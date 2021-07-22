import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";
export class IndicatorWAS extends IndicatorNetValueAdded {

  constructor()
  {
    super("was")
    // Specific data for WAS
    this.wasteProduction = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.wasteProduction = backUp.wasteProduction;
  }
  
  /* ---------- Setters ---------- */
  
  setStatement(statement) {
    this.wasteProduction = statement;
    this.uncertainty = this.wasteProduction > 0 ? 50.0 : 0.0;
  }
  
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.wasteProduction;
  }

  getStatementUncertainty() {
    return this.wasteProduction!=null ? this.uncertainty : null;
  }

  /* ---------- Override ---------- */
  
  getValue() {
    if (this.netValueAdded!=null & this.wasteProduction!=null) 
    {
      return this.wasteProduction/this.netValueAdded *1000;
    } 
    else 
    {
      return null;
    }
  }
    
}