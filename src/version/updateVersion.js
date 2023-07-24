// La Société Nouvelle

import metaIndics from "/lib/indics.json";

import {
  getGhgEmissionsUncertainty,
  getTotalGhgEmissionsUncertainty,
} from "../../components/assessments/AssessmentGHG";
import { buildAggregateIndicator } from "../formulas/footprintFormulas";

import { getAmountItems } from "../utils/Utils";
import { Expense } from "/src/accountingObjects/Expense";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";
import { updater_2_0_0 } from "./updateVersion_v1_to_v2";
import { ComparativeData } from "../models/ComparativeData";
import { fetchComparativeData } from "../services/MacrodataService";

/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = async (sessionData) => {
  switch (sessionData.version) {
    case "3.0.0":
      break;
    case "2.0.0":
      await updater_3_0_0(sessionData);
      break;
    case "1.0.6":
      await updater_2_0_0(sessionData);
      await updater_3_0_0(sessionData);
      break;
    case "1.0.5":
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      await updater_3_0_0(sessionData);
      break;
    case "1.0.4":
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      await updater_3_0_0(sessionData);
      break;
    case "1.0.3":
      // updater 1_0_3 removed -> build old comparative data (useless with updater_1_0_5 : fetch comparative data)
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      await updater_3_0_0(sessionData);
      break;
    case "1.0.2":
      updater_1_0_2(sessionData);
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      await updater_3_0_0(sessionData);
      break;
    case "1.0.1":
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      await updater_3_0_0(sessionData);
      break;
    case "1.0.0":
      updater_1_0_0(sessionData);
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      await updater_1_0_4(sessionData);
      await updater_1_0_5(sessionData);
      await updater_2_0_0(sessionData);
      await updater_3_0_0(sessionData);
      break;
    default:
      break;
  }
};

// ------------------------------------------------------------------
// Updater
// ------------------------------------------------------------------

// Updater for version 3.0.0
const updater_3_0_0 = async (sessionData) => {
  
  // - Changed values for isAllActivitiesinFrance and isValueAddedCrafted: true/false/null -> true/false/partially.
  // - Updater handles transition from null to "partially" for isAllActivitiesinFrance based on domesticProduction value.
  // - Updater handles transition for isValueAddedCrafted based on isValueAddedCrafted value.

  if (
    sessionData.impactsData.isAllActivitiesinFrance == null &&
    sessionData.impactsData.domesticProduction != null
  ) {
    sessionData.impactsData.isAllActivitiesinFrance = "partially";
  }

  if (
    sessionData.impactsData.isValueAddedCrafted == null &&
    sessionData.impactsData.isValueAddedCrafted != null
  ) {
    sessionData.impactsData.isValueAddedCrafted = "partially";
  }

  // - Utilizes new ComparativeData class and fetches data for declared indicators.
  // - Updates sessionData structure for comparative data.
  // - Sets sessionData progression to 5 if indicators are declared and progression is at 4.
  const prevComparativeCode = sessionData.comparativeData.activityCode;

  sessionData.comparativeData = new ComparativeData();
  sessionData.comparativeData.activityCode = prevComparativeCode;

  const period = sessionData.financialPeriod;


  if (indicators.length > 0) {
    await fetchComparativeData(sessionData.comparativeData, sessionData.validations[period.periodKey]);
  }

  if (
    sessionData.progression === 4 &&
    sessionData.validations[period.periodKey].length > 0
  ) {
    sessionData.progression = 5;
  }
};

const updater_1_0_5 = async (sessionData) => {
  // delete useless objects from  previous session
  delete sessionData.comparativeAreaFootprints;
  delete sessionData.targetSNBCarea;
  delete sessionData.targetSNBCbranch;

  // get previous session division code
  let code = sessionData.comparativeDivision;

  sessionData.comparativeData = new ComparativeData();
  sessionData.comparativeData.activityCode = code;

  delete sessionData.comparativeDivision;

  // set previous analysis to True to disable new indicators assessment with missing data
  sessionData.indics = [
    "eco",
    "art",
    "soc",
    "knw",
    "dis",
    "geq",
    "ghg",
    "mat",
    "was",
    "nrg",
    "wat",
    "haz",
  ];
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

const updater_1_0_2 = (sessionData) => {
  // update progression according to current number of steps
  if (sessionData.progression > 1) {
    sessionData.progression = sessionData.progression - 1;
  }
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
