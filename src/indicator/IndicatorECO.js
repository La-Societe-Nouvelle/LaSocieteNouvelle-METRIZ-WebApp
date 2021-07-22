
import { IndicatorNetValueAdded } from "./IndicatorNetValueAdded";

export class IndicatorECO extends IndicatorNetValueAdded {

  constructor() 
  {
    super("eco");
    // Specific data for ECO
    this.domesticProduction = null;
    this.isAllActivitiesInFrance = null; // 24-06-2021
  }

  /*
    case domesticProduction != null -> "part"
    case isAllActivitiesInFrance -> "true" / "false"
  */

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.domesticProduction = backUp.domesticProduction;
    this.isAllActivitiesInFrance = backUp.isAllActivitiesInFrance!=undefined ? backUp.isAllActivitiesInFrance : null;
  }

  /* ----- SETTERS ----- */

  setStatement(statement) {
    this.domesticProduction = statement;
  }

  setIsAllActivitiesInFrance(isAllActivitiesInFrance) {
    this.isAllActivitiesInFrance = isAllActivitiesInFrance;
    if (this.isAllActivitiesInFrance == null) {
      this.domesticProduction = 0.0; // re-init value
    } else {
      this.domesticProduction = null;
    }
  }

  /* ----- GETTERS ----- */

  getStatement() {
    return this.domesticProduction;
  }

  getIsAllActivitiesInFrance() {
    return this.isAllActivitiesInFrance;
  }

  /* ----- VALUE & UNCERTAINTY ----- */

  getValue() {
    if (this.netValueAdded!=null) 
    {
      // case : part of the net value added is crafted
      if (this.domesticProduction!=null) {return this.domesticProduction/this.netValueAdded *100}
      // case : none/all of the net value added is crafted
      else if (this.isAllActivitiesInFrance!=null) {return this.isAllActivitiesInFrance ? 100 : 0}
      // case : not defined
      else {return null}
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