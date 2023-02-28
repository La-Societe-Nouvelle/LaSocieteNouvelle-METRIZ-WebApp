// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint.js";

export class Amortisation {

  constructor({id,
               account,
               accountLib,
               accountAux,
               amount,
               footprint,
               prevAmount,
               prevFootprint,
               initialState,
               entries}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;                                                   // id

    this.account = account;                                         // #28
    this.accountLib = accountLib;                                   // label of the account
    this.accountAux = accountAux;                                   // Immobilisation account (#2)

    this.amount = amount || 0;                                      // amount at the end
    this.footprint = new SocialFootprint(footprint);                //
    
    this.initialState = initialState || "currentFootprint";         //
    this.prevAmount = prevAmount || 0;                              // amount
    this.prevFootprint = new SocialFootprint(prevFootprint);        //

    this.entries = entries || [];
  // ---------------------------------------------------------------------------------------------------- //
  }

  /* ---------- Periods ---------- */

  buildPeriods = async (periods) =>
  {
    this.periods = [];

    let currentAmount = this.prevAmount;

    for (let period of periods) 
    {      
      // update current amount
      let entriesOnPeriod = this.entries.filter(entry => !entry.isANouveaux).concat(adjustedExpensesEntries).filter(entry => entry.date==period.dateStart); // variations at beginning of period
      let variationOnPeriod = getAmountItems(entriesOnPeriod, 2);
      currentAmount = currentAmount+variationOnPeriod;

      // add period with current amount
      this.periods.push({
        dateStart: period.dateStart,
        dateEnd: period.dateEnd,
        amount: currentAmount
      });
    }
  }

  initPeriods = async (periods,adjustedExpensesEntries) =>
  {
    this.periods = [];

    let currentAmount = this.prevAmount;
    let dateStart = dateStart;

    for (let period of periods) 
    {      
      // update current amount
      let entriesOnPeriod = this.entries.filter(entry => !entry.isANouveaux).concat(adjustedExpensesEntries).filter(entry => entry.date==period.dateStart); // variations at beginning of period
      let variationOnPeriod = getAmountItems(entriesOnPeriod, 2);
      currentAmount = currentAmount+variationOnPeriod;

      // add period with current amount
      this.periods.push({
        dateStart: period.dateStart,
        dateEnd: period.dateEnd,
        amount: currentAmount
      });
    }
  }

  completePeriods = (nextPeriods) =>
  {
    let amortisationPrevPeriods = [...this.periods];
    this.periods = [];
    nextPeriods.forEach(nextPeriod =>
    {
      // period matching with next period (next periods can't be over two prev periods)
      let prevPeriod = amortisationPrevPeriods.filter(period => (parseInt(period.dateStart) <= parseInt(nextPeriod.dateStart)) && (parseInt(period.dateEnd) >= parseInt(nextPeriod.dateEnd)))[0];
      this.periods.push({
        dateStart: nextPeriod.dateStart,
        dateEnd: nextPeriod.dateEnd,
        amount: roundValue(prevPeriod.amount,2) // same amount
      })
    })
  }

}