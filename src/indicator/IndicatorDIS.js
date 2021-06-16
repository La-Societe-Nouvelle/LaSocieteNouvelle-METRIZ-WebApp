import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";


export class IndicatorDIS extends IndicatorNetValueAdded {

  constructor()
  {
    super("dis");
    // Specific data for DIS
    this.indexGini = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.indexGini = backUp.indexGini;
  }

  /* ---------- Setters ---------- */
  
  setIndexGini(indexGini) {
    this.indexGini = indexGini;
    this.uncertainty = 0;
  }
  
  /* ---------- Getters ---------- */
  
  getIndexGini() {return this.indexGini}
  
  /* ---------- Update ---------- */
  
  getValue() {return this.indexGini}  

}