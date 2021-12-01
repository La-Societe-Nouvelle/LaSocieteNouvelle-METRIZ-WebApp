// La Société Nouvelle

// Imports
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint';

// Utils
import { getCurrentDateString } from '../utils/Utils';

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

export class Immobilisation {

  constructor({id,
               account,
               accountLib,
               isDepreciableImmobilisation,
               amount,
               footprint,
               prevAmount,
               prevFootprint,
               prevFootprintAreaCode,
               prevFootprintActivityCode,
               initialState,
               status,
               dataFetched,
               lastUpdateFromRemote})
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = id;

    this.account = account;
    this.accountLib = accountLib;

    this.isDepreciableImmobilisation = isDepreciableImmobilisation || false;
    
    // Footprint
    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint)

    // Previous footprint
    this.prevAmount = prevAmount || 0;
    this.initialState = initialState || "none";
    this.prevFootprint = new SocialFootprint(prevFootprint)
    this.prevFootprintAreaCode = prevFootprintAreaCode || "FRA";
    this.prevFootprintActivityCode = prevFootprintActivityCode || "TOTAL";

    // Updates
    this.status = status || null;                                           // 200 (ok), 404 (not found), 500 (server error)
    this.dataFetched = dataFetched || false;                                // response received
    this.lastUpdateFromRemote = lastUpdateFromRemote || null; 
  // ---------------------------------------------------------------------------------------------------- //
  }

  async update(nextProps)
  {
    // update initial state ----------------------------- //
    if (nextProps.initialState!=undefined && nextProps.initialState!=this.initialState) 
    {
      this.initialState = nextProps.initialState;
      // status
      this.dataFetched = false;
      this.status = null;
    }

    // update default footprint ------------------------- //
    if (this.initialState=="defaultData" && 
        (nextProps.prevFootprintAreaCode!=this.prevFootprintAreaCode || nextProps.prevFootprintActivityCode!=this.prevFootprintActivityCode))
    {
      if (nextProps.prevFootprintAreaCode!=undefined) this.prevFootprintAreaCode = nextProps.prevFootprintAreaCode;
      if (nextProps.prevFootprintActivityCode!=undefined) this.prevFootprintActivityCode = nextProps.prevFootprintActivityCode;
      // status
      this.dataFetched = false;
      this.status = null;
    }
  }

  /* ---------- Load Data ---------- */ 

  async loadPreviousFootprint(data)
  {
    this.footprint.updateAll(data.empreinteSocietale);
    this.initialState = "prevFootprint";
    this.dataFetched = false;
    this.status = 200;
  }

  /* ---------- Fetch Data ---------- */ 

  async updatePrevFootprintFromRemote() 
  {
    // Case - Fetch default data -------------------------------------------------------------------------- //
    if (this.initialState=="defaultData") 
    {
      // request
      let endpoint = apiBaseUrl + "default?" + "area="+this.prevFootprintAreaCode + "&activity="+this.prevFootprintActivityCode +"&flow=PRD";
      let response = await this.fetchData(endpoint);
      
      if (response!=null) // code == 200 ------------------------------ //
      {
        let data = response;
        // footprint ---------------------------------------- //
        this.prevFootprint.updateAll(data.empreinteSocietale);
        // state -------------------------------------------- //
        this.lastUpdateFromRemote = getCurrentDateString();
        this.dataFetched = true;
        this.status = 200;
      } 
      else // code == 404 --------------------------------------------- //
      {
        // footprint ---------------------------------------- //
        this.prevFootprint = new SocialFootprint();
        // state -------------------------------------------- //
        this.lastUpdateFromRemote = "";
        this.dataFetched = false;
        this.status = 404;
      }
    }
  }

  /* ---------- Fetching data ---------- */

  // Fetch default data
  async fetchData(endpoint) 
  {
    let response = await fetch(endpoint, {method:'get'});
    let data = await response.json();
    console.log(endpoint+' status:'+data.header.statut);
    if (data.header.statut == 200) {return data} 
    else                           {return null}
  }

}