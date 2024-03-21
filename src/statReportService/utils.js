// la Société Nouvelle

// utils
import { buildAggregateFootprint } from "/src/formulas/footprintFormulas";
import { getAmountItems, roundValue } from "../utils/Utils";

// lib
import metaIndics from "/lib/indics.json";

/* -------------------------------------------------- LEGAL UNIT PROFILE -------------------------------------------------- */

/** Profile
 *    - activityCode
 *    - workforcebracket
 *    - postalCode
 *    - economieSocialeSolidaire
 *    - societeMission
 *    - nbEtablissements
 *    - dateCreation
 *    - inscriptionRegistreMetiers 
 *    - categorieJuridique
 */

export const buildLegalUnitProfile = async (legalUnit) =>
{
  const activityCode  = legalUnit.activityCode;
  const workforceBracket  = legalUnit.trancheEffectifs;
  const postalCode = legalUnit.corporateHeadquarters?.match(/\((.*)\)/).pop() || "";
  const economieSocialeSolidaire = legalUnit.isEconomieSocialeSolidaire; 
  const societeMission  = legalUnit.isSocieteMission;
  const nbEtablissements = legalUnit.nbActiveEstablishments;
  const dateCreation = legalUnit.creationDate;
  const inscriptionRegistreMetiers = legalUnit.hasCraftedActivities;
  const categorieJuridique = legalUnit.legalStatusCode;


  return {
    activityCode,
    postalCode,
    workforceBracket,
    postalCode,
    economieSocialeSolidaire,
    societeMission,
    nbEtablissements,
    dateCreation,
    inscriptionRegistreMetiers,
    categorieJuridique
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
  } = session;

  // External expenses distribution
  const externalExpensesDistribution = await getExternalExpensesDistribution(financialData, period);

  // Investments distribution
  const investementsDistribution = await getInvestmentsDistribution(financialData, period);

  // Main aggregates rates
  const aggregateRates = await getAggregateRates(financialData, period);

  // Financial rates
  const financialRates = await getFinancialRates(financialData, period);

  // Consumptions footprints (and fixed capital formation)
  const aggregateFootprints = await getAggregateFootprints(financialData, period);

  return {
    externalExpensesDistribution,
    investementsDistribution,
    aggregateRates,
    financialRates,
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

// Financial rates
// -> Resultat/CA
// -> EBE/CA
// -> CA/Capitaux fixes
// -> Resultat/Capitaux fixes

const getFinancialRates = async (financialData,period) => 
{
  const {
    revenue
  } = financialData.productionAggregates;

  // get amounts
  const revenueAmount = revenue.periodsData[period.periodKey].amount;
  const incomeAmount = getProfit(financialData,period.periodKey);
  const operatingSurplusAmount = getOperatingSurplus(financialData,period.periodKey);
  const fixedCapitalAmount = getFixedCapitalGrossValue(financialData,period.dateEnd);

  // Rates
  const income_on_revenue = roundValue(incomeAmount / revenueAmount, 4);
  const operating_surplus_on_revenue = roundValue(operatingSurplusAmount / revenueAmount, 4);
  const revenue_on_fixed_capital = roundValue(revenue / fixedCapitalAmount, 4);
  const income_on_fixed_capital = roundValue(incomeAmount / fixedCapitalAmount, 4);

  // data
  const financialRates = {
    income_on_revenue,
    operating_surplus_on_revenue,
    revenue_on_fixed_capital,
    income_on_fixed_capital
  };

  return financialRates;
};

const getProfit = (financialData,periodKey) => 
{
  // Résultat d'exploitation
  let revenue = financialData.productionAggregates.revenue.periodsData[periodKey].amount;
  let storedProduction = financialData.productionAggregates.storedProduction.periodsData[periodKey].amount;
  let immobilisedProduction = financialData.productionAggregates.immobilisedProduction.periodsData[periodKey].amount;
  let otherOperatingIncomes = financialData.otherFinancialData.otherOperatingIncomes.periodsData[periodKey].amount;
  let operatingIncomes = 
      revenue 
    + storedProduction 
    + immobilisedProduction 
    + otherOperatingIncomes;
  let operatingExpensesItems = financialData.externalExpensesAccounts
    .concat(financialData.stockVariationsAccounts)
    .concat(financialData.amortisationExpensesAccounts)
    .filter(account => account.periodsData.hasOwnProperty(periodKey));
  let operatingExpenses = getAmountItemsForPeriod(operatingExpensesItems, periodKey, 2)
    + financialData.otherFinancialData.taxes.periodsData[periodKey].amount
    + financialData.otherFinancialData.personnelExpenses.periodsData[periodKey].amount;
  let operatingResult = operatingIncomes - operatingExpenses;

  // Résultat financier
  let financialIncomes = financialData.otherFinancialData.financialIncomes.periodsData[periodKey].amount;
  let financialExpenses = financialData.otherFinancialData.financialExpenses.periodsData[periodKey].amount;
  let financialResult = financialIncomes - financialExpenses;

  // Résultat exceptionnel
  let exceptionalIncomes = financialData.otherFinancialData.exceptionalIncomes.periodsData[periodKey].amount;
  let exceptionalAmortisationExpensesAccounts = financialData.amortisationExpensesAccounts.filter(account => /^6871/.test(account.accountNum));
  let exceptionalExpenses = getAmountItemsForPeriod(exceptionalAmortisationExpensesAccounts, periodKey, 2) + financialData.otherFinancialData.exceptionalExpenses.periodsData[periodKey].amount;
  let exceptionalResult = exceptionalIncomes - exceptionalExpenses;

  // Taxes
  let taxOnProfits = financialData.otherFinancialData.taxOnProfits.periodsData[periodKey].amount;

  // Profit ------------------------------------------- //
  
  let profit = 
      operatingResult 
    + financialResult
    + exceptionalResult
    - taxOnProfits;

  return profit
}

const getOperatingSurplus = (financialData,periodKey) => 
{
  // Résultat d'exploitation
  let revenue = financialData.productionAggregates.revenue.periodsData[periodKey].amount;
  let otherOperatingIncomes = financialData.otherFinancialData.otherOperatingIncomes.periodsData[periodKey].amount;
  let operatingExpensesItems = financialData.externalExpensesAccounts
    .concat(financialData.stockVariationsAccounts)
    .concat(financialData.amortisationExpensesAccounts)
    .filter(account => account.periodsData.hasOwnProperty(periodKey));
  let operatingExpenses = getAmountItemsForPeriod(operatingExpensesItems, periodKey, 2)
    + financialData.otherFinancialData.personnelExpenses.periodsData[periodKey].amount
    + financialData.otherFinancialData.taxes.periodsData[periodKey].amount;
  
  let operatingSurplus = 
      revenue 
    + otherOperatingIncomes
    - operatingExpenses;
  
  return operatingSurplus;
}

const getFixedCapitalGrossValue = (financialData,date) => 
{
  // Montant des immobilisations en fin d'exercice
  let fixedCapitalAmount = getAmountItems(
    financialData.immobilisations.map((immobilisation) => immobilisation.states[date])
  );
  
  return fixedCapitalAmount;
}

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