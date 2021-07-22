import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

const DELIVERED = 0;
const WITHDRAWAL = 1;

export class IndicatorWAT extends IndicatorNetValueAdded {

  constructor() 
  {
    super("wat")
    // Specific data for WAT
    this.waterConsumption = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.waterConsumption = backUp.waterConsumption;
  }

  /* ---------- Setters ---------- */
  
  setStatement(statement) {
    this.waterConsumption = statement;
    this.uncertainty = this.waterConsumption > 0 ? 50.0 : 0.0;
  }
  
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.waterConsumption;
  }

  getStatementUncertainty() {
    return this.waterConsumption!=null ? this.uncertainty : null;
  }
  
  /* ---------- Update ---------- */
  
  getValue() {
    if (this.netValueAdded!=null && this.waterConsumption!=null) 
    {
      return this.waterConsumption/this.netValueAdded *1000;
    } 
    else 
    {
      return null;
    }
  }

}