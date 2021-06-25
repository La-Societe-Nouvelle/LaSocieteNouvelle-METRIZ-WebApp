import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";


export class IndicatorART extends IndicatorNetValueAdded {

  constructor()
  {
    super("art");
    // Specific data for ART
    this.craftedProduction = null;
    this.isValueAddedCrafted = false;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.craftedProduction = backUp.craftedProduction;
    // 25-06-2021
    this.isValueAddedCrafted = backUp.isValueAddedCrafted!=undefined ? backUp.isValueAddedCrafted : (backUp.hasLabel!=undefined ? backUp.hasLabel : false);
  }
    
  /* ---------- Setters ---------- */
    
  setCraftedProduction(craftedProduction) {
    this.craftedProduction = craftedProduction;
    this.uncertainty = 0;
  }    
  
  setIsValueAddedCrafted(isValueAddedCrafted) {
      this.isValueAddedCrafted = isValueAddedCrafted;
      this.craftedProduction = isValueAddedCrafted ? this.netValueAdded : 0.0;
  }
  
  /* ---------- Getters ---------- */
  
  getCraftedProduction() {return this.craftedProduction}
  getIsValueAddedCrafted() {return this.isValueAddedCrafted}
  
  /* ---------- Override ---------- */
  
  getValue() {
    if (this.netValueAdded!=null & this.isValueAddedCrafted) {
      return 100.0;
    } else if (this.netValueAdded!=null & this.craftedProduction!=null) {
      if (this.netValueAdded < this.craftedProduction) {
          this.craftedProduction = this.netValueAdded;
      }
      return this.craftedProduction/this.netValueAdded *100;
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