import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

export class IndicatorGEQ extends IndicatorNetValueAdded {

  constructor()
  {
    super("geq")
    // Specific data for GEQ
    this.wageGap = null;
    this.hasEmployees = true;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.wageGap = backUp.wageGap;
    this.hasEmployees = backUp.hasEmployees!=undefined ? backUp.hasEmployees : true;
  }

  /* ---------- Setters ---------- */
  
  setStatement(statement) {
    this.wageGap = statement;
  }
  
  setHasEmployees(hasEmployees) {
    this.hasEmployees = hasEmployees
    this.wageGap = this.hasEmployees ? null : 0.0;
  }
  
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.wageGap;
  }

  getHasEmployees() {
    return this.hasEmployees;
  }
  
  /* ---------- Override ---------- */
  
  getValue() {
    if (this.netValueAdded!=null) 
    {
      return this.hasEmployees ? this.wageGap : 0.0;
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