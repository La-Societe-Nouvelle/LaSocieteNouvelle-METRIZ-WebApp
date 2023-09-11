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
  if (!period.periodKey) {
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
  let externalFootprintsValid = checkExternalFootprints(session,period);
  if (!externalFootprintsValid) {
    return progressionIndex.providersSection;
  }
  
  // statements
  let statementsValid = checkImpactsStatements(session,period);
  if (!statementsValid) {
    return progressionIndex.statementsSection;
  }
  
  // results
  let resultsValid = checkResults(session,period);
  console.log("déclaration validées : "+statementsValid);
  if (!resultsValid) {
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
  console.log(assetAccounts);
  return assetAccounts.every((account) => !account.isAmortisable || account.initialStateSet);
}

export const checkExternalFootprints = (session,period) => {
  let externalExpenses = session.financialData.externalExpenses
    .filter((expense) => period.regex.test(expense.date));
  return externalExpenses.every((expense) => expense.footprint.isValid())
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
  console.log(netValueAdded.footprint);
  return validations.every((indic) => netValueAdded.footprint.indicators[indic].isValid());
}