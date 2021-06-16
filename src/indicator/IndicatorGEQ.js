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
    this.hasEmployees = backUp.hasEmployees;
  }

  /* ---------- Setters ---------- */
  
  setWageGap(wageGap) {
    this.wageGap = wageGap
  }
  
  setHasEmployees(hasEmployees) {
    this.hasEmployees = hasEmployees
  }
  
  /* ---------- Getters ---------- */
  
  getWageGap() {return this.wageGap}
  getHasEmployees() {return this.hasEmployees}
  
  /* ---------- Override ---------- */
  
  getValue() {
    if (this.hasEmployees) {
      return this.wageGap;
    } else {
      return 0.0;
    }
  }

}