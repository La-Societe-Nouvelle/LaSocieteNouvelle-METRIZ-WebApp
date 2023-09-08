import { isValidNumber } from "../../../../../utils/Utils";
import fuels from "/lib/emissionFactors/fuels.json";


/* ----------------- ITEMS ----------------- */

export const initNrgItem = (id,type) => 
{
  const item = {
    id: id,
    fuelCode: null,
    type: type,
    consumption: null,
    consumptionUnit: null,
    consumptionUncertainty: null,
    nrgConsumption: null,
    nrgConsumptionUncertainty: null,
  };
  return item;
}

/** Checks to do :
 *    - valid consumption
 *    - valid uncertainty
 *    - valid unit
 */

export const checkNrgItem = ({
  fuelCode,
  consumption,
  consumptionUncertainty,
  consumptionUnit,
  nrgConsumption,
  nrgConsumptionUncertainty
}) =>
{
  // factorId unset
  if (fuelCode==null) {
    return false;
  } 
  // consumption not valid
  else if (!isValidNumber(consumption,0)) {
    return false;
  } 
  // uncertainty not valid
  else if (!isValidNumber(consumptionUncertainty,0,100)) {
    return false;
  } 
  // unit not valid
  else if (!fuels[fuelCode] 
          || !["MJ","GJ","tep","kWh", ...Object.keys(fuels[fuelCode].units)].includes(consumptionUnit)) {
    return false;
  }
  // ghg data not valid
  else if (!isValidNumber(nrgConsumption,0) || !isValidNumber(nrgConsumptionUncertainty,0,100)) {
    return false;
    // ... log error
  } 
  else {
    return true;
  }
}

/* ---------- NRG FORMULAS ---------- */

export const getNrgConsumption = ({
  consumption,
  consumptionUnit,
  fuelCode,
}) => {
  switch (consumptionUnit) {
    case "MJ":
      return consumption;
    case "GJ":
      return consumption * 1000;
    case "tep":
      return consumption * 41868;
    case "kWh":
      return consumption * 3.6;
    default: {
      if (fuelCode) {
        return consumption * fuels[fuelCode].units[consumptionUnit].coefNRG;
      } else {
        return null;
      }
    }
  }
};

const getNrgConsumptionMax = ({
  consumption,
  consumptionUnit,
  consumptionUncertainty,
  fuelCode,
}) => {
  switch (consumptionUnit) {
    case "MJ":
      return consumption * (1 + consumptionUncertainty / 100);
    case "GJ":
      return consumption * (1 + consumptionUncertainty / 100) * 1000;
    case "tep":
      return consumption * (1 + consumptionUncertainty / 100) * 41868;
    case "kWh":
      return consumption * (1 + consumptionUncertainty / 100) * 3.6;
    default: {
      if (fuelCode) {
        let fuel = fuels[fuelCode].units[consumptionUnit];
        return (
          consumption *
          (1 + consumptionUncertainty / 100) *
          fuel.coefNRG *
          (1 + fuel.coefNRGUncertainty / 100)
        );
      } else {
        return null;
      }
    }
  }
};

const getNrgConsumptionMin = ({
  consumption,
  consumptionUnit,
  consumptionUncertainty,
  fuelCode,
}) => {
  switch (consumptionUnit) {
    case "MJ":
      return consumption * (1 - consumptionUncertainty / 100);
    case "GJ":
      return consumption * (1 - consumptionUncertainty / 100) * 1000;
    case "tep":
      return consumption * (1 - consumptionUncertainty / 100) * 41868;
    case "kWh":
      return consumption * (1 - consumptionUncertainty / 100) * 3.6;
    default: {
      if (fuelCode) {
        let fuel = fuels[fuelCode].units[consumptionUnit];
        return (
          consumption *
          (1 - consumptionUncertainty / 100) *
          fuel.coefNRG *
          (1 - fuel.coefNRGUncertainty / 100)
        );
      } else {
        return null;
      }
    }
  }
};

export const getNrgConsumptionUncertainty = ({
  consumption,
  consumptionUnit,
  consumptionUncertainty,
  fuelCode,
}) => {
  const value = getNrgConsumption({ consumption, consumptionUnit, fuelCode });
  const valueMax = getNrgConsumptionMax({
    consumption,
    consumptionUnit,
    consumptionUncertainty,
    fuelCode,
  });
  const valueMin = getNrgConsumptionMin({
    consumption,
    consumptionUnit,
    consumptionUncertainty,
    fuelCode,
  });

  return value != 0 ? getUncertainty(value, valueMin, valueMax) : 0;
};

export const getTotalNrgConsumption = (nrgDetails) => {
  const sum = Object.entries(nrgDetails)
    .map(([_, data]) => data.nrgConsumption)
    .reduce((a, b) => a + b, 0);
  return sum;
};

export const getTotalNrgConsumptionUncertainty = (nrgDetails) => {
  const items = Object.entries(nrgDetails).map(([_, itemData]) => itemData);
  if (items.length > 0) {
    const value = items
      .map((item) => item.nrgConsumption)
      .reduce((a, b) => a + b, 0);
    if (value > 0) {
      const valueMax = items
        .map(
          (item) =>
            item.nrgConsumption * (1 + item.nrgConsumptionUncertainty / 100)
        )
        .reduce((a, b) => a + b, 0);
      const valueMin = items
        .map(
          (item) =>
            item.nrgConsumption *
            Math.max(1 - item.nrgConsumptionUncertainty / 100, 0)
        )
        .reduce((a, b) => a + b, 0);
      return Math.round(
        (Math.max(valueMax - value, value - valueMin) / value) * 100
      );
    } else {
      return 0;
    }
  } else return null;
};

// Formulas for energy consumption and nrg consumption uncertainty filter by type
// try reuse other functions

export const getNrgConsumptionByType = (nrgDetails, type) => {
  const sum = Object.entries(nrgDetails)
    .filter(([_, data]) => data.type == type)
    .map(([_, data]) => data.nrgConsumption)
    .reduce((a, b) => a + b, 0);
  return sum;
};

export const getNrgConsumptionUncertaintyByType = (nrgDetails, type) => {
  const items = Object.entries(nrgDetails)
    .filter(([_, itemData]) => itemData.type == type)
    .map(([_, itemData]) => itemData);

  if (items.length > 0) {
    // get value
    const value = items
      .map((item) => item.nrgConsumption)
      .reduce((a, b) => a + b, 0);

    if (value > 0) {
      // get value max
      const valueMax = items
        .map(
          (item) =>
            item.nrgConsumption * (1 + item.nrgConsumptionUncertainty / 100)
        )
        .reduce((a, b) => a + b, 0);
      // get value min
      const valueMin = items
        .map(
          (item) =>
            item.nrgConsumption * (1 - item.nrgConsumptionUncertainty / 100)
        )
        .reduce((a, b) => a + b, 0);
      return Math.round(
        (Math.max(valueMax - value, value - valueMin) / value) * 100
      );
    } else {
      return 0;
    }
  } else return null;
};

export function getUncertainty(value, valueMin, valueMax) {
  return Math.round(
    (Math.max(valueMax - value, value - valueMin) / value) * 100
  );
}