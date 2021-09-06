import { EconomicValue } from './EconomicValue';

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Immobilisation extends EconomicValue {

  constructor({id,label,amount,footprint,
               account,
               initialState,
               prevFootprintLoaded,
               footprintAreaCode,
               footprintActivityCode,
               dataFetched})
  {
    super({id,label,amount,footprint})

    this.account = account || "";
    this.initialState = initialState || "none";
    this.prevFootprintLoaded = prevFootprintLoaded || false;

    this.footprintAreaCode = footprintAreaCode || "FRA";
    this.footprintActivityCode = footprintActivityCode || "00";
    this.dataFetched = dataFetched || false;
  }

  async update(nextProps)
  {
    super.update(nextProps);

    // update account number
    if (nextProps.account!=undefined) this.account = nextProps.account;

    // if initial state changed
    if (nextProps.initialState!=undefined && nextProps.initialState!=this.initialState) 
    {
      this.initialState = nextProps.initialState;
      this.prevFootprintLoaded = false;
      this.dataFetched = false;
    }

    // update from remote if changes (and initial state came from default data)
    if (this.initialState=="defaultData" 
      && (nextProps.footprintAreaCode!=this.footprintAreaCode || nextProps.footprintActivityCode!=this.footprintActivityCode))
    {
      if (nextProps.footprintAreaCode!=undefined) this.footprintAreaCode = nextProps.footprintAreaCode;
      if (nextProps.footprintActivityCode!=undefined) this.footprintActivityCode = nextProps.footprintActivityCode;
      await this.updateFootprintFromRemote();
    }
  }
  
  /* ---------- Getters ---------- */

  getAccount() {return this.account}

  /* ---------- Setters ---------- */

  setAccount(account) {this.account = account}

  /* ---------- Load Data ---------- */ 

  async loadPreviousFootprint(data)
  {
    this.initialState = "prevFootprint";
    this.footprint.updateAll(data.empreinteSocietale);
    this.prevFootprintLoaded = true;
    this.dataFetched = false;
  }

  /* ---------- Fetch Data ---------- */ 

  async updateFootprintFromRemote() 
  {
    let data = await this.fetchDefaultData();
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