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

export async function fetchComparativeDataForArea(
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

  for (const key in comparativeData) {
    if (key !== "activityCode") {
      const areaDataset = comparativeData[key].area;
      const aggregate = aggregates[key];

      await fetchDataForDatasets(
        areaDataset,
        "00",
        aggregate,
        indicator,
        endpoints
      );
    }
  }
}

export async function fetchComparativeDataForDivision(
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
      const divisionDataset = comparativeData[key].division;

      const aggregate = aggregates[key];

      await fetchDataForDatasets(
        divisionDataset,
        activityCode,
        aggregate,
        indicator,
        endpoints
      );
    }
  }
}

async function fetchDataForDatasets(
  series,
  activityCode,
  aggregate,
  indicator,
  endpoints
) {
  const { macrodata, target, trends } = series;

  const macrodataResult = await fetchMacrodata(
    endpoints.macrodata,
    activityCode,
    aggregate,
    indicator
  );
  const targetResult = await fetchMacrodata(
    endpoints.target,
    activityCode,
    aggregate,
    indicator
  );
  const trendsResult = await fetchMacrodata(
    endpoints.trends,
    activityCode,
    aggregate,
    indicator
  );

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

