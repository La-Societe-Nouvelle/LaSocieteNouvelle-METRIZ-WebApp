// La Société Nouvelle

import {
  getGhgEmissionsUncertainty,
  getTotalGhgEmissionsUncertainty,
} from "../../components/assessments/AssessmentGHG";
import retrieveAreaFootprint from "../services/responses/areaFootprint";
import retrieveDivisionFootprint from "../services/responses/divisionFootprint";
import retrieveTargetFootprint from "../services/responses/targetFootprint";



/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = async(sessionData) => {


  switch (sessionData.version) 
  {
    case "1.0.4":
      await updater_1_0_4(sessionData);
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

 let comparativeAreaFootprints = {};
 let comparativeDivisionFootprints = {};
 let targetSNBCbranch = {valueAddedTarget: { value: null },productionTarget: { value: null },consumptionTarget: { value: null },};
 let targetSNBCarea = {valueAddedTarget: { value: null },productionTarget: { value: null },consumptionTarget: { value: null },};
 let code = sessionData.comparativeDivision;

    await Promise.all(

      sessionData.validations.map(async (indic) => {
        const footprint = await retrieveAreaFootprint(indic);
        Object.assign(comparativeAreaFootprints, footprint);

        if(code!='00'){
          const divisionFootprint = await retrieveDivisionFootprint(indic,code);
          Object.assign(comparativeDivisionFootprints,divisionFootprint);
        }
        // TARGET SNCB 2030 FOR SPECIFIC SECTOR
        if(indic =='ghg' && code != '00') {
          const target = await retrieveTargetFootprint(code);
          Object.assign(targetSNBCbranch,target);
        }
        else{

        }
        // TARGET SNCB 2030 FOR ALL SECTORS
        if(indic =='ghg') {
          const targetArea = await retrieveTargetFootprint("00");
          Object.assign(targetSNBCarea,targetArea);
        }
      })
    );
    Object.assign(sessionData, {comparativeAreaFootprints : comparativeAreaFootprints,
    comparativeDivisionFootprints : comparativeDivisionFootprints, targetSNBCbranch : targetSNBCbranch, targetSNBCarea : targetSNBCarea})

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




