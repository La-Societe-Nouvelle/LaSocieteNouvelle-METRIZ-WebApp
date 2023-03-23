// Imports
import { buildAggregateIndicator } from "../formulas/footprintFormulas";
import { getAmountItems, getPrevAmountItems } from "../utils/Utils";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const indics = ["eco","art","soc","knw","idr","geq","ghg","mat","was","nrg","wat","haz"];

export class Account {

  constructor({accountNum,
               accountLib,
               periodsData}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = accountNum;                                           // id

    this.accountNum = accountNum;                                   // account number
    this.accountLib = accountLib;                                   // account label
    
    this.periodsData = {};
    if (periodsData) {
      Object.values(periodsData).forEach(({periodKey,amount,footprint}) => {
        this.periodsData[periodKey] = {
          periodKey,
          amount,
          footprint: new SocialFootprint(footprint)
        }
      })
    }
  // ---------------------------------------------------------------------------------------------------- //
  }

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

export const buildAggregateFromArray = ({accountNum,
                                         accountLib,
                                         items}) =>
{
  let amount = getAmountItems(items);

  let footprint = new SocialFootprint();
  indics.forEach(indic => footprint.indicators[indic] = buildAggregateIndicator(indic,items));

  let prevAmount = getPrevAmountItems(items);

  let prevFootprint = new SocialFootprint();
  indics.forEach(indic => prevFootprint.indicators[indic] = buildAggregateIndicator(indic,items,{usePrev: true}));

  return new Account({accountNum,accountLib,amount,footprint,prevAmount,prevFootprint});
}