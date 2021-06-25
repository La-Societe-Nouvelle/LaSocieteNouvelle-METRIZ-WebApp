
import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

export class IndicatorECO extends IndicatorNetValueAdded {

  constructor() 
  {
    super("eco");
    // Specific data for ECO
    this.domesticProduction = null;
    this.isAllActivitiesInFrance = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.domesticProduction = backUp.domesticProduction;
    // 24-06-2021
    this.isAllActivitiesInFrance = backUp.isAllActivitiesInFrance!=undefined ? backUp.isAllActivitiesInFrance : (this.domesticProduction==this.netValueAdded);
  }

  /* ----- SETTERS ----- */

  setDomesticProduction(domesticProduction) {
    this.domesticProduction = domesticProduction;
    this.uncertainty = 0;
    this.isAllActivitiesInFrance = domesticProduction==this.netValueAdded;
  }

  setIsAllActivitiesInFrance(isAllActivitiesInFrance) {
    this.isAllActivitiesInFrance = isAllActivitiesInFrance;
    if (isAllActivitiesInFrance) {
      this.domesticProduction = this.netValueAdded;
    } else {
      this.domesticProduction = 0.0;
    }
  }

  /* ----- GETTERS ----- */

  getDomesticProduction() {
    return this.domesticProduction;
  }

  getIsAllActivitiesInFrance() {
    return this.isAllActivitiesInFrance;
  }

  /* ----- VALUE & UNCERTAINTY ----- */

  getValue() {
    if (this.netValueAdded!=null & this.isAllActivitiesInFrance) {
      return 100.0;
    } else if (this.netValueAdded!=null & this.domesticProduction!=null) {
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