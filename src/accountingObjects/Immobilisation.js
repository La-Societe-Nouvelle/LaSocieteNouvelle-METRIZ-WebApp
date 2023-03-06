// La Société Nouvelle

// Imports
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Utils
import { getAmountItems, getCurrentDateString } from "../utils/Utils";
import api from "../api";

export class Immobilisation 
{
  constructor({
    id,
    // Immobilisation
    accountNum, accountLib, isAmortisable, entries, phases,
    // Amortisation
    amortisationAccountNum, amortisationAccountLib, amortisationEntries, amortisationPhases,
    // Initial state
    initialState, initialAmount, initialAmortisationAmount, initialFootprint, initialFootprintParams,
    // Last state
    lastAmount, lastAmortisationAmount, lastFootprint, lastAmortisationFootprint,
    prevAmount,
    prevFootprint,
    prevFootprintAreaCode,
    prevFootprintActivityCode,
    status,
    dataFetched,
    lastUpdateFromRemote,
    periods
  }) {
    // ---------------------------------------------------------------------------------------------------- //
    this.id = id;

    // Immobilisation

    this.accountNum = accountNum;
    this.accountLib = accountLib;
    
    this.isAmortisable = isAmortisable || false;

    this.entries = entries || [];

    this.phases = phases || [];

    // amortisation

    this.amortisationAccountNum = amortisationAccountNum;
    this.amortisationAccountLib = amortisationAccountLib;

    this.amortisationEntries = amortisationEntries || [];
    this.amortisationPhases = amortisationPhases || [];

    // Initial state
    this.initialState = initialState || "none";
    this.initialAmount = initialAmount || 0;
    this.initialFootprint = new SocialFootprint(initialFootprint);
    this.initialAmortisationAmount = initialAmortisationAmount || 0;
    this.initialFootprintParams = initialFootprintParams || {};

    // Last state
    this.lastAmount = lastAmount;
    this.lastAmortisationAmount = lastAmortisationAmount;
    this.lastFootprint = new SocialFootprint(lastFootprint);
    this.lastAmortisationFootprint = new SocialFootprint(lastAmortisationFootprint);

    // Periods
    this.phases = phases ? phases.map(phase => new ImmobilisationPhase(phase)) : [];

    // Old

    this.prevAmount = prevAmount || 0;
    this.prevFootprint = new SocialFootprint(prevFootprint);
    this.prevFootprintAreaCode = prevFootprintAreaCode || "FRA";
    this.prevFootprintActivityCode = prevFootprintActivityCode || "TOTAL";

    // Updates
    this.status = status || null; // 200 (ok), 404 (not found), 500 (server error)
    this.dataFetched = dataFetched || false; // response received
    this.lastUpdateFromRemote = lastUpdateFromRemote || null;

    // entries
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
}

export class ImmobilisationPhase
{
  constructor(props) {
    this.dateStart = props.dateStart;
    this.dateEnd = props.dateEnd;
    this.amount = props.amount;
    this.footprint = new SocialFootprint(props.footprint);
    this.amortisationAmount = props.amortisationAmount;
    this.amoritisationFootprint = new SocialFootprint(props.amoritisationFootprint);
  }
} 
