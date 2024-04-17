// La Société Nouvelle

// API
import api from "/config/api";

// Objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Utils
import { getAmountItems } from "../utils/Utils";

// ################################################## ACCOUNT OBJECT ##################################################

/** Usages :
 *    -> Expenses accounts (external expenses, stock variations, amortisations)
 *       builds in financial data
 * 
 *  Props :
 *    - id (accountNum)
 *    - accountNum
 *    - accountLib
 *    - periodsData
 *    - footprint (used for expenses footprint estimation)
 *    - defaultFootprintParams
 *    - dataFetched
 *    - footprintStatus
 * 
 *  Props of periods :
 *    - periodKey
 *    - amount
 *    - footprint
 */

export class Account {

  constructor({accountNum,
               accountLib,
               periodsData,
               footprint,
               defaultFootprintParams,
               dataFetched,
               footprintStatus}) 
  {
  // ---------------------------------------------------------------------------------------------------- //
    this.id = accountNum;                                           // id

    this.accountNum = accountNum;                                   // account number
    this.accountLib = accountLib;                                   // account label
    
    this.periodsData = {};                                          // data for each period
    if (periodsData) {
      Object.values(periodsData)
            .forEach(({periodKey,amount,footprint}) => {
        this.periodsData[periodKey] = {
          periodKey,
          amount,
          footprint: new SocialFootprint(footprint)
        }
      })
    }

    // Footprint - used for expenses footprint estimation
    this.footprint = new SocialFootprint(footprint);                // social footprint
    this.defaultFootprintParams = defaultFootprintParams || {       // paramètres (empreinte par défaut)
      area: "FRA",
      code: "00",
      aggregate: "PRD",
      accuracyMapping: 0
    };
    this.dataFetched = dataFetched || false;                        // response received
    this.footprintStatus = footprintStatus || 0;                    // status response api

  // ---------------------------------------------------------------------------------------------------- //
  }

  // build periods data from items (expenses, etc.), for array of periods
  buildPeriods = (items,periods) => 
  {
    this.periodsData = {};
    periods.forEach(period => 
    {
      this.periodsData[period.periodKey] = {
        periodKey: period.periodKey,
        amount: getAmountItems(items.filter(item => period.regex.test(item.date)), 2),
        footprint: new SocialFootprint()
      }
    })
  }

  /* ---------- Update ---------- */

  async update(nextProps) 
  {
    // update default footprint params
    if (nextProps.defaultFootprintParams != undefined ||
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
    // Fetch default data --------------------------------------------------------------------------------- //

    let defaultFptParams = Object.entries(this.defaultFootprintParams)
      .map(([key,value]) => key+"="+value)
      .join("&");
    
    await api.get("defaultfootprint?"+defaultFptParams)
             .then((res) => 
    {
      let status = res.data.header.code;
      this.footprintStatus = status;
      if (status == 200) {
        this.footprint.updateAll(res.data.footprint);
        this.dataFetched = true;
      } else {
        this.footprint = new SocialFootprint();
        this.dataFetched = false;
      }
    }).catch((err)=>{
      console.log("[ERROR] Erreur lors de la récupération de l'empreinte pour le compte n°"+err.message);
      console.log(this);
      console.log("[ERROR] Message : "+err.message);
      throw err;
    });

    // ---------------------------------------------------------------------------------------------------- //
    return;
  }
}