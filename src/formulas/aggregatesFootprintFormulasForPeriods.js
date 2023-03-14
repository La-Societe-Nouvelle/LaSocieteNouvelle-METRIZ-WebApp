// La Société Nouvelle

// Generic formulas
import { Aggregate } from '../accountingObjects/Aggregate';
import { getAmountItems, getPrevDate } from '../utils/Utils';
import { buildAggregateFootprint, buildAggregateIndicator } from './footprintFormulas';

/** Structure of file
 *    - Assignment companies footprints to expenses or investments
 *    - Build financial accounts footprints
 * 
 *  Date format : YYYYMMDD
 */

/* ------------------------------------------------------------------------------------ */
/* -------------------- IMMBOLISATION'S PERIODS FOOTPRINT FORMULAS -------------------- */
/* ------------------------------------------------------------------------------------ */

export const updateImmobilisationPeriodsFpt = async (indic,financialData,financialPeriod) =>
{
  let periods = financialData.immobilisationPeriods;
  financialData.immobilisations
    .filter(immobilisation => immobilisation.isAmortisable)
    .map(async immobilisation => 
    {
      let investments = financialData.investments.filter(investment => investment.accountNum==immobilisation.accountNum);
      let productionImmobilisations = financialData.productionImmobilisations.filter(item => item.accountAux==item.accountNum);

      let amortisation = financialData.adjustedAmortisations.filter(amortisation => amortisation.accountAux==immobilisation.accountNum)[0];
      let amortisationExpenses = financialData.adjustedAmortisationExpenses.filter(expense => expense.accountAux==amortisation.accountNum);

      if (immobilisation.initialState=="currentFootprint") {
        let investmentsFpt = buildAggregateFootprint(investments);
        immobilisation.prevFootprint = investmentsFpt;
        amortisation.prevFootprint = investmentsFpt;
      }

      let prevImmobilisation = new Aggregate({
        amount: immobilisation.prevAmount, 
        footprint: immobilisation.prevFootprint
      });

      let prevAmortisation = new Aggregate({
        amount: amortisation.prevAmount,
        footprint: amortisation.prevFootprint
      })


      for (let period of periods)
      {
        // Immobilisation ----------------------------------- //
        // update fpt based on investments/immobilisations of production at the beginning of the period

        let immobilisationPeriod = immobilisation.periods.filter(immobilisationPeriod => immobilisationPeriod.index==period.index)[0]; // to do key-value
        let immobilisationPeriodAggregates = [];

        // investments (beginning of period)
        let investmentsPeriod = investments.filter(investment => investment.date==period.dateStart);
        immobilisationPeriodAggregates.push(investmentsPeriod); // add investments

        // immobilisations of production (beginning of period)
        let productionImmobilisationsPeriod = productionImmobilisations.filter(item => item.date==period.dateEnd);
        if (productionImmobilisationsPeriod.length>0) {
          let productionImmobilisationsAggregate = new Aggregate();
          productionImmobilisationsAggregate.amount = getAmountItems(productionImmobilisationsPeriod);
          productionImmobilisationsAggregate.footprint.indicators[indic] = await getProductionFptBetweenDates(indic,financialData,financialPeriod.dateStart,financialPeriod.dateEnd);
          immobilisationPeriodAggregates.push(productionImmobilisationsAggregate); // add immobilisations of production
        }

        // previous data
        let prevImmobilisationAggregate = new Aggregate();
        prevImmobilisationAggregate.amount = immobilisationPeriod.amount-getAmountItems(immobilisationPeriodAggregates); // remains of previous value
        prevImmobilisationAggregate.footprint.indicators[indic] = prevImmobilisation.footprint.indicators[indic];
        immobilisationPeriodAggregates.push(prevImmobilisationAggregate);

        // set new footprint
        if (immobilisationPeriodAggregates.length>1) {
          immobilisationPeriod.footprint.indicators[indic] = await buildAggregateIndicator(indic,immobilisationPeriodAggregates);
        } else {
          immobilisationPeriod.footprint.indicators[indic] = prevImmobilisation.footprint.indicators[indic];;
        }

        // Amortisation expenses ---------------------------- //
        // update amortisation expenses fpt

        let amortisationExpensesPeriod = amortisationExpenses.filter(expense => expense.date==period.dateEnd);

        if (amortisationExpensesPeriod.length>0) {
          let amortisationExpensesPeriodFpt = await buildAggregateIndicator(indic, [immobilisationPeriod,prevAmortisation]);
          amortisationExpensesPeriod.forEach((amortisationExpense) => amortisationExpense.footprint.indicators[indic] = amortisationExpensesPeriodFpt);
        }

        // Amortisation ------------------------------------- //
        // update amortisation fpt based on amortisation expenses at the beginning of the period

        let amortisationPeriod = amortisation.periods.filter(amortisationPeriod => amortisationPeriod.index==period.index)[0];
        let amortisationPeriodAggregates = [];

        // amortisation expenses
        amortisationPeriodAggregates.push(amortisationExpensesPeriod);

        // previous data
        let prevAmortisationAggregate = new Aggregate();
        prevAmortisationAggregate.amount = amortisationPeriod.amount-getAmountItems(amortisationExpensesPeriod); // remains of previous value
        prevImmobilisationAggregate.footprint.indicators[indic] = amortisationPrevFpt;
        amortisationPeriodAggregates.push(prevAmortisationAggregate);

        // set new footprint
        if (amortisationPeriodAggregates.length>1) {
          amortisationPeriod.footprint.indicators[indic] = await buildAggregateIndicator(indic,amortisationPeriodAggregates);
        } else {
          amortisationPeriod.footprint.indicators[indic] = amortisationPrevFpt;
        }

        // -------------------------------------------------- //

        prevImmobilisation = immobilisationPeriod;
        prevAmortisation = amortisationPeriod;

        immobilisation.footprint.indicators[indic] = immobilisationPeriod.footprint.indicators[indic];
        amortisation.footprint.indicators[indic] = amortisationPeriod.footprint.indicators[indic];
      }
      return;
    })
}

const getProductionFptBetweenDates = async (indic,financialData,dateStart,dateEnd) =>
{
  let netValueAdded = financialData.mainAggregates.netValueAdded;
  let intermediateConsumptions = await buildIntermediateConsumptionsPeriodAggregate(indic,financialData,dateStart,dateEnd);
  let fixedCapitalConsumptions = await buildFixedCapitalConsumptionsPeriodAggregate(indic,financialData,dateStart,dateEnd);

  let indicator = await buildAggregateIndicator(indic, [netValueAdded,intermediateConsumptions,fixedCapitalConsumptions]);
  return indicator;
}

const buildIntermediateConsumptionsPeriodAggregate = async (indic,financialData,dateStart,dateEnd) =>
{
  let aggregate = new Aggregate();
  let externalExpenses = financialData.expenses
    .filter(expense => parseInt(expense.date)>=parseInt(dateStart) && parseInt(expense.date)<=parseInt(dateEnd));
  let stockVariations = financialData.stockVariations // error !!! -> use entries ? OK
    .filter(variation => variation.isPurchasesStockVariation)
    .filter(variation => parseInt(variation.date)>=parseInt(dateStart) && parseInt(variation.date)<=parseInt(dateEnd));
  let expenses = externalExpenses.concat(stockVariations);
  aggregate.footprint.indicators[indic] = await buildAggregateIndicator(indic,expenses);
  aggregate.amount = await getAmountItems(expenses);
  return aggregate;
}

const buildFixedCapitalConsumptionsPeriodAggregate = async (indic,financialData,dateStart,dateEnd) =>
{
  let aggregate = new Aggregate();
  let amortisationExpenses = financialData.adjustedAmortisationExpenses
    .filter(expense => parseInt(expense.date)>=parseInt(dateStart) && parseInt(expense.date)<=parseInt(dateEnd));  
  aggregate.footprint.indicators[indic] = await buildAggregateIndicator(indic,amortisationExpenses);
  aggregate.amount = await getAmountItems(amortisationExpenses);
  return aggregate;
}