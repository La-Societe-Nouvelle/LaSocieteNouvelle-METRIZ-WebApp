import {Indicator} from '/src/Indicator.js';

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class SocialFootprint {

  constructor() 
  {
    this.indicators = {};
    indics.forEach((indic) => {
      this.indicators[indic] = new Indicator(indic);
    })

    this.footprintId = null;
    this.areaCode = null;
    this.activityCode = null;
  }

  initFootprint() {
    this.areaCode = "WLD";
  }

  /* --------- Back Up ---------- */

  updateFromBackUp(backUp) {
    indics.forEach((indic) => {this.indicators[indic].updateFromBackUp(backUp.indicators[indic])});
    this.areaCode = backUp.areaCode || "WLD";
    this.activityCode = backUp.activityCode || "00";
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
    indics.map((indic) => {this.updateIndic(indic,data[indic.toUpperCase()])})
  }
  
  // Specific indicator
  updateIndic(indic, data) {
    this.indicators[indic].update(data);
  }

  // All indicators
  async updateFromRemote() {
    let data = await this.fetchData();
    indics.map((indic) => {this.updateIndic(indic,data[indic.toUpperCase()])})
  }
  
  // Specific indicator
  async updateIndicFromRemote(indic) {
    let data = await this.fetchData();
    this.indicators[indic].update(data[indic]);
  }

  /* ---------- Fetching data ---------- */

  // Fetch all data
  async fetchData() 
  {
    this.dataFetched = false;
    // Fetch footprint
    if (this.footprintId!=null) 
    {  
      let endpoint = apiBaseUrl + "siren/" + this.footprintId;
      let response = await fetch(endpoint, {method:'get'});
      let data = await response.json();
      if (data.header.statut == 200) {
        return data.profil.empreinteSocietale;
      }
    }
    // Fetch default data
    if (!this.dataFetched) {
      let area = this.areaCode || "_DV";
      let activity = this.activityCode || "00";
      let endpoint = apiBaseUrl + "default?" + "pays="+area + "&activite="+activity +"&flow=PRD";
      let response = await fetch(endpoint, {method:'get'});
      let data = await response.json();
      if (data.header.statut == 200) {
        return data.empreinteSocietale;
      } else {
        endpoint = apiBaseUrl + "default?pays=_DV&activite=00&flow=GAP";
        response = await fetch(endpoint, {method:'get'});
        data = await response.json();
        return data.empreinteSocietale;
      }
    }
  }

  // Fetch footprint data for all indicators & complete general data
  fetchFootprintdata() {
      this.footprint.fetchData();
  }
      
  // Fetch only CSF data for a specific indicator
  async fetchIndicFootprintData(indic) {
    this.footprint.fetchIndicFootprintData(indic);
  }
      

}