// La Société Nouvelle

// Utils
import { isValidNumber, roundValue } from "../utils/Utils";

// Librairies
import metaIndics from "/lib/indics";

// ################################################## INDICATOR OBJECT ##################################################

export class Indicator {

  constructor({
    indic,
    value,
    uncertainty,
    flag,
    source,
    info,
    year,
    lastupdate,
  }) 
  {
    // ---------------------------------------------------------------------------------------------------- //

    this.indic = indic;

    this.value = value              ?? null;
    this.uncertainty = uncertainty  ?? null;

    this.flag = flag                ?? null;
    this.source = source            ?? null;
    this.info = info                ?? null;
    this.year = year                ?? null;

    this.lastupdate = lastupdate    ?? null;

  // ---------------------------------------------------------------------------------------------------- //
  }

  /* ---------- Getters ---------- */
    
  getValue = () => {
    return this.value;
  }
  getUncertainty = () => {
    if (isValidNumber(this.value)) {
      return this.uncertainty
    } else {
      return null
    }
  }

  // Derivated values

  // gross impact
  getGrossImpact = (amount) =>
  {
    if (isValidNumber(amount) && isValidNumber(this.value)) 
    { 
      const { type, nbDecimals } = metaIndics[this.indic];
      switch (type) {
        case "intensité" :  return roundValue(amount*this.value/1000, nbDecimals);
        case "proportion":  return roundValue(amount*this.value/100, nbDecimals);
        case "indice"    :  return null;
        default          :  return null;
      }
    } else {
      return null
    }
  }

  // value max
  getValueMax = () => 
  {
    if (isValidNumber(this.value) && isValidNumber(this.uncertainty,0)) 
    {
      const { type, nbDecimals } = metaIndics[this.indic];

      let coef = 1.0 + this.uncertainty/100;
      let valueMax = roundValue(this.value*coef, nbDecimals);

      if (type=="proportion") { // majoration
        return Math.sign(valueMax) * Math.min(Math.abs(valueMax), 100.0);
      } else {
        return valueMax;
      }
    } 
    else {
      return null;
    }
  }

  getValueMin = () => 
  {
    if (isValidNumber(this.value) && isValidNumber(this.uncertainty,0)) 
    {
      const { nbDecimals } = metaIndics[this.indic];

      let coef = Math.max(1.0 - this.uncertainty/100, 0.0);
      let valueMin = roundValue(this.value*coef, nbDecimals);

      return valueMin;
    } 
    else {
      return null;
    }
  }

  /* ---------- Update from API ---------- */
    
  // data from API response (method called in SocialFootprint.js)
  update(data) 
  {
    this.value = data.value;
    this.uncertainty = data.uncertainty;
    this.flag = data.flag;
    this.info = data.info;
    this.source = data.source;
    this.year = data.year;
    this.lastupdate = data.lastupdate;
  }

  /* ---------- Setters ---------- */
        
  setValue(nextValue) 
  {
    if (isValidNumber(nextValue)) 
    {
      this.value = nextValue;
      this.flag = "m"; // valeur modifiée
    } 
    else 
    {
      this.value = null;
      this.flag = "i"; // valeur invalide
      this.uncertainty = null;
    }
  }

  setUncertainty(nextUncertainty) 
  {
    if (isValidNumber(nextUncertainty)) {
      this.uncertainty = nextUncertainty;
    } else {
      this.uncertainty = null;
    }
  }

  /* ---------- Check ---------- */

  // -> doesn't check max & min limits
  isValid = () => 
  {
    return isValidNumber(this.value) 
        && isValidNumber(this.uncertainty,0);
  }

}