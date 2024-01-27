// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";
Chart.register(ChartDataLabels);

// Utils
import { getAggregatesDistribution } from "./chartsUtils";

// Styles
import { aggregatesChartColors, prevAggregatesChartColors, tooltips } from "../../../../constants/chartColors";

/* ---------- VALUE DISTRIBUTION CHART ---------- */

/** Pie chart to show production distribution between main aggregates
 *  
 *  Args :
 *    - id
 *    - session
 *    - datasetOptions
 *    - printOptions
 * 
 *  datasetOptions :
 *    - period
 * 
 *  printOptions :
 *    - printMode -> to maintain aspect ratio
 *    - shpwPreviousPeriod
 * 
 */

export const ValueDistributionChart = ({
  id,
  session,
  datasetOptions,
  printOptions
}) => {

  // --------------------------------------------------
  // Data

  const chartData =buildChartData(session,datasetOptions);

  // --------------------------------------------------
  // Options

  const chartOptions = buildChartOptions(printOptions);

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

const buildChartData = (session,datasetOptions,printOptions) => 
{
  const { financialData } = session;
  const {
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded
  } = financialData.mainAggregates;
  const aggregates = [intermediateConsumptions,fixedCapitalConsumptions,netValueAdded];

  const {
    period
  } = datasetOptions;

  const {
    showPreviousPeriod
  } = printOptions;

  const datasets = [];
  const labels = [];

  // --------------------------------------------------
  // Previous period

  if (showPreviousPeriod)
  {
    const prevPeriodDistribution = getAggregatesDistribution(aggregates,prevPeriod.periodKey);
   
    const prevPeriodData = {
      labels : prevPeriodDistribution.map((item) => item.label),
      data: prevPeriodDistribution.map(aggregate => aggregate.percentage),
      borderWidth: 2,
      backgroundColor: prevPeriodDistribution.map((item) => prevAggregatesChartColors[item.id]),
      weight: 0.4
    };

    datasets.push(prevPeriodData);
  };

  // --------------------------------------------------
  // Current period

  const currPeriodDistribution = getAggregatesDistribution(aggregates,period.periodKey);

  const currentPeriod = {
    labels: currPeriodDistribution.map((item) => item.label),
    data: currPeriodDistribution.map((aggregate) => aggregate.percentage),
    borderWidth: 2,
    backgroundColor: currPeriodDistribution.map((item) => aggregatesChartColors[item.id]),
  };

  chartData.datasets.push(currentPeriod);

  // --------------------------------------------------

  const chartData = {
    datasets: datasets,
    labels: labels,
  };

  return chartData;
}

// ################################################## OPTIONS ##################################################

const buildChartOptions = (printOptions) => 
{
  const {
    printMode
  } = printOptions;

  const chartOptions = {
    devicePixelRatio: 2,
    maintainAspectRatio: printMode ? false : true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color : "#FFFFFF",
        font: {
          size: 10,
          family: "Raleway",
          weight: "bold",
        },
        formatter: (value) => {
          if (value !== 0) {
            return value + "%";
          } else {
            return null;
          }
        },
      },
      tooltip: {
        backgroundColor: tooltips.tooltipBackground,
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            let label = context.label;
            if (context.datasetIndex === 0) {
              label += " (N-1)"; 
            }
            return label;
          },
        },
      },
    },
    layout: {
      padding: {
        left: 50,
        right: 50,
        top : 0,
        bottom : 0
      },
    },
  };

  return chartOptions;
}