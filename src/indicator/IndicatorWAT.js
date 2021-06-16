import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

const DELIVERED = 0;
const WITHDRAWAL = 1;

export class IndicatorWAT extends IndicatorNetValueAdded {

  constructor() 
  {
    super("wat")
    // Specific data for WAT
    this.waterConsumption = null;
    // Details
    this.items = {};
    this.itemsUncertainty = {};
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.waterConsumption = backUp.waterConsumption;
    this.items = backUp.items;
    this.itemsUncertainty = backUp.itemsUncertainty;
  }

  /* ---------- Setters ---------- */
  
  setTotalWaterConsumption(input) {
    this.waterConsumption = input;
    this.uncertainty = 50.0;
    this.items = {};
    this.itemsUncertainty = {};
  }
  
  setConsumptionItem(item,input) {
    this.items[item] = input;
    this.itemsUncertainty[item] = 50.0;
    this.updateTotal();
  }
  
  setConsumptionItemUncertainty(item,input) {
      this.itemsUncertainty[item] = input;
      this.updateTotal();
  }
  
  /* ---------- Getters ---------- */
  
  getTotalWaterConsumption() {return this.waterConsumption}
  getTotalWaterConsumptionUncertainty() {return this.uncertainty}
  getItemValue(item) {return this.items[item]}
  getItemUncertainty(item) {return this.itemsUncertainty[item]}
  
  /* ---------- Update ---------- */
  
  update({waterConsumption,uncertainty,items,itemsUncertainty}) {
    this.waterConsumption = waterConsumption;
    this.uncertainty = uncertainty;
    // Details
    this.items = items;
    this.itemsUncertainty = itemsUncertainty;
  }

  updateTotal() {
      let isTotalSet = false;
      this.waterConsumption = 0.0;
      let consumptionMax = 0.0;
      let consumptionMin = 0.0;
      for (let item = 0; item < items.length; item++) {
          let consumptionItem = items[item];
          if (consumptionItem!=null) {
              consumptionMax+= consumptionItem*(1 + itemsUncertainty[item]/100);
              consumptionMin+= consumptionItem*(1 - itemsUncertainty[item]/100);
              consumption+= consumptionItem;
              isTotalSet = true;
          }
      }
      if (isTotalSet) {
          if (consumption > 0) { uncertainty = max(consumptionMax-consumption, consumption-consumptionMin)/consumption *100;} 
          else                 { uncertainty = 0.0;}
      } else {
          consumption = null;
          uncertainty = null;
          flag = Flag.UNDEFINED;
      }
  }
  
  /* ---------- Override ---------- */
  
  getValue() {
    if (this.netValueAdded!=null & this.waterConsumption!=null) {
      return this.waterConsumption/this.netValueAdded*1000;
    } else {
      return null;
    }
  }

}