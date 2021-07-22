import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";


export class IndicatorDIS extends IndicatorNetValueAdded {

  constructor()
  {
    super("dis");
    // Specific data for DIS
    this.indexGini = null;
    this.hasEmployees = true; // 25-06-2021
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.indexGini = backUp.indexGini;
    this.hasEmployees = backUp.hasEmployees!=undefined ? backUp.hasEmployees : true; 
  }

  /* ---------- Setters ---------- */
  
  setStatement(statement) {
    this.indexGini = statement;
    this.hasEmployees = true;
  }

  setHasEmployees(hasEmployees) {
    this.hasEmployees = hasEmployees;
    this.indexGini = hasEmployees ? null : 0.0;
  }
  
  /* ---------- Getters ---------- */
  
  getStatement() {
    return this.indexGini;
  }

  getHasEmployees() {
    return this.hasEmployees;
  }
  
  /* ---------- Update ---------- */
  
  getValue() {
    if (this.netValueAdded!=null) 
    {
      return this.hasEmployees ? this.indexGini : 0.0;
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