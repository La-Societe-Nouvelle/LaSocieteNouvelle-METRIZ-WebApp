// La Société Nouvelle

// API
import api from "/config/api";

// Objects
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint';

// Utils
import { getAmountItems, roundValue } from '../utils/Utils';
import { getDatesEndMonths, getPrevDate } from '../utils/periodsUtils';

// ################################################## STOCK OBJECT ##################################################

/**
 * 
 */

export class Stock {

  constructor({accountNum, accountLib, entries,                                           // Stock data
               depreciationAccountNum, depreciationAccountLib, depreciationEntries,       // Depreciation data
               initialStateType, initialState, initialStateSet, initialFootprintParams,   // Initial state
               lastState,
               purchasesAccounts,
               states,
               status,
               dataFetched,
               lastUpdateFromRemote})
  {
  // ---------------------------------------------------------------------------------------------------- //

    this.isProductionStock = /^3(3|4|5)/.test(accountNum);
    this.expensesAccountsPrefix = !this.isProductionStock ? "60"+accountNum.slice(1).replace(/(0*)$/g,"") : null; // 3145 -> 60145.. 
    this.purchasesAccounts = purchasesAccounts || []; // associated purchases accounts 
    
    // Stock -------------------------------------------- //
    
    this.accountNum = accountNum;
    this.accountLib = accountLib;
    this.entries = entries || [];

    // Depreciation ------------------------------------- //
    
    this.depreciationAccountNum = depreciationAccountNum;
    this.depreciationAccountLib = depreciationAccountLib;
    this.depreciationEntries = depreciationEntries || [];

    // States ------------------------------------------- //
    
    // initial
    this.initialStateType = initialStateType || "none";
    this.initialState = initialState ? new StockState(initialState) : null;
    this.initialFootprintParams = initialFootprintParams || {};
    this.initialStateSet = initialStateSet && initialState;

    // intermediate
    this.states = {};
    if (states) {
      Object.entries(states).forEach(([date,stateData]) => {
        this.states[date] =  new StockState(stateData);
      });
    }

    // final
    this.lastState = lastState ? new StockState(lastState) : null;

    // Updates ------------------------------------------ //

    // Updates
    this.status = status || null;                                           // 200 (ok), 404 (not found), 500 (server error)
    this.dataFetched = dataFetched || false;                                // response received
    this.lastUpdateFromRemote = lastUpdateFromRemote || null; 

  // ---------------------------------------------------------------------------------------------------- //

    this.defaultStockVariationAccountNum = !this.isProductionStock ? "60"+this.accountNum : undefined;
    this.defaultStockVariationAccountLib = !this.isProductionStock ?  "Variation stock "+this.accountLib : undefined;
  }

  /* ------------------------- Load BackUp Data ------------------------- */

   loadInitialStateFromBackUp = async (loadedStock) =>
  {
    // stock enries
    this.entries.push(...loadedStock.entries);

    // depreciation entries
    this.depreciationEntries.push(...loadedStock.depreciationEntries);

    // initial state
    this.initialStateType = loadedStock.initialStateType;
    this.initialState = new StockState(loadedStock.initialState);
    this.initialFootprintParams = loadedStock.initialFootprintParams || {};
    this.initialStateSet = loadedStock.initialStateSet;

    // purchasesAccounts
    if(loadedStock.purchasesAccounts.length > 0) {
      this.purchasesAccounts = this.purchasesAccounts.concat(loadedStock.purchasesAccounts.filter(account => !this.purchasesAccounts.includes(account)));
    }
    // states
    Object.values(loadedStock.states)
      .forEach(state => this.states[state.date] = new StockState(state));
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
          this.initialStateSet = true;
        } else {
          this.initialState.footprint = new SocialFootprint();
          this.initialStateSet = false;
          throw res.data.header.message;
        }
      }).catch((err)=>{
        throw Error(err.message);
      });
  }

  /* ------------------------- States Builder ------------------------- */

  // Les états (states) représentent les valeurs (montants, empreintes, etc.) à une certaine date.
  // Ils sont calculés pour chaque fin de mois et dès qu'un changement est observé via une écriture comptable.
  // 
  // Les données présentes au sein d'un état sont :
  //    - prevStateDate : date du précédent état
  //    - date
  //    - valeur du stock
  //    - empreinte du stock

  buildStates = async (financialPeriod) => 
  {
    this.states = {};

    // add initial state
    let endPrevFinancialPeriod = getPrevDate(financialPeriod.dateStart);
    this.initialState.date = endPrevFinancialPeriod;
    this.states[endPrevFinancialPeriod] = new StockState(this.initialState);

    // end of months
    let datesEndMonths = getDatesEndMonths(financialPeriod.dateStart, financialPeriod.dateEnd);

    // get all dates from entries
    let datesEntries = this.entries
        .filter(entry => !entry.isANouveaux)
        .map(entry => entry.date);

    // concat phases & sort dates
    let dates = datesEndMonths
        .concat([financialPeriod.dateEnd])
        .concat(datesEntries)
        .filter((value, index, self) => index === self.findIndex(item => item === value))   // remove duplicates dates and empty string
        .sort((a, b) => parseInt(a) - parseInt(b));   // sort by date (chronology)

    let stockAmount = this.initialState.amount;
    let prevStateDate = endPrevFinancialPeriod;
    
    for (let date of dates) 
    {
      // update stock amount
      let stockEntriesAtDate = this.entries.filter(entry => !entry.isANouveaux).filter(entry => entry.date == date);
      let stockVariationAtDate = getAmountItems(stockEntriesAtDate, 2);
      stockAmount = roundValue(stockAmount + stockVariationAtDate, 2);

      // add state
      this.states[date] = new StockState({
        date,
        prevStateDate,
        amount: stockAmount
      });

      // update previous date
      prevStateDate = date;
    }
  }

}

// ################################################## STOCK STATE OBJECT ##################################################

export class StockState
{
  constructor(props) 
  {
    this.date = props.date;
    this.prevStateDate = props.prevStateDate;
    this.amount = props.amount;
    this.footprint = new SocialFootprint(props.footprint);
  }
}