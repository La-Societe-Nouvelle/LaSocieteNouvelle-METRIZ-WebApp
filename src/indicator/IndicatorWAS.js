import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

const TYPE_RECYCLED = 0;
const TYPE_NOT_DANGEROUS = 1;
const TYPE_DANGEROUS = 2;

export class IndicatorWAS extends IndicatorNetValueAdded {

  constructor()
  {
    super("was")
    // Specific data for WAS
    this.wasteProduction = null;
    this.items = {};
    this.itemsUncertainty = {};
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.wasteProduction = backUp.wasteProduction;
    this.items = backUp.items;
    this.itemsUncertainty = backUp.itemsUncertainty;
  }
  
  /* ---------- Setters ---------- */
  
  setWaste(wasteProduction) {
    this.wasteProduction = wasteProduction;
    this.uncertainty = 50.0;
    this.items = {};
    this.itemsUncertainty = {};
  }
  
  setWasteItem(item,input) {
      this.items[item] = input;
      this.itemsUncertainty[item] = 50.0;
      this.updateTotal();
  }
  
  setWasteItemUncertainty(item,input) {
    this.itemsUncertainty[item] = value;
    this.updateTotal();
  }
  
  /* ---------- Getters ---------- */
  
  getTotalWasteProduction() {return this.wasteProduction}

  getTotalWasteProductionUncertainty() {
    if (this.wasteProduction!=null) {return this.uncertainty}
    else {return null}
  }

  getWasteItem(item) {return this.items[item]}
  
  getWasteItemUncertainty(item) {return this.itemsUncertainty[item]}
    
  /* ---------- Update ---------- */
  
  update({wasteProduction,uncertainty,items,itemsUncertainty}) {
    this.wasteProduction = wasteProduction;
    this.uncertainty = uncertainty;
    // Details
    this.items = items;
    this.itemsUncertainty = itemsUncertainty;
  }

  updateTotal() {
      let isTotalSet = false;
      this.wasteProduction = 0.0;
      let wasteMax = 0.0;
      let wasteMin = 0.0;
      for (let item = 0; item < items.length; item++) {
          let wasteItem = items[item];
          if (wasteItem!=null) {
              wasteMax+= wasteItem*(1 + itemsUncertainty[item]/100);
              wasteMin+= wasteItem*max(1 - itemsUncertainty[item]/100, 0.0);
              waste+= wasteItem;
              isTotalSet = true;
          }
      }
      if (isTotalSet) {
          if (this.wasteProduction > 0) { uncertainty = max(wasteMax-waste, waste-wasteMin)/waste *100;} 
          else { uncertainty = 0.0;}
      } else {
          this.wasteProduction = null;
          uncertainty = null;
          //flag = Flag.UNDEFINED;
      }
  }

  /* ---------- Override ---------- */
  
  getValue() {
    if (this.netValueAdded!=null & this.wasteProduction!=null) {
      return this.wasteProduction/this.netValueAdded*1000;
    } else {
      return null;
    }
  }
    
}