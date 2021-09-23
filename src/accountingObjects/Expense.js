// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class Expense {

  constructor({id,
               account,
               accountLib,
               accountAux,
               accountAuxLib,
               amount,
               footprint}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;
    
    this.account = account;
    this.accountLib = accountLib;
    this.accountAux = accountAux;
    this.accountAuxLib = accountAuxLib;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint({...footprint});
  // ---------------------------------------------------------------------------------------------------- //
  }

}