// La Société Nouvelle

// Generic formulas
import { getLastDateOfMonth, getNbDaysBetweenDates, getNextMonth, getSumItems, isInPeriod } from '../utils/Utils';
import { buildIndicatorAggregate, buildIndicatorMerge } from './footprintFormulas';

/** Structure of file
 *    - Assignment companies footprints to expenses or investments
 *    - Build financial accounts footprints
 * 
 *  Date format : YYYYMMDD
 */

/* -------------------------------------------------------------------------------- */
/* -------------------- FINANCIAL ACCOUNTS INDICATORS FORMULAS -------------------- */
/* -------------------------------------------------------------------------------- */

export const updateAccountsFootprintsOverPeriod = async (indic,financialData,dateStart,dateEnd) =>
{
    // External expenses --------------------------------------------------------- //

    // External expenses accounts
    await updateExternalExpensesAccountsIndicator(indic,financialData);

    // Purchase stocks ----------------------------------------------------------- //
    
    // Purchase stocks
    await updatePurchasesStocksIndicator(indic,financialData);

    // ...previous footprints based on current financial year
    financialData.stocks.filter(stock => !stock.isProductionStock)
                        .filter(stock => stock.initialState == "currentFootprint")
                        .map(async (stock) => stock.prevFootprint.indicators[indic] = stock.footprint.indicators[indic]);      

    // Purchase stocks variations ------------------------------------------------ //

    // Stocks variations footprints
    await updatePurchasesStocksVariationsIndicator(indic,financialData);

    // Stocks variations accounts footprints
    await updatePurchasesStocksVariationsAccountsIndicator(indic,financialData);

    // Immobilisation ------------------------------------------------------------ //

    // ...previous immobilisation footprints based on current financial year
    await financialData.immobilisations.filter(immobilisation => immobilisation.initialState == "currentFootprint")
                                       .map(async (immobilisation) => 
    {
        let investmentsRelatedToImmobilisation = financialData.investments.filter(investment => investment.account == immobilisation.account);
        immobilisation.prevFootprint.indicators[indic] = await buildIndicatorAggregate(indic,investmentsRelatedToImmobilisation);
        return;
    });

    // ...previous depreciation footprints based on current financial year
    await financialData.depreciations.filter(depreciation => /^28/.test(depreciation.account))
                                     .filter(depreciation => depreciation.initialState == "currentFootprint")
                                     .map(async (depreciation) => 
    {
        let immobilisation = financialData.getImmobilisationByAccount(depreciation.accountAux);
        depreciation.prevFootprint.indicators[indic] = immobilisation.prevFootprint.indicators[indic];
        return;
    });

    // Depreciation expenses ----------------------------------------------------- //
    
    // Depreciation expenses
    await updateDepreciationExpensesIndicator(indic,financialData);

    // Depreciation expenses accounts
    await updateDepreciationExpensesAccountsIndicator(indic,financialData);

    return;
}

/* ---------- Empreintes des comptes de charges externes ---------- */

// Agrégation des dépenses rattachées au compte

export const updateExternalExpensesAccountsIndicatorMonthly = async (indic,financialData,month) =>
{
    await Promise.all(financialData.expenseAccounts.filter(account => /^6(0[^3]|1|2)/.test(account.accountNum)) // get external expenses accounts
                                                   .map(async ({data}) => 
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

// Agrégation des comptes de charges rattachés au compte de stock

export const updatePurchasesStocksIndicatorMonthy = async (indic,financialData,month) =>
{
  let stocks = financialData.stocks.filter(stock => !stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    let accountsRelatedToStock = getAccountsRelatedToStock(stock,financialData.expenseAccounts).map(account => account.data[month]);
    // footprint
    if (accountsRelatedToStock.length > 0) stock.data[month].footprint.indicators[indic] = await buildIndicatorAggregate(indic, accountsRelatedToStock);
    else                                   stock.data[month].footprint.indicators[indic] = stock.data[month].prevFootprint.indicators[indic];
    // prev footprint
    let nextMonth = getNextMonth();
    if (stock.data[nextMonth]!=undefined) stock.data[nextMonth].prevFootprint.indicators[indic] = stock.data[month].footprint.indicators[indic];
    return;
  }));
  return;
}

const getAccountsRelatedToStock = (stock,accounts) =>
{
  let accountsRelatedToStock = accounts.filter(account => account.accountNum.startsWith(stock.accountAux));
  // case - no expenses related to stock
  if (accountsRelatedToStock.length == 0) accountsRelatedToStock = accounts.filter(account => account.accountNum.startsWith("60"+stock.account.charAt(1)));
  return accountsRelatedToStock;
}

/* ---------- Empreinte des variations de stocks d'achats ---------- */

// stock variation footprint is based on initial & final footprint of the stock account
// VS = SI - SF
// stock account appears in only one stock variation item

export const updatePurchasesStocksVariationsIndicator = async (indic,financialData) =>
{
  let stocksVariations = financialData.stockVariations.filter(stockVariation => /^6/.test(stockVariation.account));
  await Promise.all(stocksVariations.map(async (variation) =>
  {
    let stock = financialData.getStockByAccount(variation.accountAux);
    variation.footprint.indicators[indic] = await buildIndicatorMerge(stock.prevFootprint.indicators[indic], stock.prevAmount,
                                                                      stock.footprint.indicators[indic], -stock.amount);
    // Le calcul de l'incertitude peut entraîner des résultats erronés, les valeurs étant traitées comme décorrélées
    // L'incertitude associée est donc celle de la valeur courante
    variation.footprint.indicators[indic].setUncertainty(stock.footprint.indicators[indic].getUncertainty());
    return;
  }));
  return;
}

/* ----- Empreinte des comptes de variations de stocks d'achats ----- */

// stock variation footprint is based on initial & final footprint of the stock account

export const updatePurchasesStocksVariationsAccountsIndicator = async (indic,financialData) =>
{
    await Promise.all(financialData.expenseAccounts.filter(account => /^603/.test(account.accountNum))
                                                   .map(async ({accountNum,footprint}) => 
    {
        // filter expenses
        let stockVariations = financialData.stockVariations.filter(variation => variation.account == accountNum);
        // build indicator
        footprint.indicators[indic] = await buildIndicatorAggregate(indic,stockVariations);
        return;
    }));
    return;
}

/* ----- Depreciation expenses footprints ----- */

// footprint based on immobilisation footprint (before immobilised production) & previous depreciation footprint
/** Formules :
 *    Empreinte sociétale du reste à ammortir du compte d'immobilisation.
 *    Les investissements réalisés sur l'exercice sont pris en compte. La production immobilisée est exclue (empreinte dépendante de la production).
 *  3 étapes :
 *    - Empreinte des investissements réalisés sur l'exercice
 *    - Empreinte du compte d'immobilisation (hors production immobilisée)
 *    - Déduction de l'empreinte du compte d'amortissement
 */

export const updateDepreciationExpensesIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.depreciationExpenses.map(async (expense) =>
  {
    let depreciation = financialData.getDepreciationByAccount(expense.accountAux);
    let immobilisation = financialData.getImmobilisationByAccount(depreciation.accountAux);

    // Indicator of immobilisation before immobilised production
    let investments = financialData.investments.filter(investment => investment.account == immobilisation.account);
    let investmentsIndicator = await buildIndicatorAggregate(indic,investments);

    let amountInvestments = investments.map(investment => investment.amount)
                                       .reduce((a,b) => a+b,0);
    let amountImmobilisedProduction = financialData.immobilisationProductions.filter(immobilisationProduction => immobilisationProduction.account == immobilisation.account)
                                                                             .map(immobilisationProduction => immobilisationProduction.amount)
                                                                             .reduce((a,b) => a+b,0);
    
    let immobilisationIndicator = investments.length > 0 ? await buildIndicatorMerge(immobilisation.prevFootprint.indicators[indic], immobilisation.amount-amountInvestments-amountImmobilisedProduction,
                                                                                     investmentsIndicator, amountInvestments) 
                                                         : immobilisation.prevFootprint.indicators[indic];
    // Footprint (reste à amortir)
    expense.footprint.indicators[indic] = await buildIndicatorMerge(immobilisationIndicator, immobilisation.amount-amountImmobilisedProduction,
                                                                    depreciation.prevFootprint.indicators[indic], -(depreciation.amount-expense.amount));
    // Le calcul de l'incertitude peut entraîner des résultats erronés, les valeurs étant supposées décorrélées et l'impact brut restant à amortir pouvant être faible
    // L'incertitude associée est donc celle de la valeur associée à l'immobilisation
    expense.footprint.indicators[indic].setUncertainty(immobilisationIndicator.getUncertainty());
    return;
  }));
  return;
}

/* ---------- Empreintes des comptes de charges externes ---------- */

// Agrégation des dotations rattachées au compte

export const updateDepreciationExpensesAccountsIndicator = async (indic,financialData) =>
{
    await Promise.all(financialData.expenseAccounts.filter(account => /^68/.test(account.accountNum))
                                                   .map(async ({accountNum,footprint}) => 
    {
        // filter expenses
        let expenses = financialData.depreciationExpenses.filter(expense => expense.account == accountNum);
        // build indicator
        footprint.indicators[indic] = await buildIndicatorAggregate(indic,expenses);
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

export const updateProductionItemsFootprints = async (indic,financialData) =>
{
  const {production,
         productionStocks,
         storedProduction,
         immobilisedProduction,
         revenue} = financialData.aggregates;

  // Production stocks ----------------------------------------------------------- //

  // Set production footprint to final production stocks footprint
  financialData.stocks.filter(stock => stock.isProductionStock)
                      .forEach(stock => stock.footprint.indicators[indic] = financialData.aggregates.production.footprint.indicators[indic]);
  
  // ...initial production stock footprint based on current production footprint
  financialData.stocks.filter(stock => stock.isProductionStock)
                      .filter(stock => stock.prevFootprint.indicators[indic].value == null)
                      .forEach(stock => stock.prevFootprint.indicators[indic] = financialData.aggregates.production.footprint.indicators[indic]);

  // Stored production
  productionStocks.prevFootprint.indicators[indic] = await buildIndicatorAggregate(indic,financialData.stocks.filter(stock => stock.isProductionStock),{usePrev: true});
  productionStocks.footprint.indicators[indic] = await buildIndicatorAggregate(indic,financialData.stocks.filter(stock => stock.isProductionStock));
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
    await updateImmobilisationsFootprintMonthly(indic,financialData,month);
    
    // Depreciations
    await updateDepreciationsFootprintMonthly(indic,financialData,month);
    
    return;
}

/* ----- Immoblisations footprints ----- */

/** Empreinte déduite à partir de l'empreinte de la période incluant la fin du mois
 *  L'empreinte et le montant sont constants pour une période pour les comptes d'immobilisation.
 */

const updateImmobilisationsFootprintMonthly = async (indic,financialData) =>
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

const updateDepreciationsFootprintMonthly = async (indic,financialData,month) =>
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