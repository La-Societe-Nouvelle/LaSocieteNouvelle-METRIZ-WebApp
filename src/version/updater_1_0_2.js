// La Société Nouvelle

// Updater from 1.0.1 to version 1.0.2
export const updater_to_1_0_2 = async (session) => 
{
  // ----------------------------------------------------------------------------------------------------
  // Changes in impacts data

  // LIST OF UPDATES :
  // - Changes ids in ghg details

  // update ghgDetails
  Object.entries(session.impactsData.ghgDetails)
        .forEach(([_, itemData]) => 
  {
    // update uncertainty
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
  });

  // ----------------------------------------------------------------------------------------------------

  session.version = "1.0.2";
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
  gaz,
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
          greenhouseGases[gaz].prg
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