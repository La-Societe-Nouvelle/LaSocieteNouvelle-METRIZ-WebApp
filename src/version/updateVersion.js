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

 let areaFootprint = {};
 
    await Promise.all(
      sessionData.validations.map(async (indic) => {
        const footprint = await retrieveAreaFootprint(indic,sessionData.comparativeAreaFootprints);
        Object.assign(areaFootprint, footprint)
      })
    );

    sessionData.comparativeAreaFootprints = areaFootprint;

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

const retrieveAreaFootprint = async (indicator) => {

  let indic = indicator.toUpperCase();
  let valueAddedFootprint;
  let productionFootprint;
  let consumptionFootprint;
  let footprint = {};


  const getValueAdded = SerieDataService.getMacroData(indic, "00", "NVA");

  const getProduction = SerieDataService.getMacroData(indic, "00", "PRD");

  const getConsumption = SerieDataService.getMacroData(indic, "00", "IC");

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
