import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

export class IndicatorHAZ extends IndicatorNetValueAdded {

  constructor()
  {
    super("haz")
    // Specific data for HAZ
    this.hazardousSubstancesConsumtpion = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.hazardousSubstancesConsumtpion = backUp.hazardousSubstancesConsumtpion || backUp.hazardsUse;
  }

  /* ---------- Setters ---------- */

  setStatement(statement) {
    this.hazardousSubstancesConsumtpion = statement;
    this.uncertainty = this.hazardousSubstancesConsumtpion > 0 ? 50.0 : 0.0;
  }
k
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.hazardousSubstancesConsumtpion;
  }
  
  getStatementUncertainty() {
    return this.getStatement()!=null ? this.uncertainty : null;
  }

  /* ---------- Update ---------- */
  
  getValue() {
    if (this.netValueAdded!=null && this.hazardousSubstancesConsumtpion!=null) 
    {
        return this.hazardousSubstancesConsumtpion/this.netValueAdded *1000;
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