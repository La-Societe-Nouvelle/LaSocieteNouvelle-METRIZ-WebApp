// La Société Nouvelle

// Generic formulas
import { Aggregate } from '../accountingObjects/Aggregate';
import { Immobilisation } from '../accountingObjects/Immobilisation';
import { SocialFootprint } from '../footprintObjects/SocialFootprint';
import { getAmountItems, getPrevDate, roundValue, sortChronologicallyDates } from '../utils/Utils';
import { buildAggregateFootprint, buildAggregateIndicator, buildAggregatePeriodIndicator, buildDifferenceFootprint, mergeFootprints } from './footprintFormulas';

import metaIndics from "/lib/indics";

/** Structure of file
 *    - Assignment companies footprints to expenses or investments
 *    - Build financial accounts footprints
 * 
 *  Date format : YYYYMMDD
 */

/* ------------------------------------------------------------------------------------ */
/* -------------------- IMMBOLISATION'S PERIODS FOOTPRINT FORMULAS -------------------- */
/* ------------------------------------------------------------------------------------ */

const buildConsumptionsPeriodAggregate = async (indic,financialData,dateStart,dateEnd) =>
{
  let aggregate = new Aggregate();

  let externalExpenses = financialData.externalExpenses
    .filter(expense => parseInt(expense.date)>=parseInt(dateStart) && parseInt(expense.date)<=parseInt(dateEnd));
  let stockVariations = financialData.stockVariations
    .filter(variation => parseInt(variation.date)>=parseInt(dateStart) && parseInt(variation.date)<=parseInt(dateEnd));
  let amortisationExpenses = financialData.adjustedAmortisationExpenses
    .filter(expense => parseInt(expense.date)>=parseInt(dateStart) && parseInt(expense.date)<=parseInt(dateEnd));  
  
  let expenses = [...externalExpenses,...stockVariations,...amortisationExpenses];

  aggregate.footprint.indicators[indic] = await buildAggregateIndicator(indic,expenses);
  aggregate.amount = await getAmountItems(expenses);

  return aggregate;
}

export const getImmobilisedProductionFootprint = async (indic,financialData,period) =>
{
  const {
    netValueAdded,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    production,
  } = financialData.mainAggregates;

  // Fixed capital consumtpions
  let fixedCapitalConsumptionsFpt = await buildFixedCapitalConsumptionsFootprint(financialData,period,0,true);
  console.log("there 1");
  console.log(fixedCapitalConsumptionsFpt);
  let partConsumptionOfImmobilisedProduction = await buildFixedCapitalConsumptionsFootprint(financialData,period,1,false);
  console.log("there 2");
  console.log(partConsumptionOfImmobilisedProduction);
  let consumptionOfImmobilisedProduction = partConsumptionOfImmobilisedProduction.indicators.eco.value*fixedCapitalConsumptions.periodsData[period.periodKey].amount;
  console.log(consumptionOfImmobilisedProduction);
  let adjustedFixedCapitalConsumptions = {
    periodsData: {
      [period.periodKey]: {
        amount: roundValue(fixedCapitalConsumptions.periodsData[period.periodKey].amount-consumptionOfImmobilisedProduction, 2),
        footprint: fixedCapitalConsumptionsFpt
      }
    }
  }

  // Production
  console.log(adjustedFixedCapitalConsumptions);
  console.log(intermediateConsumptions);
  console.log(netValueAdded);
  let immobilisedProductionFootprint = await buildAggregatePeriodIndicator(indic,[netValueAdded,intermediateConsumptions,adjustedFixedCapitalConsumptions],period.periodKey);
  console.log("fpt");
  console.log(immobilisedProductionFootprint);
  console.log(production.periodsData[period.periodKey].footprint.indicators.eco);
  return immobilisedProductionFootprint;
}

const buildFixedCapitalConsumptionsFootprint = async (financialData,period,valueForImmobilisedProduction,applyInvestmentsFootprint) =>
{
  let amortisationExpenses = [];

  let immobilisations = financialData.immobilisations.filter(immobilisation => immobilisation.isAmortisable).map(immobilisation => new Immobilisation(immobilisation));
  await Promise.all(immobilisations
    .map(async (immobilisation) =>
  {
    let states = Object.values(immobilisation.states)
      .filter(state => period.regex.test(state.date))
      .sort((a,b) => sortChronologicallyDates(a,b));

    if (!applyInvestmentsFootprint) {
      console.log(getPrevDate(period.dateStart));
      immobilisation.states[getPrevDate(period.dateStart)].footprint = getFootprintWithValue(0);
      immobilisation.states[getPrevDate(period.dateStart)].amortisationFootprint = getFootprintWithValue(0);
    }

    for (let state of states) 
    {
      let prevState = immobilisation.states[state.prevStateDate];
      console.log(prevState);
      let newImmobilisations = [];

      // investissements
      let investments = financialData.investments
        .filter(investment => investment.accountNum==immobilisation.accountNum)
        .filter(investment => investment.date==state.date);      
      if (investments.length>0) {
        let investmentsAmount = getAmountItems(investments);
        let investmentsFootprint = applyInvestmentsFootprint ? await buildAggregateFootprint(investments) : getFootprintWithValue(0);
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
        console.log("Production immobilisée !");
        let immobilisedProductionsAmount = getAmountItems(immobilisedProductions);
        let immobilisedProductionsFootprint = getFootprintWithValue(valueForImmobilisedProduction);
        newImmobilisations.push({
          amount: immobilisedProductionsAmount,
          footprint: immobilisedProductionsFootprint
        })
      }

      let newImmobilisationsAmount = getAmountItems(newImmobilisations, 2);
      console.log(newImmobilisations);
      console.log(prevState.footprint);
      console.log({amount: roundValue(state.amount-newImmobilisationsAmount, 2), footprint: prevState.footprint});
      // immobilisation footprint
      state.footprint = await mergeFootprints([
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
        // add expense to list
        amortisationExpenses.push({
          amount: state.amortisationExpenseAmount,
          footprint: amortisationExpenseFootprint
        })
        // amortisation footprint
        state.amortisationFootprint = await mergeFootprints([
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

  return buildAggregateFootprint(amortisationExpenses);
}

const getFootprintWithValue = (valueToApply) => {
  let footprint = new SocialFootprint();
  Object.keys(metaIndics).forEach(indic => footprint.indicators[indic].value = valueToApply);
  return footprint;
}