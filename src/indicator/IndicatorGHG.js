import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

const POSTE_SOURCES_FIXES = 0 ;
const POSTE_SOURCES_MOBILES = 1 ;
const POSTE_PROCEDES = 2 ;
const POSTE_FUGITIVES = 3 ;
const POSTE_BIOMASSE = 4 ;

export class IndicatorGHG extends IndicatorNetValueAdded {

  constructor()
  {
    super("ghg");
    //Specific data for GHG
    this.emissions = null;
    this.emissionsItems = {};
    this.emissionsItemsUncertainty = {};
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.emissions = backUp.emissions;
    this.emissionsItems = backUp.emissionsItems;
    this.emissionsItemsUncertainty = backUp.emissionsItemsUncertainty;
  }
    
  /* ---------- Setters ---------- */
  
  setTotalEmissions(emissions) {
      if (this.value!=null) {this.value = this.value*(emissions/this.emissions)}
      this.emissions = emissions;
      this.uncertainty = 50.0;
      this.emissionsItems = {};
      this.emissionsItemsUncertainty = {};
  }
  
  setEmissionsItem(item,emissions) {
      this.emissionsItems[item] = emissions; // Gap (-1) with carbon assessment items numbering
      this.emissionsItemsUncertainty[item] = 50.0;
      this.updateTotal();
  }
  
  setEmissionsUncertaintyItem(item,emissions) {
      this.emissionsItemsUncertainty[item] = emissions;
      this.updateTotal();
  }
  
  /* ---------- Getters ---------- */
  
  getTotalEmissions() {return this.emissions}
  getTotalEmissionsUncertainty() {
    if (this.emissions!=null) {return this.uncertainty}
    else {return null}
  }
  getItem(item) {return this.emissionsItems[item]}
  getItemUncertainty(item) {return this.emissionsItemsUncertainty[item]}

  getEmissionsItems() {
      return this.emissionsItems;
  }

  getEmissionsItemsUncertainty() {
      return this.emissionsItemsUncertainty;
  }
  
  /* ---------- Update ---------- */
  
  updateTotal() {
      let isTotalSet = false;
      let emissions = 0.0;
      let emissionsMax = 0.0;
      let emissionsMin = 0.0;
      // sum items
      for (let item = 0; item < 5; item++) {
          if (this.emissionsItems[item]!=undefined) {
              let emissionsItem = this.emissionsItems[item];
              emissionsMax+= emissionsItem*(1 + this.emissionsItemsUncertainty[item]/100);
              emissionsMin+= emissionsItem*Math.max(1 - this.emissionsItemsUncertainty[item]/100, 0.0);
              emissions+= emissionsItem;
              isTotalSet = true;
          }
      }
      if (isTotalSet) {
        this.emissions = emissions;
        if (emissions > 0.0) { this.uncertainty = Math.max(emissionsMax-emissions, emissions-emissionsMin)/emissions *100;} 
        else                 { this.uncertainty = 0.0;}
      } else {
          this.emissions = null;
          this.uncertainty = null;
          //flag = Flag.UNDEFINED;
      }
  }
  
  getValue() {
    if (this.netValueAdded!=null & this.emissions!=null) {
      return this.emissions/this.netValueAdded*1000;
    } else {
      return null;
    }
  }

}