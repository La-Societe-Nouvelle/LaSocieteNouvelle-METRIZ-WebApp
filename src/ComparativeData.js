import { ComparativeFootprint } from "./footprintObjects/ComparativeFootprint";
import { HistoricalFootprint } from "./footprintObjects/HistoricalFootprint";

export class ComparativeData {
  constructor(props) {
    if (props == undefined) props = {};

    // Activity Code for comparative division
    this.activityCode = props.activityCode || "00";

    //Get Comparative footprint for each aggreagate

    this.fixedCapitalConsumptions = props.fixedCapitalConsumptions || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint: new HistoricalFootprint(),
      trendsFootprint: new HistoricalFootprint(),
    };  

    this.intermediateConsumptions = props.intermediateConsumptions || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint: new HistoricalFootprint(),
      trendsFootprint: new HistoricalFootprint(),
    };

    this.production = props.production || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint: new HistoricalFootprint(),
      trendsFootprint: new HistoricalFootprint(),
    };

    this.netValueAdded = props.netValueAdded || {
      areaFootprint: new ComparativeFootprint(),
      targetAreaFootprint: new ComparativeFootprint(),
      divisionFootprint: new ComparativeFootprint(),
      targetDivisionFootprint: new HistoricalFootprint(),
      trendsFootprint: new HistoricalFootprint(),
    };
  }
}

// Update Comparative Data
export async function updateHistoricalFootprint(
  indic,
  prevComparativeData,
  newComparativeData,
  serie
) {
  let newFixedCapitalConsumptions;
  
  newFixedCapitalConsumptions = Object.assign(
    {},
    prevComparativeData.fixedCapitalConsumptions[serie].indicators,
    {
      ...prevComparativeData.fixedCapitalConsumptions[serie].indicators,
      [indic]: newComparativeData.fixedCapitalConsumptions,
    }
  );

  const newIntermediateConsumptions = Object.assign(
    {},
    prevComparativeData.intermediateConsumptions[serie].indicators,
    {
      ...prevComparativeData.intermediateConsumptions[serie].indicators,
      [indic]: newComparativeData.intermediateConsumptions,
    }
  );

  const newProduction = Object.assign(
    {},
    prevComparativeData.production[serie].indicators,
    {
      ...prevComparativeData.production[serie].indicators,
      [indic]: newComparativeData.production,
    }
  );

  const newNetValueAdded = Object.assign(
    {},
    prevComparativeData.netValueAdded[serie].indicators,
    {
      ...prevComparativeData.netValueAdded[serie].indicators,
      [indic]: newComparativeData.netValueAdded,
    }
  );

  const updatedHistoricalFootprint = Object.assign({}, prevComparativeData, {
    fixedCapitalConsumptions: {
      ...prevComparativeData.fixedCapitalConsumptions,
      [serie]: {
        indicators: newFixedCapitalConsumptions,
      },
    },
    intermediateConsumptions: {
      ...prevComparativeData.intermediateConsumptions,
      [serie]: {
        indicators: newIntermediateConsumptions,
      },
    },
    netValueAdded: {
      ...prevComparativeData.netValueAdded,
      [serie]: {
        indicators: newNetValueAdded,
      },
    },
    production: {
      ...prevComparativeData.production,
      [serie]: {
        indicators: newProduction,
      },
    },
  });

  return updatedHistoricalFootprint;
}

export async function updateComparativeFootprint(
  indic,
  prevComparativeData,
  newComparativeData,
  serie
) {
  let newFixedCapitalConsumptions;

    newFixedCapitalConsumptions = Object.assign(
      {},
      prevComparativeData.fixedCapitalConsumptions[serie].indicators,
      {
        ...prevComparativeData.fixedCapitalConsumptions[serie].indicators,
        [indic]: {
          value: newComparativeData.fixedCapitalConsumptions
            ? newComparativeData.fixedCapitalConsumptions.value
            : null,
          flag: newComparativeData.fixedCapitalConsumptions
            ? newComparativeData.fixedCapitalConsumptions.flag
            : null,
        },
      }
    );

  const newIntermediateConsumptions = Object.assign(
    {},
    prevComparativeData.intermediateConsumptions[serie].indicators,
    {
      ...prevComparativeData.intermediateConsumptions[serie].indicators,
      [indic]: {
        value: newComparativeData.intermediateConsumption
          ? newComparativeData.intermediateConsumptions.value
          : null,
        flag: newComparativeData.intermediateConsumption
          ? newComparativeData.intermediateConsumptions.flag
          : null,
      },
    }
  );

  const newProduction = Object.assign(
    {},
    prevComparativeData.production[serie].indicators,
    {
      ...prevComparativeData.production[serie].indicators,
      [indic]: {
        value: newComparativeData.production
          ? newComparativeData.production.value
          : null,
        flag: newComparativeData.production
          ? newComparativeData.production.flag
          : null,
      },
    }
  );

  const newNetValueAdded = Object.assign(
    {},
    prevComparativeData.netValueAdded[serie].indicators,
    {
      ...prevComparativeData.netValueAdded[serie].indicators,
      [indic]: {
        value: newComparativeData.netValueAdded
          ? newComparativeData.netValueAdded.value
          : null,
        flag: newComparativeData.netValueAdded
          ? newComparativeData.netValueAdded.flag
          : null,
      },
    }
  );

  const updatedAggregatesFootprint = Object.assign({}, prevComparativeData, {
    fixedCapitalConsumptions: {
      ...prevComparativeData.fixedCapitalConsumptions,
      [serie]: {
        indicators: newFixedCapitalConsumptions,
      },
    },
    intermediateConsumptions: {
      ...prevComparativeData.intermediateConsumptions,
      [serie]: {
        indicators: newIntermediateConsumptions,
      },
    },
    netValueAdded: {
      ...prevComparativeData.netValueAdded,
      [serie]: {
        indicators: newNetValueAdded,
      },
    },
    production: {
      ...prevComparativeData.production,
      [serie]: {
        indicators: newProduction,
      },
    },
  });

  return updatedAggregatesFootprint;
}
