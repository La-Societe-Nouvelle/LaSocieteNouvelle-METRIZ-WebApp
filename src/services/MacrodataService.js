import api from "../../config/api";
import { endpoints } from "../../config/endpoint";

export async function fetchMacrodata(dataset, activityCodes, indicators) {
  const aggregates = ["CFC", "PRD", "NVA", "IC"];

  try {
    const response = await api.get(`/macrodata/${dataset}`, {
      params: {
        division: activityCodes.join(" "),
        aggregate: aggregates.join(" "),
        indic: indicators.join(" "),
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

export async function fetchComparativeData(comparativeData, validations) {
  let activityCodes = ["00"];
  if (comparativeData.activityCode && comparativeData.activityCode != "00") {
    activityCodes.push(comparativeData.activityCode);
  }

  let indicators = validations.map((validation) => validation.toUpperCase());

  const excludedIndicators = ["ART", "ECO", "IDR", "HAZ"];

  const indicatorsWithTarget = indicators.filter(
    (indicator) => !excludedIndicators.includes(indicator)
  );

  const [macrodata, target, trend] = await Promise.all([
    fetchMacrodata(endpoints.macrodata, activityCodes, indicators),
    indicatorsWithTarget.length > 0
      ? fetchMacrodata(endpoints.target, activityCodes, indicatorsWithTarget)
      : Promise.resolve([]),
    fetchMacrodata(endpoints.trend, activityCodes, indicators),
  ]);

  const aggregates = {
    CFC: "fixedCapitalConsumptions",
    PRD: "production",
    NVA: "netValueAdded",
    IC: "intermediateConsumptions",
  };

  const datasets = { macrodata, target, trend };
  for (const [serie, results] of Object.entries(datasets)) {
    for (const result of results) {
      const { aggregate, division, indic } = result;

      const aggregateKey = aggregates[aggregate];
      const activityCodeKey = division == "00" ? "area" : "division";

      const dataSeries =
      comparativeData[aggregateKey][activityCodeKey][serie].data;

      // Initialize dataSeries[indic] as an empty array if it doesn't exist
      dataSeries[indic] = dataSeries[indic] || [];

      // Check if the indicator already exists in dataSeries[indic]
      const existingIndex = dataSeries[indic]?.findIndex(
        (item) => item.division !== division
      );

      if (existingIndex !== -1) {
        // update the existing data
        dataSeries[indic][existingIndex] = result;
        dataSeries[indic].sort((a, b) => a.year - b.year);
      } else {
        // If not, add the new data as a new element to the array
        dataSeries[indic].push(result);
        dataSeries[indic].sort((a, b) => a.year - b.year);
      }
    }


    }
  }
