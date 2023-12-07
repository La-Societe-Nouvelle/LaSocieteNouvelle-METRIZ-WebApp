// la Société Nouvelle

// utils
import { buildAggregateFootprint } from "/src/formulas/footprintFormulas";
import { roundValue } from "../utils/Utils";

// lib
import metaIndics from "/lib/indics.json";

/* -------------------------------------------------- LEGAL UNIT PROFILE -------------------------------------------------- */

/** Profile
 *    - activityCode
 *    - postalCode
 *    - workforcebracket
 * 
 */

export const buildLegalUnitProfile = async (legalUnit) =>
{
  const activityCode = legalUnit.activityCode;
  const postalCode = legalUnit?.corporateHeadquarters?.match(/\((.*)\)/).pop() || "";
  const workforceBracket = legalUnit.trancheEffectifs;

  return {
    activityCode,
    postalCode,
    workforceBracket
  };
}

/* -------------------------------------------------- STATISTIC REPORT BUILDER -------------------------------------------------- */

/** Structure of stats report
 *    -> external expenses distribution
 *    -> investments distribution
 *    -> main aggregates rates
 *    -> main aggregates footprints
 * 
 */

export const buildStatReport = async (session, period) => 
{
  const {
    financialData,
    validations
  } = session;

  // External expenses distribution
  const externalExpensesDistribution = await getExternalExpensesDistribution(financialData, period);

  // Investments distribution
  const investementsDistribution = await getInvestmentsDistribution(financialData, period);

  // Main aggregates rates
  const aggregateRates = await getAggregateRates(financialData, period);

  // Consumptions footprints (and fixed capital formation)
  const aggregateFootprints = await getAggregateFootprints(financialData, period);

  return {
    externalExpensesDistribution,
    investementsDistribution,
    aggregateRates,
    aggregateFootprints,
  };
};

/* -------------------------------------------------- UTILS -------------------------------------------------- */

// External expenses distribution

const getExternalExpensesDistribution = async (financialData,period) => 
{
  const expenses = financialData.externalExpenses
    .filter((expense) => period.regex.test(expense.date));

  const expensesByActivityCode = {};

  let totalExpenseAmount = 0;

  // get amount by activity code
  for (let expense of expenses) 
  {
    const expenseAmount = expense.amount;
    const activityCode = getExpenseActivityCode(expense,financialData);
    
    if (activityCode in expensesByActivityCode) {
      expensesByActivityCode[activityCode].totalAmount += expenseAmount;
    } else {
      expensesByActivityCode[activityCode] = {
        activityCode,
        totalAmount: expenseAmount,
      };
    }

    totalExpenseAmount += expenseAmount;
  };

  // get distribution
  const externalExpensesDistribution = Object.values(expensesByActivityCode)
    .map(({ activityCode, totalAmount }) => ({
      activityCode,
      proportion: roundValue((totalAmount / totalExpenseAmount), 4),
    })
  );

  return externalExpensesDistribution;
};

const getExpenseActivityCode = (expense,financialData) => 
{
  // from provider
  if (expense.footprintOrigin=="provider") {
    const provider = financialData.getProvider(expense.providerNum);
    const activityCode = provider.isDefaultProviderAccount
      ? provider.defaultFootprintParams.code
      : provider.legalUnitData.activitePrincipaleCode;
    return activityCode;
  }
  // from account
  else if (expense.footprintOrigin=="account") {
    const account = financialData.externalExpensesAccounts.find((account) => account.accountNum == expense.accountNum);
    const activityCode = account.defaultFootprintParams.code;
    return activityCode; 
  }
  // default
  else {
    return "00";
  }
}

// Investments distribution
  
const getInvestmentsDistribution = async (financialData,period) => 
{
  const investments = financialData.investments
    .filter((investment) => period.regex.test(investment.date));

  const investmentsByDivision = {};

  let totalInvestmentsAmount = 0;

  // get amount by activity code
  for (let investment of investments) {
    const provider = financialData.getProvider(investment.providerNum);
    const activityCode = provider.isDefaultProviderAccount
      ? provider.defaultFootprintParams.code
      : provider.legalUnitData.activitePrincipaleCode;

    const investmentAmount = investment.amount;
    totalInvestmentsAmount += investmentAmount;

    if (activityCode in investmentsByDivision) {
      investmentsByDivision[activityCode].totalAmount += investmentAmount;
    } else {
      investmentsByDivision[activityCode] = {
        activityCode,
        totalAmount: investmentAmount,
      };
    }
  };

  // get distribution
  const investmentsDistribution = Object.values(investmentsByDivision)
    .map(({ activityCode, totalAmount }) => ({
      activityCode,
      proportion: roundValue((totalAmount / totalInvestmentsAmount), 4),
    })
  );

  return investmentsDistribution;
};
  
// Main aggregates rates

const getAggregateRates = async (financialData,period) => 
{
  const {
    netValueAdded,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    production
  } = financialData.mainAggregates;

  // get amounts
  const netValueAddedAmount = netValueAdded.periodsData[period.periodKey].amount;
  const intermediateConsumptionsAmount = intermediateConsumptions.periodsData[period.periodKey].amount;
  const fixedCapitalConsumptionsAmount = fixedCapitalConsumptions.periodsData[period.periodKey].amount;
  const productionAmount = production.periodsData[period.periodKey].amount;

  // Rates
  const netValueAddedRate = roundValue(netValueAddedAmount / productionAmount, 4);
  const intermediateConsumptionsRate = roundValue(intermediateConsumptionsAmount / productionAmount, 4);
  const fixedCapitalConsumptionsRate = roundValue(fixedCapitalConsumptionsAmount / productionAmount, 4);

  // data
  const aggregateRates = {
    NVA: netValueAddedRate,
    IC: intermediateConsumptionsRate,
    CFC: fixedCapitalConsumptionsRate
  };

  return aggregateRates;
};

// Aggregates footprints
//  -> intermediate consumptions fpt
//  -> fixed capital consumptions fpt
//  -> fixed capital formation fpt
//  -> net value added fpt

  
const getAggregateFootprints = async (financialData, period) => 
{
  const {
    mainAggregates,
    investments
  } = financialData;

  // Intermediate consumptions footprint
  const intermediateConsumptionsFpt = mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators;

  // Fixed capital consumptions footprint
  const fixedCapitalConsumptionsFpt = mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators;

  // Fixed capital formation footprint
  const fixedCapitalFormationFpt = await getFixedCapitalFormationFpt(investments, period);

  // Net value added footprint
  const netValueAddedFpt = await getNetValueAddedFpt(financialData, period);

  return {
    intermediateConsumptions: intermediateConsumptionsFpt,
    fixedCapitalConsumptions: fixedCapitalConsumptionsFpt,
    fixedCapitalFormation: fixedCapitalFormationFpt,
    netValueAdded: netValueAddedFpt
  };
};

const getFixedCapitalFormationFpt = async (investments,period) => 
{
  const investmentsOnPeriod = investments
    .filter((investment) => period.regex.test(investment.date));
  const fixedCapitalFormationFpt = await buildAggregateFootprint(investmentsOnPeriod);
  return fixedCapitalFormationFpt;
};

const getNetValueAddedFpt = async (financialData, period) => 
{
  const netValueAddedFpt = financialData.mainAggregates.netValueAdded.periodsData[period.periodKey].footprint;

  const netValueAddedFptFiltered = {}
  Object.keys(metaIndics).forEach((indic) => {
    if (netValueAddedFpt.indicators[indic].isValid()) {
      netValueAddedFptFiltered[indic] = {...netValueAddedFpt.indicators[indic]};
    }
  });

  return netValueAddedFptFiltered; 
};