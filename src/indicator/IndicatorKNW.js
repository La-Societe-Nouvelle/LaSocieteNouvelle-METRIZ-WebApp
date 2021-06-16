import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

const SPENDINGS_INTERNALS_TRAININGS = 0;
const SPENDINGS_RESEARCH = 1;
const SPENDINGS_TRAININGS_CONTRACTS = 2;

export class IndicatorKNW extends IndicatorNetValueAdded {

  constructor() {
    super("knw")
    // Specific data for KNW
    this.spendings = null;
    this.spendingsItems = {};
    this.spendingsItemsUncertainty = {};
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.spendings = backUp.spendings;
    this.spendingsItems = backUp.spendingsItem;
    this.spendingsItemsUncertainty = backUp.spendingsItemsUncertainty;
  }

  /* ---------- Setters ---------- */
  
  setSpendings(spendings) {
      this.spendings = spendings;
  }
  
  setSpendingsItem(item,spendings) {
      this.spendingsItems[item] = spendings;
      updateTotal();
  }

  setSpendingsItemUncertainty(item,uncertainty) {
      this.spendingsItemsUncertainty[item] = uncertainty;
  }
  
  /* ---------- Getters ---------- */
  
  getSpendings() {return this.spendings}
  
  getSpendingsItem(item) {return this.spendingsItems[item]}

  getSpendingsItemUncertainty(indic) {return this.spendingsItemsUncertainty[item]}
  
  /* ---------- Update ---------- */
  
  updateTotal() {
    let spendings = 0.0;
    for (let item = 0; item < this.spendingsItems.length; item++) {
        let spendingsItem = spendingsItems[item];
        spendings+= spendingsItem!=null ? spendingsItem : 0.0;
    }
  }
  
  /* ---------- Override ---------- */

  getValue() {
    if (this.netValueAdded!=null & this.spendings!=null) {
      if (this.netValueAdded < this.spendings) {
          this.spendings = netValueAdded;
      }
      return this.spendings/this.netValueAdded*100;
    } else {
      return null;
    }
  }

  getUncertainty() {
      if (this.getValue()!=null) {return 0.0}
      else {return null}
  }
}