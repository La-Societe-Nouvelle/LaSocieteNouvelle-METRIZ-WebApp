// La Société Nouvelle

// Generic formulas
import { updateImmobilisationPeriodsFpt } from './aggregatesFootprintFormulasForPeriods';
import { buildAggregateFootprint, buildAggregateIndicator, buildIndicatorMerge, buildVariationFootprint, mergeFootprints } from './footprintFormulas';

/** Structure of file
 *    - Assignment companies footprints to expenses and investments
 *    - Build financial accounts footprints
 */

/* ------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- ASSIGN COMPANIES FOOTPRINTS ---------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------- */

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

export const updateIntermediateConsumptionsFpt = async (indic,financialData) =>
{
  // External expenses --------------------------------------------------------- //

  // External expenses accounts
  await updateExternalExpensesAccountsFpt(financialData);

  // Purchases stocks ---------------------------------------------------------- //
  
  // Purchases stocks
  await updatePurchasesStocksFpt(financialData);

  // Stocks variations footprints
  //await updatePurchasesStocksVariationsFpt(indic,financialData);

  // Stocks variations accounts footprints
  await updatePurchasesStocksVariationsAccountsFpt(financialData);
}

/* ---------- Empreintes des comptes de charges externes ---------- */
// Agrégation des dépenses rattachées au compte de charges

const updateExternalExpensesAccountsFpt = async (financialData) =>
{
  await Promise.all(financialData.expenseAccounts
    .filter(account => /^6(0[^3]|1|2)/.test(account.accountNum)) // get external expenses accounts
    .map(async ({accountNum,footprint}) => 
  {
    // retrieve expenses (linked to the account)
    let expenses = financialData.expenses.filter(expense => expense.account==accountNum && expense.amount>0); // temp solution to avoid uncertainty issue
    // build footprint
    footprint = await buildAggregateFootprint(expenses);
    return;
  }));
  return;
}

/* ---------- Empreinte des stocks d'achats ---------- */
// Agrégation des comptes de charges rattachés au compte de stock

const updatePurchasesStocksFpt = async (financialData) =>
{
  let stocks = financialData.stocks.filter(stock => !stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    let accountsRelatedToStock = getAccountsRelatedToStock(stock,financialData.expenseAccounts);
    if (accountsRelatedToStock.length > 0) {
      stock.footprint = await buildAggregateFootprint(accountsRelatedToStock);
    } else {
      stock.footprint = stock.prevFootprint;
    }
    // initial state
    if (stock.initialState=="currentFootprint") {
      stock.prevFootprint = stock.footprint;
    }
    // variation
    stockVariation = financialData.stockVariations.filter(stockVariation => stockVariation.accountAux==stock.account)[0];
    stockVariation.footprint = await buildVariationFootprint(stock);
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
// VS = SF - SI
// stock account appears in only one stock variation item

// const updatePurchasesStocksVariationsFpt = async (indic,financialData) =>
// {
//   let stocksVariations = financialData.stockVariations.filter(stockVariation => /^6/.test(stockVariation.account));
//   await Promise.all(stocksVariations.map(async (variation) =>
//   {
//     let stock = financialData.getStockByAccount(variation.accountAux);
//     variation.footprint.indicators[indic] = await mergeFootprints(stock.footprint.indicators[indic], stock.amount,
//                                                                   stock.prevFootprint.indicators[indic], -stock.prevAmount);
//     // Le calcul de l'incertitude peut entraîner des résultats erronés, les valeurs étant traitées comme décorrélées
//     // L'incertitude associée est donc celle de la valeur courante
//     variation.footprint.indicators[indic].setUncertainty(stock.footprint.indicators[indic].getUncertainty());
//     return;
//   }));
//   return;
// }

/* ----- Empreinte des comptes de variations de stocks d'achats ----- */
// stock variation footprint is based on initial & final footprint of the stock account

export const updatePurchasesStocksVariationsAccountsFpt = async (financialData) =>
{
  await Promise.all(financialData.expenseAccounts
    .filter(account => /^603/.test(account.accountNum))
    .map(async ({accountNum,footprint}) => 
  {
    // filter stocks
    let stock = financialData.stocks.filter(stock => stock.account.startsWith(accountNum.substring(2)));
    // build indicator
    footprint = await buildVariationFootprint(stock);
    return;
  }));
  return;
}

/* ------------------------------------------------------------------------------------------------- */
/* -------------------- FIXED CAPITAL CONSUMPTIONS & IMMOBILISATIONS FOOTPRINTS -------------------- */
/* ------------------------------------------------------------------------------------------------- */

/** 
 *    -> set prev footprint for account with initial state "currentFootprint" -> when update periods
 */

export const updateFixedCapitalConsumptionsFpt = async (indic,financialData,financialPeriod) =>
{
  // Immobilisations ----------------------------------------------------------- //

  // immobilisations periods
  await updateImmobilisationPeriodsFpt(indic,financialData,financialPeriod);

  // amortisation accounts


}

/* ----- Empreinte des comptes de dotations aux amortissements ----- */
// amortisation expenses footprint is based on...

export const updateAmortisationExpenseAccountsFpt = async (financialData) =>
{
  await Promise.all(financialData.expenseAccounts
    .filter(account => /^68/.test(account.accountNum))
    .map(async ({accountNum,footprint}) => 
  {
    // filter amortisation expenses
    let adjustedAmortisationExpenses = financialData.adjustedAmortisationExpenses.filter(expense => expense.accountNum==accountNum);
    // build indicator
    footprint = await buildAggregateFootprint(adjustedAmortisationExpenses);
    return;
  }));
  return;
}

/* -------------------------------------------------------------------------------- */
/* -------------------- FINANCIAL ACCOUNTS INDICATORS FORMULAS -------------------- */
/* -------------------------------------------------------------------------------- */

export const updateAccountsFootprints = async (indic,financialData) =>
{

    // Depreciation expenses ----------------------------------------------------- //
    
    // Depreciation expenses
    //await updateDepreciationExpensesIndicator(indic,financialData);

    // Depreciation expenses accounts
    //await updateDepreciationExpensesAccountsIndicator(indic,financialData);

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
    let investments = financialData.investments.filter(investment => investment.accountNum == immobilisation.accountNum);
    let investmentsIndicator = await buildAggregateIndicator(indic,investments);

    let amountInvestments = investments.map(investment => investment.amount)
                                       .reduce((a,b) => a+b,0);
    let amountImmobilisedProduction = financialData.immobilisationProductions.filter(immobilisationProduction => immobilisationProduction.accountNum == immobilisation.accountNum)
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
        let expenses = financialData.depreciationExpenses.filter(expense => expense.accountNum == accountNum);
        // build indicator
        footprint.indicators[indic] = await buildAggregateIndicator(indic,expenses);
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
           capitalConsumption,
           production} = financialData.aggregates;

    // External expenses
    let externalExpensesAccounts = financialData.expenseAccounts.filter(account => /^6(0[^3]|1|2)/.test(account.accountNum));
    externalExpenses.footprint.indicators[indic] = await buildAggregateIndicator(indic,externalExpensesAccounts);
    
    // Purchasing stock Variations
    let purchaseStocksVariationsAccounts = financialData.expenseAccounts.filter(account => /^603/.test(account.accountNum));
    storedPurchases.footprint.indicators[indic] = await buildAggregateIndicator(indic,purchaseStocksVariationsAccounts);
    
    // Intermediate consumption
    let expensesAccounts = financialData.expenseAccounts.filter(account => /^6(0|1|2)/.test(account.accountNum));
    intermediateConsumption.footprint.indicators[indic] = await buildAggregateIndicator(indic,expensesAccounts);;
    
    // Capital consumption
    let depreciationExpensesAccounts = financialData.expenseAccounts.filter(account => /^68/.test(account.accountNum));
    capitalConsumption.footprint.indicators[indic] = await buildAggregateIndicator(indic,depreciationExpensesAccounts);
        
    // Current production
    production.footprint.indicators[indic] = await buildAggregateIndicator(indic, [netValueAdded,intermediateConsumption,capitalConsumption]);
    
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
  productionStocks.prevFootprint.indicators[indic] = await buildAggregateIndicator(indic,financialData.stocks.filter(stock => stock.isProductionStock),{usePrev: true});
  productionStocks.footprint.indicators[indic] = await buildAggregateIndicator(indic,financialData.stocks.filter(stock => stock.isProductionStock));
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

export const updateFinalStatesFootprints = async (indic,financialData) =>
{
    // Immobilisations
    await updateImmobilisationsIndicator(indic,financialData);
    
    // Depreciations
    await updateDepreciationsIndicator(indic,financialData);
    
    return;
}

/* ----- Immoblisations footprints ----- */

/** Empreinte déduite à partir de l'empreinte initiale, des investissements et des immobilisations de production
 *  2 étapes :
 *    - Calcul de l'empreinte des investissements, et association à l'empreinte initiale
 *    - Calcul de l'empreinte des immobilisations de production, et association à l'empreinte précédement obtenue (intiale + investissements)
 */

const updateImmobilisationsIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.immobilisations.map(async (immobilisation) => 
  {
    // Investments
    let investments = financialData.investments.filter(investment => investment.accountNum == immobilisation.accountNum);
    let amountInvestments = investments.map(investment => investment.amount)
                                       .reduce((a,b) => a+b,0);
    // Immobilised production
    let immobilisedProductions = financialData.immobilisationProductions.filter(immobilisationProduction => immobilisationProduction.accountNum == immobilisation.accountNum);
    let amountImmobilisedProduction = immobilisedProductions.map(immobilisationProduction => immobilisationProduction.amount)
                                                            .reduce((a,b) => a+b,0);
    
    // Merge investments indicator
    let investmentsIndicator = await buildAggregateIndicator(indic,investments);
    let immobilisationIndicator = investments.length > 0 ? await buildIndicatorMerge(immobilisation.prevFootprint.indicators[indic], immobilisation.amount-amountInvestments-amountImmobilisedProduction,
                                                                                     investmentsIndicator, amountInvestments) 
                                                         : immobilisation.prevFootprint.indicators[indic];
    // Merge immobilised productions indicator
    let immobilisationProductionsIndicator = await buildAggregateIndicator(indic,immobilisedProductions);
    immobilisationIndicator = immobilisedProductions.length > 0 ? await buildIndicatorMerge(immobilisationIndicator, immobilisation.amount-amountImmobilisedProduction,
                                                                                            immobilisationProductionsIndicator, amountImmobilisedProduction) 
                                                                : immobilisation.prevFootprint.indicators[indic];

    // Assign indicator
    immobilisation.footprint.indicators[indic] = immobilisationIndicator;
    return;
  }));
  return;
}

 /* ----- Depreciations footprints ----- */

/** Empreinte obtenue à partir de l'empreinte initiale et des empreinte des dotations aux amortissements
 *  L'empreinte des dotations est pondérée à hauteur du montant des dotations.
 *  L'empreinte initiale du compte d'amortissement est pondrée à hauteur du montant "restant" (montant final du compte - montant des dotations)
 *  En l'absence de dotations, l'empreinte finale correspond à l'empreinte initiale.
 */

const updateDepreciationsIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.depreciations.map(async (depreciation) => 
  {
    // Depreciation expenses
    let depreciationExpense = financialData.getDepreciationExpenseByAccountAux(depreciation.accountNum);
    // Merge if expense defined
    depreciation.footprint.indicators[indic] = depreciationExpense!=undefined ? await buildIndicatorMerge(depreciation.prevFootprint.indicators[indic], depreciation.amount-depreciationExpense.amount,
                                                                                                          depreciationExpense.footprint.indicators[indic], depreciationExpense.amount)
                                                                              : depreciation.prevFootprint.indicators[indic];
    return;
  }));
  return;
}