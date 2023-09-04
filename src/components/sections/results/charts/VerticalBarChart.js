// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics";

import { printValue } from "/src/utils/Utils";
import { increaseBrightness } from "../utils";

const getSuggestedMax = (max) => {
  if (max < 10) {
    return 10;
  } else if (max < 20) {
    return 25;
  } else if (max < 45) {
    return 50;
  } else {
    return 100;
  }
};

/* ---------- VERTICAL BAR CHART ---------- */

/** Bar chart to compare footprint with macro & branch
 *  
 *  Args :
 *    - id
 *    - indic
 *    - session,
 *    - aggregate
 *    - isPrinting -> use in report
 * 
 */

export const VerticalBarChart = ({
  id,
  session,
  period,
  aggregate,
  indic,
  isPrinting,
  showDivisionData,
  showAreaData,
  showTargetData,
  showPreviousData,
  useIndicColors
}) => {

  const { unit, nbDecimals } = metaIndics[indic];

  const indicColor = metaIndics[indic].color;
  const branchIndicColor = increaseBrightness( indicColor, 50); 

  // Datasets --------------------------------------------------------------

  const {
    financialData,
    comparativeData
  } = session
  const mainAggregates = financialData.mainAggregates;

  // current footprints

  const dataset_currentFootprints = [];
  const labels =[];
  const backgroundColors = [];
  // area
  if (showAreaData) {
    let areaValue = comparativeData[aggregate].area.history.data[indic].slice(-1)[0].value;
    dataset_currentFootprints.push(areaValue);
    labels.push("France");
    backgroundColors.push("RGBA(176,185,247,1)");
  }
  // company
  let companyValue = mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
  dataset_currentFootprints.push(companyValue);
  labels.push("Exercice");
  if(useIndicColors) {
    backgroundColors.push(indicColor);

  }
  else {
    backgroundColors.push("RGBA(250,89,95,1)");

  }
  // division
  if (showDivisionData) {
    let divisionValue = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
    dataset_currentFootprints.push(divisionValue);
    labels.push("Branche");
    if(useIndicColors) {
      backgroundColors.push(branchIndicColor);
      
    } else {
      backgroundColors.push("rgb(255, 182, 66)");

    }
  }

  // prev footprints

  const prevDateEnd = period.dateEnd;
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const dataset_prevFootprints = [
    null,
    prevPeriod ? mainAggregates[aggregate].periodsData[prevPeriod.periodKey].footprint.indicators[indic].value : null,
    null
  ];

  // targets

  const dataset_target = [
    comparativeData[aggregate].area.target.data[indic].length>0 ? 
      comparativeData[aggregate].area.target.data[indic].slice(-1)[0].value : null,
    null,
    comparativeData[aggregate].division.target.data[indic].length>0 ? 
      comparativeData[aggregate].division.target.data[indic].slice(-1)[0].value : null,
  ];

  const datasets = [{
    label: "Empreinte",
    data: dataset_currentFootprints,
    skipNull: true,
    backgroundColor: backgroundColors,
    borderWidth: 0,
    type: "bar",
    barPercentage: 0.6,
    categoryPercentage: 0.6,
    minBarLength: 2,
  }];
  if (showPreviousData) datasets.push({
    label: "Valeur N-1",
    data: dataset_prevFootprints,
    skipNull: true,
    backgroundColor: backgroundColors,
    borderWidth: 0,
    barPercentage: 0.6,
    categoryPercentage: 0.6,
    minBarLength: 2,
  });
  if (showTargetData) datasets.push({
    label: "Objectif",
    data: dataset_target,
    skipNull: true,
    backgroundColor: backgroundColors,
    borderWidth: 0,
    barPercentage: 0.6,
    categoryPercentage: 0.6,
    minBarLength: 2,
  });

  // Data for chart --------------------------------------------------------

  const max = Math.max(...dataset_currentFootprints.filter((o) => o!=null));
  const suggestedMax = unit === "%" ? getSuggestedMax(max) : null;

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  // Options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: isPrinting ? false : true,
    devicePixelRatio: 2,
    aspectRatio: 1,
    layout: {
      padding : {
        left: 10,
        right : 10,
      },
    },
    scales: {
      y: {
        display: true,
        min: 0,
        max: suggestedMax,
        ticks: {
          color: "#191558",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "rgba(245, 245, 245, 0.75)",
          lineWidth : 2,
        },
      },
      x: {
        ticks: {
          color: "#191558",
          font: {
            size: 10,
          },
        },
        grid: {
          lineWidth : 2,
          color: "rgba(245, 245, 245, 0.75)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: function (value, context) {
          if (value) {
            return printValue(value, nbDecimals);
          }
        },
        color: "#191558",
        font: {
          size: 9,
          family: "Roboto",
        },
      },
      title: {
        display: true,
        padding: {
          top: 10,
          bottom: 20,
        },
        align: "start",
        text: unit,
        color: "#191558",
        font: {
          size: 11,
        },
      },
      tooltip: {
        backgroundColor: "#191558",
        padding: 10,
        cornerRadius: 2,
        callbacks: {
          label: function (context) {
            return (
              context.dataset.label +
              " : " +
              printValue(context.parsed.y, nbDecimals) +
              " " +
              unit
            );
          },
        },
      },
    },
  };

  return (
    <Bar
      id={id}
      data={chartData}
      options={{
        ...commonOptions,
        suggestedMax: suggestedMax,
      }}
    />
  );
}