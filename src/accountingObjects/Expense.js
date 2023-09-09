// La Société Nouvelle

// Objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// ################################################## EXPENSE OBJECT ##################################################

/** Props :
 *    - accountNum -> #6x
 *    - accountLib
 *    - providerNum
 *    - providerLib
 *    - isDefaultProviderAccount
 *    - amount
 *    - footprint
 *    - date
 */

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

    this.amount = amount;
    this.footprint = new SocialFootprint(footprint);

    this.date = date;
  // ---------------------------------------------------------------------------------------------------- //
  }
}