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
import { getLabelPeriod, getPrevPeriod } from "../../../../utils/periodsUtils";

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
  
  const value =  chartData.datasets.length > 1 ? chartData.datasets[1]?.data[0] : chartData.datasets[0]?.data[0];
  if (value == null) {
    value = " - ";
  }

  const chartOptions = buildChartOptions(
    printOptions,
    value
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
      label : getLabelPeriod(prevPeriod),
      data: [
        prevValue, 
        100 - prevValue
      ],
      datalabels: { display: false },
      borderWidth: 2,
      backgroundColor: [
        prevAggregatesChartColors[aggregate],
        colors.lightBackground
      ],
      weight: 0.3,
    });
  }
  labels.push(aggregateData.label);
  
  // --------------------------------------------------
  // current period
  
  const value = aggregateData.periodsData[period.periodKey].footprint.indicators[indic].value;

  datasets.push({
    label : getLabelPeriod(period),
    data: [
      value, 
      100 - value
    ],
    datalabels: { display: false },
    borderWidth: 2,
    backgroundColor: [
      aggregatesChartColors[aggregate],
      colors.lightBackground
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
  printOptions,
  value
) => {

  const {
    printMode
  } = printOptions;
  const chartOptions = {
    devicePixelRatio: 2,
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
        display: printMode ? false : true,
        position: "bottom",
        align: "left",
        labels: {
          boxWidth: 10,
          color : colors.textColor,

          font: {
            size: 10,
            textAlign : "left"
          },
          generateLabels: (chart) => {
            const labels = [];
            chart.data.datasets.forEach((dataset,index) => {
              const label = chart.data.datasets[index].label;
                const backgroundColor = dataset.backgroundColor[0];
                labels.push({
                  text: label,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 0,
                });
             
            });
            return labels;
          },
        },
      },
      annotation: {
        annotations: [
          {
            type: "label",
            xScaleID: "x-axis-0",
            content: value + "%", 
            color: colors.textColor,
            font: {
              size: 12,
              family: "Raleway",
              weight: "bold",
            },
          },
        ],
      },
      tooltip: {
        backgroundColor: tooltips.backgroundColor,
        padding: tooltips.padding,
        cornerRadius: tooltips.cornerRadius,
        callbacks: {
          label: (context) => {
            const datasets = context.chart.data.datasets;
            const index = context.datasetIndex;
            const value = datasets[index].data[0] ;
            return `Empreinte  ${value}%`;
          },
          title: (context) => {
            return context[0]?.dataset.label
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