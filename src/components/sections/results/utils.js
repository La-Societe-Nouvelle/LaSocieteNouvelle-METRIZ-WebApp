// La Société Nouvelle

// Libraries
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


export const getLastIndustryTargetData = (targetData) => {
  const lastTargetValue = targetData.length > 0 ? targetData[targetData.length - 1].value : 0;
  const lastTargetYear = targetData.length > 0 ? targetData[targetData.length - 1].year : 2030;

  return { lastTargetValue, lastTargetYear };
};

export const determineAlignedTargetValue = (
  currentValue,
  branchValue,
  targetYear
) => {
  return currentValue >= branchValue ? targetYear : targetYear * (currentValue / branchValue);
};

export const projectTrendValues = async(footprints, targetYear, targetMode, decimals) => {

  const currentYear = footprints[0].year;
  const currentValue = footprints[0].value;

  const previousYear =  footprints[1].year;
  const previousValue = footprints[1].value;

  const dataPoints = [
    [
      parseInt(previousYear),
      previousValue,
    ],
    [
      parseInt(currentYear),
      currentValue,
    ],
  ];

  const result = regression.linear(dataPoints);

  const projectedValues = [];

  for (let year = parseInt(previousYear); year <= parseInt(targetYear); year++) {
    const projectedValue  = result.predict(year)[1];

    projectedValues.push({
      value: projectedValue.toFixed(decimals),
      year: year.toString(),
      target: targetMode,
    });
  }


  return projectedValues;
}

export const buildTrend = async(historicalFootprints, maxYear, nbDecimals) => 
{
  const dataPoints = historicalFootprints.map((footprint) => 
    [parseInt(footprint.year), footprint.value]
  ).sort((a,b) => a[0] - b[0]);
  const startYear = Math.max(...historicalFootprints.map((item) => parseInt(item.year)));
  const endYear = parseInt(maxYear);

  console.log(dataPoints);
  if (dataPoints.length == 1) 
  {
    //return [];

    // build values array
    const trendValues = [];
    for (let year = startYear; year <= endYear; year++) {
      const trendValue  = dataPoints[0][1];
      trendValues.push({
        value: trendValue.toFixed(nbDecimals),
        year: year.toString()
      });
    }
    return trendValues;
  }

  else if (dataPoints.length == 2) 
  {
    console.log(dataPoints);
    // regression geometric
    const growthFactor = Math.pow(dataPoints[1][1] / dataPoints[0][1], 1 / (dataPoints[1][0] - dataPoints[0][0]));

    // build values array
    const trendValues = [];
    for (let year = startYear; year <= endYear; year++) {
      let i = year - startYear;
      const trendValue = dataPoints[1][1] * Math.pow(growthFactor, i);
      trendValues.push({
        value: trendValue.toFixed(nbDecimals),
        year: year.toString()
      });
    }
    return trendValues;
  }

  // else if (dataPoints.length == 2) 
  // {
  //   // regression linear
  //   const result = regression.linear(dataPoints);

  //   // build values array
  //   const trendValues = [];
  //   for (let year = startYear; year <= endYear; year++) {
  //     const trendValue  = result.predict(year)[1];
  //     trendValues.push({
  //       value: trendValue.toFixed(nbDecimals),
  //       year: year.toString()
  //     });
  //   }
  //   return trendValues;
  // }

  else if (dataPoints.length > 2) 
  {
    // regression polynomial
    const result = regression.polynomial(dataPoints, { order: 2 });

    // build values array
    const trendValues = [];
    for (let year = startYear; year <= endYear; year++) {
      const trendValue  = result.predict(year)[1];
      trendValues.push({
        value: trendValue.toFixed(nbDecimals),
        year: year.toString()
      });
    }
    return trendValues;
  }

  else {
    return [];
  }
}

export const  interpolateLinearValues = (
  startYear,
  startValue,
  endYear,
  endValue,
  targetMode,
  decimals
) =>  {
  const dataPoints = [
    [parseInt(startYear), startValue],
    [parseInt(endYear), parseInt(endValue)],
  ];

  const result = regression.linear(dataPoints);

  const interpolatedValues = [];
  for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
    const interpolatedValue = result.predict(year)[1];
    interpolatedValues.push({
      value: interpolatedValue.toFixed(decimals),
      year: year.toString(),
      target: targetMode,
    });
  }

  return interpolatedValues;
}

export const interpolateGeometricValues = async (
  startYear,
  startValue,
  endYear,
  endvalue,
  targetMode,
  decimals
) => {
  const values = [];

  const startYearNumber = parseInt(startYear);
  const targetYearNumber = parseInt(endYear);

  const yearsDifference = targetYearNumber - startYearNumber;
  
  let newValue = parseFloat(endvalue);
  newValue = newValue === 0 ? 0.1 : newValue;

  const growthFactor = Math.pow(newValue / startValue, 1 / yearsDifference);

  for (let i = 0; i <= yearsDifference; i++) {
    const currentYear = startYearNumber + i;
    const currentValue = startValue * Math.pow(growthFactor, i);

    values.push({
      value: currentValue.toFixed(decimals),
      year: currentYear.toString(),
      target: targetMode,
    });
  }

  return values;
};


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
