import { EconomicValue } from './EconomicValue';

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Immobilisation extends EconomicValue {

  constructor({id,label,amount,account,
               footprintAreaCode,footprintActivityCode,prevFootprintLoaded,dataFetched,
               footprint}) 
  {
    super({id,label,amount,footprint})

    this.account = account || "";
    this.prevFootprintLoaded = prevFootprintLoaded || false;

    this.footprintAreaCode = footprintAreaCode || "FRA";
    this.footprintActivityCode = footprintActivityCode || "00";
    this.dataFetched = dataFetched || false;
  }

  async update(props) 
  {
    super.update(props);
    if (props.account!=undefined) this.account = props.account;

    if (!this.prevFootprintLoaded && (
          (props.footprintAreaCode!=undefined && props.footprintAreaCode!=this.footprintAreaCode)
       || (props.footprintActivityCode!=undefined && props.footprintActivityCode!=this.footprintActivityCode))) 
    {
      if (props.footprintAreaCode!=undefined) this.footprintAreaCode = props.footprintAreaCode;
      if (props.footprintActivityCode!=undefined) this.footprintActivityCode = props.footprintActivityCode;
      await this.updateFootprintFromRemote();
    }
  }
  
  /* ---------- Getters ---------- */

  getAccount() {return this.account}

  /* ---------- Setters ---------- */

  setAccount(account) {this.account = account}

  /* ---------- Fetch Data ---------- */ 

  async updateFootprintFromRemote() 
  {
    let data = await this.fetchDefaultData();
    console.log(data);
    if (data!=null) {this.footprint.updateAll(data.empreinteSocietale);this.dataFetched = true}
  }

  /* ---------- Fetching data ---------- */

  // Fetch default data
  async fetchDefaultData() 
  {
    let endpoint = apiBaseUrl + "default?" + "pays="+this.footprintAreaCode + "&activite="+this.footprintActivityCode +"&flow=PRD";
    let response = await fetch(endpoint, {method:'get'});
    let data = await response.json();
    if (data.header.statut == 200) {return {areaCode: this.footprintAreaCode, activityCode: this.footprintActivityCode, ...data}} 
    else                           {return null}
  }

}