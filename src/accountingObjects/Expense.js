// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class Expense {

  constructor({id,
               account,
               accountLib,
               accountAux,
               accountAuxLib,
               isDefaultAccountAux,
               amount,
               footprint,
               entries}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;
    
    this.account = account;
    this.accountLib = accountLib;
    this.accountAux = accountAux;
    this.accountAuxLib = accountAuxLib;
    this.isDefaultAccountAux = isDefaultAccountAux;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    this.entries = entries || [];
  // ---------------------------------------------------------------------------------------------------- //
  }

}