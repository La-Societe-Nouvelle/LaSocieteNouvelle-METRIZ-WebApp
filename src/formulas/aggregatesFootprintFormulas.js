// La Société Nouvelle

// Generic formulas
import { getAmountItems, getPrevDate, getSumItems, roundValue } from '../utils/Utils';
import { updateImmobilisationPeriodsFpt } from './aggregatesFootprintFormulasForPeriods';
import { buildAggregateIndicator, buildAggregatePeriodIndicator, buildDifferenceFootprint, mergeFootprints, buildDifferenceIndicator, mergeIndicators, buildAggregateFootprint } from './footprintFormulas';

/** Structure of file
 *    - Assignment companies footprints to expenses and investments
 *    - Build financial accounts footprints
 */

/* ----------------------------------------------------------------------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------ ASSIGN COMPANIES FOOTPRINTS ------------------------------------------------------------ */
/* ----------------------------------------------------------------------------------------------------------------------------------------------------- */

/* ----- Empreintes des charges externes ----- */
// Affectation de l'empreinte du fournisseur (compte auxiliaire)

export const updateExternalExpensesFpt = async (financialData) =>
{
  await Promise.all(financialData.expenses.map(async (expense) => 
  {
    // retrieve company
    let company = financialData.getCompanyByAccount(expense.accountAux);
    // assign fpt
    expense.footprint = company.footprint;
    return;
  }));
  return;
}

/* ----- Investments footprints ----- */
// Affectation de l'empreinte du fournisseur (compte auxiliaire)

export const updateInvestmentsFpt = async (financialData) =>
{
  await Promise.all(financialData.investments.map(async (investment) => 
  {
    // retrieve company
    let company = financialData.getCompanyByAccount(investment.accountAux);
    // assign fpt
    investment.footprint = company.footprint;
    return;
  }));
  return;
}

/* ----------------------------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- INTERMEDIATE CONSUMPTIONS & PURCHASES STOCKS FOOTPRINTS ---------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------------------------------- */

export const updateIntermediateConsumptionsFootprints = async (financialData,period) =>
{
  // External expenses accounts
  await updateExternalExpensesAccountsFpt(financialData,period);
  
  // Purchases stocks
  await updatePurchasesStocksStatesFpt(financialData,period);

  // Stocks variations accounts footprints
  await updatePurchasesStocksVariationsAccountsFpt(financialData,period);
}

/* ---------- Empreintes des comptes de charges externes ---------- */
// Agrégation des dépenses rattachées au compte de charges

const updateExternalExpensesAccountsFpt = async (financialData,period) =>
{
  await Promise.all(financialData.externalExpenseAccounts
    .map(async (account) => 
  {
    // retrieve expenses (linked to the account)
    let expenses = financialData.expenses
      .filter(expense => expense.accountNum==account.accountNum)
      .filter(expense => period.regex.test(expense.date))
      .filter(expense => expense.amount>0); // temp solution to avoid uncertainty issue
    
    // build footprint
    account.periodsData[period.periodKey].footprint = await buildAggregateFootprint(expenses);
    return;
  }));
  return;
}

/* ---------- Empreinte des stocks d'achats ---------- */
// Agrégation des comptes de charges rattachés au compte de stock

const updatePurchasesStocksStatesFpt = async (financialData,period) =>
{
  let stocks = financialData.stocks.filter(stock => !stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    let finalState = stock.states[period.dateEnd];
    let prevStateDateEnd = getPrevDate(period.dateStart);
    let prevState = stock.states[prevStateDateEnd];
    
    let unstorages = financialData.stockVariations
      .filter(variation => variation.stockAccountNum==stock.accountNum)
      .filter(variation => period.regex.test(variation.date))
      .filter(variation => variation.amount < 0); // all unstorages
    
    let oldStock = Math.max(-getSumItems(unstorages, 2),0);
    let newStock = roundValue(finalState.amount-oldStock,2);

    let purchases = financialData.expenses
    .filter(expense => expense.accountNum.startsWith(stock.expensesAccountsPrefix))
    .filter(expense => period.regex.test(expense.date));
    let purchasesFootprint = await buildAggregateFootprint(purchases);
    
    finalState.footprint = await mergeFootprints([
      {amount: oldStock, footprint: prevState.footprint},    // old stock (remains)
      {amount: newStock, footprint: purchasesFootprint}]);   // new stock
    return;
  }));
  return;
}

/* ----- Empreinte des comptes de variations de stocks d'achats ----- */
// stock variation footprint is based on initial & final footprint of the stock account

const updatePurchasesStocksVariationsAccountsFpt = async (financialData,period) =>
{
  await Promise.all(financialData.stockVariationAccounts
    .map(async (account) => 
  {
    let stock = financialData.stocks.filter(stock => stock.defaultStockVariationAccountNum==account.accountNum)[0];
    
    if (stock) {
      let finalState = stock.states[period.dateEnd];
      let prevStateDateEnd = getPrevDate(period.dateStart);
      let initialState = stock.states[prevStateDateEnd];
  
      let stockVariationFootprint = await buildDifferenceFootprint(finalState,initialState);
      account.periodsData[period.periodKey].footprint =stockVariationFootprint;
    }
    return;
  }));
  return;
}

/* ----------------------------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- FIXED CAPITAL CONSUMPTIONS & IMMOBILISATIONS FOOTPRINTS ---------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------------------------------- */

/** 
 *    -> set prev footprint for account with initial state "currentFootprint" -> when update periods
 */

export const updateFixedCapitalConsumptionsFootprints = async (financialData,period) =>
{
  // immobilisations & amortisations states
  await updateImmobilisationsStatesFpt(financialData,period);

  // amortisation expenses
  await updateAmortisationExpensesFpt(financialData,period);

  // amortisation expenses accounts
  await updateAmortisationExpenseAccountsFpt(financialData,period);
}

/* ---------- Empreinte des immobilisations ---------- */
// Agrégation des comptes de charges rattachés au compte de stock

const updateImmobilisationsStatesFpt = async (financialData,period) =>
{
  let immobilisations = financialData.immobilisations.filter(immobilisation => !immobilisation.isAmortisable);
  await Promise.all(immobilisations.map(async (immobilisation) =>
  {
    let prevStateDateEnd = getPrevDate(period.dateStart);
    let initialState = immobilisation.states[prevStateDateEnd];

    let states = Object.values(immobilisation.states)
      .filter(state => period.regex.test(state.date)); // sort

    for (let state of states) 
    {
      // investissements
      let investments = financialData.investments
        .filter(investment => investment.accountNum==immobilisation.accountNum)
        .filter(investment => investment.date==state.date)
      let investmentsAmount = getAmountItems(investments);
      let investmentsFootprint = await buildAggregateFootprint(investments);

      // immobilisation footprint
      state.footprint = await mergeFootprints([
        {amount: investmentsAmount, footprint: investmentsFootprint},                                  // investments
        {amount: roundValue(state.amount-investmentsAmount, 2), footprint: initialState.footprint}]);  // remains

      // amortisation expense footprint
      let amortisationExpenseFootprint = await buildDifferenceFootprint(
        {amount: initialState.amount, footprint: initialState.footprint},                        // immobilisation
        {amount: initialState.amortisationAmount, footprint: initialState.amortisationFootprint} // amortisation
      )

      // amortisation footprint
      state.amortisationFootprint = await mergeFootprints([
        {amount: state.amortisationExpenseAmount, footprint: amortisationExpenseFootprint},                                               // amortisation expense
        {amount: roundValue(state.amortisationAmount-state.amortisationExpenseAmount, 2), footprint: initialState.amortisationFootprint}  // amortisation
      ])
    }
    return;
  }));
  return;
}

/* ----- Empreintes des dotations aux amortissements ----- */
// amortisation expenses footprint is based on...

const updateAmortisationExpensesFpt = async (financialData,period) =>
{
  let amortisationExpenses = financialData.adjustedAmortisationExpenses.filter(expense => period.regex.test(expense.date));
  await Promise.all(amortisationExpenses.map(async (expense) =>
  {
    let immobilisation = financialData.immobilisations.filter(immobilisation => immobilisation.amortisationAccountNum==expense.amortisationAccountNum)[0];
    if (immobilisation) 
    {
      let state = immobilisation.states[expense.date];
      let prevState = immobilisation.states[state.prevStateDate];

      expense.footprint = await buildDifferenceFootprint(
        {amount: prevState.amount, footprint: prevState.footprint},                        // immobilisation
        {amount: prevState.amortisationAmount, footprint: prevState.amortisationFootprint} // amortisation
      )
    } else {
      console.log("immobilisation not found for amortisation account : "+expense.amortisationAccountNum)
    }
    return;
  }));
  return;
}

/* ----- Empreintes des comptes de dotations aux amortissements ----- */
// amortisation expenses footprint is based on...

const updateAmortisationExpenseAccountsFpt = async (financialData,period) =>
{
  await Promise.all(financialData.amortisationExpensesAccounts
    .map(async (account) => 
  {
    let amortisationExpenses = financialData.adjustedAmortisationExpenses
      .filter(expense => expense.accountNum==account.accountNum)
      .filter(expense => period.regex.test(expense.date));

    account.periodsData[period.periodKey].footprint = await buildAggregateFootprint(amortisationExpenses);
    return;
  }));
  return;
}

/* -------------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- FINANCIAL AGGREGATES INDICATORS FORMULAS ---------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

export const updateMainAggregatesFootprints = async (indic,financialData,period) =>
{
  const {netValueAdded,
          intermediateConsumptions,
          fixedCapitalConsumptions,
          production} = financialData.mainAggregates;

  // Intermediate consumptions
  intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic] = 
    await buildAggregatePeriodIndicator(indic,financialData.externalExpenseAccounts.concat(financialData.stockVariationAccounts),period.periodKey);
  
  // Fixed capital consumtpions
  fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic] = 
    await buildAggregatePeriodIndicator(indic,financialData.stockVariationAccounts,period.periodKey);
  
  // Production
  production.periodsData[period.periodKey].footprint.indicators[indic] = 
    await buildAggregatePeriodIndicator(indic,[netValueAdded,intermediateConsumptions,fixedCapitalConsumptions],period.periodKey);
  
  return;
}

/* ---------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- PRODUCTION ITEMS INDICATORS FORMULAS ---------------------------------------- */
/* ---------------------------------------------------------------------------------------------------------------------- */

export const updateProductionItemsFootprints = async (indic,financialData,period) =>
{
  // Production stocks
  await updateProductionStocksStatesFpt(indic,financialData,period);

  // Stored production
  await updateStoredProductionFpt(indic,financialData,period);

  // Immobilised production
  await updateImmobilisedProductionFpt(indic,financialData,period);

  // Sold production
  await updateSoldProductionFpt(indic,financialData,period);

  return;
}

/* ---------- Empreinte des stocks de production ---------- */
// ...

const updateProductionStocksStatesFpt = async (indic,financialData,period) =>
{
  let stocks = financialData.stocks.filter(stock => stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    stock.states[period.dateEnd].footprint.indicators[indic] = financialData.mainAggregates.production.periodsData[period.periodKey].footprint.indicators[indic];
    return;
  }));
  return;
}

/* ----- Empreinte de la production stockée ----- */
// ...

const updateStoredProductionFpt = async (indic,financialData,period) =>
{
  let prevStateDateEnd = getPrevDate(period.dateStart);
  let productionStocks = financialData.stocks.filter(stock => stock.isProductionStock);

  let initialProductionStockAmount = getAmountItems(productionStocks.map(stock => stock.states[prevStateDateEnd]));
  let initialProductionStockFootprint = await buildAggregateFootprint(productionStocks.map(stock => stock.states[prevStateDateEnd]));

  let finalProductionStockAmount = getAmountItems(productionStocks.map(stock => stock.states[period.dateEnd]));
  let finalProductionStockFootprint = await buildAggregateFootprint(productionStocks.map(stock => stock.states[period.dateEnd]));

  financialData.storedProduction.periodsData[period.periodKey].footprint.indicators[indic]
    = await buildDifferenceIndicator(indic,
      {amount: finalProductionStockAmount, footprint: finalProductionStockFootprint},     // final production
      {amount: initialProductionStockAmount, footprint: initialProductionStockFootprint}  // initial production
    )
  return;
}

/* ----- Empreinte de la production immobilisée ----- */
// ...

const updateImmobilisedProductionFpt = async (indic,financialData,period) =>
{
  financialData.immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic]
    = financialData.mainAggregates.production.periodsData[period.periodKey].footprint.indicators[indic];
  return;
}

/* ----- Empreinte de la production vendue ----- */
// ...

const updateSoldProductionFpt = async (indic,financialData,period) =>
{
  let prevStateDateEnd = getPrevDate(period.dateStart);
  let productionStocks = financialData.stocks.filter(stock => stock.isProductionStock);

  let initialProductionStockAmount = getAmountItems(productionStocks.map(stock => stock.states[prevStateDateEnd]));
  let initialProductionStockFootprint = await buildAggregateFootprint(productionStocks.map(stock => stock.states[prevStateDateEnd]));

  let productionFootprint = financialData.mainAggregates.production.periodsData[period.periodKey].footprint;
  
  let revenueAmount = financialData.revenue.periodsData[period.periodKey].amount;
  console.log(initialProductionStockFootprint);
  console.log(productionFootprint);
  financialData.revenue.periodsData[period.periodKey].footprint.indicators[indic]
    = await mergeIndicators(indic,[
      {amount: initialProductionStockAmount, footprint: initialProductionStockFootprint},
      {amount: roundValue(revenueAmount-initialProductionStockAmount,2), footprint: productionFootprint}
    ]);
  return;
}