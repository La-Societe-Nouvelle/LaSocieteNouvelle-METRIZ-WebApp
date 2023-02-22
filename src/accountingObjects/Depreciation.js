// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint.js";

export class Depreciation {

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

    this.account = account;                                         // #28 or #29
    this.accountLib = accountLib;                                   // label of the account
    this.accountAux = accountAux;                                   // Immobilisation account (#2)

    this.amount = amount || 0;                                      // amount at the end
    this.footprint = new SocialFootprint(footprint);                //

    this.prevAmount = prevAmount || 0;                              // amount at the beginning
    this.prevFootprint = new SocialFootprint(prevFootprint);        //
    this.initialState = initialState || "currentFootprint";         //

    this.entries = entries || [];
  // ---------------------------------------------------------------------------------------------------- //
  }

  /* ---------- Periods ---------- */

  initPeriods = async (expenses,dateStart,dateEnd) =>
  {
    let currentAmount = this.prevAmount;
    let dateStart = dateStart;

    this.periods = [];

    // entries
    let entries = this.entries
        .filter(entry => !entry.isANouveaux)
        .concat(expenses.map(expense => expense.adjustmentEntries).reduce((a,b) => a.concat(b),[])) // adjustment entries
        .sort((a,b) => parseInt(a.date) > parseInt(b.date));
    for (let entry of entries) 
    {
        // add period with current amount
        this.periods.push({
            dateStart: dateStart,
            dateEnd: entry.date,
            amount: currentAmount
        });
        // update current amount
        currentAmount+= entry.amount;
        dateStart = entry.date;
    }

    // add last period
    this.periods.push({
        dateStart: dateStart,
        dateEnd: dateEnd,
        amount: currentAmount
    });

    // clean periods to avoid useless data
    let index = 0;
    while (index < amortisation.periods.length)
    {
      // remove single day period
      if (amortisation.periods[index].dateStart==amortisation.periods[index].dateEnd) {
          amortisation.periods.splice(index,1);
      } 
      // merge period if same amount
      else if (index > 0 && amortisation.periods[index].amount==amortisation.periods[index-1].amount) {
          amortisation.periods[index-1].dateEnd = amortisation.periods[index].dateEnd; // extend period
          amortisation.periods.splice(index,1);
      } 
      else {
          index+= 1;
      }
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