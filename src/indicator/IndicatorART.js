import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";


export class IndicatorART extends IndicatorNetValueAdded {

  constructor()
  {
    super("art");
    // Specific data for ART
    this.craftedProduction = null;
    this.isValueAddedCrafted = null; // 25-06-2021
  }

  /*
    case craftedProduction != null -> "part"
    case isValueAddedCrafted -> "true" / "false"
  */

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.craftedProduction = backUp.craftedProduction;
    this.isValueAddedCrafted = backUp.isValueAddedCrafted!=undefined ? backUp.isValueAddedCrafted : null;
  }
    
  /* ---------- Setters ---------- */
    
  setStatement(statement) {
    this.craftedProduction = statement;
    this.uncertainty = 0;
  }    
  
  setIsValueAddedCrafted(isValueAddedCrafted) {
      this.isValueAddedCrafted = isValueAddedCrafted;
      if (this.isValueAddedCrafted == null) {
        this.craftedProduction = 0.0; // re-init value
      } else {
        this.craftedProduction = null;
      }
  }
  
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.craftedProduction;
  }

  getIsValueAddedCrafted() {
    return this.isValueAddedCrafted
  }
  
  /* ---------- Override ---------- */
  
  getValue() {
    if (this.netValueAdded!=null) 
    {
      // case : part of the net value added is crafted
      if (this.craftedProduction!=null) {return this.craftedProduction/this.netValueAdded *100}
      // case : none/all of the net value added is crafted
      else if (this.isValueAddedCrafted!=null) {return this.isValueAddedCrafted ? 100 : 0}
      // case : no statement
      else {return null}
    } 
    else 
    {
      return null;
    }
  }
    
  getUncertainty() {
    return this.getValue()!=null ? 0.0 : null;
  }

}