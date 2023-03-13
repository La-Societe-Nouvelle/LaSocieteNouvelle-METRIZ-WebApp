// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class AccountingItem {

  constructor({id,
               accountNum,
               accountLib,
               amount,
               footprint,
               date}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;                                                   // id

    this.accountNum = accountNum;                                   // account number
    this.accountLib = accountLib;                                   // account label

    this.amount = amount || 0;                                      // amount
    this.footprint = new SocialFootprint(footprint);                // footprint
    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }

}