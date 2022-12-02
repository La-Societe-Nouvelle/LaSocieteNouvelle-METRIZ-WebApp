// La Société Nouvelle

// Utils
import { getSumItems } from "../utils/Utils";

// Libraries
import metaIndics from '/lib/indics';

// limite significative (0.5 -> 50%)
const limit = 0.25;

// List of significative values for footprints

export function getSignificativeCompanies({companies,expenses,investments})
{
  // significative companies for external expenses
  let expensesByCompanies = getExpensesByCompanies(expenses);
  let significativeCompaniesForExpenses = Object.keys(metaIndics).map((indic) => getSignificativeCompaniesForExpenses(indic,companies,expensesByCompanies))
                                                                 .reduce((a,b) => a.concat(b),[])
                                                                 .filter((value, index, self) => index === self.findIndex(item => item.account === value.account));

  // significative companies for investments
  let significativeCompaniesForInvestments = companies.filter(company => investments.filter(investment => investment.accountAux == company.account).length > 0);

  // Merge
  let significativeCompanies = significativeCompaniesForExpenses.concat(significativeCompaniesForInvestments)
                                                                .filter((value, index, self) => index === self.findIndex(item => item.account === value.account));
  return significativeCompanies;
}


export function getSignificativeCompaniesForExpenses(indic,companies,expensesByCompanies) 
{
  // get gross impact
  let totalImpact = getSumItems(companies.map(company => company.footprint.indicators[indic].value*expensesByCompanies[company.account]));

  // sort companies by expenses (absolute value)
  companies.sort((a,b) => Math.abs(expensesByCompanies[a.account]) - Math.abs(expensesByCompanies[b.account]));

  let significativeGap = false;
  let index = 0;
  let limitAmount = 0;

  while (!significativeGap && index < companies.length)
  {
    // get "unsignificative" companies
    limitAmount = Math.abs(companies[index].amount);
    let unsignificativeCompanies = companies.filter(company => Math.abs(expensesByCompanies[company.account]) <= limitAmount);

    // get gross impact of unsignificative companies
    let grossImpact = getSumItems(unsignificativeCompanies.map(company => company.footprint.indicators[indic].value*expensesByCompanies[company.account]));

    // check max side
    let maxGrossImpact = getSumItems(unsignificativeCompanies.map((company) => 
      Math.max(company.footprint.indicators[indic].getValueMax()*expensesByCompanies[company.account],
               company.footprint.indicators[indic].getValueMin()*expensesByCompanies[company.account])
    ));
    if (Math.abs(grossImpact-maxGrossImpact) >= Math.abs(totalImpact)*limit) significativeGap = true;

    // check min side
    let minGrossImpact = getSumItems(unsignificativeCompanies.map((company) => 
      Math.max(company.footprint.indicators[indic].getValueMax()*expensesByCompanies[company.account],
               company.footprint.indicators[indic].getValueMin()*expensesByCompanies[company.account])
    ));
    if (Math.abs(grossImpact-minGrossImpact) >= Math.abs(totalImpact)*limit) significativeGap = true;

    if (!significativeGap) index++;
  }

  // Retrieve list of companies
  let significativeCompanies = companies.filter(company => company.amount >= limitAmount);

  return significativeCompanies;
}

const getExpensesByCompanies = (expenses) => 
{
    let expensesByCompanies = {};
    expenses.forEach((expense) => 
    {
        if (expensesByCompanies[expense.accountAux] == undefined) expensesByCompanies[expense.accountAux] = expense.amount;
        else expensesByCompanies[expense.accountAux]+= expense.amount;
    })
    return expensesByCompanies;
}

// Work in progress new significative function

export function getSignificativeCompaniesBis(companies,expenses,investments,minFpt,maxFpt)
{
  if (minFpt==null || maxFpt==null) {
    return companies.filter(company => company.state != "siren" && company.footprintActivityCode == "00");
  }

  let expensesByCompanies = getExpensesByCompanies(expenses);
  let companiesCompleted = companies.filter(company => company.state == "siren" || company.footprintActivityCode != "00");
  let companiesUncompleted = companies.filter(company => company.state != "siren" && company.footprintActivityCode == "00");

  let significativeCompaniesForExpenses = Object.keys(metaIndics)
    .map(async (indic) => await getSignificativeCompaniesByIndic(indic,companiesCompleted,companiesUncompleted,expensesByCompanies,minFpt,maxFpt,limit))
    .reduce((a,b) => a.concat(b),[])
    .filter((value, index, self) => index === self.findIndex(item => item.account === value.account));

  // significative companies for investments
  let significativeCompaniesForInvestments = companies.filter(company => investments.filter(investment => investment.accountAux == company.account).length > 0);

  // Merge
  let significativeCompanies = significativeCompaniesForExpenses.concat(significativeCompaniesForInvestments)
                                                                .filter((value, index, self) => index === self.findIndex(item => item.account === value.account));
  return significativeCompanies;
}

const getSignificativeCompaniesByIndic = async (indic,companiesCompleted,companiesUncompleted,expensesByCompanies,minFpt,maxFpt,limit) =>
{
  // sort companies by expenses (absolute value)
  companiesUncompleted.sort((a,b) => Math.abs(expensesByCompanies[a.account]) - Math.abs(expensesByCompanies[b.account]));

  let significativeGap = false;
  let index = 0;
  let limitAmount = 0;

  while (!significativeGap && index < companiesUncompleted.length)
  {
    // get "unsignificative" companies limit (amount)
    limitAmount = Math.abs(companiesUncompleted[index].amount);
    
    // build impact for tracked expenses (with siren number and data already fetched)
    let impactTrackedExpenses = getSumItems(companiesCompleted.map(company => company.footprint.indicators[indic].value*company.amount));

    // build impact for upper limit companies (mininum footprint case)
    let upperLimitCompanies = companiesUncompleted.filter(company => Math.abs(expensesByCompanies[company.account]) > limitAmount);
    let impactUpperLimitCompanies = getSumItems(upperLimitCompanies.map(company => company.footprintActivityCode=="00" 
    ? minFpt.indicators[indic].value*expensesByCompanies[company.account]
    : company.footprint.indicators[indic].value*expensesByCompanies[company.account]));
    
    // build impact for under limit companies (maximum footprint case)
    let underLimitCompanies = companiesUncompleted.filter(company => Math.abs(expensesByCompanies[company.account]) <= limitAmount);
    let impactUnderLimitCompanies = getSumItems(underLimitCompanies.map(company => company.footprintActivityCode=="00" 
      ? maxFpt.indicators[indic].value*expensesByCompanies[company.account]
      : company.footprint.indicators[indic].value*expensesByCompanies[company.account]));

    // check if impact of under limit companies represent more than [limit] % of tracked expenses and upper limit companies impacts
    if (Math.abs(impactUnderLimitCompanies) >= Math.abs(impactTrackedExpenses + impactUpperLimitCompanies)*limit) significativeGap = true;

    if (!significativeGap) index++;
  }

  // Retrieve list of companies
  let significativeCompanies = companiesUncompleted.filter(company => company.amount >= limitAmount);

  return significativeCompanies;
}