// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

export class Aggregate {

  constructor({label,
               amount,
               footprint,
               prevAmount,
               prevFootprint}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.label = label;

    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    this.prevAmount = prevAmount || 0;
    this.prevFootprint = new SocialFootprint(prevFootprint);
  // ---------------------------------------------------------------------------------------------------- //
  }

}