// La Société Nouvelle

// Utils
import { getSumItems } from '/src/utils/Utils';

// Libraries
import metaIndics from '/lib/indics';

/* ------------------------------------- FORMULAS -------------------------------------------- */

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
  } else if (provider.footprintStatus === 404) {
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

/* ------------------------------------- DEFAULT MAPPING BY CHAT-GPT -------------------------------------------- */

import axios from 'axios';
import divisions from '/lib/divisions';

const apiUrl = 'https://api.openai.com/v1/chat/completions';
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export const getMappingFromChatGPT = async (providers) => 
{
  // build request
  const request = buildMappingQuery(providers);

  // open ai
  try 
  {
    const response = await axios.post(apiUrl, {
      model: "gpt-3.5-turbo-0301",
      messages: [{"role": "user", "content": request}],
      max_tokens: 500,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const mappingChatGPT = response.data.choices[0].message;

    const mapping = [];
    
    if (mappingChatGPT.content) {
      const rows = mappingChatGPT.content.split("\n");
      rows.forEach(row => {
        if (/^\|.*\| [0-9]{2} \|$/.test(row)) {
          let rowData = row.split("|");
          let providerNum = rowData[1].trim();
          //let providerLib = rowData[2].trim();
          let activityCode = rowData[3].trim();
          let provider = providers.find((provider) => provider.providerNum == providerNum);
          if (provider && Object.keys(divisions).includes(activityCode)) {
            mapping.push({
              providerNum: providerNum,
              defaultCode: activityCode
            })
          }
        }
      }); 
    }

    return ({
      mapping,
      isAvailable: true
    });
  } 
  catch (error) {
    console.log(error);
    console.error('Error generating code:', error.message); 
    return ({
      isAvailable: false
    });
  }
}

const buildMappingQuery = (providers) => 
{
  const query = 
      "Compléter le tableau avec le code de la division de la NACE Rév.2 décrivant le mieux les activités financées (division des fournisseurs) "
    + "à partir du libellé du compte de charges. "+"\n"
    + "\n"
    + "| Id | Libellé du compte de charges | Code de la division économique des activités financées (2 chiffres) |"+"\n"
    + "|----|------------------------------|---------------------------------------------------------------------|"+"\n"
    + providers.map((provider) => {
        return( "|"
          +" "+provider.providerNum+" |"
          +" "+provider.providerLib+" |"
          +" "+" |"
        )}).join("\n")
    + "\n"
    + "\n"
    + "(Ne retourner que le tableau)";

  return query;
}