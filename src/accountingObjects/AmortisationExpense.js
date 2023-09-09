// La Société Nouvelle

// Objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// ################################################## AMORTISATION EXPENSE OBJECT ##################################################

/** Props :
 *    - accountNum -> #28x
 *    - accountLib
 *    - amortisationAccountNum -> #68x
 *    - amortisationAccountLib
 *    - amount
 *    - footprint
 *    - date
 */

export class AmortisationExpense {

  constructor({accountNum,
               accountLib,
               amortisationAccountNum,
               amortisationAccountLib,
               amount,
               footprint,
               date}) 
  {
  // ---------------------------------------------------------------------------------------------------- //    
    this.accountNum = accountNum;
    this.accountLib = accountLib;

    this.amortisationAccountNum = amortisationAccountNum;
    this.amortisationAccountLib = amortisationAccountLib;

    this.amount = amount;
    this.footprint = new SocialFootprint(footprint);

    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }
}