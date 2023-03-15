// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class Expense {

  constructor({accountNum,
               accountLib,
               providerNum,
               providerLib,
               isDefaultProviderAccount,
               amount,
               footprint,
               date}) 
  {
  // ---------------------------------------------------------------------------------------------------- //    
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.providerNum = providerNum;
    this.providerLib = providerLib;
    this.isDefaultProviderAccount = isDefaultProviderAccount;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }

}