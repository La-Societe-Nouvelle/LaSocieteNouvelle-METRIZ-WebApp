// La Société Nouvelle

import { getGhgEmissionsUncertainty, getTotalGhgEmissionsUncertainty } from "../../components/assessments/AssessmentGHG";

/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = (sessionData) =>
{
  switch(sessionData.version)
  {
    case "1.0.3" : break;
    case "1.0.2": updater_1_0_2(sessionData);
    case "1.0.0": updater_1_0_0(sessionData);
    case "1.0.1": updater_1_0_1(sessionData); break;
    
    default : updater_1_0_0(sessionData);
  }
}
const updater_1_0_2 = (sessionData) => 
{
  // update progression according to current number of steps 
  if(sessionData.progression > 1){
    sessionData.progression = sessionData.progression - 1;
  }

}

const updater_1_0_0 = (sessionData) =>
{
  // update ghgDetails
  Object.entries(sessionData.impactsData.ghgDetails).forEach(([_,itemData]) =>
  {
    // update name factor id
    itemData.factorId = itemData.fuelCode;
    // update prefix id
    if (/^p/.test(itemData.factorId)) itemData.factorId = "fuel"+itemData.factorId.substring(1);
    if (/^s/.test(itemData.factorId)) itemData.factorId = "coolSys"+itemData.factorId.substring(1);
    if (/^industrialProcesses_/.test(itemData.factorId)) itemData.factorId = "indusProcess"+itemData.factorId.substring(20);
  })
}

const updater_1_0_1 = (sessionData) =>
{
  // update ghgDetails (error with variable name in NRG tool : getGhgEmissionsUncertainty used instead of ghgEmissionsUncertainty)
  Object.entries(sessionData.impactsData.ghgDetails).forEach(([_,itemData]) =>
  {
    // update name
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
  })
  // update value
  sessionData.impactsData.ghgEmissionsUncertainty = getTotalGhgEmissionsUncertainty(sessionData.impactsData.ghgDetails);
}