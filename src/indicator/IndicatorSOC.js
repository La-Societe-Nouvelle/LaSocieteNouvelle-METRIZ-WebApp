import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

export class IndicatorSOC extends IndicatorNetValueAdded {

  constructor()
  {
    super("soc")
    // Specific data for SOC
    this.hasSocialPurpose = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.hasSocialPurpose = backUp.hasSocialPurpose;
  }

  /* --------- Setters --------- */
  
  setStatement(statement) {
      this.hasSocialPurpose = statement;
  }
  
  /* --------- Getters --------- */
  
  getStatement() {
    return this.hasSocialPurpose;
  }
  
  /* --------- Override --------- */
  
  getValue() {
    if (this.netValueAdded!=null && this.hasSocialPurpose!=null) 
    {
      return this.hasSocialPurpose ? 100.0 : 0.0;
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