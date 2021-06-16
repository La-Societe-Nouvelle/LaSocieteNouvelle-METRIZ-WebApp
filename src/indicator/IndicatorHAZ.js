import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

export class IndicatorHAZ extends IndicatorNetValueAdded {

  constructor()
  {
    super("haz")
    // Specific data for HAZ
    this.hazardsUse = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.hazardsUse = backUp.hazardsUse;
  }

  /* ---------- Setters ---------- */
  
  setHazard(hazardsUse) {
    this.hazardsUse = hazardsUse;
    if (this.hazardsUse==null) {this.uncertainty = null}
    else {this.uncertainty = 50.0}
  }

  /* ---------- Getters ---------- */
  
  getProductsUse() {return this.hazardsUse}
  
  getProductsUseUncertainty() {
    if (this.hazardsUse!=null) {return this.uncertainty}
    else {return null}
  }

  /* ---------- Update ---------- */
  
  getValue() {
    if (this.netValueAdded!=null & this.hazardsUse!=null) {
      return this.hazardsUse/this.netValueAdded*1000;
    } else {
      return null;
    }
  }
  

}