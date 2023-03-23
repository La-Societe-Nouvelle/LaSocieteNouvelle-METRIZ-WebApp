// La Société Nouvelle

// Imports
import { getAmountItems } from "../utils/Utils";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const oneDay = 24 * 60 * 60 * 1000;

export class immobilisedProduction {

  constructor({id,
               accountNum,
               accountLib,
               immobilisationAccountNum,
               immobilisationAccountLib,
               amount,
               footprint,
               date}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;
    
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.immobilisationAccountNum = immobilisationAccountNum;
    this.immobilisationAccountLib = immobilisationAccountLib;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }

  /* ---------- Periods ---------- */

  getAdjustedEntries = async (periods,entries,dateStart,dateEnd) =>
  {
    const adjustmentEntries = [];

    let currentAmount = 0;
    let currentMax = 0

    for (let period of periods) 
    {
      let entriesAtDate = entries.filter(entry => entry.date==period.dateStart);
      if (entriesAtDate.length>0) {
        let expensesOnPeriod = getAmountItems(entriesAtDate);
        //

        adjustmentEntries.push({

        })
      }
      currentAmount+= flow.amount;

      if (currentAmount > currentMax) 
      {
        let amountPeriod = currentAmount-currentMax;
        currentMax = currentAmount;

        // update current values
        dateStart = flow.date;

        if (flow.amount > amountPeriod) {
          this.adjustmentEntries.push({
            date: flow.date,
            amount: -(flow.amount-amountPeriod)
          })
      }
      }
      else {
        this.adjustmentEntries.push({
          date: flow.date,
          amount: -flow.amount
        })
      }
    }

    if (dateStart!=dateEnd) {
      // add last period
      this.periods.push({
        dateStart: dateStart,
        dateEnd: dateEnd,
        amount: currentAmount-currentMax
      });
    }
  }

  initPeriods = async (dateStart,dateEnd) =>
  {
    let currentAmount = 0;
    let currentMax = 0

    this.periods = [];
    this.adjustmentEntries = [];

    // entries
    let flows = getFlowsByDate(this.entries);
    for (let flow of flows) 
    {
      currentAmount+= flow.amount;

      if (currentAmount > currentMax) 
      {
        let amountPeriod = currentAmount-currentMax;
        currentMax = currentAmount;
        // end current period
        this.periods.push({
          dateStart: dateStart,
          dateEnd: flow.date,
          amount: amountPeriod
        });

        // update current values
        dateStart = flow.date;

        if (flow.amount > amountPeriod) {
          this.adjustmentEntries.push({
            date: flow.date,
            amount: -(flow.amount-amountPeriod)
          })
      }
      }
      else {
        this.adjustmentEntries.push({
          date: flow.date,
          amount: -flow.amount
        })
      }
    }

    if (dateStart!=dateEnd) {
      // add last period
      this.periods.push({
        dateStart: dateStart,
        dateEnd: dateEnd,
        amount: currentAmount-currentMax
      });
    }
  }

  /**
   *  The aim of the function is to split amortisation expenses between this different amortisation/immobilisation periods
   */

  completePeriods = async (immobilisation,amortisation,nextPeriods,datesExpenses,dateStart) =>
  {
    let expensePrevPeriods = [...this.periods];
    this.periods = [];
    expensePrevPeriods.forEach(prevPeriod =>
    {
      // get start date (based on all amortisation expenses linked to amortisation account) -> period without other amortisation expenses
      let dateStartNextPeriods = datesExpenses.filter(date => parseInt(date) < parseInt(prevPeriod.dateEnd)).sort((a,b) => parseInt(a) < parseInt(b))[0];
      if (dateStartNextPeriods==undefined) dateStartNextPeriods = dateStart;

      let subPeriods = nextPeriods.filter(period => (parseInt(period.dateStart) >= parseInt(prevPeriod.dateStart)) && (parseInt(period.dateEnd) <= parseInt(prevPeriod.dateEnd)));

      // if no expense during period
      if (prevPeriod.amount==0) {
        subPeriods.forEach(subPeriod => {
          this.periods.push({
            dateStart: subPeriod.dateStart,
            dateEnd: subPeriod.dateEnd,    
            amount: 0
          })
        })
      } 
        
      // build data for new periods
      else {
        let total = 0; // sum of time x amount to depreciate
        let tempPeriods = [];

        subPeriods.forEach(subPeriod => 
        {
          // case if other amortisation expense on this sub period
          if (parseInt(subPeriod.dateStart) < parseInt(dateStartNextPeriods)) {
            // push 0
            this.periods.push({
              dateStart: subPeriod.dateStart,
              dateEnd: subPeriod.dateEnd,    
              amount: 0
            })
          } 
          
          // get nb days and amount to depreciate for each new sub period
          else {
            // nb days
            let nbDaysSubPeriod = Math.round(Math.abs((getDateFromString(subPeriod.dateStart) - getDateFromString(subPeriod.dateEnd)) / oneDay));
            // amount to depreciate
            let amortisationAmount = amortisation.periods.filter(period => period.dateStart==subPeriod.dateStart)[0].amount;
            let immobilisationAmount = immobilisation.periods.filter(period => period.dateStart==subPeriod.dateStart)[0].amount;
            let amountToDepreciate = immobilisationAmount - amortisationAmount;
            
            total+= amountToDepreciate*nbDaysSubPeriod;
            tempPeriods.push({
              dateStart: subPeriod.dateStart,
              dateEnd: subPeriod.dateEnd,
              nbDays: nbDaysSubPeriod,    
              amount: prevPeriod.amount * (amountToDepreciate*nbDaysSubPeriod) // divide after by total
            })
          }
        })

        // build new periods (pro rata amount to depreciate) & update amount of amortisation periods
        if (total > 0) {
          let cumulChanges = 0;
          for (let tempPeriod of tempPeriods) 
          {
            tempPeriod.amount = roundValue(tempPeriod.amount / total,2);
            tempPeriod.rate = roundValue(tempPeriod.amount/tempPeriod.nbDays,2);
            this.periods.push(tempPeriod);

            // update amortisation period that came after (as there is an amortisation expense) except for last subperiod of prev period
            if (tempPeriod.dateEnd!=prevPeriod.dateEnd) {
              cumulChanges+= tempPeriod.amount;
              let amortisationPeriod = amortisation.periods.filter(period => period.dateStart==tempPeriod.dateEnd)[0];
              amortisationPeriod.amount+= cumulChanges;
            }
          }
        }
      }
    })
  }

}

const getFlowsByDate = (entries) => 
{
    let flows = [];
    entries.forEach((entry) => 
    {
        let flow = flows.filter(flow => flow.date==entry.date)[0];
        if (flow == undefined) flows.push({date: entry.date, amount: entry.amount})
        else flow.amount+= entry.amount;
    })
    return flows.sort((a,b) => parseInt(a.date) > parseInt(b.date));
}