
import {Indicator} from '/src/Indicator.js';

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

export class SocialFootprint {

  constructor() 
  {
    this.indicators = {};
    indics.forEach((indic) => {
      this.indicators[indic] = new Indicator(indic);
    })
  }

  updateFromBackUp(backUp) {
    indics.forEach((indic) => {this.indicators[indic].updateFromBackUp(backUp.indicators[indic])})
  }

  /* --------- Getters ---------- */

  getIndicator(indic) {
    return this.indicators[indic];
  }

  /* ---------- Updaters ---------- */

  // default data
  setDefaultData() {
    if (!Indic.isDefautDataSet) { Indic.fetchDefaultData(); }
    indics.map((indic) => {
      this.indicateurs[indic] = new Indicator(indic);
    })
  }
  
  // default data
  setDefaultData(defaultData) {
    indics.map((indic) => {
      let indicator = new Indicator(indic);
      indicator.update(defaultData);
      this.indicateurs[indic] = indicator;
    })
  }
  
  // All indicators
  updateAll(data) {
    indics.map((indic) => {this.update(indic,data[indic.toUpperCase()])})
  }
  
  // Specific indicator
  update(indic,data) {
      this.indicators[indic].update(data);
  }
      

}