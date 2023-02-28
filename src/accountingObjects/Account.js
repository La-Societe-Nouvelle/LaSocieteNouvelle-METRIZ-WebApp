// Imports
import { buildAggregateIndicator } from "../formulas/footprintFormulas";
import { getAmountItems, getPrevAmountItems } from "../utils/Utils";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const indics = ["eco","art","soc","knw","idr","geq","ghg","mat","was","nrg","wat","haz"];

export class Account {

  constructor({accountNum,
               accountLib,
               accountAux,
               amount,
               footprint,
               initialState,
               prevAmount,
               prevFootprint,
               entries}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = accountNum;                                           // id

    this.accountNum = accountNum;                                   // account number
    this.accountLib = accountLib;                                   // account label
    this.accountAux = accountAux;                                   // 

    this.amount = amount || 0;                                      // amount at the end
    this.footprint = new SocialFootprint(footprint);                //
    
    this.initialState = initialState || "currentFootprint";         // 
    this.prevAmount = prevAmount || 0;                              // amount
    this.prevFootprint = new SocialFootprint(prevFootprint);        //

    this.entries = entries || [];
  // ---------------------------------------------------------------------------------------------------- //
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