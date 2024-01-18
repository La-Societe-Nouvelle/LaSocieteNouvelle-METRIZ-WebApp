// La Société Nouvelle

import metaIndics from "../../../lib/indics.json";
import { getTotalGhgEmissions } from "../../components/sections/statements/modals/AssessmentGHG/utils";
import divisions from "/lib/divisions";

// Libraries
import fuels from "/lib/emissionFactors/fuels.json";
import industrialProcesses from "/lib/emissionFactors/industrialProcesses";
import agriculturalProcesses from "/lib/emissionFactors/agriculturalProcesses";
import coolingSystems from "/lib/emissionFactors/coolingSystems";
import landChanges from "/lib/emissionFactors/landChanges";

const emissionFactors = {
  ...fuels,
  ...industrialProcesses,
  ...agriculturalProcesses,
  ...coolingSystems,
  ...landChanges
};

const apiUrl = 'https://api.openai.com/v1/chat/completions';
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

import axios from 'axios';
import { isValidNumber, roundValue } from "../../utils/Utils";
import { getTotalNrgConsumption } from "../../components/sections/statements/modals/AssessmentNRG/utils";
import { getKnwContribution } from "../../components/sections/statements/modals/AssessmentKNW/utils";

export const getAnalysisFromChatGPT = async ({
    session,
    period,
    indic
}) => {

  // build request
  const request = buildRequestOpenAI({
    session,
    period,
    indic
  });
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
 
    const analysisOpenIA = response.data.choices[0].message;
    return ({
      analysis: analysisOpenIA.content,
      isAvailable: true
    });
  } 
  catch (error) {
  
    console.error('Error generating code:', error.message);
    return ({
      analysis: "",
      isAvailable: false
    });
  }
}

const buildRequestOpenAI = ({
    session,
    period,
    indic
}) => {
    // v0
    const aggregatesData = buildMainAggratesTable({session,period,indic});
    const expensesData = buildExpensesTable({session,period,indic});
    const impactsData = buildImpactsData({session,period,indic});

    const request = 
      // --------------------------------------------------
          "Pour une entreprise de la division économique \""+divisions[session.comparativeData.comparativeDivision]+"\","+"\n"
        + "\n"
      // --------------------------------------------------
        + "Impacts directs : "+"\n"
        + impactsData+"\n"
        + "\n"
      // --------------------------------------------------
        + "Empreintes des soldes intermédiaires de gestion : "+"\n"
        + aggregatesData+"\n"
        + "\n"
      // --------------------------------------------------
        + "Empreintes des comptes de charges externes : "+"\n"
        + expensesData+"\n"
        + "\n"
      // --------------------------------------------------
        + questions[indic];
    
    return request;
}

/* ----------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- UTILS -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------- */

const metaMainAggregates = {
  "production":               {   label: "Production"},
  "intermediateConsumptions": {   label: "Consommations intermédiaires"},
  "fixedCapitalConsumptions": {   label: "Consommations de capital fixe"},
  "netValueAdded":            {   label: "Valeur ajoutée nette"},
}

const buildMainAggratesTable = ({
  session,
  period,
  indic
}) => {
  const { mainAggregates } = session.financialData;

  const { unit, nbDecimals, unitAbsolute } = metaIndics[indic];

  const data = 
      "| Agrégat | Montant | "+metaIndics[indic].libelle+" | Moyenne branche |"+"\n"
    + "|---------|---------|-------------------------------|-----------------|"+"\n"
    + Object.keys(metaMainAggregates)
            .filter((aggregateKey) => mainAggregates[aggregateKey].periodsData.hasOwnProperty(period.periodKey))
            .map((aggregateKey) => {
        return( "|"
          +" "+metaMainAggregates[aggregateKey].label+" |"
          +" "+mainAggregates[aggregateKey].periodsData[period.periodKey].amount+" € |"
          +" "+mainAggregates[aggregateKey].periodsData[period.periodKey].footprint.indicators[indic].value+" "+unit+" |"
          +" "+session.comparativeData[aggregateKey]?.division?.history?.data?.[indic]?.at(-1)?.value +" "+unit+" |"
        )}).join("\n")
    + "\n";

  return data;
}

const buildExpensesTable = ({
    session,
    period,
    indic
}) => {

  const {
    financialData
  } = session;
  const externalExpensesAccounts = financialData.externalExpensesAccounts;

  const { unit, nbDecimals, unitAbsolute } = metaIndics[indic];

  const data = 
      "| Numéro de compte | Libellé | Montant | "+metaIndics[indic].libelle+" |"+"\n"
    + "|------------------|---------|---------|-------------------------------|"+"\n"
    + externalExpensesAccounts
        .filter(({ periodsData }) => periodsData.hasOwnProperty(period.periodKey))
        .map(({ accountNum, accountLib, periodsData }) => 
          "| "+accountNum
        +" | "+accountLib
        +" | "+periodsData[period.periodKey].amount+" €"
        +" | "+periodsData[period.periodKey].footprint.indicators[indic].value+" "+unit
        +" |"
    ).join("\n");

  return data;
}

const buildImpactsData = ({
  session,
  period,
  indic
}) => {

  const impactsData = session.impactsData[period.periodKey];
  switch(indic) {
    case "art": return buildImpactsART(impactsData);
    case "eco": return buildImpactsECO(impactsData);
    case "geq": return buildImpactsGEQ(impactsData);
    case "ghg": return buildImpactsGHG(impactsData);
    case "haz": return buildImpactsHAZ(impactsData);
    case "idr": return buildImpactsIDR(impactsData);
    case "knw": return buildImpactsKNW(impactsData);
    case "mat": return buildImpactsMAT(impactsData);
    case "nrg": return buildImpactsNRG(impactsData);
    case "soc": return buildImpactsSOC(impactsData);
    case "was": return buildImpactsWAS(impactsData);
    case "wat": return buildImpactsWAT(impactsData);
    default: return "";
  }
}

const buildImpactsART = (impactsData) => 
{
  const {
    isValueAddedCrafted,
    craftedProduction,
    netValueAdded
  } = impactsData;

  const impacts = "";
  if (isValueAddedCrafted==true) {
    impacts = impacts 
      + "Les activités de l'entreprise sont artisanales ou font appel à un savoir-faire reconnu (ex. label EPV),"
      + " 100% de sa valeur ajoutée est qualifiée d'artisanale."+"\n";
  } else if (isValueAddedCrafted=="partially") {
    impacts = impacts 
      + "Les activités de l'entreprise sont partiellement artisanales ou font appel à un savoir-faire reconnu (ex. label EPV),"
      + " "+roundValue(craftedProduction/netValueAdded, 0)+" % de sa valeur ajoutée est qualifiée d'artisanale."+"\n";
  } else {
    impacts = impacts
     + "Les activités de l'entreprise ne sont pas artisanales et ne font pas appel à un savoir-faire reconnu (ex. label EPV)."+"\n";
  }
}

const buildImpactsECO = (impactsData) => 
{
  const {
    isAllActivitiesInFrance,
    domesticProduction,
    netValueAdded
  } = impactsData;

  const impacts = "";
  if (isAllActivitiesInFrance==true) {
    impacts = impacts 
      + "Les activités de l'entreprise sont entièrement localisées en France,"
      + " 100% de sa valeur ajoutée est produite en France."+"\n";
  } else if (isAllActivitiesInFrance=="partially") {
    impacts = impacts 
      + "Les activités de l'entreprise sont partiellement localisées en France,"
      + " "+roundValue(domesticProduction/netValueAdded, 0)+" % de sa valeur ajoutée est produite en France."+"\n";
  } else {
    impacts = impacts
     + "Les activités de l'entreprise sont entièrement localisées à l'étranger (hors France)."+"\n";
  }

  return impacts;
}

const buildImpactsGEQ = (impactsData) => 
{
  const {
    hasEmployees,
    wageGap
  } = impactsData;

  const impacts = "";
  if (hasEmployees) {
    impacts = impacts 
      + "L'écart interne de rémunération femmes/hommes est de "+wageGap+" %."+"\n";
  } else {
    impacts = impacts
     + "L'entreprise n'est pas emplyeuse."+"\n";
  }

  return impacts;
}

const assessmentItems = {
  "1":  { label: "Emissions directes des sources fixes de combustion" },
  "2":  { label: "Emissions directes des sources mobiles de combustion" },
  "3a": { label: "Emissions directes des procédés industriels" },
  "3b": { label: "Emissions directes des procédés agricoles" },
  "4":  { label: "Emissions directes fugitives" },
  "5":  { label: "Emissions issues de la biomasse (sols et forêts)" },
};

const buildImpactsGHG = (impactsData) => 
{
  const {
    greenhouseGasEmissions,
    greenhouseGasEmissionsUnit,
    ghgDetails
  } = impactsData;
  let totalDetails = getTotalGhgEmissions(ghgDetails);

  const impacts = "Les émissions directes de l'entreprises sont de "+greenhouseGasEmissions+" "+greenhouseGasEmissionsUnit+".\n";
  if (Object.keys(ghgDetails).length>0 && totalDetails==greenhouseGasEmissions) {
    impacts = impactsData+"\n"+
        "Détails des émissions : "+"\n"
      + "| Poste d'émissions | Source | Emissions |"+"\n"
      + "|-------------------|--------|-----------|"+"\n"
      + Object.values(ghgDetails).map((itemData) => 
            "| "+assessmentItems[itemData.assessmentItem].label
          + "| "+emissionFactors[itemData.factorId].label
          + "| "+itemData.ghgEmissions+" kgCO2e"
      ).join("\n");
  }
  
  return impacts;
}

const buildImpactsHAZ = (impactsData) => 
{
  const {
    hazardousSubstancesUse,
    hazardousSubstancesUseUnit
  } = impactsData;

  const impacts = 
    "L'utilisation de produits dangereux s'élève à "+hazardousSubstancesUse+" "+hazardousSubstancesUseUnit+".\n";
  
  return impacts;
}

const buildImpactsIDR = (impactsData) => 
{
  const { 
    hasEmployees,
    interdecileRange
  } = impactsData;

  const impacts = "";
  if (hasEmployees) {
    impacts = impacts 
      + "Le ratio D9/D1 interne s'élève à "+interdecileRange+" au sein de l'entreprise.\n";
  } else {
    impacts = impacts
     + "L'entreprise n'est pas emplyeuse."+"\n";
  }
  
  return impacts;
}

const knwItems = {
  "apprenticeshipTax": { 
    label: "Taxe d'apprentissage" 
  },
  "vocationalTrainingTax": { 
    label: "Participation à la formation professionnelle continue" 
  },
  "apprenticesRemunerations": {
    label: "Rémunérations liées à des contrats de formation (stage, alternance, etc.)"
  },
  "employeesTrainingsCompensations": {
    label: "Rémunérations liées à des heures de suivi d'une formation"
  },
  "researchPersonnelRemunerations": {
    label: "Rémunérations liées à des activités de recherche ou de formation"
  }
}

const buildImpactsKNW = (impactsData) => 
{
  const { 
    researchAndTrainingContribution,
    knwDetails 
  } = impactsData;

  const impacts = 
    "La participation directe à la recherche et à la formation s'élève à "+researchAndTrainingContribution+".\n";
  
  if (getKnwContribution(knwDetails)==researchAndTrainingContribution) {
    impacts = impacts+"Détails des participations directes : "+"\n"
      + Object.keys(knwItems)
          .filter((itemId) => isValidNumber(knwDetails[itemId]) && knwDetails[itemId]>0)
          .map((itemId) =>
            knwItems[itemId].label+" : "+knwDetails[itemId]+" €"
          ).join("\n");
  }

  return impacts;
}

const buildImpactsMAT = (impactsData) => 
{
  const { 
    isExtractiveActivities,
    materialsExtraction,
    materialsExtractionUnit
  } = impactsData;

  const impacts = "";
  if (isExtractiveActivities) {
    impacts = impacts 
      + "L'entreprise ne réalise pas d'activité minière ou agricole."+"\n";
  } else {
    impacts = impacts
     + "L'extraction directe de matières représente "+materialsExtraction+" "+materialsExtractionUnit+"."+"\n";
  }

  return impacts;
}

const assessmentItemsNRG = {
  "electricity":                { label: "Electricité",                       toInit: true  },
  "fossil":                     { label: "Produits énergétiques fossiles",    toInit: false },
  "biomass":                    { label: "Biomasse",                          toInit: false },
  "heat":                       { label: "Chaleur",                           toInit: true  },
  "renewableTransformedEnergy": { label: "Energie renouvelable transformée",  toInit: true  }
};

const buildImpactsNRG = (impactsData) => 
{
  const {
    energyConsumption,
    energyConsumptionUnit,
    nrgDetails
  } = impactsData;
  let totalDetails = getTotalNrgConsumption(nrgDetails);

  const impacts = "La consommation directe d'énergie s'élève à "+energyConsumption+" "+energyConsumptionUnit+".\n";
  if (totalDetails==energyConsumption) {
    impacts = impactsData+"\n"+
        "Détails de la consommation énergétique : "+"\n"
      + "| Type | Produit énergétique  | Consommation |"+"\n"
      + "|------|----------------------|--------------|"+"\n"
      + Object.values(nrgDetails).map((itemData) => 
            "| "+assessmentItemsNRG[itemData.type].label
          + "| "+(["fossil","biomass"].includes(itemData.type) ? emissionFactors[itemData.fuelCode].label : assessmentItemsNRG[itemData.type].label)
          + "| "+itemData.nrgConsumption+" MJ"
      ).join("\n");
  }
  
  return impacts;
}

const buildImpactsSOC = (impactsData) => 
{
  const { 
    hasSocialPurpose,
  } = impactsData;

  const impacts = "";
  if (hasSocialPurpose) {
    impacts = impacts 
      + "L'entreprise est un acteur d'intérêt social(ESS, Agrégment ESUS, Société à mission)."+"\n";
  } else {
    impacts = impacts
     + "L'entreprise n'est pas un acteur d'intérêt social (ESS, Agrégment ESUS, Société à mission)."+"\n";
  }

  return impacts;
}

const buildImpactsWAS = (impactsData) => 
{
  const { 
    wasteProduction,
    wasteProductionUnit
  } = impactsData;

  const impacts =
    "La production directe de déchets s'élève à "+wasteProduction+" "+wasteProductionUnit+".\n";

  return impacts;
}

const buildImpactsWAT = (impactsData) => 
{
  const { 
    waterConsumption,
    waterConsumptionUnit
  } = impactsData;

  const impacts =
    "La consommation directe d'eau s'émève à "+waterConsumption+" "+waterConsumptionUnit+".\n";

  return impacts;
}

const questions = {
  "art": "Comment puis-je davantage soutenir l'artisanat ?",
  "eco": "Comment est-ce que je me situe par rapport à ma branche ? Comment puis-je davantage soutenir les activités économiques françaises ?",
  "geq": "Comment est-ce que je me situe par rapport à ma branche ? Comment puis-je réduire l'écart de rémunération femmes/hommes ?",
  "ghg": "D'où vient mon empreinte carbone ? Que pourrais-je faire pour la réduire ?",
  "haz": "D'où vient mon empreinte ? Que pourrais-je faire pour la réduire ?",
  "idr": "Comment est-ce que je me situe par rapport à ma branche ? Comment puis-je réduire les écarts de rémunération ?",
  "knw": "Comment est-ce que je me situe par rapport à ma branche ? Comment puis-je davantage soutenir la recherche et la formation ?",
  "mat": "D'où vient mon empreinte matière ? Que pourrais-je faire pour la réduire ?",
  "nrg": "D'où vient mon empreinte énergétique ? Que pourrais-je faire pour la réduire ?",
  "soc": "Comment puis-je soutenir les acteurs d'intérêt social (ESS, société à mission) ? Comment inscrire une raison d'être dans mes status ?",
  "was": "D'où vient mon empreinte déchets ? Que pourrais-je faire pour la réduire ?",
  "wat": "D'où vient mon empreinte eau ? Que pourrais-je faire pour la réduire ?",
}