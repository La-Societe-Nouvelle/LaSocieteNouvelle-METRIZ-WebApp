// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

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