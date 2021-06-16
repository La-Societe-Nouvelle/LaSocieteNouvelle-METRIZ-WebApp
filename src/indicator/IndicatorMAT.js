import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

const BIOMASSE = 0;
const METAL = 1;
const NON_METAL = 2;
const FOSSILE = 3;

export class IndicatorMAT extends IndicatorNetValueAdded {

  constructor() 
  {
    super("mat")
    this.materials = null;
    // Specific data for MAT
    this.items = {};
    this.itemsUncertainty = {};
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.materials = backUp.materials;
    this.items = backUp.items;
    this.itemsUncertainty = backUp.itemsUncertainty;
  }
    
  /* ---------- Setters ---------- */
  
  setMaterials(materials) {
    this.materials = materials;
    if (this.materials == null) {this.uncertainty = null}
    else {this.uncertainty = 50.0}
    this.items = {};
    this.itemsUncertainty = {};
  }
  
  setMaterialsItem(item,materials) {
    this.items[item] = materials;
    this.itemsUncertainty[item] = 50.0;
    this.updateTotal();
  }
  
  setMaterialsItemUncertainty(item,uncertainty) {
      this.itemsUncertainty[item] = uncertainty;
      this.updateTotal();
  }
  
  /* ---------- Getters ---------- */
  
  getMaterials() {return this.materials}

  getMaterialsUncertainty() {
    if (this.materials!=null) {return this.uncertainty}
    else {return null}
  }
  
  getMaterialsItem(item) {return items[item]}
  
  getMateiralsItemUncertainty(item) {return itemsUncertainty[item]}

  /* ---------- Update ---------- */
  
  updateTotal() {
      let isTotalSet = false;
      materials = 0.0;
      let materialsMax = 0.0;
      let materialsMin = 0.0;
      for (let item = 0; item < items.length; item++) {
          let materialsItem = items[item];
          if (materialsItem!=null) {
              materialsMax+= materialsItem*(1 + itemsUncertainty[item]/100);
              materialsMin+= materialsItem*max(1 - itemsUncertainty[item]/100, 0.0);
              materials+= materialsItem;
              isTotalSet = true;
          }
      }
      if (isTotalSet) {
          if (materials > 0.0) { uncertainty = max(materialsMax-materials, materials-materialsMin)/materials *100;} 
          else                 { uncertainty = 0.0;}
      } else {
          materials = null;
          uncertainty = null;
          flag = Flag.UNDEFINED;
      }
  }

  getValue() {
    if (this.netValueAdded!=null & this.materials!=null) {
      return this.materials/this.netValueAdded*1000;
    } else {
      return null;
    }
  }
  
  

}