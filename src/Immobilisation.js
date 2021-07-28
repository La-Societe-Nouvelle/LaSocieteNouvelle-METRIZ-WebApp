import { EconomicValue } from './EconomicValue';

export class Immobilisation extends EconomicValue {

  constructor({id,label,amount,account,footprint}) 
  {
    super({id,label,amount,footprint})
    this.account = account || "";
    this.footprint.areaCode = "FRA";
    this.footprint.activityCode = "00";
  }

  async update(props) {
    super.update(props);
    if (props.account!=undefined) this.account = props.account;
    if (props.activityCode!=undefined) this.footprint.activityCode = props.activityCode;
  }

  /* ---------- Back Up ---------- */

  updateFromBackUp(backUp) {
    super.updateFromBackUp(backUp);
    this.account = backUp.account || "";
  }
  
  /* ---------- Getters ---------- */

  getAccount() {return this.account}

  /* ---------- Setters ---------- */

  setAccount(account) {this.account = account}

  /* ---------- Fetch Data ---------- */ 

  // Fetch footprint data for all indicators & complete general data
  async updateFootprintData() {
    await this.footprint.updateFromRemote();
  }
      
  // Fetch only CSF data for a specific indicator
  async updateIndicFootprintData(indic) {
    await this.footprint.updateIndicFromRemote(indic);
  }

}