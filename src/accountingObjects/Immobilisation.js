// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Utils
import { getAmountItems, getCurrentDateString, getDatesEndMonths, getNbDaysBetweenDates, getNewId, getPrevDate, getSumItems, roundValue } from "../utils/Utils";
import api from "../api";
import { AmortisationExpense } from "./AmortisationExpense";

export class Immobilisation 
{
  constructor({accountNum, accountLib, entries,                                           // Immobilisation data
               amortisationAccountNum, amortisationAccountLib, amortisationEntries,       // Amortisation data
               depreciationAccountNum, depreciationAccountLib, depreciationEntries,       // Depreciation data
               initialStateType, initialState, initialStateSet, initialFootprintParams,   // Initial state
               lastState,                                                                 // Last state
               states,
               status, 
               dataFetched,
               lastUpdateFromRemote}) 
  {
    // ---------------------------------------------------------------------------------------------------- //

    this.isAmortisable = amortisationAccountNum!=undefined;

    // Immobilisation ----------------------------------- //

    this.accountNum = accountNum;
    this.accountLib = accountLib;
    this.entries = entries || [];

    // Amortisation ------------------------------------- //

    this.amortisationAccountNum = amortisationAccountNum;
    this.amortisationAccountLib = amortisationAccountLib;
    this.amortisationEntries = amortisationEntries || [];
    
    // Depreciation ------------------------------------- //
    
    this.depreciationAccountNum = depreciationAccountNum;
    this.depreciationAccountLib = depreciationAccountLib;
    this.depreciationEntries = depreciationEntries || [];
    
    // States ------------------------------------------- //
    
    // initial
    this.initialStateType = initialStateType || "none";
    this.initialState = initialState ? new ImmobilisationState(initialState) : null;
    this.initialFootprintParams = initialFootprintParams || {};
    this.initialStateSet = initialStateSet || false;

    // intermediate
    this.states = {};
    if (states) {
      Object.entries(states).forEach(([date,stateData]) => {
        this.states[date] =  new ImmobilisationState(stateData);
      });
    }

    // final
    this.lastState = lastState ? new ImmobilisationState(lastState) : null;

    // Updates ------------------------------------------ //

    this.status = status || null; // 200 (ok), 404 (not found), 500 (server error)
    this.dataFetched = dataFetched || false; // response received
    this.lastUpdateFromRemote = lastUpdateFromRemote || null;

    // ---------------------------------------------------------------------------------------------------- //

    this.defaultAmortisationExpenseAccountNum = this.isAmortisable ? "6811" + (parseInt(this.amortisationAccountNum.charAt(2)) + 1) + this.amortisationAccountNum.slice(3) : undefined;
    this.defaultAmortisationExpenseAccountLib = this.isAmortisable ?  "Dotations - " + this.amortisationAccountLib : undefined;
  }

  /* ------------------------- Update props ------------------------- */

  async updateProps(nextProps)
  {
    // update initial state type
    if (nextProps.initialState != undefined &&
        nextProps.initialState != this.initialStateType) {
      this.initialStateType = nextProps.initialState;
      this.initialStateSet = false;
    }

    // update initial state fpt params
    if (this.initialStateType == "defaultData" &&
        nextProps.initialFootprintParams !== this.initialFootprintParams) {
      this.initialFootprintParams = nextProps.initialFootprintParams;
      this.initialStateSet = false;
    }
  }

  /* ------------------------- Load BackUp Data ------------------------- */

  loadInitialStateFromBackUp = async (prevImmobilisation)  =>
  {

    // TO THINK : concat instead of push but need to check if arrays are empty before concat
    // // immobilisation enries
    this.entries.push(...prevImmobilisation.entries);

    // // amortisation entries
    this.amortisationEntries.push(...prevImmobilisation.amortisationEntries);

    // // depreciation entries
    this.depreciationEntries.push(...prevImmobilisation.depreciationEntries);

    // // initial state
    this.initialStateType = prevImmobilisation.initialStateType;
    this.initialState = new ImmobilisationState(
      prevImmobilisation.initialState
    );
    this.initialFootprintParams =
      prevImmobilisation.initialFootprintParams || {};
    this.initialStateSet = prevImmobilisation.initialStateSet;

    // // states
    Object.values(prevImmobilisation.states).forEach(
      (state) => (this.states[state.date] = new ImmobilisationState(state))
    );
  }

  /* ------------------------- Fetch Default Data ------------------------- */

  async updateInitialStateFootprintFromRemote() 
  {
    let defaultFptParams = Object.entries(this.initialFootprintParams).map(([key,value]) => key+"="+value).join("&");
    await api
      .get("defaultfootprint?"+defaultFptParams)
      .then((res) => 
      {
        let status = res.data.header.code;
        if (status == 200) {
          // update footprints
          this.initialState.footprint.updateAll(res.data.footprint);
          this.initialState.amortisationFootprint.updateAll(res.data.footprint);
          this.initialStateSet = true;
        } else {
          this.initialState.footprint = new SocialFootprint();
          this.initialState.amortisationFootprint = new SocialFootprint();
          this.initialStateSet = false;
          throw res.data.header.message;
        }
      }).catch((err)=>{
        throw err;
      });
  }

  /* ------------------------- States Builder ------------------------- */

  // Les états (states) représentent les valeurs (montants, empreintes, etc.) à une certaine date.
  // Ils sont calculés pour chaque fin de mois et dès qu'un changement est observé via une écriture comptable.
  // 
  // Les données présentes au sein d'un état sont :
  //    - prevStateDate : date du précédent état
  //    - date
  //    - valeur brute de l'immobilisation
  //    - valeur de l'amortissement
  //    - montant des dotations
  //    - empreinte de l'immobilisation
  //    - empreinte de l'amortissement
  // Les données relatives à l'amortissement et aux dotations sont ajustées : en répartissant les dotations.
  // 
  // La construction des états se fait en 2 étapes :
  //  1. construction des "objets" avec les valeurs, sans répartition des dotations sur l'année
  //  2. répartition des dotations

  buildStates = async (financialPeriod,amortisationExpenses) => 
  {
    this.states = {};

    // add initial state
    let endPrevFinancialPeriod = getPrevDate(financialPeriod.dateStart);
    this.initialState.date = endPrevFinancialPeriod;
    this.states[endPrevFinancialPeriod] = new ImmobilisationState(this.initialState);

    // end of months
    let datesEndMonths = getDatesEndMonths(financialPeriod.dateStart, financialPeriod.dateEnd);

    // get all dates from entries
    let datesEntries = this.entries
        .concat(this.amortisationEntries)
        .filter(entry => !entry.isANouveaux)
        .map(entry => entry.date);

    // concat phases & sort dates
    let dates = datesEndMonths
        .concat([financialPeriod.dateEnd])
        .concat(datesEntries)
        .filter((value, index, self) => index === self.findIndex(item => item === value))   // remove duplicates dates and empty string
        .sort((a, b) => parseInt(a) - parseInt(b));   // sort by date (chronology)

      let immobilisationAmount = this.initialState.amount;
    let amortisationAmount = this.initialState.amortisationAmount;
    let amortisationExpensesAmount = 0;
    let maxAmortisationExpensesAmount = 0;
    let prevStateDate = endPrevFinancialPeriod;
    
    for (let date of dates) 
    {
      // update immobilisation amount
      let immobilisationEntriesAtDate = this.entries.filter(entry => !entry.isANouveaux).filter(entry => entry.date == date);
      let immobilisationVariationAtDate = getAmountItems(immobilisationEntriesAtDate, 2);
      immobilisationAmount = roundValue(immobilisationAmount + immobilisationVariationAtDate, 2);

      // update amortisation amount
      let amortisationEntriesAtDate = this.amortisationEntries.filter(entry => !entry.isANouveaux).filter(entry => entry.date == date);
      let amortisationVariationAtDate = getAmountItems(amortisationEntriesAtDate, 2);
      amortisationAmount = roundValue(amortisationAmount + amortisationVariationAtDate, 2);

      // amortisation expenses
      let expensesAtDate = amortisationExpenses.filter(expense => expense.date == date);
      let amountExpensesAtDate = getAmountItems(expensesAtDate);
      amortisationExpensesAmount = roundValue(amortisationExpensesAmount + amountExpensesAtDate, 2);

      let adjustedAmortisationExpenseAmount = Math.max(roundValue(amortisationExpensesAmount-maxAmortisationExpensesAmount,2), 0);  // expense > 0 if expenses amount > current max
      amortisationAmount = roundValue(amortisationAmount - amountExpensesAtDate + adjustedAmortisationExpenseAmount, 2);            // adjust amortisation amount (remove expenses & add adjusted expense)
      maxAmortisationExpensesAmount = roundValue(maxAmortisationExpensesAmount + adjustedAmortisationExpenseAmount, 2);             // update max

      // add state
      this.states[date] = new ImmobilisationState({
        date,
        prevStateDate,
        amount: immobilisationAmount,
        amortisationAmount: amortisationAmount,
        amortisationExpenseAmount: adjustedAmortisationExpenseAmount
      });

      // update previous date
      prevStateDate = date;
    }
  }

  divideAdjustedAmortisationExpenses = async () => 
  {
    let statesWithAmortisationExpenseToDivide = Object.values(this.states)
      .filter(state => state.amortisationExpenseAmount > 0);

    for (let stateWithAmortisationExpenseToDivide of statesWithAmortisationExpenseToDivide)
    {
      // get date of previous state with adjusted amortisation expense
      let prevDate = Object.values(this.states)
        .filter(state => parseInt(state.date) < parseInt(stateWithAmortisationExpenseToDivide.date) && state.amortisationExpenseAmount > 0)
        .map(state => state.date)
        .sort((a,b) => parseInt(b) - parseInt(a))[0] || this.initialState.date; // < 0 => a before b (i.e. a has to be after b)
      
      // i.e. date(s) to divide amount amortisation expenses with
      if (prevDate!=stateWithAmortisationExpenseToDivide.prevStateDate)
      {
        // update
        let statesToUpdate = Object.values(this.states)
          .filter(state => parseInt(state.date) > parseInt(prevDate) && parseInt(state.date) <= parseInt(stateWithAmortisationExpenseToDivide.date))
          .sort((a,b) => parseInt(a.date) - parseInt(b.date)); // chronologic order
        
        for (let stateToUpdate of statesToUpdate)
        {
          let prevState = this.states[stateToUpdate.prevStateDate];
          stateToUpdate.amountToAmortise = roundValue(prevState.amount - prevState.amortisationAmount, 2);
          stateToUpdate.nbDaysToAmortise = getNbDaysBetweenDates(prevState.date,stateToUpdate.date);
        };
        
        let totalToAmortise = getSumItems(statesToUpdate.map(({amountToAmortise,nbDaysToAmortise}) => amountToAmortise*nbDaysToAmortise), 2);
        let amortisationExpenseAmount = stateWithAmortisationExpenseToDivide.amortisationExpenseAmount;
        
        // reset state data
        stateWithAmortisationExpenseToDivide.amortisationAmount = roundValue(stateWithAmortisationExpenseToDivide.amortisationAmount-amortisationExpenseAmount, 2);
        stateWithAmortisationExpenseToDivide.amortisationExpenseAmount = 0;
        
        // update values
        let adjustedAmount = 0;
        
        for (let stateToUpdate of statesToUpdate)
        {
          // if last state -> add difference between total & initial
          if (stateToUpdate.date==stateWithAmortisationExpenseToDivide.date) {
            let difference = roundValue(adjustedAmount- amortisationExpenseAmount,2);
            if (difference!=0) {
              stateToUpdate.amortisationExpenseAmount = roundValue(stateToUpdate.amortisationExpenseAmount-difference, 2);
              stateToUpdate.amortisationAmount = roundValue(stateToUpdate.amortisationAmount-difference, 2);
            }
          }
    
        };
      }
    }
  }

  getAdjustedAmortisationExpenses = async () => 
  {
    if (this.isAmortisable) 
    {
      let adjustedAmortisationExpenses = [];
  
      Object.values(this.states)
        .filter(state => state.amortisationExpenseAmount > 0)
        .forEach((state,index) => 
      {
        let adjustedAmortisationExpense = new AmortisationExpense({
          id: this.defaultAmortisationExpenseAccountNum+"_"+(index+1),
          accountNum: this.defaultAmortisationExpenseAccountNum,
          accountLib: this.defaultAmortisationExpenseAccountLib,
          amortisationAccountNum: this.amortisationAccountNum,
          amortisationAccountLib: this.amortisationAccountLib,
          amount: state.amortisationExpenseAmount,
          date: state.date
        })
        adjustedAmortisationExpenses.push(adjustedAmortisationExpense);
      })
      
      return (adjustedAmortisationExpenses)
    }
    else {
      return [];
    }
  }

}

export class ImmobilisationState
{
  constructor(props) 
  {
    this.date = props.date;
    this.prevStateDate = props.prevStateDate;
    this.amount = props.amount;
    this.footprint = new SocialFootprint(props.footprint);
    this.amortisationAmount = props.amortisationAmount;
    this.amortisationFootprint = new SocialFootprint(props.amortisationFootprint);
    this.amortisationExpenseAmount = props.amortisationExpenseAmount;
  }
}