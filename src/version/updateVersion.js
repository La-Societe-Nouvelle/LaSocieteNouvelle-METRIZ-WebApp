// La Société Nouvelle

import metaIndics from "/lib/indics.json";

import {
  getGhgEmissionsUncertainty,
  getTotalGhgEmissionsUncertainty,
} from "../../components/assessments/AssessmentGHG";
import { buildIndicatorAggregate } from "../formulas/footprintFormulas";
import retrieveAreaFootprint from "../services/responses/areaFootprint";
import retrieveDivisionFootprint from "../services/responses/divisionFootprint";
import retrieveTargetFootprint from "../services/responses/targetFootprint";
import { getAmountItems } from "../utils/Utils";

import { Expense } from '/src/accountingObjects/Expense';
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";
import { ComparativeData } from "../ComparativeData";


/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = async(sessionData) => {

  switch (sessionData.version) 
  {
    case "1.0.5":
      await updater_1_0_3(sessionData);
      break;
    case "1.0.4":
      await updater_1_0_4(sessionData);
      await updater_1_0_3(sessionData);
      break;
    case "1.0.3":
      await updater_1_0_3(sessionData);
      await updater_1_0_4(sessionData);
      break;
    case "1.0.2":
      updater_1_0_2(sessionData);
      updater_1_0_3(sessionData);
      await updater_1_0_4(sessionData);
      break;
    case "1.0.1":
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      await updater_1_0_3(sessionData);
      break;
    case "1.0.0":
      updater_1_0_0(sessionData);
      updater_1_0_1(sessionData);
      updater_1_0_2(sessionData);
      await updater_1_0_3(sessionData);
      await updater_1_0_4(sessionData);
      break;
    default:
      break;
  }
};

const updater_1_0_4 = async (sessionData) => 
{
  let investments = sessionData.financialData.investments ? sessionData.financialData.investments.map((props,index) => new Expense({id: index, ...props})) : [];
  let investmentsFootprint = new SocialFootprint();
  Object.keys(metaIndics).forEach(async (indic) => investmentsFootprint[indic] = await buildIndicatorAggregate(indic,investments));
  let dataGrossFixedCapitalFormationAggregate = {
    label : "Formation brute de capital fixe",
    amount : getAmountItems(investments),
    footprint : investmentsFootprint
  }
  sessionData.financialData.aggregates.grossFixedCapitalFormation = dataGrossFixedCapitalFormationAggregate;
}

const updater_1_0_3 = async (sessionData) => {

  // delete old objects from session

  delete sessionData.comparativeAreaFootprints;
  delete sessionData.targetSNBCarea;
  delete sessionData.targetSNBCbranch;

  let newComparativeData = new ComparativeData(); 

  let code = sessionData.comparativeDivision;
 
  for await (const indic of sessionData.validations) {

    // update comparative data according to validated indicators
    const updatedData =  await updateComparativeData(indic,code, newComparativeData)
    newComparativeData = updatedData;

  }

  // delete comparative division
  delete sessionData.comparativeDivision;
  // update session with new values 
  sessionData.comparativeData = newComparativeData;
  sessionData.comparativeData.activityCode = code;

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


 async function updateComparativeData(indic,comparativeDivision,comparativeData) {

  let newComparativeData = await retrieveAreaFootprint(
    indic,
    comparativeData
  );

  newComparativeData = await retrieveTargetFootprint(
    "00",
    indic,
    newComparativeData
  );

  if (comparativeDivision) {
    newComparativeData = await retrieveDivisionFootprint(
      indic,
      comparativeDivision,
      newComparativeData
    );

    newComparativeData = await retrieveTargetFootprint(
      comparativeDivision,
      indic,
      newComparativeData
    );
  }
  return newComparativeData;
}