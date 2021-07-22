import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";
export class IndicatorMAT extends IndicatorNetValueAdded {

  constructor() 
  {
    super("mat")
    this.materialsExtraction = null;
    this.isExtractiveActivities = null; // 07-07-2021
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.materialsExtraction = backUp.materialsExtraction || backUp.materials;
    this.isExtractiveActivities = backUp.isExtractiveActivities || null;
  }
    
  /* ---------- Setters ---------- */
  
  setStatement(statement) {
    this.materialsExtraction = statement;
    this.uncertainty = this.materialsExtraction > 0 ? 50.0 : 0.0;
    this.isExtractiveActivities = true;
  }

  setIsExtractiveActivities(isExtractiveActivities) {
    this.isExtractiveActivities = isExtractiveActivities;
    this.materialsExtraction = this.isExtractiveActivities ? null : 0.0;
    this.uncertainty = 0.0;
  }
  
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.materialsExtraction;
  }

  getStatementUncertainty() {
    return this.getStatement()!=null ? this.uncertainty : null;
  }

  getIsExtractiveActivities() {
    return this.isExtractiveActivities;
  }

  /* ---------- Override ---------- */

  getValue() {
    if (this.netValueAdded!=null) 
    {
      // case : no mining or agricultural activities
      if (!this.isExtractiveActivities) {return 0.0}
      // case : mining or agricultural activities
      else if (this.materialsExtraction!=null) {this.materialsExtraction/this.netValueAdded *1000}
      // case : no statement
      else {return null};
    }
    else 
    {
      return null;
    }
  }
  
  getUncertainty() {
    return this.getValue()!=null ? this.uncertainty : null;
  }

}