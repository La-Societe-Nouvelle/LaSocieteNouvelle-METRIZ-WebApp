
import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

export class IndicatorECO extends IndicatorNetValueAdded {

  constructor() 
  {
    super("eco");
    // Specific data for ECO
    this.domesticProduction = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.domesticProduction = backUp.domesticProduction;
  }

  setDomesticProduction(domesticProduction) {
    if (this.value!=null) {
      this.value = this.value*(domesticProduction/this.domesticProduction);
    }
    this.domesticProduction = domesticProduction;
    this.uncertainty = 0;
  }

  getDomesticProduction() {
    return this.domesticProduction;
  }

  getValue() {
    if (this.netValueAdded!=null & this.domesticProduction!=null) {
      if (this.netValueAdded < this.domesticProduction) {
          this.domesticProduction = this.netValueAdded;
      }
      return this.domesticProduction/this.netValueAdded*100;
    } else {
      return null;
    }
  }

  getUncertainty() {
    if (this.getValue()!=null) {return 0.0}
    else {return null}
  }

}