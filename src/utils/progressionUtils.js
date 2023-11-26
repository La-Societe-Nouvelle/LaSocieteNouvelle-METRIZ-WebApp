// La Société Nouvelle

import { 
  checkStatementART, 
  checkStatementECO, 
  checkStatementGEQ, 
  checkStatementGHG, 
  checkStatementHAZ, 
  checkStatementIDR, 
  checkStatementKNW, 
  checkStatementMAT, 
  checkStatementNRG, 
  checkStatementSOC, 
  checkStatementWAS, 
  checkStatementWAT 
} from "../components/sections/statements/forms/utils";

const progressionIndex = {
  "startSection": 0,
  "accountingImportSection": 1,
  "initialStatesSection": 2,
  "providersSection": 3,
  "statementsSection": 4,
  "resultsSection": 5
};

export const getProgression = async (session,period) => 
{
  // period defined
  if (!period || !period.periodKey) {
    return progressionIndex.accountingImportSection;
  }

  // ckeck financial data
  let financialDataValid = checkFinancialData(session,period);
  if (!financialDataValid) {
    return progressionIndex.accountingImportSection;
  }

  // check initial states
  let initialStatesValid = checkInitialStates(session,period);
  if (!initialStatesValid) {
    return progressionIndex.initialStatesSection;
  }
  
  // check external footprints
  let providerFootprintsValid = checkProviderFootprints(session,period);
  let externalFootprintsValid = checkExternalFootprints(session,period);
  if (!providerFootprintsValid || !externalFootprintsValid) {
    return progressionIndex.providersSection;
  }
  
  // statements
  let statementsValid = checkImpactsStatements(session,period);
  if (!statementsValid) {
    return progressionIndex.statementsSection;
  }
  
  // results
  let resultsValid = checkResults(session,period);
  let comparativeDataValid = await checkComparativeData(session,period);
  if (!resultsValid || !comparativeDataValid) {
    return progressionIndex.statementsSection;
  } else {
    return progressionIndex.resultsSection;
  }
}

export const checkFinancialData = (session,period) => {
  return session.financialData.status[period.periodKey].isValidated;
}

export const checkInitialStates = (session,period) => 
{
  let assetAccounts = [
    ...session.financialData.immobilisations,
    ...session.financialData.stocks
  ];
  return assetAccounts.every((account) => !account.isAmortisable || account.initialStateSet);
}

export const checkProviderFootprints = (session,period) => {

  const externalFlowsOnPeriod = [
    ...session.financialData.externalExpenses,
    ...session.financialData.investments
  ].filter((flow) => period.regex.test(flow.date));

  const providersToSync = session.financialData.providers
      .filter((provider) => externalFlowsOnPeriod.some((flow) => flow.footprintOrigin=="provider" && flow.providerNum==provider.providerNum));
  const accountsToSync = session.financialData.externalExpensesAccounts
    .filter((account) => externalFlowsOnPeriod.some((flow) => flow.footprintOrigin=="account" && flow.accountNum==account.accountNum));

  return [...providersToSync,...accountsToSync].every((provider) => provider.footprint.isValid())
}

export const checkExternalFootprints = (session,period) => {
  let externalFlows = [
    ...session.financialData.externalExpenses,
    ...session.financialData.investments
    ]
    .filter((expense) => period.regex.test(expense.date));
  return externalFlows.every((expense) => expense.footprint.isValid())
}

/** Vérification si l'ensemble des déclarations sont complètes
 * 
 */

export const checkImpactsStatements = (session,period) => 
{
  let selectedIndics = session.validations[period.periodKey];
  return selectedIndics.length>0 &&
    selectedIndics.every((indic) => checkIndicStatement(session.impactsData[period.periodKey], indic).status=="ok");
}

const checkIndicStatement = (impactsData,indic) =>
{
  switch(indic)
  {
    case "art": return checkStatementART(impactsData);
    case "eco": return checkStatementECO(impactsData);
    case "geq": return checkStatementGEQ(impactsData);
    case "ghg": return checkStatementGHG(impactsData);
    case "haz": return checkStatementHAZ(impactsData);
    case "idr": return checkStatementIDR(impactsData);
    case "knw": return checkStatementKNW(impactsData);
    case "mat": return checkStatementMAT(impactsData);
    case "nrg": return checkStatementNRG(impactsData);
    case "soc": return checkStatementSOC(impactsData);
    case "was": return checkStatementWAS(impactsData);
    case "wat": return checkStatementWAT(impactsData);
  }
}

export const checkResults = (session,period) => 
{
  let netValueAdded = session.financialData.mainAggregates.netValueAdded.periodsData[period.periodKey];
  let validations = session.validations[period.periodKey];
  return validations.every((indic) => netValueAdded.footprint.indicators[indic].isValid());
}

export const checkComparativeData = async (session,period) => 
{
  const aggregates = ["production","intermediateConsumptions","fixedCapitalConsumptions","netValueAdded"];
  const scales = ["area","division"];
  const series = ["history"]; // "trend","target"

  let validations = session.validations[period.periodKey];

  for (let indic of validations) {
    for (let aggregate of aggregates) {
      for (let scale of scales) {
        for (let serie of series) {
          if (!session.comparativeData?.[aggregate]?.[scale]?.[serie]?.data?.[indic]) {
            return false;
          }
        }
      }
    }
  }
  return true;
}