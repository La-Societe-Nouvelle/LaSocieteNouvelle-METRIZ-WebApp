// La Société Nouvelle

/* ----------------------------------------------------------------- */
/* -------------------- MANAGE PREVIOUS VERSION -------------------- */
/* ----------------------------------------------------------------- */

export const updateVersion = (sessionData) =>
{
  switch(session.version)
  {
    case "1.0.1": break;
    case "1.0.0": updater_1_0_0(sessionData); break;
    default : updater_1_0_0(sessionData);
  }
}

const updater_1_0_0 = (sessionData) =>
{
  // update ghgDetails
  sessionData.impactsData.ghgDetails.forEach((item) =>
  {
    // update name factor id
    item.factorId = item.fuelCode;
    // update prefix id
    if (/^p/.test(item.factorId)) item.factorId = "fuel"+item.factorId.substring(1);
    if (/^s/.test(item.factorId)) item.factorId = "coolSys"+item.factorId.substring(1);
    if (/^industrialProcesses_/.test(item.factorId)) item.factorId = "indusProcess"+item.factorId.substring(20);
  })
}