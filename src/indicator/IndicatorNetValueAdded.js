
import { Indicator } from "../Indicator";

export class IndicatorNetValueAdded extends Indicator {

  constructor(indic) 
  {
    super(indic);
    this.netValueAdded = null;
  }

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.netValueAdded = backUp.netValueAdded;
  }

  getNetValueAdded() {
    return this.netValueAdded;
  }

  setNetValueAdded(netValueAdded) {
    this.netValueAdded = netValueAdded;
  }

}