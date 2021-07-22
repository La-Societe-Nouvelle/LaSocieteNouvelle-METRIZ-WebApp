import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";
export class IndicatorKNW extends IndicatorNetValueAdded {

  constructor() {
    super("knw")
    // Specific data for KNW
    this.researchAndTrainingContribution = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.spendings = backUp.researchAndTrainingContribution || backUp.spendings;
  }

  /* ---------- Setters ---------- */
  
  setStatement(statement) {
      this.researchAndTrainingContribution = statement;
  }
  
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.researchAndTrainingContribution;
  }
  
  /* ---------- Override ---------- */

  getValue() {
    if (this.netValueAdded!=null & this.researchAndTrainingContribution!=null) 
    {
      return this.researchAndTrainingContribution/this.netValueAdded *100;
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