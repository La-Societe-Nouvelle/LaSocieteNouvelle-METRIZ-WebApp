// La Société Nouvelle

// Objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// ################################################## AGGREGATE OBJECT ##################################################

/** Usages :
 *    -> Aggregates (main aggregates, production aggregates)
 *       builds in financial data
 * 
 *  Props :
 *    - id -> aggregateKey
 *    - label
 *    - periodsData
 * 
 *  Props of periods :
 *    - periodKey
 *    - amount
 *    - footprint
 */

export class Aggregate {

  constructor({ id, 
                label, 
                periodsData }) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;

    this.label = label;

    this.periodsData = {};
    if (periodsData) {
      Object.values(periodsData)
            .forEach(({periodKey,amount,footprint}) => {
        this.periodsData[periodKey] = {
          periodKey,
          amount,
          footprint: new SocialFootprint(footprint)
        };
      });
    }
  // ---------------------------------------------------------------------------------------------------- //
  }

  getAmount = (periodKey) => {
    return this.periodsData[periodKey].amount;
  }

  getFootprint = (periodKey,indic) => {
    if (indic) {
      return this.periodsData[periodKey].footprint.indicators[indic];
    } else {
      return this.periodsData[periodKey].footprint;
    }
  }
}