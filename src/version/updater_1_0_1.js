// La Société Nouvelle

// Updater from 1.0.0 to version 1.0.1
export const updater_to_1_0_1 = async (session) => 
{
  // ----------------------------------------------------------------------------------------------------
  // Changes in impacts data

  // LIST OF UPDATES :
  // - Changes ids in ghg details

  // update ghgDetails
  Object.entries(session.impactsData.ghgDetails)
        .forEach(([_, itemData]) => 
  {
    // update name : fuelCode -> factorId
    itemData.factorId = itemData.fuelCode;
    // update prefix for factorId
    if (/^p/.test(itemData.factorId))
      itemData.factorId = "fuel" + itemData.factorId.substring(1);
    if (/^s/.test(itemData.factorId))
      itemData.factorId = "coolSys" + itemData.factorId.substring(1);
    if (/^industrialProcesses_/.test(itemData.factorId))
      itemData.factorId = "indusProcess" + itemData.factorId.substring(20);
  });

  // ----------------------------------------------------------------------------------------------------

  session.version = "1.0.1";
}