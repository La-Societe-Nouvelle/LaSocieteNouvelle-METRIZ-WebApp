// La Société Nouvelle

// Generic formulas
import { getAmountItems, getLastDateOfMonth, getNbDaysBetweenDates, getNextMonth } from '../utils/Utils';
import { buildAggregateFpt, buildIndicatorAggregate, buildIndicatorMerge, megreFpt } from './footprintFormulas';

/** Structure of file
 *    - Assignment companies footprints to expenses or investments
 *    - Build financial accounts footprints
 * 
 *  Date format : YYYYMMDD
 */

/* ------------------------------------------------------------------------------------ */
/* -------------------- IMMBOLISATION'S PERIODS FOOTPRINT FORMULAS -------------------- */
/* ------------------------------------------------------------------------------------ */

export const updateImmobilisationPeriodsFpt = async (financialData) =>
{
  let periods = financialData.immobilisationPeriods;
  financialData.immobilisations.filter(immobilisation => immobilisation.isDepreciableImmobilisation)
    .map(async immobilisation => 
    {
      let amortisation = financialData.depreciations.filter(amortisation => amortisation.accountAux==immobilisation.account)[0];
      let amortisationExpenses = financialData.depreciationExpenses.filter(expense => expense.accountAux==amortisation.account);
      let investments = financialData.investments.filter(investment => investment.account==immobilisation.account);

      let immobilisationPrevFpt = immobilisation.prevFootprint;
      let amortisationPrevFpt = amortisation.prevFootprint;

      for (let period of periods)
      {
        // Immobilisation ----------------------------------- //

        let immobilisationPeriod = immobilisation.periods.filter(immobilisationPeriod => immobilisationPeriod.index==period.index)[0];

        // previous footprint
        let immobilisationPeriodPrevFpt = immobilisationPrevFpt;

        // investments
        let investmentsPeriod = investments.filter(investment => investment.date==period.dateStart);
        let investmentsPeriodFpt = await buildAggregateFpt(investmentsPeriod);
        let investmentsPeriodAmount = getAmountItems(investmentsPeriod);

        // immobilised production

        //
        let immobilisationPeriodFpt = await megreFpt(investmentsPeriodFpt, investmentsPeriodAmount, immobilisationPeriodPrevFpt, immobilisationPeriod.amount-investmentsAmount);
        immobilisationPeriod.footprint = immobilisationPeriodFpt;
        immobilisationPrevFpt = immobilisationPeriodFpt;

        // Amortisation ------------------------------------- //

        let amortisationPeriod = amortisation.periods.filer(amortisationPeriod => amortisationPeriod.index==period.index)[0];

        // previous footprint
        let amortisationPeriodPrevFpt = amortisationPrevFpt;

        // amortisation expenses
        let amortisationExpensesPeriod = amortisationExpenses.filter(expense => expense.date==period.dateStart);
        let amortisationExpensesPeriodFpt = await buildAggregateFpt(amortisationExpensesPeriod);
        let amortisationExpensesPeriodAmount = getAmountItems(amortisationExpensesPeriod);

        //
        let amortisationPeriodFpt = await megreFpt(amortisationExpensesPeriodFpt, amortisationExpensesPeriodAmount, amortisationPeriodPrevFpt, amortisationPeriod.amount-amortisationExpensesPeriodAmount);
        amortisationPeriod.footprint = amortisationPeriodFpt;
        amortisationPrevFpt = amortisationPeriodFpt;

        // -------------------------------------------------- //
      }
      return;
    })
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------

export const updateAccountsFootprints_periods = async (indic,financialData) =>
{
  financialData.immobilisations.filter(immobilisation => immobilisation.isDepreciableImmobilisation)
    .forEach(async immobilisation => 
    {
      let amortisation = financialData.depreciations.filter(amortisation => amortisation.accountAux==immobilisation.account)[0];
      // let amortisationExpenses...

      immobilisation.periods.forEach(async period => 
      {
        // immobilisation
        let immobilisationPrevFpt = period.index > 0 ? period[index-1].footprint : immobilisation.prevFootprint;
        let investments = financialData.investments.filter(investment => investment.account==immobilisation.account && investment.date==period.dateStart);
        let investmentsFpt = await buildIndicatorAggregate(indic,investments);
        let investmentsAmount = getAmountItems(investments);
        // immobilised production ?
        period.footprint.indicators[indic] = await buildIndicatorMerge(investmentsFpt, investmentsAmount, immobilisationPrevFpt, period.amount-investmentsAmount);

        // amortisation
        let amortisationPrevFpt = period.index > 0 ? period[index-1].footprint : amortisation.prevFootprint;
      })
    })
}

/* ---------- Empreintes des comptes de charges externes ---------- */

// Agrégation des dépenses rattachées au compte de charge, sur le mois concerné

export const updateImmobilisationsFootprints_month = async (indic,financialData,month) =>
{
    await Promise.all(financialData.expenseAccounts.filter(account => /^6(0[^3]|1|2)/.test(account.accountNum)) // get external expenses accounts
                                                   .map(async ({accountNum,data}) => 
    {
        // retrieve expenses (linked to the account)
        let expenses = financialData.expenses.filter(expense => expense.account == accountNum)
                                             .filter(expense => expense.date.startsWith(month));
        // control uncertainty
        expenses.filter(expense => expense.amount < 0)
                .filter(expense => expenses.filter(item => item.amount > 0 && item.company == expense.company).length > 0)
                .forEach(expense => expense.footprint.indicators[indic].uncertainty = 0);
        // build indicator
        data[month].footprint.indicators[indic] = await buildIndicatorAggregate(indic,expenses);
        return;
    }));
    return;
}

/* ---------- Empreinte des stocks d'achats ---------- */

// Empreinte sur la période incluant la fin du mois

export const updatePurchasesStocksAccountsFootprints_month = async (indic,financialData,month) =>
{
  let stocks = financialData.stocks.filter(stock => !stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    // find stock period including last day of month
    let lastDateOfMonth = getLastDateOfMonth(month);
    let stockPeriod = stock.periods.filter(period => parseInt(period.dateStart) <= parseInt(lastDateOfMonth) && parseInt(period.dateEnd) >= parseInt(lastDateOfMonth))[0];
    // set footprint
    stock.data[month].footprint.indicators[indic] = stockPeriod.footprint.indicators[indic];
    return;
  }));
  return;
}

/* ---------- Empreinte des comptes de variations de stocks d'achats ---------- */

// Agrégation des variations de stocks rattachées au compte de variation, sur le mois concerné

export const updatePurchasesStocksVariationsAccountsFootprints_month = async (indic,financialData,month) =>
{
  await Promise.all(financialData.expenseAccounts.filter(account => /^603/.test(account.account))
                                                 .map(async ({accountNum,data}) => 
  {
    // retrieve stock variations (linked to the account)
    let stockVariations = financialData.stockVariations.filter(variation => variation.account == accountNum)
                                                       .filter(variation => variation.date.startsWith(month));
    // build indicator
    data[month].footprint.indicators[indic] = await buildIndicatorAggregate(indic,stockVariations);
    return;
  }));
  return;
}

/* ---------- Empreintes des comptes de dotations aux amortissements ---------- */

// Agrégation des dotations rattachées au compte

export const updateAmortisationExpensesAccountsFootprints_month = async (indic,financialData,month) =>
{
    await Promise.all(financialData.expenseAccounts.filter(account => /^68/.test(account.accountNum))
                                                   .map(async ({accountNum,data}) => 
    {
        // filter expenses
        let expenses = financialData.depreciationExpenses.filter(expense => expense.account == accountNum)
                                                         .filter(expense => expense.date.startsWith(month));
        // build indicator
        data[month].footprint.indicators[indic] = await buildIndicatorAggregate(indic,expenses);
        return;
    }));
    return;
}

/* ---------------------------------------------------------------------------------- */
/* -------------------- FINANCIAL AGGREGATES INDICATORS FORMULAS -------------------- */
/* ---------------------------------------------------------------------------------- */

export const updateAggregatesFootprints = async (indic,financialData) =>
{
    const {netValueAdded,
           externalExpenses,
           storedPurchases,
           intermediateConsumption,
           grossFixedCapitalFormation,
           capitalConsumption,
           grossValueAdded,
           production} = financialData.aggregates;

    // External expenses
    let externalExpensesAccounts = financialData.expenseAccounts.filter(account => /^6(0[^3]|1|2)/.test(account.accountNum));
    externalExpenses.footprint.indicators[indic] = await buildIndicatorAggregate(indic,externalExpensesAccounts);
    
    // Purchasing stock Variations
    let purchaseStocksVariationsAccounts = financialData.expenseAccounts.filter(account => /^603/.test(account.accountNum));
    storedPurchases.footprint.indicators[indic] = await buildIndicatorAggregate(indic,purchaseStocksVariationsAccounts);
    
    // Intermediate consumption
    let expensesAccounts = financialData.expenseAccounts.filter(account => /^6(0|1|2)/.test(account.accountNum));
    intermediateConsumption.footprint.indicators[indic] = await buildIndicatorAggregate(indic,expensesAccounts);;
    
    // Formation brute de capital fixe
    let investments = financialData.investments;
    grossFixedCapitalFormation.footprint.indicators[indic] = await buildIndicatorAggregate(indic,investments);

    // Capital consumption
    let depreciationExpensesAccounts = financialData.expenseAccounts.filter(account => /^68/.test(account.accountNum));
    capitalConsumption.footprint.indicators[indic] = await buildIndicatorAggregate(indic,depreciationExpensesAccounts);
    
    // Gross value added
    grossValueAdded.footprint.indicators[indic] = await buildIndicatorMerge(netValueAdded.footprint.indicators[indic], netValueAdded.amount,
                                                                            capitalConsumption.footprint.indicators[indic], capitalConsumption.amount)
    // Current production

    production.footprint.indicators[indic] = await buildIndicatorMerge(intermediateConsumption.footprint.indicators[indic], intermediateConsumption.amount,
                                                                       grossValueAdded.footprint.indicators[indic], grossValueAdded.amount);
    
    return;
}

/* ------------------------------------------------------------------------------ */
/* -------------------- PRODUCTION ITEMS INDICATORS FORMULAS -------------------- */
/* ------------------------------------------------------------------------------ */

export const updateProductionAccountsFootprints_month = async (indic,financialData,month) =>
{
  const {production,
         productionStocks,
         storedProduction,
         immobilisedProduction,
         revenue} = financialData.aggregates;

  // Production stocks ----------------------------------------------------------- //

  // Set production footprint to final production stocks footprint
  financialData.stocks.filter(stock => stock.isProductionStock)
                      .forEach(stock => stock.data[month].footprint.indicators[indic] = production.data[month].footprint.indicators[indic]);

  // Stored production
  productionStocks.data[month].footprint.indicators[indic] = productionStocks.data[month].prevAmount > revenue.data[month].amount ?
    await buildIndicatorMerge(productionStocks.data[month].prevFootprint.indicators[indic], productionStocks.data[month].prevAmount-revenue.data[month].amount,
      production.data[month].footprint.indicators[indic], productionStocks.data[month].amount-(productionStocks.data[month].prevAmount-revenue.data[month].amount))
                                                             : production.data[month].footprint.indicators[indic]; // -> check with sold production

  productionStocks.data[month].footprint.indicators[indic] = production.data[month].footprint.indicators[indic]; // -> check with sold production
  storedProduction.footprint.indicators[indic] = await buildIndicatorMerge(productionStocks.footprint.indicators[indic], productionStocks.amount,
                                                                           productionStocks.prevFootprint.indicators[indic], productionStocks.prevAmount);
  // Le calcul de l'incertitude peut entraîner des résultats erronés, les valeurs étant supposées décorrélées et l'impact brut restant à amortir pouvant être faible
  // L'incertitude associée est donc celle de la production courante
  storedProduction.footprint.indicators[indic].setUncertainty(productionStocks.prevFootprint.indicators[indic].getUncertainty());

  // Immobilised production
  immobilisedProduction.footprint.indicators[indic] = production.footprint.indicators[indic];

  // Revenue footprint
  revenue.footprint.indicators[indic] = await buildIndicatorMerge(production.footprint.indicators[indic], production.amount-productionStocks.prevAmount,
                                                                  productionStocks.prevFootprint.indicators[indic], productionStocks.prevAmount);
  
  return;
}

/* -------------------------------------------------------------------------------------- */
/* -------------------- IMMOBILISATIONS & STOCKS INDICATORS FORMULAS -------------------- */
/* -------------------------------------------------------------------------------------- */

export const updateFinalStatesFootprintsMonthly = async (indic,financialData,month) =>
{
    // Immobilisations
    await updateImmobilisationsAccountsFootprints_month(indic,financialData,month);
    
    // Depreciations
    await updateAmortisationsAccountsFootprints_month(indic,financialData,month);
    
    return;
}

/* ----- Immoblisations footprints ----- */

/** Empreinte déduite à partir de l'empreinte de la période incluant la fin du mois
 *  L'empreinte et le montant sont constants pour une période pour les comptes d'immobilisation.
 */

const updateImmobilisationsAccountsFootprints_month = async (indic,financialData,month) =>
{
  await Promise.all(financialData.immobilisations.map(async (immobilisation) => 
  {
    // find immobilisation period including last day of month
    let lastDateOfMonth = getLastDateOfMonth(month);
    let immobilisationPeriod = immobilisation.periods.filter(period => parseInt(period.dateStart) <= parseInt(lastDateOfMonth) && parseInt(period.dateEnd) >= parseInt(lastDateOfMonth))[0];

    // set footprint
    immobilisation.data[month].footprint.indicators[indic] = immobilisationPeriod.footprint.indicators[indic];

    // prev fpt for next month -> useful ?
    let nextMonth = getNextMonth(month);
    if (Object.keys(immobilisation.data).includes(nextMonth)) immobilisation.data[nextMonth].prevFootprint.indicators[indic] = immobilisation.data[month].footprint.indicators[indic];
    return;
  }));
  return;
}

 /* ----- Depreciations footprints ----- */

/** Empreinte obtenue à partir de l'empreinte initiale de la période incluant la fin du mois et des empreinte des dotations aux amortissements durant cette période
 *  Les empreintes des dotations sont pondérées à hauteur du montant des dotations (nombre de jours x dotations journalières).
 *  L'empreinte initiale du compte d'amortissement est pondrée à hauteur du montant initial du compte d'amortissement.
 *  En l'absence de dotations, l'empreinte finale correspond à l'empreinte initiale.
 */

// /!\ cas si fin du mois = fin de période => valeurs directes !

const updateAmortisationsAccountsFootprints_month = async (indic,financialData,month) =>
{
  await Promise.all(financialData.depreciations.map(async (depreciation) => 
  {
    // find immobilisation period including last day of month
    let lastDateOfMonth = getLastDateOfMonth(month);
    let depreciationPeriod = depreciation.periods.filter(period => parseInt(period.dateStart) <= parseInt(lastDateOfMonth) && parseInt(period.dateEnd) >= parseInt(lastDateOfMonth))[0];

    // get nb days between start of period and end of month
    let nbDaysDepreciated = getNbDaysBetweenDates(depreciationPeriod.dateStart,lastDateOfMonth);

    // compute depreciation expenses footprint & amount for nb days betweend start of period and end of month
    let depreciationExpenses = financialData.getDepreciationExpenseByAccountAux(depreciation.account);
    let depreciationExpensesForPeriod = depreciationExpenses
      .map(depreciationExpense => depreciationExpense.periods)
      .reduce((a,b) => a.concat(b),[])
      .filter(period => period.dateStart==depreciationPeriod.dateStart) // filter period match depreciation period
      .map(period => {return({ indicator: period.prevFootprint.indicators[indic], amount: period.rate*nbDaysDepreciated })});
    let depreciationExpensesFootprint = await buildIndicatorAggregate(indic, depreciationExpensesForPeriod);
    let depreciationExpensesAmount = getAmountItems(depreciationExpensesForPeriod);

    // get footprint at the end of month
    depreciation.data[month].footprint.indicators[indic] = await buildIndicatorMerge(depreciationPeriod.prevFootprint.indicators[indic], depreciationPeriod.prevAmount, // start of period
                                                                                     depreciationExpensesFootprint, depreciationExpensesAmount); // depreciation until end of month
    
    // prev fpt for next month
    let nextMonth = getNextMonth(month);
    if (Object.keys(depreciation.data).includes(nextMonth)) depreciation.data[nextMonth].prevFootprint.indicators[indic] = depreciation.data[month].footprint.indicators[indic];
    return;
  }));
  return;
}