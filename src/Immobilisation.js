import { EconomicValue } from './EconomicValue';
import { SocialFootprint } from './SocialFootprint';

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Immobilisation extends EconomicValue {

  constructor({id,label,amount,footprint,
               account,
               accountLib,
               prevAmount,
               initialState,
               prevFootprint,
               prevFootprintAreaCode,
               prevFootprintActivityCode,
               dataFetched,
               isDepreciableImmobilisation})
  {
    super({id,label,amount,footprint})

    this.account = account || "";
    this.accountLib = accountLib || "";
    this.isDepreciableImmobilisation = isDepreciableImmobilisation || false;
    
    this.prevAmount = prevAmount || 0;
    this.initialState = initialState || "none";
    this.prevFootprint = new SocialFootprint({...prevFootprint})

    this.prevFootprintAreaCode = prevFootprintAreaCode || "FRA";
    this.prevFootprintActivityCode = prevFootprintActivityCode || "00";
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
      this.dataFetched = false;
    }

    // update from remote if changes (and initial state came from default data)
    if (this.initialState=="defaultData" 
      && (nextProps.prevFootprintAreaCode!=this.prevFootprintAreaCode || nextProps.prevFootprintActivityCode!=this.prevFootprintActivityCode))
    {
      if (nextProps.prevFootprintAreaCode!=undefined) this.prevFootprintAreaCode = nextProps.prevFootprintAreaCode;
      if (nextProps.prevFootprintActivityCode!=undefined) this.prevFootprintActivityCode = nextProps.prevFootprintActivityCode;
      await this.updatePrevFootprintFromRemote();
    }
  }

  /* ---------- Load Data ---------- */ 

  async loadPreviousFootprint(data)
  {
    this.footprint.updateAll(data.empreinteSocietale);
    this.initialState = "prevFootprint";
    this.dataFetched = false;
  }

  /* ---------- Fetch Data ---------- */ 

  async updatePrevFootprintFromRemote() 
  {
    let data = await this.fetchDefaultData();
    if (data!=null) {this.prevFootprint.updateAll(data.empreinteSocietale);this.dataFetched = true}
  }

  /* ---------- Fetching data ---------- */

  // Fetch default data
  async fetchDefaultData() 
  {
    let endpoint = apiBaseUrl + "default?" + "pays="+this.prevFootprintAreaCode + "&activite="+this.prevFootprintActivityCode +"&flow=PRD";
    let response = await fetch(endpoint, {method:'get'});
    let data = await response.json();
    if (data.header.statut == 200) {return {areaCode: this.prevFootprintAreaCode, activityCode: this.prevFootprintActivityCode, ...data}} 
    else                           {return null}
  }

}