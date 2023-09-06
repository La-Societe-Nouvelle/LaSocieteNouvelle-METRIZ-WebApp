// La Société Nouvelle
import metaIndics from "/lib/indics.json";

import { buildAggregateIndicator } from "../formulas/footprintFormulas";

import { getAmountItems } from "../utils/Utils";

import { Expense } from "/src/accountingObjects/Expense";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

import { updater_2_0_0 } from "./updater_2_0_0";
import { fetchComparativeData } from "../services/MacrodataService";
import { ComparativeData } from "../ComparativeData";

import { updater_1_0_1 } from "./updater_1_0_1";
import { updater_1_0_0 } from "./updater_1_0_0";
import { updater_1_0_2 } from "./updater_1_0_2";
import { updater_1_0_4 } from "./updater_1_0_4";
import { updater_1_0_5 } from "./updater_1_0_5";


/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

/** Functions to update session JSON to current version
 *  ex. function updater_2_2_1 -> convert session JSON to version 2.2.1
 * 
 *  Versions :
 *    1.0.0
 * 
 */

export const updateVersion = async (sessionData) => 
{
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


  if (sessionData.validations[period.periodKey].length > 0) {
    await fetchComparativeData(sessionData.comparativeData);
  }

  if (
    sessionData.progression === 4 &&
    sessionData.validations[period.periodKey].length > 0
  ) {
    sessionData.progression = 5;
  }
}