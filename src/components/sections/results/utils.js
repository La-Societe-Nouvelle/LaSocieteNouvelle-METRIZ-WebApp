// La Société Nouvelle

// Libraries
import keyIndics from "/lib/keyIndics";

// --------------------------------------------------
import keyIndics from "/lib/keyIndics";
import regression from "regression";

// get closest year data
//  call(s) : summaryReportGeneratorContribution.js
export const getClosestYearData = (data, currentYear) => 
{
  // return null if empty data
  if (!data) return null;

  const years = Object.keys(data);
  const closestYear = years.reduce((a, b) => {
    return Math.abs(b - currentYear) < Math.abs(a - currentYear) ? b : a;
  });

  if (closestYear) {
    return ({
      value: data[closestYear].value, 
      year:  data[closestYear].year
    })
  } else {
    return null;
  }
}

export const getLatestYear = (values) => {
  if (values.length === 0) {
    return null;
  }
  const latestYear = values.reduce((maxYear, object) => {
    const objectYear = parseInt(object.year, 10); // Convert year to integer

    // Compare the years and update if the current year is more recent
    return objectYear > maxYear ? objectYear : maxYear;
  }, parseInt(values[0].year, 10)); 

  return latestYear.toString();
}


export const getPeriodFootprint = (
  financialData,
  aggregate,
  defaultPeriod,
  indic
) => {
  return financialData.mainAggregates[aggregate].periodsData[
    defaultPeriod.periodKey
  ].footprint.indicators[indic];
};

export const getLastBranchTargetData = (targetData) => {
  const lastTargetValue =
    targetData.length > 0 ? targetData[targetData.length - 1].value : 0;
  const lastTargetYear =
    targetData.length > 0 ? targetData[targetData.length - 1].year : 2030;

  return { lastTargetValue, lastTargetYear };
};

export const calculateSimilarEffortTarget = (
  currentValue,
  branchValue,
  targetYear
) => {
  return currentValue >= branchValue
    ? targetYear
    : targetYear * (currentValue / branchValue);
};


export async function getTrend(footprints, targetYear, targetMode) {
  const years = footprints.map((footprint) => footprint.year);
  const latestYear = Math.max(...years.map(Number)).toString();

  const secondLatestYear = Math.max(
    ...years.filter((year) => year !== latestYear).map(Number)
  ).toString();

  const dataPoints = [
    [
      parseInt(secondLatestYear),
      footprints.find((f) => f.year === secondLatestYear).value,
    ],
    [parseInt(latestYear), footprints.find((f) => f.year === latestYear).value],
  ];

  const allYears = Array.from(
    { length: targetYear - secondLatestYear + 1 },
    (_, index) => (parseInt(secondLatestYear) + index).toString()
  );

  const result = regression.linear(dataPoints);

  const projectedValues = allYears.map((year) => ({
    value: result.predict(parseInt(year))[1].toFixed(1),
    year: year,
    target: targetMode,
  }));

  return projectedValues;
}

export async function buildLinearPath(
  startYear,
  startValue,
  endYear,
  endValue,
  targetMode
) {
  const dataPoints = [
    [parseInt(startYear), startValue],
    [parseInt(endYear), parseInt(endValue)],
  ];

  const result = regression.linear(dataPoints);

  const valuesBetweenPoints = [];
  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    const projectedValue = result.predict(year)[1];
    valuesBetweenPoints.push({
      value: projectedValue.toFixed(1),
      year: year.toString(),
      target: targetMode,
    });
  }

  return valuesBetweenPoints;
}



// --------------------------------------------------

// trigger download chart image
//  call(s) : ComparativeHorizontalBarChartVisual.js
export const downloadChartImage = (chartId, fileName) => {
  const canvas = document.getElementById(chartId);
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  link.click();
}

// --------------------------------------------------

// key indics
export const getKeyIndics = (division) => {
  return keyIndics[division].keyIndics;
};

// --------------------------------------------------

export const getTagsIndic = (
  session,
  period,
  aggregate,
  indic
) => {
  const { financialData, comparativeData } = session;


  const companyFootprint = financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
  const divisionFootprint = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;

  if (isBetter(indic,companyFootprint,divisionFootprint,10)) {
    return([{
      type: "good",
      text: "Niveau supérieur à la branche",
      class: "success"
    }])
  } 
  else if (isWorst(indic,companyFootprint,divisionFootprint,10)) {
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
};


const isBetter = (indic,value,reference,margin) => {
  const positiveImpact = ["eco","art","soc","knw"].includes(indic)
  if (positiveImpact) {
    return value>=reference*(1+margin/100)
  } else {
    return value<=reference*(1-margin/100)
  }
};

const isWorst = (indic,value,reference,margin) => {
  const positiveImpact = ["eco","art","soc","knw"].includes(indic)
  if (positiveImpact) {
    return value<=reference*(1-margin/100)
  } else {
    return value>=reference*(1+margin/100)
  }
};

// --------------------------------------------------

// Check if comparative data exists for a specific scale, series, and indicator.

export const hasComparativeData = (session, scale, serie, indic) => {
  const aggregates = [
    "production",
    "intermediateConsumptions",
    "fixedCapitalConsumptions",
    "netValueAdded"
  ];

  const hasComparativeData = aggregates.every(aggregate => 
    session.comparativeData?.[aggregate]?.[scale]?.[serie]?.data?.[indic].length > 0
  );
  return hasComparativeData;
}

// --------------------------------------------------

// Livrables & Charts 

export function getMostImpactfulExpensesPart(expenses, total, indic) {
  const expensesPart = expenses.map((expense) => {
    let expenseImpact = expense.footprint.indicators[indic].getGrossImpact(
      expense.amount
    );
    let impactPercentage = Math.round((expenseImpact / total) * 100);
    let accountLib = expense.accountLib;

    return { accountLib, impactPercentage };
  });
  return expensesPart;
}


export function sortByImpact(expensesAccounts, indicator, order) {

  const sortedExpensesAccounts = expensesAccounts.sort((a, b) => {
    const valueA = a.footprint.indicators[indicator].getGrossImpact(a.amount);
    const valueB = b.footprint.indicators[indicator].getGrossImpact(b.amount);

    if (order === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedExpensesAccounts;
}
