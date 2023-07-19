import api from "../../config/api";
import { endpoints } from "../../config/endpoint";

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
  const fetchDataPromises = [];

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

      fetchDataPromises.push(
        fetchDataForDatasets(areaDataset, "00", aggregate, indicator, endpoints)
      );
    }
  }

  await Promise.all(fetchDataPromises);
}

export async function fetchComparativeDataForDivision(
  comparativeData,
  indicator,
  endpoints
) {
  const fetchDataPromises = [];

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

      fetchDataPromises.push(
        fetchDataForDatasets(
          divisionDataset,
          activityCode,
          aggregate,
          indicator,
          endpoints
        )
      );
    }
  }
  await Promise.all(fetchDataPromises);
}

async function fetchDataForDatasets(
  series,
  activityCode,
  aggregate,
  indicator,
  endpoints
) {
  const { macrodata, target, trend } = series;


  const [macrodataResult, targetResult, trendResult] = await Promise.all([
    fetchMacrodata(endpoints.macrodata, activityCode, aggregate, indicator),
    fetchMacrodata(endpoints.target, activityCode, aggregate, indicator),
    fetchMacrodata(endpoints.trend, activityCode, aggregate, indicator)
  ]);


  if (macrodataResult !== null) {
    macrodata.data[indicator] = macrodataResult;
  }
  if (targetResult !== null) {
    target.data[indicator] = targetResult;
  }
  if (trendResult !== null) {
    trend.data[indicator] = trendResult;
  }
}



// ...

export async function fetchMacroDataForIndicators(session, indicators) {
  const areaPromises = indicators.map(indic => fetchComparativeDataForArea(session.comparativeData, indic, endpoints));

  await Promise.all(areaPromises);

  if (session.comparativeData.activityCode !== "00") {
    const divisionPromises = indicators.map(indic => fetchComparativeDataForDivision(session.comparativeData, indic, endpoints));
    await Promise.all(divisionPromises);
  }
}


