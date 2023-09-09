// La Société Nouvelle

// Objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// ################################################## IMMOBILISATION PRODUCTION OBJECT ##################################################

/**
 * 
 */

export class ImmobilisedProduction {

  constructor({accountNum,
               accountLib,
               immobilisationAccountNum,
               immobilisationAccountLib,
               amount,
               footprint,
               date}) 
  {
  // ---------------------------------------------------------------------------------------------------- //    
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.immobilisationAccountNum = immobilisationAccountNum;
    this.immobilisationAccountLib = immobilisationAccountLib;

    this.amount = amount;
    this.footprint = new SocialFootprint(footprint);

    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }
}