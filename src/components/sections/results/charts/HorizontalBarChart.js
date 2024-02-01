// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Styles
import { aggregatesChartColors, colors, prevAggregatesChartColors } from "../../../../constants/chartColors";

Chart.register(ChartDataLabels);

/* ---------- HORIZONTAL BAR CHART ---------- */

/** Chart to show production impact distribution through main aggregates
 *  
 *  Args :
 *    - id
 *    - session
 *    - datasetOptions
 *    - printOptions
 * 
 *  datasetOptions :
 *    - period
 *    - indic
 * 
 *  printOptions :
 * 
 */

export const HorizontalBarChart = ({
  id,
  session,
  datasetOptions,
  printOptions
}) => {

  // --------------------------------------------------
  // Data

  const chartData = buildChartData(session,datasetOptions);

  // --------------------------------------------------
  // Options

  const chartOptions = buildChartOptions(
    printOptions,
    chartData
  );

  // --------------------------------------------------
  
  return (
    <Bar
      id={id}
      data={chartData}
      options={chartOptions}
    />
  );
}

// ################################################## DATASET ##################################################

const buildChartData = (session,datasetOptions) => 
{
  const {
    financialData,
    comparativeData
  } = session;

  const {
    period,
    indic
  } = datasetOptions;

  const aggregates = [
    "production",
    "intermediateConsumptions",
    "fixedCapitalConsumptions",
    "netValueAdded"
  ];

  // --------------------------------------------------
  // Data

  const data = [];

  for (let aggregate of aggregates) 
  {
    let legalUnitFpt = financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
    let branchFpt = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
    
    if (branchFpt !== 0) {
      let value = Math.round((legalUnitFpt - branchFpt) / branchFpt * 100);
      data.push(value);
    } else {
      data.push(0);
    }
  }

  // --------------------------------------------------

  const chartData = {
    datasets: [{
      data: data,
      backgroundColor: prevAggregatesChartColors.production,
      borderWidth: 0,
      type: "bar",
      borderWidth: 0,
      barPercentage: 1,
      categoryPercentage: 0.70,
      minBarLength: 2,
    }],
    labels: [
      "Production",
      "Consommations intermédiaires",
      "Consommations de capital fixe",
      "Valeur ajoutée nette",
    ],
  };

  return chartData;
}

// ################################################## OPTIONS ##################################################

const buildChartOptions = (
  printOptions,
  chartData
) => {

  const data = chartData.datasets
    .map(dataset => dataset.data)
    .flat();
  
  const maxValue = Math.max(
    Math.abs(Math.min(...data)),
    Math.abs(Math.max(...data))
  );
  const minValue = -maxValue;

  const chartOptions = {
    devicePixelRatio: 2,
    indexAxis: "y",
    scales: {
      y: {
        display: false,
      },
      x: {
        min: minValue - 10,
        max: maxValue + 10,
        grid: {
          color: "#f0f0f8",
          borderWidth : 1,
          borderColor: "#f0f0f8"
        },
        ticks: {
          color: colors.textColor,
          font: {
            size: 12,
            family: "Roboto",
          },
          callback: (value, index) => {
            if (value === 0 || value === 40 || value === -40) {
              return value + "%";
            }
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false           
      },
      datalabels: {
        anchor: function (context) {
          return context.dataset.data[context.dataIndex] < 0
            ? "start"
            : "end";
        },
        offset: function (context) {
          return context.dataset.data[context.dataIndex] < 0 ? -30 : 5;
        },
        align: "end",
        color: colors.textColor,

        font: {
          size: 12,
          family: "Roboto",
        },
        formatter: (value) => {
          if (value !== 0) {
            return value + "%";
          }
        },
      },
    },
  };

  return chartOptions;
}