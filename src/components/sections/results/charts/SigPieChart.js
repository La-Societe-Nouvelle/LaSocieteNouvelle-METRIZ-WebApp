// La Société Nouvelle

// React
import React from "react";

// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartAnnotation from "chartjs-plugin-annotation";
import { Doughnut } from "react-chartjs-2";
Chart.register(ChartDataLabels, ChartAnnotation);

// Utils
import { getPrevPeriod } from "../../../../utils/periodsUtils";

// Styles
import {
  colors,
  prevAggregatesChartColors,
  aggregatesChartColors,
  tooltips,
} from "../../../../constants/chartColors";

/* ---------- SIG PIE CHART ---------- */

/** ... add description
 *  
 *  Args :
 *    - id
 *    - session
 *    - datasetOptions
 *    - printOptions
 * 
 *  datasetOptions :
 *    - period
 *    - aggregate
 *    - indic
 * 
 *  printOptions :
 *    - showPreviousData
 *    - printMode
 * 
 *  /!\ annotation -> value
 */

export const SigPieChart = ({ 
  id,
  session,
  datasetOptions,
  printOptions
}) => {

  // --------------------------------------------------
  // Data

  const chartData = buildChartData(
    session,
    datasetOptions,
    printOptions
  );

  // --------------------------------------------------
  // Options

  const chartOptions = buildChartOptions(
    datasetOptions,
    printOptions
  );

  // --------------------------------------------------

  return (
    <Doughnut 
      id={id} 
      data={chartData} 
      options={chartOptions} 
    />
  );
}

// ################################################## DATASET ##################################################

const buildChartData = (
  session,
  datasetOptions,
  printOptions
) => {

  const {
    availablePeriods,
    financialData
  } = session;
  
  const {
    period,
    aggregate,
    indic
  } = datasetOptions;
  
  const {
    showPreviousData
  } = printOptions;

  const aggregateData = financialData.mainAggregates[aggregate];
  
  const datasets = [];
  const labels = [];
  
  // --------------------------------------------------
  // prev period
  
  const prevPeriod = getPrevPeriod(availablePeriods,period);
  if (showPreviousData && prevPeriod)
  {
    const prevValue = aggregateData.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value;

    datasets.push({
      data: [
        prevValue, 
        100 - prevValue
      ],
      datalabels: { display: false },
      borderWidth: 2,
      backgroundColor: [
        prevAggregatesChartColors[aggregate.id],
        "rgba(215, 220, 251, 0)",
      ],
      weight: 0.3,
    });
  }
  labels.push(aggregateData.label);
  
  // --------------------------------------------------
  // current period
  
  const value = aggregateData.periodsData[period.periodKey].footprint.indicators[indic].value;

  datasets.push({
    data: [
      value, 
      100 - value
    ],
    datalabels: { display: false },
    borderWidth: 2,
    backgroundColor: [
      aggregatesChartColors[aggregate.id],
      "rgb(247, 247, 247)",
    ],
  });
  labels.push("");

  // --------------------------------------------------

  const chartData = {
    datasets,
    labels,
  };

  return chartData;
}

// ################################################## OPTIONS ##################################################

const buildChartOptions = (
  datasetOptions,
  printOptions
) => {

  const {
    period
  } = datasetOptions;

  const {
    printMode
  } = printOptions;

  const chartOptions = {
    hover: { mode: null },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    plugins: {

      legend: {
        display: false,
      },
      annotation: {
        annotations: [
          {
            type: "label",
            xScaleID: "x-axis-0",
            //content: value + "%", 
            color: colors.textColor,
            font: {
              size: 14,
              family: "Raleway",
              weight: "bold",
            },
          },
        ],
      },
      tooltip: {
        backgroundColor: tooltips.tooltipBackground,
        cornerRadius: 2,
        callbacks: {
          label: function (context) {
            const period = context.datasetIndex == 0 ? "(N-1)" : "";
            return context.parsed + "% " + period;
          },
        },
      },
    },
    layout: {
      padding: {
        left:  printMode ? 0 : 40,
        right:  printMode ? 0 : 40,
        top : 0,
        bottom : 0
      },
    },
  };

  return chartOptions;
}