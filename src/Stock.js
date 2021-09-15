// La Société Nouvelle


// Imports
import { EconomicValue } from './EconomicValue';
import { SocialFootprint } from './SocialFootprint';

// API url
const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Stock extends EconomicValue {

  constructor({id,label,amount,footprint,
               account,
               accountLib,
               accountAux,
               prevAmount,
               initialState,
               prevFootprint,
               prevFootprintAreaCode,
               prevFootprintActivityCode,
               dataFetched,
               isProductionStock})
  {
    super({id,label,amount,footprint})

    this.account = account || "";
    this.accountLib = accountLib || "";
    this.isProductionStock = isProductionStock;
    this.accountAux = accountAux;

    this.prevAmount = prevAmount || 0;
    this.initialState = initialState || "none";
    this.prevFootprint = new SocialFootprint({...prevFootprint});

    this.prevFootprintAreaCode = prevFootprintAreaCode || "FRA";
    this.prevFootprintActivityCode = prevFootprintActivityCode || "00";
    this.dataFetched = dataFetched || false;
  }

  async update(nextProps) 
  {
    super.update(nextProps);

    // update accounts numbers
    if (nextProps.account!=undefined) this.account = nextProps.account;
    if (nextProps.accountAux!=undefined) this.accountAux = nextProps.accountAux;

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

  /* ---------- Getters ---------- */

  getAccount() {return this.account}
  getAccountAux() {return this.accountPurchases}
  getInitialAmount() {return this.amount}

  /* ---------- Setters ---------- */

  setAccount(nextAccount) {this.account = nextAccount}
  setAccountPurchases(accountPurchases) {this.accountPurchases = accountPurchases}
  setFootprint(nextFootprint) {this.footprint = nextFootprint}

  /* ---------- Load Data ---------- */ 

  async loadPreviousFootprint(data)
  {
    this.prevFootprint.updateAll(data.empreinteSocietale);
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