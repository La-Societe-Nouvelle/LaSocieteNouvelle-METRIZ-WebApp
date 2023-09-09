// La Société Nouvelle

// Objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Utils
import { getAmountItems } from "../utils/Utils";

// ################################################## ACCOUNT OBJECT ##################################################

/** Usages :
 *    -> Expenses accounts (external expenses, stock variations, amortisations)
 *       builds in financial data
 * 
 *  Props :
 *    - id -> accountNum
 *    - accountNum
 *    - accountLib
 *    - periodsData
 * 
 *  Props of periods :
 *    - periodKey
 *    - amount
 *    - footprint
 */

export class Account {

  constructor({accountNum,
               accountLib,
               periodsData}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = accountNum;                                           // id

    this.accountNum = accountNum;                                   // account number
    this.accountLib = accountLib;                                   // account label
    
    this.periodsData = {};                                          // data for each period
    if (periodsData) {
      Object.values(periodsData)
            .forEach(({periodKey,amount,footprint}) => {
        this.periodsData[periodKey] = {
          periodKey,
          amount,
          footprint: new SocialFootprint(footprint)
        }
      })
    }
  // ---------------------------------------------------------------------------------------------------- //
  }

  // build periods data from items, for array of periods
  buildPeriods = (items,periods) => 
  {
    this.periodsData = {};
    periods.forEach(period => 
    {
      this.periodsData[period.periodKey] = {
        periodKey: period.periodKey,
        amount: getAmountItems(items.filter(item => period.regex.test(item.date)), 2),
        footprint: new SocialFootprint()
      }
    })
  }
}