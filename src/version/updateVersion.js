// La Société Nouvelle

import metaIndics from "/lib/indics.json";

import {
  getGhgEmissionsUncertainty,
  getTotalGhgEmissionsUncertainty,
} from "../../components/assessments/AssessmentGHG";
import { buildAggregateIndicator } from "../formulas/footprintFormulas";

import { getAmountItems, getTargetSerieId } from "../utils/Utils";

import { Expense } from "/src/accountingObjects/Expense";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";
import { ComparativeData } from "../ComparativeData";
import getSerieData from "/src/services/responses/SerieData";
import getMacroSerieData from "/src/services/responses/MacroSerieData";
import getHistoricalSerieData from "/src/services/responses/HistoricalSerieData";
import { Provider } from "../Provider";
import { updater_2_0_0 } from "./updateVersion_v1_to_v2";

/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = async (sessionData) => 
{
  switch (sessionData.version) {
    case "2.0.0":
      break;
    case "1.0.6":
      await updater_2_0_0(sessionData);
      break;
    case "1.0.5":
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      break;
    case "1.0.4":
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      break;
    case "1.0.3":
      // updater 1_0_3 removed -> build old comparative data (useless with updater_1_0_5 : fetch comparative data)
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      break;
    case "1.0.2":
      updater_1_0_2(sessionData);
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      break;
    case "1.0.1":
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      break;
    case "1.0.0":
      updater_1_0_0(sessionData);
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      break;
    default:
      break;
  }
};

const updater_1_0_5 = async (sessionData) => {
  // ----------------------------------------------------------------
  // Get comparative data (Division, Target & Trends)
  // for each aggregate and update session for each validated indicators
  // ----------------------------------------------------------------

  // delete useless objects from  previous session
  delete sessionData.comparativeAreaFootprints;
  delete sessionData.targetSNBCarea;
  delete sessionData.targetSNBCbranch;

  // get previous session division code
  let code = sessionData.comparativeDivision;

  let newComparativeData = new ComparativeData();

  for await (const indic of sessionData.validations) {
    
 // update comparative data for each validated indicators
    const updatedData = await updateComparativeData(
      indic,
      code,
      newComparativeData
    );

    newComparativeData = updatedData;
  }

  // update session with new values
  sessionData.comparativeData = newComparativeData;
  sessionData.comparativeData.activityCode = code;
  // delete old property and assign division code into comparative data object
  delete sessionData.comparativeDivision;

  // set previous analysis to True to disable new indicators assessment with missing data
  sessionData.indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

};

const updater_1_0_4 = async (sessionData) => {
  let investments = sessionData.financialData.investments
    ? sessionData.financialData.investments.map(
        (props, index) => new Expense({ id: index, ...props })
      )
    : [];
  let investmentsFootprint = new SocialFootprint();
  Object.keys(metaIndics).forEach(
    async (indic) =>
      (investmentsFootprint[indic] = await buildAggregateIndicator(
        indic,
        investments
      ))
  );
  let dataGrossFixedCapitalFormationAggregate = {
    label: "Formation brute de capital fixe",
    amount: getAmountItems(investments),
    footprint: investmentsFootprint,
  };
  sessionData.financialData.aggregates.grossFixedCapitalFormation =
    dataGrossFixedCapitalFormationAggregate;
};

// ------------------------------------------------------------------
// Updater
// ------------------------------------------------------------------

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

// ----------------------------------------------------------------

export async function updateComparativeData(
  indic,
  comparativeDivision,
  comparativeData
) {
  let idTarget = getTargetSerieId(indic);

  // Area Footprint
  let newComparativeData = await getMacroSerieData(
    indic,
    "00",
    comparativeData,
    "areaFootprint"
  );

  // Target Area Footprint
  if (idTarget) {
    newComparativeData = await getSerieData(
      idTarget,
      "00",
      indic,
      newComparativeData,
      "targetAreaFootprint"
    );
  }

  if (comparativeDivision != "00") {
    // Division Footprint
    newComparativeData = await getMacroSerieData(
      indic,
      comparativeDivision,
      newComparativeData,
      "divisionFootprint"
    );

    newComparativeData = await getHistoricalSerieData(
      comparativeDivision,
      indic,
      newComparativeData,
      "trendsFootprint"
    );
    // Target Division Footprint
    newComparativeData = await getHistoricalSerieData(
      comparativeDivision,
      indic,
      newComparativeData,
      "targetDivisionFootprint"
    );
  }
  return newComparativeData;
}