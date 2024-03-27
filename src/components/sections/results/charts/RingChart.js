// La Société Nouvelle

// React
import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics.json";

// Utils
import { roundValue } from "/src/utils/Utils";
import { changeOpacity, getCutOut } from "./chartsUtils";

// Styles
import { colors, tooltips } from "../../../../constants/chartColors";
import { getLabelPeriod } from "../../../../utils/periodsUtils";

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

export const RingChart = ({ id, session, datasetOptions, printOptions }) => 
{
  // --------------------------------------------------
  // Data

  const chartData = buildChartData(session, datasetOptions);

  // --------------------------------------------------
  // Options

  const chartOptions = buildChartOptions(printOptions);

  // --------------------------------------------------

  return <Doughnut id={id} data={chartData} options={chartOptions} />;
};

// ################################################## DATASET ##################################################

const buildChartData = (session, datasetOptions) => {
  const { financialData, comparativeData } = session;

  const { aggregate, indic, period } = datasetOptions;

  const indicColor = metaIndics[indic].color;
  const branchIndicColor = changeOpacity(indicColor, 0.3);

  const periodLabel = getLabelPeriod(period);
  const datasets = [];
  const labels = ["Branche", periodLabel];
  // --------------------------------------------------
  // Branch

  const branchFpt = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
  datasets.push({
    data: [branchFpt, roundValue(100 - branchFpt, 2)],
    backgroundColor: [branchIndicColor, colors.transparent],
    label: "Branche",
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
  });

  // --------------------------------------------------
  // Legal unit

  const legalUnitFpt =
    financialData.mainAggregates[aggregate].periodsData[period.periodKey]
      .footprint.indicators[indic].value;
  datasets.push({
    data: [legalUnitFpt, roundValue(100 - legalUnitFpt, 2)],
    backgroundColor: [indicColor, colors.lightBackground],
    label: "Unité Légale",
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
  });

  // --------------------------------------------------

  const chartData = {
    datasets,
    labels
  };

  return chartData;
};

// ################################################## OPTIONS ##################################################

const buildChartOptions = (printOptions) => {
  const { cutOut } = printOptions;

  const [width, setWidth] = useState(100);

  const handleResize = (chart) => {
    setWidth(chart.canvas.width);
  };

  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    devicePixelRatio: 2,
    onResize: handleResize,
    layout: {
      padding: {
        top: 20,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          if (context.dataIndex === 0) {
            return `${value}%`;
          } else {
            return "";
          }
        },
        backgroundColor: (context) => {
          if (context.dataIndex === 0) {
            return colors.lightBackground;
          } else {
            return colors.transparent;
          }
        },
        borderRadius: 5,
        align: (context) => {
          if (context.datasetIndex === 0) {
            return "right";
          } else {
            return "left";
          }
        },
        color : colors.textColor,
        offset : 10,
        anchor :  "start",
        font: {
          size: 10,
          family: "Roboto",
        },
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
            return `Empreinte de la production: ${value}%`;
          },
          title: (context) => {
            return context[0]?.dataset.label
          },
        },
      },
      legend: {
        display: true,
        position: "bottom",
        align: "center",
        labels: {
          boxWidth: 10,
          color : colors.textColor,
          font: {
            size: 10,
          },
          generateLabels: (chart) => {
            const labels = [];
            chart.data.datasets.forEach((dataset,index) => {
              const label = chart.data.labels[index];
                const backgroundColor = dataset.backgroundColor[0];
                labels.push({
                  text: label,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 0,
                  hidden: false,
                  boxWidth: 10,
                });
             
            });
            return labels;
          },
        },
      },
    },
    cutout: getCutOut(width, cutOut ?? 8),
  };

  return chartOptions;
};
