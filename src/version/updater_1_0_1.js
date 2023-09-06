// Updater version from 1.0.0 to 1.0.1

import { getSumItems, roundValue } from "../utils/Utils";

export const updater_1_0_1 = (sessionData) => 
{
  // ----------------------------------------------------------------------------------------------------
  // Changes in impacts data

  // LIST OF UPDATES :
  // - Changes ids in ghg details

  // update ghgEmissionsUncertainty (wrong variable name)
  for (let itemData of Object.values(sessionData.impactsData.ghgDetails)) {
    itemData.ghgEmissionsUncertainty = getGhgEmissionsUncertainty(itemData);
  };
  // update value
  sessionData.impactsData.ghgEmissionsUncertainty = getTotalGhgEmissionsUncertainty(sessionData.impactsData.ghgDetails);
}

// ANNEXES FUNCTIONS 

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

const getTotalGhgEmissionsUncertainty = (ghgDetails) => {
  const items = Object.entries(ghgDetails).map(([_, itemData]) => itemData);
  const uncertainty = getGhgEmissionsUncertaintyItems(items);
  return uncertainty;
};

const getGhgEmissionsUncertaintyItems = (items) => {
  if (items.length > 0) {
    const value = getSumItems(items.map((item) => item.ghgEmissions), 0);
    if (value != 0) {
      const valueMax = getSumItems(items.map((item) =>
        Math.max(
          item.ghgEmissions * (1 + item.ghgEmissionsUncertainty / 100),
          item.ghgEmissions * (1 - item.ghgEmissionsUncertainty / 100)
        )), 0);
      const valueMin = getSumItems(items.map((item) =>
        Math.min(
          item.ghgEmissions * Math.max(1 + item.ghgEmissionsUncertainty / 100, 0),
          item.ghgEmissions * Math.max(1 - item.ghgEmissionsUncertainty / 100, 0)
        )), 0);
      return Math.round((Math.max(Math.abs(valueMax - value), Math.abs(value - valueMin)) / value) * 100);
    } else {
      return 0;
    }
  } else return null;
}