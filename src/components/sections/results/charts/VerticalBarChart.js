// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics";

import { comparativeChartColors } from "../../../../constants/chartColors";

// utils
import { printValue } from "/src/utils/formatters";
import { getMaxY, changeOpacity } from "./chartsUtils";

/* ---------- VERTICAL BAR CHART ---------- */

/** Bar chart to compare footprint with macro & branch
 *
 *  Args :
 *    - id
 *    - session
 *    - period
 *    - aggregate
 *    - indic
 *    - printMode -> use in report
 *    - showDivisionData
 *    - showAreaData
 *    - showTargetData
 *    - useIndicColors
 *    - label
 */

export const VerticalBarChart = ({
  id,
  session,
  period,
  aggregate,
  indic,
  printMode,
  showDivisionData,
  showAreaData,
  showTargetData,
  useIndicColors,
  label,
}) => {
  const { unit, nbDecimals } = metaIndics[indic];
  // Datasets --------------------------------------------------------------

  const { financialData, comparativeData } = session;
  const mainAggregates = financialData.mainAggregates;

  // targets dataset
  const { dataset_target, targetBackgroundColors } = generateTargetDataset(
    comparativeData,
    aggregate,
    indic,
    showAreaData,
    showDivisionData
  );

  // current footprints dataset
  const { dataset_currentFootprints, labels, backgroundColors } = generateCurrentFootprintsDataset(
      comparativeData,
      aggregate,
      indic,
      useIndicColors,
      showAreaData,
      showDivisionData,
      mainAggregates,
      period,
      label
    );

  // Datasets

  const datasets = [
    {
      label: "Empreinte " + period.periodKey,
      data: dataset_currentFootprints,
      skipNull: true,
      backgroundColor: backgroundColors,
      borderWidth: 0,
      type: "bar",
      barPercentage: 0.6,
      categoryPercentage: 0.6,
      minBarLength: 2,
    },
  ];

  if (showTargetData)
    datasets.push({
      label: "Objectif 2030",
      data: dataset_target,
      skipNull: true,
      backgroundColor: targetBackgroundColors,
      borderWidth: 0,
      barPercentage: 0.6,
      categoryPercentage: 0.6,
      minBarLength: 2,
    });

  // Data for chart --------------------------------------------------------

  // Determine Y-Axis Max
  const datasetsForMaxY  = showTargetData
  ? [dataset_currentFootprints, dataset_target]
  : [dataset_currentFootprints];
  
  const maxY = unit === "%" ? getMaxY(datasetsForMaxY) : null;

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  // Options
  const commonOptions = {
    responsive: true,
    devicePixelRatio: 2,
    aspectRatio: 1,
    layout: {
      padding: {
        left: printMode ? 0 : 10,
        right: printMode ? 0 : 10,
        top: printMode ? 0 : 30,
        bottom: printMode ? 10 : 0,

      },
    },
    scales: {
      y: {
        display: true,
        min: 0,
        max: maxY,
        ticks: {
          color: "#191558",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "rgba(245, 245, 245, 0.5)",
          lineWidth: 1,
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
          lineWidth: 1,
          color: "rgba(245, 245, 245, 0.5)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: printMode ? false : true,
        anchor: "end",
        align: "top",
        formatter: function (value, context) {
          if (value) {
            return printValue(value, nbDecimals) + " " + unit;
          }
        },
        color: "#191558",
        font: {
          size: printMode ? 10 : 9,
          family: "Roboto",
        },
      },
      title: {
        display: false,
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
      }}
    />
  );
};

const generateCurrentFootprintsDataset = (
  comparativeData,
  aggregate,
  indic,
  useIndicColors,
  showAreaData,
  showDivisionData,
  mainAggregates,
  period,
  label
) => {

  // To do : récupérer les données correspondant à la période analysée
  
  const dataset_currentFootprints = [];
  const backgroundColors = [];
  const labels = [];
  const indicColor = metaIndics[indic].color;
  const branchIndicColor = changeOpacity(indicColor, 0.3);

  // Area Footprint
  if (showAreaData) {
    let areaValue = comparativeData[aggregate].area.history.data[indic].slice(-1)[0]?.value;
    dataset_currentFootprints.push(areaValue);
    labels.push("France");

    
    backgroundColors.push(comparativeChartColors.area);
  }
  // Legal Unit Footprint

  let legalUnitValue = mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic]?.value;
  dataset_currentFootprints.push(legalUnitValue);
  labels.push(label);

  if (useIndicColors) {
    backgroundColors.push(indicColor);
  } else {
    backgroundColors.push(comparativeChartColors.legalunit);
  }

  // Division Footprint

  if (showDivisionData) {
    let divisionValue = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
    
    dataset_currentFootprints.push(divisionValue);
    labels.push("Branche");

    if (useIndicColors) {
      backgroundColors.push(branchIndicColor);
    } else {
      backgroundColors.push(comparativeChartColors.branch);
    }
  }

  return { dataset_currentFootprints, labels, backgroundColors };
};

const generateTargetDataset = (
  comparativeData,
  aggregate,
  indic,
  showAreaData,
  showDivisionData
) => {
  const dataset_target = [];
  const targetBackgroundColors = [];

  // Area Target
  let areaTargetValue = showAreaData
    ? comparativeData[aggregate].area.target.data[indic].slice(-1)[0]?.value
    : null;
  dataset_target.push(areaTargetValue);
  targetBackgroundColors.push(comparativeChartColors.targetarea);

  //
  dataset_target.push(null); 
  targetBackgroundColors.push(null);

  // Division Target
  let divisionTargetValue = showDivisionData
    ? comparativeData[aggregate].division.target.data[indic].slice(-1)[0]?.value
    : null;
  dataset_target.push(divisionTargetValue);
  targetBackgroundColors.push(comparativeChartColors.targetbranch);

  return { dataset_target, targetBackgroundColors };
};
