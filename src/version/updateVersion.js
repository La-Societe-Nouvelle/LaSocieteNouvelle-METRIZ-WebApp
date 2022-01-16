// La Société Nouvelle

/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = (sessionData) =>
{
  switch(sessionData.version)
  {
    case "1.0.1": break;
    case "1.0.0": updater_1_0_0(sessionData); break;
    default : updater_1_0_0(sessionData);
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