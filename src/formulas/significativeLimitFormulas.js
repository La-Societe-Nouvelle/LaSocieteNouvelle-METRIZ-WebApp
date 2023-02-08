// La Société Nouvelle

// Utils
import { getSumItems } from "../utils/Utils";

// Libraries
import metaIndics from '/lib/indics';

// limite significative (0.5 -> 50%)
const limit = 0.1;

// List of significative values for footprints

// Work in progress new significative function

export async function getSignificativeCompanies(companies,expenses,investments,minFpt,maxFpt)
{
  if (minFpt==null || maxFpt==null) {
    return companies.filter(company => company.state != "siren").map(company => company.account);
  }

  // significative companies for expenses
  let expensesByCompanies = getExpensesByCompanies(expenses); // key: account / value: amount
  let identifiedCompanies = companies.filter(company => company.state == "siren" && Object.keys(expensesByCompanies).includes(company.account));
  let unidentifiedCompanies = companies.filter(company => company.state != "siren" && Object.keys(expensesByCompanies).includes(company.account));

  let significativeCompaniesForExpenses = [];
  for (let indic of Object.keys(metaIndics)) {
    let significativeCompaniesForExpensesByIndic = await getSignificativeCompaniesByIndic(indic,identifiedCompanies,unidentifiedCompanies,expensesByCompanies,minFpt,maxFpt,limit); // return list accounts
    significativeCompaniesForExpenses = significativeCompaniesForExpenses.concat(significativeCompaniesForExpensesByIndic);
  }

  // significative companies for investments
  let significativeCompaniesForInvestments = companies.filter(company => investments.filter(investment => investment.accountAux == company.account).length > 0 && company.state!="siren").map(company => company.account);

  // Merge
  let significativeCompanies = significativeCompaniesForExpenses.concat(significativeCompaniesForInvestments).filter((value, index, self) => index === self.findIndex(item => item === value));
  return significativeCompanies;
}

const getSignificativeCompaniesByIndic = async (indic,identifiedCompanies,unidentifiedCompanies,expensesByCompanies,minFpt,maxFpt,limit) =>
{
  // sort unidentified companies by expenses (absolute value)
  unidentifiedCompanies = unidentifiedCompanies.sort((a,b) => Math.abs(expensesByCompanies[a.account]) - Math.abs(expensesByCompanies[b.account]));

  let significativeGap = false;
  let index = 0;

  // build impact for tracked expenses (with siren)
  let impactIdentifiedCompaniesExpenses = getSumItems(identifiedCompanies.map(company => company.footprint.indicators[indic].value*company.amount));

  while (!significativeGap && index < unidentifiedCompanies.length)
  {
    // get limit amount
    let limitAmount = Math.abs(expensesByCompanies[unidentifiedCompanies[index].account]);
    
    // build impact for upper limit companies (mininum footprint case) -> use activity footprint if defined otherwise use min footprint
    let upperLimitCompanies = unidentifiedCompanies.filter(company => Math.abs(expensesByCompanies[company.account]) > limitAmount);
    let impactUpperLimitCompanies = getSumItems(upperLimitCompanies.map(company => company.footprintActivityCode=="00" || company.status!=200
    ? minFpt.indicators[indic].value*expensesByCompanies[company.account]
    : company.footprint.indicators[indic].value*expensesByCompanies[company.account]));
    
    // build impact for under limit companies (maximum footprint case) -> use activity footprint if defined otherwise use max footprint
    let underLimitCompanies = unidentifiedCompanies.filter(company => Math.abs(expensesByCompanies[company.account]) <= limitAmount);
    let impactUnderLimitCompanies = getSumItems(underLimitCompanies.map(company => company.footprintActivityCode=="00" || company.status!=200
      ? maxFpt.indicators[indic].value*expensesByCompanies[company.account]
      : company.footprint.indicators[indic].value*expensesByCompanies[company.account]));

    // check if impact of under limit companies represent more than [limit] % of tracked expenses and upper limit companies impacts
    if (Math.abs(impactUnderLimitCompanies) >= Math.abs(impactIdentifiedCompaniesExpenses + impactUpperLimitCompanies)*limit) significativeGap = true;

    if (!significativeGap) index++;
  }

  // Retrieve list of companies
  let significativeCompanies = unidentifiedCompanies.slice(index).map(company => company.account);
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