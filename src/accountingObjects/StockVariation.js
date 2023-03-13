// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class StockVariation {

  constructor({id,
               accountNum,
               accountLib,
               stockAccountNum,
               stockAccountLib,
               amount,
               footprint}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;
    
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.stockAccountNum = stockAccountNum;
    this.stockAccountLib = stockAccountLib;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);
  // ---------------------------------------------------------------------------------------------------- //
  }

}