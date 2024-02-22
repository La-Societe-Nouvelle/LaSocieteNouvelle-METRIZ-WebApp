// La Société Nouvelle

// Utils
import { getSumItems } from '/src/utils/Utils';

// Libraries
import metaIndics from '/lib/indics';

/* ------------------------------------- FORMULAS - PROVIDERS -------------------------------------------- */

// List of significative values for footprints
// limite significative (0.5 -> 50%)
const limit = 0.1;

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

export function getUnidentifiedProviderStatusIcon(provider) {

  if (!provider.footprintStatus) {
    return {
      className: "bi bi-arrow-repeat text-success",
      title: "Données prêtes à être synchronisées",
    };
  } else if (provider.footprintStatus === 200) {
    return {
      className: "bi bi-check2 text-success",
      title: "Données synchronisées",
    };
  } else if (provider.footprintStatus === 500 ) {
    return {
      className: "bi bi-x-lg text-danger",
      title: "Erreur lors de la synchronisation",
    };
  }

  return {
    className: "",
    title: "",
  };
}

/* ------------------------------------- FORMULAS - ACCOUNTS -------------------------------------------- */

export async function getSignificativeAccounts(accounts,minFpt,maxFpt,period)
{
  // if no data -> return list of all account with default footprint
  if (minFpt==null || maxFpt==null) {
    return accounts.map(account => account.accountNum);
  }

  let providerAccount = accounts.filter((account) => account.providerNum).map((provider) => provider.providerNum);
  let filteredAccounts = accounts.filter((account) => account.accountNum);

  let significativeAccounts = [];
  for (let indic of Object.keys(metaIndics)) 
  {
    // significative accounts for indic
    let significativeAccountsForIndic = await getSignificativeAccountsByIndic(indic,filteredAccounts,minFpt,maxFpt,limit,period); // return list accounts
    significativeAccounts.push(...significativeAccountsForIndic);
  }

  // Remove duplicates & return
  return [...significativeAccounts, ...providerAccount].filter((value, index, self) => index === self.findIndex(item => item === value));
}

// iteration until provider under limit are significative
const getSignificativeAccountsByIndic = async (indic,accounts,minFpt,maxFpt,limit,period) =>
{
  let isSignificative = false;
  
  accounts.sort((a,b) => Math.abs(a.periodsData[period.periodKey].amount) - Math.abs(b.periodsData[period.periodKey].amount));
  let index = 0; // under -> account not significative

  while (!isSignificative && index <= accounts.length)
  {    
    // build impact for upper limit accounts (mininum footprint case) -> use activity footprint if defined otherwise use min footprint
    let upperLimitAccounts = accounts.slice(index);
    let impactOfUpperLimitAccounts = getSumItems(upperLimitAccounts.map(account => 
      (account.defaultFootprintParams.code=="00" || account.footprintStatus!=200) ?
        minFpt.indicators[indic].value*account.periodsData[period.periodKey].amount :               //  if no activity set or footprint unfetched
        account.footprint.indicators[indic].value*account.periodsData[period.periodKey].amount));   //  if activity set & fpt fetched
    
    // build impact for under limit accounts (maximum footprint case) -> use activity footprint if defined otherwise use max footprint
    let underLimitAccounts = accounts.slice(0,index);
    let impactOfUnderLimitAccounts = getSumItems(underLimitAccounts.map(account => 
      (account.defaultFootprintParams.code=="00" || account.footprintStatus!=200) ? 
        maxFpt.indicators[indic].value*account.periodsData[period.periodKey].amount : 
        account.footprint.indicators[indic].value*account.periodsData[period.periodKey].amount));

    // check if impact of under limit accounts represent more than [limit] % of upper limit accounts impacts
    if (Math.abs(impactOfUnderLimitAccounts) >= Math.abs(impactOfUpperLimitAccounts)*limit) isSignificative = true;

    if (!isSignificative) index++;
  }

  // Retrieve list of accounts
  let significativeAccounts = index>0 ? accounts.slice(index-1).map(account => account.accountNum) : [];
  return significativeAccounts;
}

/* ------------------------------------- FORMULAS - FLOWS -------------------------------------------- */

export async function getSignificativeAccountsFromFlows(flows,accounts,providers,minFpt,maxFpt,period)
{
  // if no data -> return list of all provider with default footprint
  if (minFpt==null || maxFpt==null) {
    let significativeAccounts = flows
      .map((flow) => flow.accountNum)
      .filter((value, index, self) => index === self.findIndex(item => item === value));
    return significativeAccounts;
  }

  // split flows
  let identifiedProviders = providers
    .filter(provider => !provider.useDefaultFootprint)
    .filter(provider => provider.periodsData.hasOwnProperty(period.periodKey))
    .map(provider => provider.providerNum);
  let identifiedFlows = flows
    .filter(flow => flow.footprintOrigin=="provider" 
         && identifiedProviders.includes(flow.providerNum));
  let unidentifiedFlows = flows
    .filter(flow => flow.footprintOrigin!="provider"
         || !identifiedProviders.includes(flow.providerNum))
    .sort((a,b) => Math.abs(a.amount) - Math.abs(b.amount));

  let significativeAccounts = [];
  for (let indic of Object.keys(metaIndics)) 
  {
    // significative flows for indic
    let significativeFlowsForIndic = await getSignificativeFlowsByIndic(indic,identifiedFlows,unidentifiedFlows,minFpt,maxFpt,limit,period,accounts); // return list flows
    let significativeAccountsForIndic = significativeFlowsForIndic
      .map((flow) => flow.accountNum)
      .filter((value, index, self) => index === self.findIndex(item => item === value));
    significativeAccounts.push(...significativeAccountsForIndic);
  }

  // significative providers for investments -> all by default
  let immobilisationProviders = providers
    .filter(provider => provider.periodsData.hasOwnProperty(period.periodKey))
    .filter(provider => provider.periodsData[period.periodKey].amountInvestments > 0)
    .map(provider => provider.providerNum);
  significativeAccounts.push(...immobilisationProviders);

  // Remove duplicates & return
  return significativeAccounts.filter((value, index, self) => index === self.findIndex(item => item === value));
}

// iteration until provider under limit are significative
const getSignificativeFlowsByIndic = async (indic,identifiedFlows,unidentifiedFlows,minFpt,maxFpt,limit,period,accounts) =>
{
  // build impact for tracked expenses (with siren)
  let impactOfIdentifiedFlows = getSumItems(identifiedFlows.map(flow => flow.footprint.indicators[indic].value*flow.amount));

  let isSignificative = false;
  
  unidentifiedFlows.sort((a,b) => Math.abs(a.amount) - Math.abs(b.amount));
  let index = 0; // under -> providers not significative

  while (!isSignificative && index <= unidentifiedFlows.length)
  {    
    // build impact for upper limit flows (mininum footprint case) -> use activity footprint if defined otherwise use min footprint
    let upperLimitFlows = unidentifiedFlows.slice(index);
    let impactOfUpperLimitFlows = getSumItems(upperLimitFlows.map(flow => {
      let account = accounts.find(account => account.accountNum == flow.accountNum);
      if (!account 
       || account.defaultFootprintParams.code=="00" 
       || account.footprintStatus!=200) {
        return minFpt.indicators[indic].value*flow.amount;
      } else {
        return flow.footprint.indicators[indic].value*flow.amount
      }
    }));
    
    // build impact for under limit flows (maximum footprint case) -> use activity footprint if defined otherwise use max footprint
    let underLimitFlows = unidentifiedFlows.slice(0,index);
    let impactOfUnderLimitFlows = getSumItems(underLimitFlows.map(flow => {
      let account = accounts.find(account => account.accountNum == flow.accountNum);
      if (!account 
       || account.defaultFootprintParams.code=="00" 
       || account.footprintStatus!=200) {
        return maxFpt.indicators[indic].value*flow.amount;
      } else {
        return flow.footprint.indicators[indic].value*flow.amount
      }
    }));

    // check if impact of under limit providers represent more than [limit] % of identified expenses and upper limit providers impacts
    if (Math.abs(impactOfUnderLimitFlows) >= Math.abs(impactOfIdentifiedFlows + impactOfUpperLimitFlows)*limit) isSignificative = true;

    if (!isSignificative) index++;
  }

  // Retrieve list of companies
  let significativeFlows = index>0 ? unidentifiedFlows.slice(index-1) : [];
  return significativeFlows;
}

/* ------------------------------------- DEFAULT MAPPING BY CHAT-GPT -------------------------------------------- */

import axios from 'axios';
import divisions from '/lib/divisions';
import { isValidNumber } from '../../../../utils/Utils';

const apiUrl = 'https://api.openai.com/v1/chat/completions';
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export const getMappingFromChatGPT = async (providers, legalUnitActivityCode) => 
{
  // build request
  const request = buildMappingQuery(providers, legalUnitActivityCode);

  // open ai
  try 
  {
    const response = await axios.post(apiUrl, {
      model: "gpt-3.5-turbo-0301",
      messages: [{"role": "user", "content": request}],
      max_tokens: 1000,
      temperature: 0.1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 500000,
    });

    const mappingChatGPT = response.data.choices[0].message;

    const mapping = [];
    
    if (mappingChatGPT.content) {
      const rows = mappingChatGPT.content.split("\n");
      for (let row of rows) 
      {
        if (/^\|.*\| [0-9]{2} \|.*\|$/.test(row)) {
          let rowData = row.split("|");
          let accountId = rowData[1].trim();
          let activityCode = rowData[3].trim();
          let accuracyValue = rowData[4].trim()?.match(/^(100|[0-9]{1,2})/)?.[0];
          if (accountId && Object.keys(divisions).includes(activityCode)) {
            mapping.push({
              accountId,
              defaultCode: activityCode,
              accuracy: !isNaN(accuracyValue) && isValidNumber(accuracyValue,0,100) ? Math.min(parseInt(accuracyValue), 90) : null
            })
          }
        }
      }; 
    }

    return ({
      mapping,
      isAvailable: true
    });
  } 
  catch (error) {
    console.error('Error generating code:', error.message); 
    return ({
      isAvailable: false
    });
  }
}

const buildMappingQuery = (accounts,legalUnitActivityCode) => 
{
  const query = 
      "Compléter le tableau avec le code de la division de la NACE Rév.2 décrivant le mieux les activités financées (division des fournisseurs) "
    + "à partir du libellé du compte de charges"
    + (legalUnitActivityCode ? ", en s'appuyant sur le fait que l'entreprise appartient à la division "+legalUnitActivityCode : "")
    +". "+"\n"
    + "\n"
    + "| Id | Libellé du compte de charges | Code de la division économique des activités financées (2 chiffres) | Niveau de pertinence du lien (valeur en %) | "+"\n"
    + "|----|------------------------------|---------------------------------------------------------------------|--------------------------------------------|"+"\n"
    + accounts.map((account) => {
        return( "|"
          +" "+(account.providerNum || account.accountNum)+" |"
          +" "+(account.providerLib || account.accountLib)+" |"
          +" "+" |"
          +" "+" |"
        )}).join("\n")
    + "\n"
    + "\n"
    + "(Ne retourner que le tableau)";

  return query;
}