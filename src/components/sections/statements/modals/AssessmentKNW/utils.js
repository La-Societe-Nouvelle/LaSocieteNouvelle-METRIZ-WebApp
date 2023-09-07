import { getSumItems, isValidNumber, roundValue } from "../../../../../utils/Utils";

import metaIndics from "/lib/indics";

export const getKnwContribution = (knwDetails) => 
{
  let knwItems = Object.values(knwDetails);
  return getSumItems(knwItems);
}

export const getKnwContributionRate = (netValueAdded, knwContribution) => 
{
  if (isValidNumber(netValueAdded,0) && netValueAdded>0 
   && isValidNumber(knwContribution,0,netValueAdded)) {
    return roundValue((knwContribution / netValueAdded) * 100, metaIndics.knw.nbDecimals);
  } else {
    return null;
  }
};