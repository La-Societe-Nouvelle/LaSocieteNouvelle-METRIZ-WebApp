import api from "../../config/api";


export async function fetchMacrodata(dataset, activityCode, aggregate, indic) {
  try {
    const response = await api.get(`/macrodata/${dataset}`, {
      params: {
        division: activityCode,
        aggregate: aggregate,
        indic: indic,
        area: "FRA",
      },
    });

    if (response.data.header.code === 200) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchDataForComparativeData(
  comparativeData,
  indicator,
  endpoints
) {
  const aggregates = {
    fixedCapitalConsumptions: "CFC",
    production: "PRD",
    netValueAdded: "NVA",
    intermediateConsumptions: "IC",
  };

  const { activityCode } = comparativeData;

  for (const key in comparativeData) {
    if (key !== "activityCode") {
      const dataSet = comparativeData[key];
      const aggregate = aggregates[key];

      await fetchDataForDataSet(
        dataSet,
        activityCode,
        aggregate,
        indicator,
        endpoints
      );
    }
  }
}

async function fetchDataForSeries(series, activityCode, aggregate, indicator, endpoints) {
    const { macrodata, target, trends } = series;
  
    const macrodataResult = await fetchMacrodata(endpoints.macrodata, activityCode, aggregate, indicator);
    const targetResult = await fetchMacrodata(endpoints.target, activityCode, aggregate, indicator);
    const trendsResult = await fetchMacrodata(endpoints.trends, activityCode, aggregate, indicator);
  
    if (macrodataResult !== null) {
      macrodata.data[indicator] = macrodataResult;
    }
    if (targetResult !== null) {
      target.data[indicator] = targetResult;
    }
    if (trendsResult !== null) {
      trends.data[indicator] = trendsResult;
    }
  }
  

async function fetchDataForDataSet(
  dataSet,
  activityCode,
  aggregate,
  indicator,
  endpoints
) {
  const { area, division } = dataSet;

  await fetchDataForSeries(area, "00", aggregate, indicator, endpoints);
  await fetchDataForSeries(
    division,
    activityCode,
    aggregate,
    indicator,
    endpoints
  );
}
