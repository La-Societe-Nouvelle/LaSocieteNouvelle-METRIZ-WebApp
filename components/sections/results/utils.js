import { getTargetSerieId } from "/src/utils/Utils";
import getSerieData from "/src/services/responses/SerieData";
import getMacroSerieData from "/src/services/responses/MacroSerieData";
import getHistoricalSerieData from "/src/services/responses/HistoricalSerieData";
// utils.js
export const updateComparativeData = async (indic, code, comparativeData) => {
  let updatedComparativeData = comparativeData;
  let idTarget = getTargetSerieId(indic);

  updatedComparativeData = await getMacroSerieData(
    indic,
    code,
    updatedComparativeData,
    "divisionFootprint"
  );

  updatedComparativeData = await getHistoricalSerieData(
    code,
    indic,
    updatedComparativeData,
    "trendsFootprint"
  );

  updatedComparativeData = await getHistoricalSerieData(
    code,
    indic,
    updatedComparativeData,
    "targetDivisionFootprint"
  );
  updatedComparativeData = await getMacroSerieData(
    indic,
    "00",
    updatedComparativeData,
    "areaFootprint"
  );

  // Target Area Footprint

  if (idTarget) {
    updatedComparativeData = await getSerieData(
      idTarget,
      "00",
      indic,
      updatedComparativeData,
      "targetAreaFootprint"
    );
  }

  return updatedComparativeData;
};

export const getClosestYearData = (data, currentYear) => {
  if (!data) {
    return null;
  }
  let closestYearData = null;

  const years = Object.keys(data);
  const closestYear = years.reduce((a, b) => {
    return Math.abs(b - currentYear) < Math.abs(a - currentYear) ? b : a;
  });

  closestYearData = data[closestYear];

  return closestYearData || null;
};
