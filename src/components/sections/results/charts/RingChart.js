// La Société Nouvelle

// React
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics.json";

// Utils
import { roundValue } from "/src/utils/Utils";
import { changeOpacity, getCutOut } from "./chartsUtils";

/* ---------- RING CHART ---------- */

/** Ring chart to show..
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
 *    - cutOut
 * 
 */

export const RingChart = ({
  id,
  session,
  datasetOptions,
  printOptions
}) => {

  console.log(id);

  // --------------------------------------------------
  // Data
  
  const chartData = buildChartData(
    session,
    datasetOptions
  );

  // --------------------------------------------------
  // Options

  const chartOptions = buildChartOptions(
    printOptions
  );

  // --------------------------------------------------

  console.log(chartData);
  return (
    <Doughnut 
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
    aggregate,
    indic,
    period
  } = datasetOptions;
  
  const backgroundColor = "rgba(245, 245, 245, 0.75)";
  const backgroundColorBis = "rgba(245, 245, 245, 0)";

  const indicColor = metaIndics[indic].color;
  const branchIndicColor = changeOpacity( indicColor, 0.3); 

  console.log(indicColor);
  console.log(backgroundColor);

  const datasets = [];
  const labels = [];

  // --------------------------------------------------
  // Branch

  const branchFpt = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
  datasets.push({
    data: [
      branchFpt,
      roundValue(100-branchFpt,2)
    ],
    backgroundColor: [
      branchIndicColor, 
      backgroundColorBis
    ],
    label: "Branche",
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
  });

  // --------------------------------------------------
  // Legal unit

  const legalUnitFpt = financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
  datasets.push({
    data: [
      legalUnitFpt,
      roundValue(100-legalUnitFpt,2)
    ],
    backgroundColor: [
      indicColor, 
      backgroundColor
    ],
    label: financialData.mainAggregates[aggregate].label,
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
  });
  labels.push(financialData.mainAggregates[aggregate].label);

  // --------------------------------------------------

  const chartData = {
    datasets,
    labels,
  };

  return chartData;
}

// ################################################## OPTIONS ##################################################

const buildChartOptions = (
  printOptions
) => {

  const {
    cutOut
  } = printOptions;

  const [width, setWidth] = useState(100);

  const handleResize = (chart) => {
    setWidth(chart.canvas.width)
  };

  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    onResize: handleResize,
    layout: {
      padding : {
        top : 20,
        left: 20,
        right : 20,
      },
    },
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          if (context.dataIndex === 0) {
              return `${value}%`;
          } else {
              return ''; 
          }
        },
        color: "#191558",
        font: {
          size: 10,
          family: "Roboto",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label;
            const value = context.parsed;
            return `${label}: ${value}%`;
          },
        },
      },
      legend: {
        display: true,
        position: "bottom",
        align: "start",
        labels: {
          boxWidth: 10,
          font: {
            size: 10,
          },
          generateLabels: (chart) => {
            const labels = [];
            const uniqueIndicators = new Set();
            chart.data.datasets.forEach((dataset) => {
              const indicator = dataset.label;
              if (!uniqueIndicators.has(indicator)) {
                uniqueIndicators.add(indicator);
                const backgroundColor = dataset.backgroundColor[0];
                labels.push({
                  text: indicator,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 1,
                  hidden: false,
                  boxWidth: 10,
                });
              }
            });
            return labels;
          },
        },
      },
    },
    cutout: getCutOut(width,cutOut ?? 5),
  };
  
  return chartOptions;
}