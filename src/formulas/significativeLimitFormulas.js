// La Société Nouvelle

// Utils
import { getSumItems } from "../utils/Utils";

// Libraries
import metaIndics from '/lib/indics';

// limite significative (0.5 -> 50%)
const limit = 0.1;

// List of significative values for footprints

export async function getSignificativeUnidentifiedProviders(providers,minFpt,maxFpt,period)
{
  // if no data -> return list of all provider with default footprint
  if (minFpt==null || maxFpt==null) {
    return providers.filter(provider => provider.useDefaultFootprint).map(provider => provider.providerNum);
  }

  // significative companies
  let identifiedProviders = providers
    .filter(provider => !provider.useDefaultFootprint)
    .filter(provider => provider.periodsData.hasOwnProperty(period.periodKey));
  let unidentifiedProviders = providers
    .filter(provider => provider.useDefaultFootprint)
    .filter(provider => provider.periodsData.hasOwnProperty(period.periodKey))
    .sort((a,b) => Math.abs(a.periodsData[period.periodKey].amountExpenses) - Math.abs(b.periodsData[period.periodKey].amountExpenses));

  let significativeProviders = [];
  for (let indic of Object.keys(metaIndics)) 
  {
    // significative providers for indic
    let significativeProvidersForIndic = await getSignificativeUnidentifiedProvidersByIndic(indic,identifiedProviders,unidentifiedProviders,minFpt,maxFpt,limit,period); // return list accounts
    significativeProviders.push(...significativeProvidersForIndic);
  }

  // significative companies for investments -> all by default
  let immobilisationProviders = providers
    .filter(provider => provider.periodsData.hasOwnProperty(period.periodKey))
    .filter(provider => provider.periodsData[period.periodKey].amountInvestments > 0)
    .map(provider => provider.providerNum);
  significativeProviders.push(...immobilisationProviders);

  // Remove duplicates & return
  return significativeProviders.filter((value, index, self) => index === self.findIndex(item => item === value));
}

// iteration until provider under limit are significative
const getSignificativeUnidentifiedProvidersByIndic = async (indic,identifiedProviders,unidentifiedProviders,minFpt,maxFpt,limit,period) =>
{
  // build impact for tracked expenses (with siren)
  let impactOfIdentifiedProvidersExpenses = getSumItems(identifiedProviders.map(provider => provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses));

  let isSignificative = false;
  
  unidentifiedProviders.sort((a,b) => Math.abs(a.periodsData[period.periodKey].amountExpenses) - Math.abs(b.periodsData[period.periodKey].amountExpenses));
  let index = 0; // under -> providers not significative

  while (!isSignificative && index <= unidentifiedProviders.length)
  {    
    // build impact for upper limit providers (mininum footprint case) -> use activity footprint if defined otherwise use min footprint
    let upperLimitProviders = unidentifiedProviders.slice(index);
    let impactOfUpperLimitProviders = getSumItems(upperLimitProviders.map(provider => 
      (provider.defaultFootprintParams.code=="00" || provider.footprintStatus!=200) ?                       // 
      minFpt.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses :                //  if no activity set or footprint unfetched
      provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses));   //  if activity set & fpt fetched
    
    // build impact for under limit providers (maximum footprint case) -> use activity footprint if defined otherwise use max footprint
    let underLimitProviders = unidentifiedProviders.slice(0,index);
    let impactOfUnderLimitCompanies = getSumItems(underLimitProviders.map(provider => 
      (provider.defaultFootprintParams.code=="00" || provider.footprintStatus!=200) ? 
      maxFpt.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses : 
      provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses));

    // check if impact of under limit providers represent more than [limit] % of identified expenses and upper limit providers impacts
    if (Math.abs(impactOfUnderLimitCompanies) >= Math.abs(impactOfIdentifiedProvidersExpenses + impactOfUpperLimitProviders)*limit) isSignificative = true;

    if (!isSignificative) index++;
  }

  // Retrieve list of companies
  let significativeProviders = index>0 ? unidentifiedProviders.slice(index-1).map(provider => provider.providerNum) : [];
  return significativeProviders;
}

/* ------------------------------------------------------------------------------------------------------------------------------------------------ */

export async function getSignificativeProviders(providers,minFpt,maxFpt,period)
{
  // if no data -> return list of all provider with default footprint
  if (minFpt==null || maxFpt==null) {
    return providers.filter(provider => provider.useDefaultFootprint).map(provider => provider.providerNum);
  }

  // significative companies
  let providersSorted = providers
    .filter(provider => provider.periodsData.hasOwnProperty(period.periodKey))
    .sort((a,b) => Math.abs(a.periodsData[period.periodKey].amountExpenses) - Math.abs(b.periodsData[period.periodKey].amountExpenses));

  let significativeProviders = [];
  for (let indic of Object.keys(metaIndics)) 
  {
    // significative providers for indic
    let significativeProvidersForIndic = await getSignificativeProvidersByIndic(indic,providersSorted,minFpt,maxFpt,limit,period); // return list accounts
    significativeProviders.push(...significativeProvidersForIndic);
  }

  // significative companies for investments -> all by default
  let immobilisationProviders = providers
    .filter(provider => provider.periodsData.hasOwnProperty(period.periodKey))
    .filter(provider => provider.periodsData[period.periodKey].amountInvestments > 0)
    .map(provider => provider.providerNum);
  significativeProviders.push(...immobilisationProviders);

  // Remove duplicates & return
  return significativeProviders.filter((value, index, self) => index === self.findIndex(item => item === value));
}

// iteration until provider under limit are significative
const getSignificativeProvidersByIndic = async (indic,providers,minFpt,maxFpt,limit,period) =>
{
  let isSignificative = false;
  
  providers.sort((a,b) => Math.abs(a.periodsData[period.periodKey].amountExpenses) - Math.abs(b.periodsData[period.periodKey].amountExpenses));
  let index = 0; // under -> providers not significative

  while (!isSignificative && index <= providers.length)
  {    
    // build impact for upper limit providers (mininum footprint case) -> use activity footprint if defined otherwise use min footprint
    let upperLimitProviders = providers.slice(index);
    let impactOfUpperLimitProviders = getSumItems(upperLimitProviders.map(provider => 
      (provider.defaultFootprintParams.code=="00" || (provider.footprintStatus!=200 && provider.footprintStatus!=203)) ?  // 
      minFpt.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses :                              //  if no activity set or footprint unfetched
      provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses));                 //  if activity set & fpt fetched
    
    // build impact for under limit providers (maximum footprint case) -> use activity footprint if defined otherwise use max footprint
    let underLimitProviders = providers.slice(0,index);
    let impactOfUnderLimitCompanies = getSumItems(underLimitProviders.map(provider => 
      (provider.defaultFootprintParams.code=="00" || (provider.footprintStatus!=200 && provider.footprintStatus!=203)) ? 
      maxFpt.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses : 
      provider.footprint.indicators[indic].value*provider.periodsData[period.periodKey].amountExpenses));

    // check if impact of under limit providers represent more than [limit] % of identified expenses and upper limit providers impacts
    if (Math.abs(impactOfUnderLimitCompanies) >= Math.abs(impactOfUpperLimitProviders)*limit) isSignificative = true;

    if (!isSignificative) index++;
  }

  // Retrieve list of companies
  let significativeProviders = index>0 ? providers.slice(index-1).map(provider => provider.providerNum) : [];
  return significativeProviders;
}