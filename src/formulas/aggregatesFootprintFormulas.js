// La Société Nouvelle

// Generic formulas
import { SocialFootprint } from '../footprintObjects/SocialFootprint';
import { getAmountItems, roundValue } from '../utils/Utils';
import { getPrevDate, sortChronologicallyDates } from '../utils/periodsUtils';
import { 
  buildDifferenceFootprint, 
  buildDifferenceIndicator, 
  buildAggregateFootprint, 
  buildAggregateIndicator,
  buildAggregatePeriodFootprint, 
  buildAggregatePeriodIndicator
} from './footprintFormulas';

/** Structure of file
 *    - Intermediate consumptions & purchase stocks footprints
 *    - Build financial accounts footprints
 */

/* ----------------------------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- INTERMEDIATE CONSUMPTIONS & PURCHASES STOCKS FOOTPRINTS ---------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------------------------------- */

export const updateIntermediateConsumptionsFootprints = async (financialData,period) =>
{
  // External expenses accounts
  await updateExternalExpensesAccountsFpt(financialData,period);
  
  // initial states purhcases stocks
  await updateInitialStateStocksFpt(financialData,period);

  // Purchases stocks
  await updatePurchasesStocksStatesFpt(financialData,period);

  // Stocks variations accounts footprints
  await updatePurchasesStocksVariationsAccountsFpt(financialData,period);
}

/* ---------- Empreintes des comptes de charges externes ---------- */
// Agrégation des dépenses rattachées au compte de charge

const updateExternalExpensesAccountsFpt = async (financialData,period) =>
{
  await Promise.all(financialData.externalExpensesAccounts
    .filter((account) => account.periodsData.hasOwnProperty(period.periodKey))
    .map(async (account) => 
  {
    // retrieve expenses
    let expenses = financialData.externalExpenses
      .filter(expense => expense.accountNum==account.accountNum)  // expenses linked to expense account
      .filter(expense => period.regex.test(expense.date))         // expenses within period
      .filter(expense => expense.amount > 0);                     // temp solution to avoid uncertainty issue
    // build footprint
    account.periodsData[period.periodKey].footprint = await buildAggregateFootprint(expenses);
    return;
  }));
  return;
}

/* ----- Empreintes initials des comptes de stocks ----- */
// Agrégation des dépenses rattachées au compte de charge
// to update using external expenses accounts for period

const updateInitialStateStocksFpt = async (financialData,period) =>
{
  // => initial state fpt based on current financial period
  await Promise.all(financialData.stocks
    .filter(stock => !stock.isProductionStock)                                // purchases stocks
    .filter(stock => stock.initialState.date==getPrevDate(period.dateStart))  // initial state date is before period (no prev session imported)
    .filter(stock => stock.initialStateType=="currentFootprint")              // initial fpt based on current financial period (other types : default data)
    .map(async (stock) => 
  {
    // purchases
    let purchases = financialData.externalExpenses
      .filter(expense => stock.purchasesAccounts.includes(expense.accountNum))  // expenses linked to stock account
      .filter(expense => period.regex.test(expense.date))                       // expenses within period
      .filter(expense => expense.amount > 0);                                   // temp solution to avoid uncertainty issue
    let purchasesFootprint = await buildAggregateFootprint(purchases);
    
    if (purchases.length==0) {
      console.log("[ERROR] pas d'achats relatifs au compte de stock "+stock.accountNum+" ("+stock.purchasesAccounts.join(",")+") sur la période "+period.periodKey);
    }

    stock.initialState.footprint = purchasesFootprint;
    stock.states[stock.initialState.date].footprint = purchasesFootprint;
    return;
  }));

  // => initial state fpt based on default data
  await Promise.all(financialData.stocks
    .filter(stock => !stock.isProductionStock)                                        // purchases stocks
    .filter(stock => stock.initialState.date==getPrevDate(period.dateStart))          // initial state date is before period (no prev session imported)
    .filter(stock => stock.initialStateType=="defaultData" && stock.initialStateSet)  // initial fpt based on current financial period (other types : default data)
    .map(async (stock) => 
  {
    stock.states[stock.initialState.date].footprint = stock.initialState.footprint;
    return;
  }));

  // check
  financialData.stocks
    .filter(stock => !stock.isProductionStock)
    .filter(stock => stock.initialState.date==getPrevDate(period.dateStart))
    .filter(stock => stock.initialStateType!="currentFootprint")
    .forEach(stock => {
      if (stock.initialStateType=="defaultData" && !stock.initialStateSet) {
        console.log("[ERROR] état initial manquant pour le compte de stock "+stock.accountNum+" (valeur par défaut)");
      } else if (stock.initialStateType!="defaultData") {
        console.log("[ERROR] état initial non défini pour le compte de stock "+stock.accountNum+" ("+stock.initialStateType+")");
      }
    });
  financialData.stocks
  .filter(stock => !stock.isProductionStock)
  .forEach(stock => {
    if (!stock.states[getPrevDate(period.dateStart)]) {
      console.log("[ERROR] état manquant pour le compte de stock "+stock.accountNum+" au "+getPrevDate(period.dateStart));
    }
  })
  return;
}

/* ---------- Empreinte des stocks d'achats ---------- */
// Agrégation des comptes de charges rattachés au compte de stock
// update to build all states within period

const updatePurchasesStocksStatesFpt = async (financialData,period) =>
{
  let stocks = financialData.stocks.filter(stock => !stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    let finalState = stock.states[period.dateEnd];
    let prevStateDateEnd = getPrevDate(period.dateStart);
    let prevState = stock.states[prevStateDateEnd];

    if (!finalState) {
      console.log("[ERROR] état manquant pour le compte de stock "+stock.accountNum+" au "+period.dateEnd);
    } else if (!prevState) {
      console.log("[ERROR] état manquant pour le compte de stock "+stock.accountNum+" au "+getPrevDate(period.dateStart));
    }
    
    let unstorages = financialData.stockVariations
      .filter(variation => variation.stockAccountNum==stock.accountNum)
      .filter(variation => period.regex.test(variation.date))
      .filter(variation => variation.amount < 0); // all unstorages
    
    let oldStockAmount = Math.max(-getAmountItems(unstorages, 2), 0);     // 0 if no unstorages
    let newStockAmount = roundValue(finalState.amount-oldStockAmount, 2);

    let purchases = financialData.externalExpenses
      .filter(expense => stock.purchasesAccounts.includes(expense.accountNum))
      .filter(expense => period.regex.test(expense.date))
      .filter(expense => expense.amount > 0);
    let purchasesFootprint = await buildAggregateFootprint(purchases);

    if (newStockAmount>0 && purchases.length==0) {
      console.log("[ERROR] pas d'achats relatifs au compte de stock "+stock.accountNum+" ("+stock.purchasesAccounts.join(",")+") sur la période "+period.periodKey);
    }
    
    if (newStockAmount > 0) { // if storage from purchases
      finalState.footprint = await buildAggregateFootprint([
        {amount: oldStockAmount, footprint: prevState.footprint},    // old stock (remains)
        {amount: newStockAmount, footprint: purchasesFootprint}]);   // new stock
    } else { // if only unstorage prev stock
      finalState.footprint = prevState.footprint;
    }
    return;
  }));
  return;
}

/* ----- Empreinte des comptes de variations de stocks d'achats ----- */
// stock variation footprint is based on initial & final footprint of the stock account

const updatePurchasesStocksVariationsFpt = async (financialData,period) =>
{
  // await Promise.all(financialData.stockVariations
  //   .map(async (variation) => 
  // {
  //   let stock = financialData.stocks.filter(stock => stock.defaultStockVariationAccountNum==variation.accountNum)[0];
    
  //   if (stock) {
  //     let finalState = stock.states[period.dateEnd];
  //     let prevStateDateEnd = getPrevDate(period.dateStart);
  //     let initialState = stock.states[prevStateDateEnd];
  
  //     let stockVariationFootprint = await buildDifferenceFootprint(finalState,initialState);
  //     variation.periodsData[period.periodKey].footprint =stockVariationFootprint;
  //   }
  //   return;
  // }));
  // return;
}

/* ----- Empreinte des comptes de variations de stocks d'achats ----- */
// stock variation footprint is based on initial & final footprint of the stock account

const updatePurchasesStocksVariationsAccountsFpt = async (financialData,period) =>
{
  await Promise.all(financialData.stockVariationsAccounts
    .filter(account => account.periodsData.hasOwnProperty(period.periodKey) && account.periodsData[period.periodKey].amount!=0) // account defined for period with amount not null
    .map(async (account) => 
  {
    let stock = financialData.stocks.find(stock => stock.defaultStockVariationAccountNum==account.accountNum);
    
    if (stock && stock.states[period.dateEnd] && stock.states[getPrevDate(period.dateStart)]) 
    {
      let finalState = stock.states[period.dateEnd];
      let prevStateDateEnd = getPrevDate(period.dateStart);
      let initialState = stock.states[prevStateDateEnd];
  
      let stockVariationFootprint = await buildDifferenceFootprint(finalState,initialState);
      account.periodsData[period.periodKey].footprint = stockVariationFootprint;
    } 
    else if (!stock) {
      console.log("[ERROR] compte de stock non trouvé pour compte de variation de stock "+account.accountNum)
    } 
    else if (!stock.states[getPrevDate(period.dateStart)]) {
      console.log("[ERROR] état manquant pour le compte de stock "+stock.accountNum+" au "+getPrevDate(period.dateStart));
    }
    else if (!stock.states[period.dateEnd]) {
      console.log("[ERROR] état manquant pour le compte de stock "+stock.accountNum+" au "+period.dateEnd);
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
  // init state
  await updateInitialStateImmobilisationsFpt(financialData,period);

  // immobilisations & amortisations states
  await updateImmobilisationsStatesFpt(financialData,period);

  // amortisation expenses
  await updateAmortisationExpensesFpt(financialData,period);

  // amortisation expenses accounts
  await updateAmortisationExpenseAccountsFpt(financialData,period);
}

/* ----- Empreintes initiales des comptes d'immobilisation ----- */
// ...

const updateInitialStateImmobilisationsFpt = async (financialData,period) =>
{
  // => initial state fpt based on current financial period
  await Promise.all(financialData.immobilisations
    .filter(immobilisation => immobilisation.isAmortisable)
    .filter(immobilisation => immobilisation.initialState.date==getPrevDate(period.dateStart))
    .filter(immobilisation => immobilisation.initialStateType=="currentFootprint")
    .map(async (immobilisation) => 
  {
    // investments
    let investments = financialData.investments
      .filter(investment => investment.accountNum==immobilisation.accountNum)
      .filter(investment => period.regex.test(investment.date))
      .filter(investment => investment.amount>0);
    let investmentsFootprint = await buildAggregateFootprint(investments);
    
    if (investments.length==0) {
      console.log("[ERROR] pas d'investissements relatifs au compte de stock "+immobilisation.accountNum+" sur la période "+period.periodKey);
    }

    immobilisation.initialState.footprint = investmentsFootprint;
    immobilisation.states[immobilisation.initialState.date].footprint = investmentsFootprint;
    immobilisation.states[immobilisation.initialState.date].amortisationFootprint = investmentsFootprint;
    return;
  }));

  // initial state fpt based on default data
  await Promise.all(financialData.immobilisations
    .filter(immobilisation => immobilisation.isAmortisable)
    .filter(immobilisation => immobilisation.initialState.date==getPrevDate(period.dateStart))
    .filter(immobilisation => immobilisation.initialStateType=="defaultData" && immobilisation.initialStateSet)
    .map(async (immobilisation) => 
  {
    immobilisation.states[immobilisation.initialState.date].footprint = immobilisation.initialState.footprint;
    immobilisation.states[immobilisation.initialState.date].amortisationFootprint = immobilisation.initialState.amortisationFootprint;
    return;
  }));
  return;
}

/* ---------- Empreinte des immobilisations ---------- */
// mises à jour des états successivements (empreinte immobilisation et empreinte amortissement)

const updateImmobilisationsStatesFpt = async (financialData,period) =>
{
  let immobilisations = financialData.immobilisations.filter(immobilisation => immobilisation.isAmortisable);
  await Promise.all(immobilisations.map(async (immobilisation) =>
  {
    let states = Object.values(immobilisation.states)
      .filter(state => period.regex.test(state.date) && state.date!=immobilisation.initialState.date)
      .sort((a,b) => sortChronologicallyDates(a,b));

    for (let state of states) 
    {
      let prevState = immobilisation.states[state.prevStateDate];
      let newImmobilisations = [];

      // investissements
      let investments = financialData.investments
        .filter(investment => investment.accountNum==immobilisation.accountNum)
        .filter(investment => investment.date==state.date);      
      if (investments.length>0) {
        let investmentsAmount = getAmountItems(investments);
        let investmentsFootprint = await buildAggregateFootprint(investments);
        newImmobilisations.push({
          amount: investmentsAmount,
          footprint: investmentsFootprint
        })
      }

      // immobilised production
      let immobilisedProductions = financialData.immobilisedProductions
        .filter(immobilisedProduction => immobilisedProduction.accountNum==immobilisation.accountNum)
        .filter(immobilisedProduction => immobilisedProduction.date==state.date);
      if (immobilisedProductions.length>0) {
        let immobilisedProductionFootprint = await getImmobilisedProductionFpt(financialData,period,period.dateStart,state.date);
        immobilisedProductions.forEach(immobilisedProduction => immobilisedProduction.footprint = immobilisedProductionFootprint);
        let immobilisedProductionAmount = getAmountItems(immobilisedProductions);
        newImmobilisations.push({
          amount: immobilisedProductionAmount,
          footprint: immobilisedProductionFootprint
        })
      }

      let newImmobilisationsAmount = getAmountItems(newImmobilisations, 2);
      // immobilisation footprint
      state.footprint = await buildAggregateFootprint([
        ...newImmobilisations,                                                                             // investments
        {amount: roundValue(state.amount-newImmobilisationsAmount, 2), footprint: prevState.footprint}]);  // remains

      // amortisation footprint
      if (state.amortisationExpenseAmount>0) 
      {
        // amortisation expense footprint
        let amortisationExpenseFootprint = await buildDifferenceFootprint(
          {amount: prevState.amount, footprint: prevState.footprint},                        // immobilisation
          {amount: prevState.amortisationAmount, footprint: prevState.amortisationFootprint} // amortisation
        )
        // amortisation footprint
        state.amortisationFootprint = await buildAggregateFootprint([
          {amount: state.amortisationExpenseAmount, footprint: amortisationExpenseFootprint},                                            // amortisation expense
          {amount: roundValue(state.amortisationAmount-state.amortisationExpenseAmount, 2), footprint: prevState.amortisationFootprint}  // amortisation
        ])
      }
      else {
        state.amortisationFootprint = prevState.amortisationFootprint;
      }

    }
    return;
  }));
  return;
}

const getImmobilisedProductionFpt = async (financialData,period,dateStart,dateEnd) =>
{
  const {
    netValueAdded,
    intermediateConsumptions,
    fixedCapitalConsumptions,
  } = financialData.mainAggregates;

  // Fixed capital consumtpions footprint based on fixed capital consumptions before immobilisation of production
  let amortisationExpenses = financialData.adjustedAmortisationExpenses
    .filter(expense => parseInt(expense.date)>=parseInt(dateStart) && parseInt(expense.date)<=parseInt(dateEnd) && expense.amount>0); // amortisation expenses before immobilised production
  
  if (amortisationExpenses.length > 0) 
  {
    let fixedCapitalConsumptionsFpt = await buildAggregateFootprint(amortisationExpenses);
    let adjustedFixedCapitalConsumptions = {
      periodsData: {
        [period.periodKey]: {
          amount: fixedCapitalConsumptions.periodsData[period.periodKey].amount,
          footprint: fixedCapitalConsumptionsFpt
        }
      }
    };
    let immobilisedProductionFootprint = await buildAggregatePeriodFootprint([netValueAdded,intermediateConsumptions,adjustedFixedCapitalConsumptions],period.periodKey);
    return immobilisedProductionFootprint;
  }
  else
  {
    let immobilisedProductionFootprint = await buildAggregatePeriodFootprint([netValueAdded,intermediateConsumptions],period.periodKey);
    return immobilisedProductionFootprint;
  }
}

/* ----- Empreintes des dotations aux amortissements ----- */
// amortisation expenses footprint based on immobilisation states

const updateAmortisationExpensesFpt = async (financialData,period) =>
{
  let amortisationExpenses = financialData.adjustedAmortisationExpenses.filter(expense => period.regex.test(expense.date) && expense.amount>0);
  await Promise.all(amortisationExpenses.map(async (expense) =>
  {
    let immobilisation = financialData.immobilisations.find(immobilisation => immobilisation.amortisationAccountNum==expense.amortisationAccountNum);
    if (immobilisation) 
    {
      let state = immobilisation.states[expense.date];
      let prevState = immobilisation.states[state.prevStateDate];

      if (!state) {
        console.log("[ERROR] état manquant pour immobilisation "+immobilisation.accountNum+" au "+expense.date);
      } else if (!prevState) {
        console.log("[ERROR] état manquant pour immobilisation "+immobilisation.accountNum+" au "+state.prevStateDate);
      }

      // footprint of what remains to amortise
      expense.footprint = await buildDifferenceFootprint(
        {amount: prevState.amount, footprint: prevState.footprint},                        // immobilisation
        {amount: prevState.amortisationAmount, footprint: prevState.amortisationFootprint} // amortisation
      );
    } else {
      console.log("[ERROR] immobilisation non trouvée pour dotations : "+expense.accountNum+" (compte d'amortissement "+expense.amortisationAccountNum+")")
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
    .filter((account) => account.periodsData.hasOwnProperty(period.periodKey) && account.periodsData[period.periodKey].amount>0)
    .map(async (account) => 
  {
    let amortisationExpenses = financialData.adjustedAmortisationExpenses
      .filter(expense => expense.accountNum==account.accountNum)
      .filter(expense => expense.amount>0)
      .filter(expense => period.regex.test(expense.date));
    
    account.periodsData[period.periodKey].footprint = await buildAggregateFootprint(amortisationExpenses);
    return;
  }));
  return;
}

/* -------------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- FINANCIAL AGGREGATES INDICATORS FORMULAS ---------------------------------------- */
/* -------------------------------------------------------------------------------------------------------------------------- */

export const updateMainAggregatesFootprints = async (financialData,period) =>
{
  const {netValueAdded,
         intermediateConsumptions,
         fixedCapitalConsumptions,
         production} = financialData.mainAggregates;

  // Intermediate consumptions
  let intermediateConsumptionsAccounts = financialData.externalExpensesAccounts
    .concat(financialData.stockVariationsAccounts)
    .filter(account => account.periodsData.hasOwnProperty(period.periodKey) && account.periodsData[period.periodKey].amount>0); // accounts defined on period with amount not null
  intermediateConsumptions.periodsData[period.periodKey].footprint = 
    await buildAggregatePeriodFootprint(intermediateConsumptionsAccounts, period.periodKey);
  
  // Fixed capital consumtpions
  let fixedCapitalConsumptionsAccounts = financialData.amortisationExpensesAccounts
    .filter(account => account.periodsData.hasOwnProperty(period.periodKey) && account.periodsData[period.periodKey].amount>0); // accounts defined on period with amount not null
  fixedCapitalConsumptions.periodsData[period.periodKey].footprint = 
    await buildAggregatePeriodFootprint(fixedCapitalConsumptionsAccounts, period.periodKey);
  
  // Production
  production.periodsData[period.periodKey].footprint = 
    await buildAggregatePeriodFootprint([netValueAdded,intermediateConsumptions,fixedCapitalConsumptions], period.periodKey);
  
  return;
}

/* ---------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- PRODUCTION ITEMS INDICATORS FORMULAS ---------------------------------------- */
/* ---------------------------------------------------------------------------------------------------------------------- */

export const updateProductionItemsFootprints = async (financialData,period) =>
{
  // Production stocks
  await updateProductionStocksStatesFpt(financialData,period);

  // Stored production
  await updateStoredProductionFpt(financialData,period);

  // Immobilised production
  await updateImmobilisedProductionFpt(financialData,period);

  // Sold production
  await updateSoldProductionFpt(financialData,period);

  return;
}

/* ---------- Empreinte des stocks de production ---------- */
// ...

const updateProductionStocksStatesFpt = async (financialData,period) =>
{
  let stocks = financialData.stocks.filter(stock => stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    // initial state
    if (stock.initialState.date==getPrevDate(period.dateStart) && stock.initialStateType=="currentFootprint") {
      stock.initialState.footprint = financialData.mainAggregates.production.periodsData[period.periodKey].footprint;
      stock.states[stock.initialState.date].footprint = financialData.mainAggregates.production.periodsData[period.periodKey].footprint;
    }

    // states
    stock.states[getPrevDate(period.dateStart)].footprint = financialData.mainAggregates.production.periodsData[period.periodKey].footprint;
    stock.states[period.dateEnd].footprint = financialData.mainAggregates.production.periodsData[period.periodKey].footprint;

    return;
  }));
  return;
}

/* ----- Empreinte de la production stockée ----- */
// ...

const updateStoredProductionFpt = async (financialData,period) =>
{
  let prevStateDateEnd = getPrevDate(period.dateStart);
  let productionStocks = financialData.stocks.filter(stock => stock.isProductionStock);

  let initialProductionStockAmount = getAmountItems(productionStocks.map(stock => stock.states[prevStateDateEnd])); // initial amount
  let initialProductionStockFootprint = await buildAggregateFootprint(productionStocks.map(stock => stock.states[prevStateDateEnd])); // inital footprint

  let finalProductionStockAmount = getAmountItems(productionStocks.map(stock => stock.states[period.dateEnd])); // final amount
  let finalProductionStockFootprint = await buildAggregateFootprint(productionStocks.map(stock => stock.states[period.dateEnd])); // final footprint

  financialData.productionAggregates.storedProduction.periodsData[period.periodKey].footprint
    = await buildDifferenceFootprint(
      {amount: finalProductionStockAmount, footprint: finalProductionStockFootprint},     // final production
      {amount: initialProductionStockAmount, footprint: initialProductionStockFootprint}  // initial production
    )
  return;
}

/* ----- Empreinte de la production immobilisée ----- */
// set production footprint

const updateImmobilisedProductionFpt = async (financialData,period) =>
{
  if (financialData.productionAggregates.immobilisedProduction.periodsData[period.periodKey] &&
      financialData.productionAggregates.immobilisedProduction.periodsData[period.periodKey].amount>0) 
  {
    financialData.productionAggregates.immobilisedProduction.periodsData[period.periodKey].footprint
      = financialData.mainAggregates.production.periodsData[period.periodKey].footprint;
  } else {
    financialData.productionAggregates.immobilisedProduction.periodsData[period.periodKey].footprint = new SocialFootprint();
  }
  return;
}

/* ----- Empreinte de la production vendue ----- */
// revenue fpt from production fpt & init stocks amount

const updateSoldProductionFpt = async (financialData,period) =>
{
  let prevStateDateEnd = getPrevDate(period.dateStart);
  let productionStocks = financialData.stocks.filter(stock => stock.isProductionStock);

  let initialProductionStockAmount = getAmountItems(productionStocks.map(stock => stock.states[prevStateDateEnd])); // initial production stocks amount
  let initialProductionStockFootprint = await buildAggregateFootprint(productionStocks.map(stock => stock.states[prevStateDateEnd])); // initial production stocks fpt

  let revenueAmount = financialData.productionAggregates.revenue.periodsData[period.periodKey].amount;
  let productionFootprint = financialData.mainAggregates.production.periodsData[period.periodKey].footprint;

  financialData.productionAggregates.revenue.periodsData[period.periodKey].footprint
    = await buildAggregateFootprint([
      {amount: initialProductionStockAmount, footprint: initialProductionStockFootprint},
      {amount: roundValue(revenueAmount-initialProductionStockAmount,2), footprint: productionFootprint}
    ]);
  return;
}