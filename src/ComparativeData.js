// La Société Nouvelle

import api from "/config/api";

// COMPARATIVE DATA

/** Structure :
 *  ----------------------------------------------------------------------------------------------------
 *    aggregate {}                  production, netValueAdded,...
 *       |- scale {}                area, division
 *           |- serie {}            history, trend, target
 *               |- .data {}        ...indics
 *                   |- indic []    array with data
 *               |- .label          label of serie
 *  ----------------------------------------------------------------------------------------------------
 * 
 */

const metaAggregates = {
  production: "PRD",
  intermediateConsumptions: "IC",
  fixedCapitalConsumptions: "CFC",
  netValueAdded: "NVA"
};

const metaScales = [
  "area",
  "division"
];

const metaSeries = {
  "history": { enpoint: "macro_fpt_a88" },
  "trend":   { enpoint: "macro_fpt_trd_a88" },
  "target":  { enpoint: "macro_fpt_tgt_a88" }
};

export class ComparativeData {

  constructor(props) 
  {
    props = props || {};

    // division
    this.activityCode =  props.activityCode && props.activityCode != "" ? props.activityCode : "00";

    // aggregates dataset

    for (let aggregate of Object.keys(metaAggregates)) 
    {
      this[aggregate] = {};
      for (let scale of metaScales) 
      {
        this[aggregate][scale] = {};
        for (let serie of Object.keys(metaSeries)) 
        {
          this[aggregate][scale][serie] = {
            label: props[aggregate]?.[scale]?.[serie]?.label || "",
            data: props[aggregate]?.[scale]?.[serie]?.data || {}
          }
        }
      }
    }
  }

  fetchComparativeData = async (indics) =>
  {
    console.log("fetch comparative data");

    const divisions = (this.activityCode && this.activityCode!="00") 
    ? ["00", this.activityCode.substring(0,2)] 
    : ["00"]
    const aggregates = Object.values(metaAggregates);
    
    // params
    const params = {
      aggregates,
      divisions,
      indics
    }

    // fetch data
    const [history, trend, target] = await Promise.all([
      this.fetchMacrodata(metaSeries.history.enpoint, params),
      this.fetchMacrodata(metaSeries.trend.enpoint, params),
      this.fetchMacrodata(metaSeries.target.enpoint, params)
    ]);

    // add data
    for (const [serie, dataset] of Object.entries({ history, target, trend })) 
    {
      for (let [aggregate,aggregateKey] of Object.entries(metaAggregates)) {
        for (let division of divisions) {
          let scale = division == "00" ? "area" : "division";
          for (let indic of indics) {
            let data = dataset
              .filter((item) => 
                   item.division==division 
                && item.aggregate==aggregateKey
                && item.indic==indic.toUpperCase())
              .sort((a, b) => a.year - b.year);
            this[aggregate][scale][serie].data[indic] = data;
          }
        }
      }
    }
  }

  fetchMacrodata = async (
    endpoint, 
    params
  ) => {
    const {
      divisions,
      aggregates,
      indics
    } = params;
  
    try {
      const response = await api.get(`/macrodata/${endpoint}`, {
        params: {
          division: divisions.join(" "),
          aggregate: aggregates.join(" "),
          indic: indics.map((indic) => indic.toUpperCase()).join(" "),
          area: "FRA",
        },
      });
  
      if (response.status===200) {
        if (response.data.header.code===200) {
          return response.data.data;
        } else {
          console.log(response.data);
          return [];
        }
      } else {
        console.log(response);
      }
    } 
    catch (error) {
      throw Error(error.message)
    }
  }

}