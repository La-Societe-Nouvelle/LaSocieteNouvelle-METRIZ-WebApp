import { isValidNumber } from '../utils/Utils';
import {Indicator} from './Indicator';

const indics = ["eco","art","soc","knw","idr","geq","ghg","mat","was","nrg","wat","haz"];

export class SocialFootprint {

  constructor(props) 
  {
    if (props==undefined) props = {indicators: {}};
  // ---------------------------------------------------------------------------------------------------- //
    // indicators
    this.indicators = {};
    indics.forEach(indic => this.indicators[indic] = new Indicator({indic,...props.indicators[indic]}));
  // ---------------------------------------------------------------------------------------------------- //
  }

  /* --------- Getters ---------- */

  getIndicator(indic) {return this.indicators[indic]}

  /* ---------- Updaters ---------- */
  
  // All indicators
  updateAll(data) 
  {
    indics.map((indic) => {this.updateIndic(indic,data[indic.toUpperCase()])})
  }
  
  // Specific indicator
  updateIndic(indic, data) 
  {
 
    this.indicators[indic].update(data);
  }

  isComplete = () => Object.entries(this.indicators).filter(([_,indicator]) => !indicator.value).length == 0;

  isValid = () => {
    return Object.values(this.indicators).every((indicator) => indicator.isValid());
  }

}