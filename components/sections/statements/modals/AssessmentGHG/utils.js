
/* -------------------- GHG FORMULAS -------------------- */

import { getSumItems } from "../../../../../src/utils/Utils";

// Libraries
import fuels from "/lib/emissionFactors/fuels.json";
import industrialProcesses from "/lib/emissionFactors/industrialProcesses";
import agriculturalProcesses from "/lib/emissionFactors/agriculturalProcesses";
import coolingSystems from "/lib/emissionFactors/coolingSystems";
import landChanges from "/lib/emissionFactors/landChanges";
import greenhouseGases from "/lib/ghg";

const emissionFactors = {
  ...fuels,
  ...industrialProcesses,
  ...agriculturalProcesses,
  ...coolingSystems,
  ...landChanges,
};


// get ghg emissions from items (in kgCO2e)
export const getGhgEmissions = ({
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
    default:
      return (
        consumption *
        emissionFactors[factorId].units[consumptionUnit].coefGHG *
        greenhouseGases[gaz].prg
      );
  }
}

// get uncertainty ghg emissions
export const getGhgEmissionsUncertainty = (item) => 
{
  const value    = getGhgEmissions(item);
  const valueMax = getGhgEmissionsMax(item);
  const valueMin = getGhgEmissionsMin(item);
  return value != 0
    ? Math.round(
        (Math.max(Math.abs(valueMax - value), Math.abs(value - valueMin)) /
          value) *
          100
      )
    : 0;
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
    default:
      return (
        consumption *
        (1 + consumptionUncertainty / 100) *
        emissionFactors[factorId].units[consumptionUnit].coefGHG *
        (1 +
          emissionFactors[factorId].units[consumptionUnit].coefGHGUncertainty /
            100) *
        greenhouseGases[gaz].prg
      );
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
    default:
      return (
        consumption *
        (1 - consumptionUncertainty / 100) *
        emissionFactors[factorId].units[consumptionUnit].coefGHG *
        (1 -
          emissionFactors[factorId].units[consumptionUnit].coefGHGUncertainty /
            100) *
        greenhouseGases[gaz].prg
      );
  }
}

/* -------------------- GHG FORMULAS | ITEMS -------------------- */

export const getTotalGhgEmissions = (ghgDetails) => {
  const items = Object.entries(ghgDetails).map(([_, itemData]) => itemData);
  const emissions = getGhgEmissionsItems(items);
  return emissions;
};

export const getTotalGhgEmissionsUncertainty = (ghgDetails) => {
  const items = Object.entries(ghgDetails).map(([_, itemData]) => itemData);
  const uncertainty = getGhgEmissionsUncertaintyItems(items);
  return uncertainty;
};

export const getTotalByAssessmentItem = (ghgDetails, assessmentItem) => {
  const items = Object.entries(ghgDetails)
    .filter(([_, itemData]) => itemData.assessmentItem == assessmentItem)
    .map(([_, itemData]) => itemData);
  const emissions = getGhgEmissionsItems(items);
  return emissions;
};

export const getUncertaintyByAssessmentItem = (ghgDetails, assessmentItem) => {
  const items = Object.entries(ghgDetails)
    .filter(([_, itemData]) => itemData.assessmentItem == assessmentItem)
    .map(([_, itemData]) => itemData);
  const uncertainty = getGhgEmissionsUncertaintyItems(items);
  return uncertainty;
};

const getGhgEmissionsItems = (items) => {
  const sum = getSumItems(
    items.map((item) => item.ghgEmissions),
    0
  );
  return sum;
};

const getGhgEmissionsUncertaintyItems = (items) => {
  if (items.length > 0) {
    const value = getSumItems(
      items.map((item) => item.ghgEmissions),
      0
    );
    if (value != 0) {
      const valueMax = getSumItems(
        items.map((item) =>
          Math.max(
            item.ghgEmissions * (1 + item.ghgEmissionsUncertainty / 100),
            item.ghgEmissions * (1 - item.ghgEmissionsUncertainty / 100)
          )
        ),
        0
      );
      const valueMin = getSumItems(
        items.map((item) =>
          Math.min(
            item.ghgEmissions *
              Math.max(1 + item.ghgEmissionsUncertainty / 100, 0),
            item.ghgEmissions *
              Math.max(1 - item.ghgEmissionsUncertainty / 100, 0)
          )
        ),
        0
      );
      return Math.round(
        (Math.max(Math.abs(valueMax - value), Math.abs(value - valueMin)) /
          value) *
          100
      );
    } else {
      return 0;
    }
  } else return null;
}