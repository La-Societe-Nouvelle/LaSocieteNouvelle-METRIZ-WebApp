// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Utils
import { getCurrentDateString } from "../utils/Utils";
import api from "../api";

export class Immobilisation {
  constructor({
    id,
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
    lastUpdateFromRemote,
    entries
  }) {
    // ---------------------------------------------------------------------------------------------------- //
    this.id = id;

    this.account = account;
    this.accountLib = accountLib;

    this.isDepreciableImmobilisation = isDepreciableImmobilisation || false;

    // Footprint
    this.amount = amount || 0;
    this.footprint = new SocialFootprint(footprint);

    // Previous footprint
    this.prevAmount = prevAmount || 0;
    this.initialState = initialState || "none";
    this.prevFootprint = new SocialFootprint(prevFootprint);
    this.prevFootprintAreaCode = prevFootprintAreaCode || "FRA";
    this.prevFootprintActivityCode = prevFootprintActivityCode || "TOTAL";

    // Updates
    this.status = status || null; // 200 (ok), 404 (not found), 500 (server error)
    this.dataFetched = dataFetched || false; // response received
    this.lastUpdateFromRemote = lastUpdateFromRemote || null;

    // entries
    this.entries = entries || [];
    // ---------------------------------------------------------------------------------------------------- //
  }

  async update(nextProps) {
    // update initial state ----------------------------- //
    if (
      nextProps.initialState != undefined &&
      nextProps.initialState != this.initialState
    ) {
      this.initialState = nextProps.initialState;
      // status
      this.dataFetched = false;
      this.status = null;
    }

    // update default footprint ------------------------- //
    if (
      this.initialState == "defaultData" &&
      (nextProps.prevFootprintAreaCode != this.prevFootprintAreaCode ||
        nextProps.prevFootprintActivityCode != this.prevFootprintActivityCode)
    ) {
      if (nextProps.prevFootprintAreaCode != undefined)
        this.prevFootprintAreaCode = nextProps.prevFootprintAreaCode;
      if (nextProps.prevFootprintActivityCode != undefined)
        this.prevFootprintActivityCode = nextProps.prevFootprintActivityCode;
      // status
      this.dataFetched = false;
      this.status = null;
    }
  }

  /* ---------- Load Data ---------- */

  async loadPreviousFootprint(data) {
    this.footprint.updateAll(data.empreinteSocietale);
    this.initialState = "prevFootprint";
    this.dataFetched = false;
    this.status = 200;
  }

  /* ---------- Fetch Data ---------- */

  async updatePrevFootprintFromRemote() {
    // Case - Fetch default data -------------------------------------------------------------------------- //
    if (this.initialState == "defaultData") {
     await api
        .get(
          "defaultfootprint/?code=" +
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
        }).catch((err)=>{
          throw err;
        });
    }
  }

  /* ---------- Periods ---------- */

  initPeriods = async (dateStart,dateEnd) =>
  {
    let currentAmount = this.prevAmount;
    let dateStart = dateStart;

    this.periods = [];

    // entries (except A-NOUVEAUX entry)
    let entries = this.entries.filter(entry => !entry.isANouveaux).sort((a,b) => parseInt(a.date) > parseInt(b.date));
    for (let entry of entries) 
    {
      // add period with current amount
      this.periods.push({
          dateStart: dateStart,
          dateEnd: entry.date,
          amount: currentAmount
      });
      // update current amount
      currentAmount+= entry.amount;
      dateStart = entry.date;
    }

    // add last period
    if(dateStart!=dateEnd) 
    {
      this.periods.push({
          dateStart: dateStart,
          dateEnd: dateEnd,
          amount: currentAmount
      });
    }
  }

  completePeriods = (nextPeriods) =>
  {
    // Immobilisation periods
    let immobilisationPrevPeriods = [...this.periods];
    this.periods = [];
    nextPeriods.forEach(nextPeriod =>
    {
      // period matching with next period (next periods can't be over two prev periods)
      let prevPeriod = immobilisationPrevPeriods.filter(period => (parseInt(period.dateStart) <= parseInt(nextPeriod.dateStart)) && (parseInt(period.dateEnd) >= parseInt(nextPeriod.dateEnd)))[0];
      this.periods.push({
        dateStart: nextPeriod.dateStart,
        dateEnd: nextPeriod.dateEnd,
        amount: prevPeriod.amount // same amount
      })
    })
  }
}
