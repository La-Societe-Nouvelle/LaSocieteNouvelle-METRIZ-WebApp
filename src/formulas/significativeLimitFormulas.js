// La Société Nouvelle

// Utils
import { getSumItems } from "../utils/Utils";

// Libraries
import metaIndics from '/lib/indics';

// limite significative (0.5 -> 50%)
const limit = 0.1;

// List of significative values for footprints

// Work in progress new significative function

export async function getSignificativeCompanies(providers,expenses,investments,minFpt,maxFpt,period)
{
  if (minFpt==null || maxFpt==null) {
    return providers.filter(provider => provider.useDefaultFootprint).map(provider => provider.providerNum);
  }

  // significative companies for expenses
  //let expensesByCompanies = getExpensesByCompanies(expenses); // key: account / value: amount
  let identifiedProviders = providers.filter(provider => !provider.useDefaultFootprint);
  let unidentifiedProviders = providers.filter(provider => provider.useDefaultFootprint);

  let significativeProvidersForExpenses = [];
  for (let indic of Object.keys(metaIndics)) 
  {
    let significativeCompaniesForExpensesByIndic = await getSignificativeProvidersByIndic(indic,identifiedProviders,unidentifiedProviders,minFpt,maxFpt,limit,period); // return list accounts
    significativeProvidersForExpenses = significativeProvidersForExpenses.concat(significativeCompaniesForExpensesByIndic);
  }

  // significative companies for investments -> all by default
  let immobilisationProviders = providers.filter(provider => investments.some(investment => investment.providerNum == provider.providerNum)).map(provider => provider.providerNum);

  // Merge
  let significativeCompanies = significativeProvidersForExpenses.concat(immobilisationProviders).filter((value, index, self) => index === self.findIndex(item => item === value));
  return significativeCompanies;
}

const getSignificativeProvidersByIndic = async (indic,identifiedProviders,unidentifiedProviders,minFpt,maxFpt,limit,period) =>
{
  // sort unidentified companies by expenses (absolute value)
  unidentifiedProviders = unidentifiedProviders.sort((a,b) => Math.abs(a.periodsData[period.periodKey].amount) - Math.abs(b.periodsData[period.periodKey].amount));

  let significativeGap = false;
  let index = 0;

  // build impact for tracked expenses (with siren)
  let impactOfIdentifiedProvidersExpenses = getSumItems(identifiedProviders.map(provider => provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey].amount));

  while (!significativeGap && index < unidentifiedProviders.length)
  {
    // get limit amount
    let limitAmount = Math.abs(unidentifiedProviders[index].periodsData[period.periodKey].amount);
    
    // build impact for upper limit providers (mininum footprint case) -> use activity footprint if defined otherwise use min footprint
    let upperLimitProviders = unidentifiedProviders.filter(provider => Math.abs(provider.periodsData[period.periodKey].amount) > limitAmount);
    let impactOfUpperLimitProviders = getSumItems(upperLimitProviders.map(provider => provider.defaultFootprintParams.code=="00" || provider.footprintStatus!=200
    ? minFpt.indicators[indic].value*provider.periodsData[period.periodKey].amount
    : provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey].amount));
    
    // build impact for under limit companies (maximum footprint case) -> use activity footprint if defined otherwise use max footprint
    let underLimitProviders = unidentifiedProviders.filter(provider => Math.abs(provider.periodsData[period.periodKey].amount) <= limitAmount);
    let impactOfUnderLimitCompanies = getSumItems(underLimitProviders.map(provider => provider.defaultFootprintParams.code=="00" || provider.footprintStatus!=200
      ? maxFpt.indicators[indic].value*provider.periodsData[period.periodKey]
      : provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey]));

    // check if impact of under limit companies represent more than [limit] % of tracked expenses and upper limit companies impacts
    if (Math.abs(impactOfUnderLimitCompanies) >= Math.abs(impactOfIdentifiedProvidersExpenses + impactOfUpperLimitProviders)*limit) significativeGap = true;

    if (!significativeGap) index++;
  }

  // Retrieve list of companies
  let significativeProviders = unidentifiedProviders.slice(index).map(provider => provider.providerNum);
  return significativeProviders;
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