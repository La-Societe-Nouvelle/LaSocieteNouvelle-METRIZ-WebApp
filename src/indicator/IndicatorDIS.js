import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";


export class IndicatorDIS extends IndicatorNetValueAdded {

  constructor()
  {
    super("dis");
    // Specific data for DIS
    this.indexGini = null;
    this.hasEmployees = true;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.indexGini = backUp.indexGini;
    // 25-06-2021
    this.hasEmployees = backUp.hasEmployees!=undefined ? backUp.hasEmployees : true; 
  }

  /* ---------- Setters ---------- */
  
  setIndexGini(indexGini) {
    this.indexGini = indexGini;
    this.uncertainty = 0;
    this.hasEmployees = true;
  }

  setHasEmployees(hasEmployees) {
    this.hasEmployees = hasEmployees;
    this.indexGini = hasEmployees ? null : 0.0;
  }
  
  /* ---------- Getters ---------- */
  
  getIndexGini() {return this.indexGini}

  getHasEmployees() {
    return this.hasEmployees;
  }
  
  /* ---------- Update ---------- */
  
  getValue() {
    if (this.netValueAdded!=null) {
      return this.indexGini
    } else {
      return null;
    }
  }  

}