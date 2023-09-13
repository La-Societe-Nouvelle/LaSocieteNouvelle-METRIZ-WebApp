

import keyIndics from "/lib/keyIndics";


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

  return closestYearData
    ? { value: closestYearData.value, year: closestYearData.year }
    : null;
};

export const downloadChartImage = (chartId, fileName) => {
  const canvas = document.getElementById(chartId);
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  link.click();
};

export const getKeyIndics = (division) => {
  return(keyIndics[division].keyIndics)
}

export const getTagsIndic = (
  session,
  period,
  aggregate,
  indic
) => {

  const {
    financialData,
    comparativeData
  } = session;

  const companyFootprint = financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
  const divisionFootprint = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
 

  const positiveImpact = ["eco","art","soc","knw"].includes(indic);

  const isBetter = (value,reference,margin) => {
    if (positiveImpact) {
      return value>=reference*(1+margin/100)
    } else {
      return value<=reference*(1-margin/100)
    }
  };

  const isWorst = (value,reference,margin) => {
    if (positiveImpact) {
      return value<=reference*(1-margin/100)
    } else {
      return value>=reference*(1+margin/100)
    }
  };

  if (isBetter(companyFootprint,divisionFootprint,10)) {
    return([{
      type: "good",
      text: "Niveau supérieur à la branche",
      class: "success"
    }])
  } 
  else if (isWorst(companyFootprint,divisionFootprint,10)) {
    return([{
      type: "bad",
      text: "Niveau inférieur à la branche",
      class: "warning"
    }])
  } 
  else {
    return([{
      type: "medium",
      text: "Niveau de la branche",
      class: "primary"
    }])
  }
}


// Check if comparative data exists for a specific scale, series, and indicator.

export const hasComparativeData = (session, scale, serie,indic) => 
{
  const aggregates = ["production","intermediateConsumptions","fixedCapitalConsumptions","netValueAdded"];

    for (let aggregate of aggregates) {
      if (!session.comparativeData?.[aggregate]?.[scale]?.[serie]?.data?.[indic].length > 0) {
        return false;
      }
    }

  return true;
}
