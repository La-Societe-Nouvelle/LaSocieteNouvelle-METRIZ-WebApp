import {Indicator} from './Indicator';

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

export class SocialFootprint {

  constructor({footprintId,areaCode,activityCode,flowCode,indicators}) 
  {
    // parameters
    this.footprintId = footprintId || null;
    this.areaCode = areaCode || null;
    this.activityCode = activityCode || null;
    this.flowCode = flowCode || null;
    // indicators
    this.indicators = {};
    if (indicators!=undefined) {indics.forEach(indic => {this.indicators[indic] = new Indicator(indicators[indic])})}
    else {indics.forEach(indic => {this.indicators[indic] = new Indicator({indic: indic})})}
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

}