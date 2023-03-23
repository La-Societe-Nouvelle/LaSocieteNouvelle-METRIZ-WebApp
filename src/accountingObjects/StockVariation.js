// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class StockVariation {

  constructor({accountNum,
               accountLib,
               stockAccountNum,
               stockAccountLib,
               amount,
               footprint,
               date}) 
  {
  // ---------------------------------------------------------------------------------------------------- //    
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.stockAccountNum = stockAccountNum;
    this.stockAccountLib = stockAccountLib;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }

}