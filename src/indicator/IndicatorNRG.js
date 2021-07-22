import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";
export class IndicatorNRG extends IndicatorNetValueAdded {

  constructor()
  {
    super("nrg")
    // Specific data for NRG
    this.energyConsumption = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.energyConsumption = backUp.energyConsumption || backUp.energy;
  }
  
  /* ---------- Setters ---------- */
  
  setStatement(statement) {
    this.energyConsumption = statement;
    this.uncertainty = this.energyConsumption > 0 ? 50.0 : 0.0;
  }

  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.energyConsumption;
  }

  getStatementUncertainty() {
    return this.getStatement()!=null ? this.uncertainty : null;
  }

  /* ---------- Override ---------- */
    
  getValue() {
    if (this.netValueAdded!=null && this.energyConsumption!=null) 
    {
      return this.energyConsumption/this.netValueAdded *1000;
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