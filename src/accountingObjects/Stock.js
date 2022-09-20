// La Société Nouvelle

// Imports
import { getCurrentDateString } from '../utils/Utils';
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint';

// API url
import api from '../api';

export class Stock {

  constructor({id,
               account,
               accountLib,
               accountAux,
               isProductionStock,
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
    this.accountAux = accountAux;

    this.isProductionStock = isProductionStock;

    // Footprint
    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint)

    // Previous footprint
    this.prevAmount = prevAmount || 0;
    this.initialState = initialState || "none";
    this.prevFootprint = new SocialFootprint(prevFootprint);
    this.prevFootprintAreaCode = prevFootprintAreaCode || "FRA";
    this.prevFootprintActivityCode = prevFootprintActivityCode || "00";

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

  async loadPreviousFootprint(prevState)
  {
    this.prevFootprint.updateAll(prevState.empreinteSocietale);
    this.initialState = "prevFootprint";
    this.dataFetched = true;
    this.status = 200;
  }

  /* ---------- Fetch Data ---------- */ 

  async updatePrevFootprintFromRemote() 
  {
    // Case - Fetch default data -------------------------------------------------------------------------- //
    if (this.initialState=="defaultData") 
    {
      console.log("initialStateStock")
    
      api
      .get(
        "defaultfootprint/?activity=" +
          this.prevFootprintActivityCode +
          "&aggregate=PRD&area=" +
          this.prevFootprintAreaCode
      )
      .then((res) => {
        let status = res.data.header.code;

        if (status == 200) {
          let data = res.data;

          //footprint ---------------------------------------- //
          this.prevFootprint.updateAll(data.footprint);

          //state -------------------------------------------- //
          this.lastUpdateFromRemote = getCurrentDateString();
          this.dataFetched = true;
        } else {
          this.prevFootprint = new SocialFootprint();
          this.lastUpdateFromRemote = "";
          this.dataFetched = false;
        }
        this.status = status;
      });

    }
  }


}