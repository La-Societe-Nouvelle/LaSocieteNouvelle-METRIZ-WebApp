// La Société Nouvelle

// Objects
import {Indicator} from './Indicator';

// Librairies
import metaIndics from "/lib/indics";

// ################################################## FOOTPRINT OBJECT ##################################################

export class SocialFootprint {

  constructor({
    indicators
  }) 
  {
    // ---------------------------------------------------------------------------------------------------- //

    // indicators
    this.indicators = {};
    Object.entries(metaIndics)
      .filter(([_,metaIndic]) => metaIndic.isAvailable)
      .forEach(([indic]) => this.indicators[indic] = new Indicator({
        indic,
        ...indicators?.[indic]
      }));
  
    // ---------------------------------------------------------------------------------------------------- //
  }

  /* --------- Getters ---------- */

  getIndicator = (indic) => this.indicators[indic]

  // Indicator getters
  getValue = (indic) => this.indicators[indic].getValue();
  getUncertainty = (indic) => this.indicators[indic].getUncertainty();
  getGrossImpact = (indic,amount) => this.indicators[indic].getGrossImpact(amount);

  /* ---------- Update from API ---------- */
  
  // All indicators
  updateALl(data) 
  {
    Object.entries(metaIndics)
      .filter(([_,metaIndic]) => metaIndic.isAvailable)
      .forEach(([indic,_]) => 
      {
        let indicData = data[indic.toUpperCase()];
        this.indicators[indic].update(indicData);
      });
  }

  /* ---------- Check ---------- */

  isValid = () => {
    return Object.values(this.indicators).every((indicator) => indicator.isValid());
  }

}