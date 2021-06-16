import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

const ELECTRICITY = 0;
const FOSSILE = 1;
const BIOMASSE = 2;
const HEAT = 3;
const PRIMARY_RENEWABLE = 4;
 
export class IndicatorNRG extends IndicatorNetValueAdded {

  constructor()
  {
    super("nrg")
    // Specific data for NRG
    this.energy = null;
    this.items = {};
    this.itemsUncertainty = {};
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.energy = backUp.energy;
    this.items = backUp.items;
    this.itemsUncertainty = backUp.itemsUncertainty;
  }
  
  /* ---------- Setters ---------- */
  
  setEnergy(input) {
    if (this.value!=null) {this.value = this.value*(input/this.energy)}
    this.energy = input;
    this.uncertainty = 50.0;
    this.items = {};
    this.itemsUncertainty = {};
  }
  
  setEnergyItem(item,input) {
      this.items[item] = input;
      this.itemsUncertainty[item] = 50.0;
      this.updateTotal();
  }
  
  setEnergyItemUncertainty(item,input) {
      this.itemsUncertainty[item] = input;
      this.updateTotal();
  }
  
  /* ---------- Getters ---------- */
  
  getEnergy() {return this.energy}

  getEnergyUncertainty() {
    if (this.energy!=null) {return this.uncertainty}
    else {return null}
  }
  
  getEnergyItem(item) {return this.items[item]}
  
  getEnergyItemUncertainty(item) {return itemsUncertainty[item]}
  
  /* ---------- Update ---------- */
  
  updateTotal() {
      let isTotalSet = false;
      energy = 0.0;
      let energyMax = 0.0;
      let energyMin = 0.0;
      for (let item = 0; item < items.length; item++) {
          let energyItem = items[item];
          if (energyItem!=null) {
              energyMax+= energyItem*(1 + itemsUncertainty[item]/100);
              energyMin+= energyItem*max(1 - itemsUncertainty[item]/100, 0.0);
              energy+= energyItem;
              isTotalSet = true;
          }
      }
      if (isTotalSet) {
          if (energy > 0) { uncertainty = max(energyMax-energy, energy-energyMin)/energy *100;} 
          else            { uncertainty = 0.0;}
      } else {
          energy = null;
          uncertainty = null;
          flag = Flag.UNDEFINED;
      }
  }
  
  getValue() {
    if (this.netValueAdded!=null & this.energy!=null) {
      return this.energy/this.netValueAdded*1000;
    } else {
      return null;
    }
  }

}