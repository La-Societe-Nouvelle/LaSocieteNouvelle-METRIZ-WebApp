import api from "../config/api";
import { getAmountItems, getCurrentDateString, valueOrDefault } from "./utils/Utils";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint.js";

export class Provider {
  constructor({
    id,
    isDefaultProviderAccount,
    providerNum,
    providerLib,
    corporateId,
    legalUnitData,
    useDefaultFootprint,
    footprint,
    defaultFootprintParams,
    dataFetched,
    footprintStatus,
    periodsData,
  }) {
    // ---------------------------------------------------------------------------------------------------- //

    // Id
    this.id = id;
    this.isDefaultProviderAccount = isDefaultProviderAccount;       // account aux defined in FEC

    // Provider account
    this.providerNum = providerNum || "";                           // numéro compte auxiliaire
    this.providerLib = providerLib || "";                           // libellé compte auxiliaire

    // Legal unit data
    this.corporateId = corporateId || null;                         // siren
    this.legalUnitData = legalUnitData || {};                       // data unité legale

    // Footprint
    this.footprint = new SocialFootprint(footprint);
    this.useDefaultFootprint = useDefaultFootprint!=undefined ? useDefaultFootprint : true;         // true by default
    this.defaultFootprintParams = defaultFootprintParams || {       // paramètres (empreinte par défaut)
      area: "FRA",
      code: "00",
      aggregate: "PRD"
    };

    // Updates
    this.dataFetched = dataFetched || false;                        // response received
    this.footprintStatus = footprintStatus || 0;                    // status response api

    // periods data for amount (expenses & investments) ..no footprint
    this.periodsData = periodsData || {};

    // ---------------------------------------------------------------------------------------------------- //
  }

  buildPeriods = (expenses, investments, periods) => 
  {
    this.periodsData = {};
    periods.forEach(period => 
    {
      this.periodsData[period.periodKey] = {
        periodKey: period.periodKey,
        amount: getAmountItems(expenses.concat(investments).filter(expense => period.regex.test(expense.date)), 2),
        amountExpenses: getAmountItems(expenses.filter(expense => period.regex.test(expense.date)), 2),
        amountInvestments: getAmountItems(investments.filter(expense => period.regex.test(expense.date)), 2)
      }
    })
  }

  /* -------------------- OPERATIONS -------------------- */

  /* ---------- Update ---------- */

  async update(nextProps) 
  {
    // update corporate id ------------------------------ //
    if (nextProps.corporateId &&
        nextProps.corporateId != this.corporateId) 
    {
      // legal data
      this.corporateId = nextProps.corporateId;
      this.legalUnitData = {};
      // footprint
      this.useDefaultFootprint = false;
      this.defaultFootprintParams = {};
      this.dataFetched = false;
      this.footprintStatus = 0;
      this.footprint = new SocialFootprint();
    }

    // remove corporate id ------------------------------ //
    // update params, remove footprint & update dataFetched
    else if ((nextProps.corporateId == "" || nextProps.corporateId == null) &&
              nextProps.corporateId != this.corporateId) 
    {
      this.corporateId = null;
      this.useDefaultFootprint = true;
      this.defaultFootprintParams = {
        area: "FRA",
        code: "00",
        aggregate: "PRD"
      };
      this.dataFetched = false;
      this.footprintStatus = 0;
      this.footprint = new SocialFootprint();
    }

    // update default footprint ------------------------- //
    // update params, remove footprint & update dataFetched
    else if (nextProps.useDefaultFootprint &&
             nextProps.useDefaultFootprint != this.useDefaultFootprint) 
    {
      this.useDefaultFootprint = true;
      this.defaultFootprintParams = {
        area: "FRA",
        code: "00",
        aggregate: "PRD"
      };
      this.dataFetched = false;
      this.footprintStatus = 0;
      this.footprint = new SocialFootprint();
    }

    // update default footprint params ------------------ //
    // update params, remove footprint & update dataFetched
    else if (nextProps.defaultFootprintParams != undefined ||
             nextProps.defaultFootprintParams !== this.defaultFootprintParams) 
    {
      this.defaultFootprintParams = {...this.defaultFootprintParams, ...nextProps.defaultFootprintParams}; // update only params in next props
      this.dataFetched = false;
      this.footprintStatus = 0;
      this.footprint = new SocialFootprint();
    }
  }

  /* ---------- Remote ---------- */

  async updateFromRemote() 
  {
    let footprintId = getDefaultFootprintId(this.corporateId);
    // Case - Fetch footprint with id --------------------------------------------------------------------- //
    if (!this.useDefaultFootprint && footprintId && /[0-9]{9}/.test(footprintId)) 
    {
      // request
      await api.get("legalunitfootprint/" + footprintId).then((res) => 
      {
          let status = res.data.header.code;
          this.footprintStatus = status;
          if (status == 200) {
            // legal data --------------------------------------- //
            this.legalUnitData = res.data.legalUnit;
            // footprint ---------------------------------------- //
            this.footprint.updateAll(res.data.footprint);
            this.dataFetched = true;
          } else {
            // legal data --------------------------------------- //
            this.legalUnitData = {};
            // footprint ---------------------------------------- //
            this.footprint = new SocialFootprint();
            this.dataFetched = false;
          }
      }).catch((err)=>{
        throw err;
      });
    }

    // Case - Fetch id not ok ----------------------------------------------------------------------------- //
    else if (!this.useDefaultFootprint) 
    {
      // legal data --------------------------------------- //
      this.legalUnitData = {};
      // footprint ---------------------------------------- //
      this.footprint = new SocialFootprint();
      this.dataFetched = false;
    }

    // Case - Fetch default data -------------------------------------------------------------------------- //
    else if (this.useDefaultFootprint) 
    {
      let defaultFptParams = Object.entries(this.defaultFootprintParams).map(([key,value]) => key+"="+value).join("&");
      await api.get("defaultfootprint?"+defaultFptParams).then((res) => 
      {
          let status = res.data.header.code;
          this.footprintStatus = status;
          if (status == 200) {
            // footprint ---------------------------------------- //
            this.footprint.updateAll(res.data.footprint);
            this.dataFetched = true;
          } else {
            this.footprint = new SocialFootprint();
            this.dataFetched = false;
          }
      }).catch((err)=>{
          throw err;
        });
    }
    // ---------------------------------------------------------------------------------------------------- //
    return;
  }

  async loadPrevProvider(prevProvider) {
    this.corporateId = prevProvider.corporateId;
    this.footprintStatus = prevProvider.footprintStatus==200 ? 203 : prevProvider.footprintStatus;
    this.footprint =  new SocialFootprint(prevProvider.footprint) ;
    this.isDefaultProviderAccount = prevProvider.isDefaultProviderAccount;
    this.legalUnitData = prevProvider.legalUnitData;
    this.periodsData = Object.assign(
      this.periodsData,
      prevProvider.periodsData
    );
    this.useDefaultFootprint = prevProvider.useDefaultFootprint;
    this.defaultFootprintParams = prevProvider.defaultFootprintParams;
  }
}

// get footrpint id (siren)
export const getDefaultFootprintId = (corporateId) =>
{
  if (!corporateId) {
    return null;
  }
  // SIREN
  else if (/^[0-9]{9}$/.test(corporateId)) {
    return corporateId;
  }
  // SIRET
  else if (/^[0-9]{14}$/.test(corporateId)) {
    return corporateId.substring(0, 9);
  }
  // VAT NUMBER
  else if (/^FR[0-9]{11}$/.test(corporateId)) {
    return corporateId.substring(4, 13);
  }
  // DEFAULT
  else {
    return corporateId;
  }
}