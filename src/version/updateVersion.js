// La Société Nouvelle

import axios from "axios";
import {
  getGhgEmissionsUncertainty,
  getTotalGhgEmissionsUncertainty,
} from "../../components/assessments/AssessmentGHG";
import SerieDataService from "../services/SerieDataService";

/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = (sessionData) => {


  switch (sessionData.version) {

    case "1.0.3":
      updater_1_0_3(sessionData);
      break;
    case "1.0.2":
      updater_1_0_2(sessionData);
      updater_1_0_3(sessionData);
      break;
    case "1.0.1":
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      updater_1_0_3(sessionData);
      break;
    case "1.0.0":
      updater_1_0_0(sessionData);
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      updater_1_0_3(sessionData);
      break;
    default:
      break;
  }
};

const updater_1_0_3 = async (sessionData) => {



 let comparativeAreaFootprints = {};
 let comparativeDivisionFootprints = {};
 let targetSNBC = {};
let code = sessionData.comparativeDivision;

    await Promise.all(
      sessionData.validations.map(async (indic) => {
        const footprint = await retrieveSectorFootprint(indic,"00");
        Object.assign(comparativeAreaFootprints, footprint);

        if(code!='00'){
          const divisionFootprint = await retrieveSectorFootprint(indic,code);
          Object.assign(comparativeDivisionFootprints,divisionFootprint);
        }
        if(indic='ghg' && code != '00') {
          const target = await retrieveTargetFootprint(code);
          Object.assign(targetSNBC,target);
        }
      })
    );

    
    Object.assign(sessionData, {comparativeAreaFootprints : comparativeAreaFootprints,
    comparativeDivisionFootprints : comparativeDivisionFootprints, targetSNBC : targetSNBC})

};

const updater_1_0_2 = (sessionData) => {
  // update progression according to current number of steps
  if (sessionData.progression > 1) {
    sessionData.progression = sessionData.progression - 1;
  }
};

const updater_1_0_0 = (sessionData) => {
  // update ghgDetails
  Object.entries(sessionData.impactsData.ghgDetails).forEach(
    ([_, itemData]) => {
      // update name factor id
      itemData.factorId = itemData.fuelCode;
      // update prefix id
      if (/^p/.test(itemData.factorId))
        itemData.factorId = "fuel" + itemData.factorId.substring(1);
      if (/^s/.test(itemData.factorId))
        itemData.factorId = "coolSys" + itemData.factorId.substring(1);
      if (/^industrialProcesses_/.test(itemData.factorId))
        itemData.factorId = "indusProcess" + itemData.factorId.substring(20);
    }
  );
};

const updater_1_0_1 = (sessionData) => {
  // update ghgDetails (error with variable name in NRG tool : getGhgEmissionsUncertainty used instead of ghgEmissionsUncertainty)
  Object.entries(sessionData.impactsData.ghgDetails).forEach(
    ([_, itemData]) => {
      // update name
      itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
    }
  );
  // update value
  sessionData.impactsData.ghgEmissionsUncertainty =
    getTotalGhgEmissionsUncertainty(sessionData.impactsData.ghgDetails);
};

const retrieveSectorFootprint = async (indicator, code) => {

  let indic = indicator.toUpperCase();
  let valueAddedFootprint;
  let productionFootprint;
  let consumptionFootprint;
  let footprint = {};


  const getValueAdded = SerieDataService.getMacroData(indic, code, "NVA");

  const getProduction = SerieDataService.getMacroData(indic, code, "PRD");

  const getConsumption = SerieDataService.getMacroData(indic, code, "IC");

  await axios
    .all([getValueAdded, getProduction, getConsumption])
    .then(
      axios.spread((...responses) => {
        const valueAdded = responses[0];
        const production = responses[1];
        const consumption = responses[2];

        if (valueAdded.data.header.code == 200) {
          valueAddedFootprint = valueAdded.data.data.at(-1);
        }
        if (production.data.header.code == 200) {
          productionFootprint = production.data.data.at(-1);
        }

        if (consumption.data.header.code == 200) {
          consumptionFootprint = consumption.data.data.at(-1);
        }
      })
    )
    .catch((errors) => {
      console.log(errors);
    });

  Object.assign(footprint, {
    [indic]: {
      valueAddedAreaFootprint: valueAddedFootprint,
      productionAreaFootprint: productionFootprint,
      consumptionAreaFootprint: consumptionFootprint,
    },
  });

  return footprint;
};


const retrieveTargetFootprint = async (code) => {

    let valueAddedTarget;
    let productionTarget;
    let consumptionTarget;
    let target = {};

    const id = 'TARGET_GHG_SNBC_FRA_DIV';

    const getValueAdded = SerieDataService.getSerieData(id, code, "NVA");
    const getProduction = SerieDataService.getSerieData(id, code, "PRD");
    const getConsumption = SerieDataService.getSerieData(id, code, "IC");

    await axios
      .all([getValueAdded, getProduction, getConsumption])
      .then(
        axios.spread((...responses) => {
          const valueAdded = responses[0];
          const production = responses[1];
          const consumption = responses[2];

          if (valueAdded.data.header.code == 200) {
            valueAddedTarget = valueAdded.data.data.at(-1);
          }

          if (production.data.header.code == 200) {
            productionTarget = production.data.data.at(-1);
          }

          if (consumption.data.header.code == 200) {
            consumptionTarget = consumption.data.data.at(-1);
          }
        })
      )
      .catch(() => {
        setError(true);
      });

      Object.assign(target, {
        
          valueAddedTarget: valueAddedTarget,
          productionTarget: productionTarget,
          consumptionTarget: consumptionTarget,
        
      });




  return target;
};
