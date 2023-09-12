// La Société Nouvelle

// Updater to version 1.0.0
export const updater_1_0_0 = async (session) => 
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

    // update uncertainty
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
  });

  // ----------------------------------------------------------------------------------------------------
}

// get ghg emissions uncertainty
const getGhgEmissionsUncertainty = (item) => 
{
  const value    = getGhgEmissions(item);
  const valueMax = getGhgEmissionsMax(item);
  const valueMin = getGhgEmissionsMin(item);
  return value != 0
    ? Math.abs(roundValue((Math.max(Math.abs(valueMax - value), Math.abs(value - valueMin)) / value) * 100, 0))
    : 0;
}

// get ghg emissions from items (in kgCO2e)
const getGhgEmissions = ({
  consumption,
  consumptionUnit,
  factorId,
  gas,
}) => {
  switch (consumptionUnit) {
    case "kgCO2e":
      return consumption;
    case "tCO2e":
      return consumption * 1000;
    default: {
      if (emissionFactors[factorId]) {
        return (
          consumption *
          emissionFactors[factorId].units[consumptionUnit].coefGHG *
          greenhouseGases[gas].prg
        );
      } else {
        return null;
      }
    }
  }
}

// get max ghg emissions
const getGhgEmissionsMax = ({
  consumption, 
  consumptionUnit, 
  consumptionUncertainty, 
  factorId, 
  gaz,
}) => {
  switch (consumptionUnit) {
    case "kgCO2e":
      return consumption * (1 + consumptionUncertainty / 100);
    case "tCO2e":
      return consumption * (1 + consumptionUncertainty / 100) * 1000;
    default: {
      if (emissionFactors[factorId]) {
        return (
          consumption 
          * (1 + consumptionUncertainty / 100) 
          * emissionFactors[factorId].units[consumptionUnit].coefGHG 
          * (1 + emissionFactors[factorId].units[consumptionUnit].coefGHGUncertainty / 100) 
          * greenhouseGases[gaz].prg
        );
      } else {
        return null;
      }
    }
  }
}

// get min ghg emissions
const getGhgEmissionsMin = ({
  consumption,
  consumptionUnit,
  consumptionUncertainty,
  factorId,
  gaz,
}) => {
  switch (consumptionUnit) {
    case "kgCO2e":
      return consumption * (1 - consumptionUncertainty / 100);
    case "tCO2e":
      return consumption * (1 - consumptionUncertainty / 100) * 1000;
    default: {
      if (emissionFactors[factorId]) {
        return (
          consumption 
          * (1 - consumptionUncertainty / 100) 
          * emissionFactors[factorId].units[consumptionUnit].coefGHG 
          * (1 - emissionFactors[factorId].units[consumptionUnit].coefGHGUncertainty / 100) 
          * greenhouseGases[gaz].prg
        );
      } else {
        return null;
      }
    }
  }
}