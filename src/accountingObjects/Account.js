// Imports
import { buildIndicatorAggregate } from "../formulas/footprintFormulas";
import { getAmountItems, getPrevAmountItems } from "../utils/Utils";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

export class Account {

  constructor({accountNum,
               accountLib,
               amount,
               footprint,
               prevAmount,
               prevFootprint,
               initialState}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    this.prevAmount = prevAmount || 0;
    this.prevFootprint = new SocialFootprint(prevFootprint);
    this.initialState = initialState || "none";
  // ---------------------------------------------------------------------------------------------------- //
  }

}

export const buildAggregateFromArray = ({accountNum,
                                         accountLib,
                                         items}) =>
{
  let amount = getAmountItems(items);

  let footprint = new SocialFootprint();
  indics.forEach(indic => footprint.indicators[indic] = buildIndicatorAggregate(indic,items));

  let prevAmount = getPrevAmountItems(items);

  let prevFootprint = new SocialFootprint();
  indics.forEach(indic => prevFootprint.indicators[indic] = buildIndicatorAggregate(indic,items,{usePrev: true}));

  return new Account({accountNum,accountLib,amount,footprint,prevAmount,prevFootprint});
}