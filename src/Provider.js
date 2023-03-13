import api from "./api";
import { getAmountItems, getCurrentDateString, valueOrDefault } from "./utils/Utils";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint.js";


export class Provider 
{
  constructor({id,
               providerNum,
               providerLib,
               isDefaultProviderAccount,
               corporateId,
               corporateName,
               legalUnitData,
               state,
               footprint,
               footprintId,
               footprintParams,
               status,
               dataFetched,
               lastUpdateFromRemote,
               amount,
  }) {
    // ---------------------------------------------------------------------------------------------------- //

    // Id
    this.id = id;

    // Company
    this.providerNum = providerNum || "";                           // numéro compte auxiliaire
    this.providerLib = providerLib || "";                           // libellé compte auxiliaire
    this.isDefaultProviderAccount = isDefaultProviderAccount;       // account aux defined in FEC

    this.corporateId = corporateId || null;                         // siren
    this.corporateName = corporateName || "";                       // dénomination unité légale

    // Legal data
    this.legalUnitData = legalUnitData || {};                       // data unité legale

    // Footprint
    this.state = state || "default"; // "" | "siren" | "default"
    this.footprint = new SocialFootprint(footprint);
    this.footprintId = footprintId || this.getDefaultFootprintId();
    this.footprintParams = footprintParams || {};                   // paramètres (empreinte par défaut)

    // Updates
    this.status = status || null; // 200 (ok), 404 (not found), 500 (server error)
    this.dataFetched = dataFetched; // response received
    this.lastUpdateFromRemote = lastUpdateFromRemote || null; // date of last update

    // Amount (expenses & investments)
    this.amount = amount || 0;

    // ---------------------------------------------------------------------------------------------------- //
  }

  buildPeriods = (expenses, periods) => 
  {
    this.periodsData = {};
    periods.forEach(period => 
    {
      this.periodsData[period.periodKey] = {
        periodKey: period.periodKey,
        amount: getAmountItems(expenses.filter(expense => period.regex.test(expense.date)), 2)
      }
    })
  }

  // init footrpint id
  getDefaultFootprintId() {
    if (!this.corporateId) {
      return null;
    }
    // SIREN
    if (/[0-9]{9}/.test(this.corporateId)) {
      return this.corporateId;
    }
    // SIRET
    else if (/[0-9]{14}/.test(this.corporateId)) {
      return this.corporateId.substring(0, 9);
    }
    // VAT NUMBER
    else if (/FR[0-9]{11}/.test(this.corporateId)) {
      return this.corporateId.substring(4, 11);
    }
    // DEFAULT
    else {
      return this.corporateId;
    }
  }

  /* -------------------- OPERATIONS -------------------- */

  /* ---------- Update ---------- */

  async update(nextProps) 
  {
    // update corporate id ------------------------------ //
    if (nextProps.corporateId != undefined &&
        nextProps.corporateId != this.corporateId) 
    {
      this.corporateId = nextProps.corporateId;
      this.footprintId = this.getDefaultFootprintId();
      // legal data
      this.legalUnitName = "";
      this.legalUnitAreaCode = "";
      this.legalUnitActivityCode = "";
      // status
      this.state = this.footprintId ? "siren" : "default";
      this.dataFetched = false;
      this.status = null;
    }

    // update default footprint ------------------------- //
    else if (
      nextProps.footprintAreaCode != undefined ||
      nextProps.footprintActivityCode != undefined
    ) {
      if (nextProps.footprintAreaCode != undefined)
        this.footprintAreaCode = nextProps.footprintAreaCode;
      if (nextProps.footprintActivityCode != undefined)
        this.footprintActivityCode = nextProps.footprintActivityCode;
      // status
      this.state = "default";
      this.dataFetched = false;
      this.status = null;
    }
  }

  /* ---------- Remote ---------- */

  async updateFromRemote() {
    // Case - Fetch footprint with id --------------------------------------------------------------------- //
    if (this.state == "siren" && /[0-9]{9}/.test(this.footprintId)) {
      // request
      await api.get("legalunitfootprint/" + this.footprintId).then((res) => {
        let status = res.data.header.code;

        if (status == 200) {
          let data = res.data.legalUnit;
          // legal data --------------------------------------- //
          this.legalUnitName = data.denominationunitelegale;
          this.legalUnitAreaCode = "FRA";
          this.legalUnitActivityCode = data.activiteprincipaleunitelegale;
          // footprint ---------------------------------------- //
          this.footprint.updateAll(res.data.footprint);
          // state -------------------------------------------- //
          this.lastUpdateFromRemote = getCurrentDateString();
          this.dataFetched = true;
        } else {
          // legal data --------------------------------------- //
          this.legalUnitName = "";
          this.legalUnitAreaCode = "";
          this.legalUnitActivityCode = "";
          // footprint ---------------------------------------- //
          this.footprint = new SocialFootprint();
          // state -------------------------------------------- //
          this.lastUpdateFromRemote = "";
          this.dataFetched = false;
        }
        this.status = status;
      }).catch((err)=>{
        throw err;
      });
    }
    // Case - Fetch id not ok ----------------------------------------------------------------------------- //
    else if (this.state == "siren") {
      // legal data --------------------------------------- //
      this.legalUnitName = "";
      this.legalUnitAreaCode = "";
      this.legalUnitActivityCode = "";
      // footprint ---------------------------------------- //
      this.footprint = new SocialFootprint();
      // state -------------------------------------------- //
      this.lastUpdateFromRemote = "";
      this.dataFetched = false;
      this.status = 404;
    }
    // Case - Fetch default data -------------------------------------------------------------------------- //
    else if (this.state == "default") {

      await api
        .get("defaultfootprint/?code="+this.footprintActivityCode+"&aggregate=PRD&area="+this.footprintAreaCode)
        .then((res) => {
          let status = res.data.header.code;
          if (status == 200) {
            let data = res.data;

            // footprint ---------------------------------------- //
            this.footprint.updateAll(data.footprint);
            // state -------------------------------------------- //
            this.lastUpdateFromRemote = getCurrentDateString();
            this.dataFetched = true;
          } else {
            this.footprint = new SocialFootprint();
            // state -------------------------------------------- //
            this.lastUpdateFromRemote = "";
            this.dataFetched = false;
          }
          this.status = status;
        }).catch((err)=>{
          throw err;
        });
    }
    // ---------------------------------------------------------------------------------------------------- //
    return;
  }

  /* ---------- Getters ---------- */

  getId() {
    return this.id;
  }

  getCorporateId() {
    return this.corporateId;
  }
  getCorporateName() {
    return this.corporateName;
  }

  getAreaCode() {
    return this.footprintAreaCode;
  }
  getActivityCode() {
    return this.footprintActivityCode;
  }

  getFootprint() {
    return this.footprint;
  }
}
