// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint.js";

export class Depreciation {

  constructor({id,
               account,
               accountLib,
               accountAux,
               amount,
               footprint,
               prevAmount,
               prevFootprint,
               initialState}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;                                                   // id

    this.account = account;                                         // #28 or #29
    this.accountLib = accountLib;                                   // label of the account
    this.accountAux = accountAux;                                   // Immobilisation account (#2)

    this.amount = amount || 0;                                      // amount at the end
    this.footprint = new SocialFootprint(footprint);           //

    this.prevAmount = prevAmount || 0;                              // amount at the beginning
    this.prevFootprint = new SocialFootprint(prevFootprint);   //
    this.initialState = initialState || "currentFootprint";         //
  // ---------------------------------------------------------------------------------------------------- //
  }

}