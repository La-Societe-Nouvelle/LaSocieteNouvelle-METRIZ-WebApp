import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";


export class IndicatorART extends IndicatorNetValueAdded {

  constructor()
  {
    super("art");
    // Specific data for ART
    this.craftedProduction = null;
    this.hasLabel = false;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.craftedProduction = backUp.craftedProduction;
    this.hasLabel = backUp.hasLabel;
  }
    
  /* ---------- Setters ---------- */
    
  setHasLabel(hasLabel) {
      this.hasLabel = hasLabel;
      if (hasLabel) {this.value = 100.0}
  }
  
  setCraftedProduction(craftedProduction) {
      this.craftedProduction = craftedProduction;
      this.uncertainty = 0;
  }    
  
  /* ---------- Getters ---------- */
  
  getCraftedProduction() {return this.craftedProduction}
  getHasLabel() {return this.hasLabel}
  
  /* ---------- Override ---------- */
  
  getValue() {
    if (this.netValueAdded!=null & this.craftedProduction!=null) {
      if (this.netValueAdded < this.craftedProduction) {
          this.craftedProduction = this.netValueAdded;
      }
      return ( Math.round(this.craftedProduction/this.netValueAdded*100 *10)/10 ).toFixed(1) ;
      //this.flag = Flag.PUBLICATION;
    } else {
      return null;
      //this.flag = Flag.UNDEFINED;
    }
  }
    
  getUncertainty() {
      if (this.getValue()!=null) {return 0.0}
      else {return null}
  }
  
  getValueAbsolute() {
  if (this.hasLabel)                        {return this.netValueAdded}
    else if (this.craftedProduction!=null)  {return this.craftedProduction}
    else                                    {return null}
  }

}