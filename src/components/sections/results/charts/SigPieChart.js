import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartAnnotation from "chartjs-plugin-annotation";
Chart.register(ChartDataLabels, ChartAnnotation);
import { Doughnut } from "react-chartjs-2";

// Colors

import {
  colors,
  prevAggregatesChartColors,
  aggregatesChartColors,
  tooltips,
} from "./chartColors";

function SigPieChart({ aggregate, indic, period, prevPeriod, id,showPreviousData, printMode }) {

  
  const value = aggregate.periodsData[period.periodKey].footprint.indicators[indic].value;

  const prevValue = showPreviousData ? (prevPeriod ? aggregate.periodsData[prevPeriod.periodKey].footprint.indicators[indic].value : null) : null;

  const datasets = [];

  if (showPreviousData && prevValue !== null) {
    datasets.push({
      data: [prevValue, 100 - prevValue],
      datalabels: { display: false },
      borderWidth: 2,
      backgroundColor: [
        prevAggregatesChartColors[aggregate.id],
        "rgba(215, 220, 251, 0)",
      ],
      weight: 0.3,
    });
  }

  
  datasets.push({
    data: [value, 100 - value],
    datalabels: { display: false },
    borderWidth: 2,
    backgroundColor: [
      aggregatesChartColors[aggregate.id],
      "rgb(247, 247, 247)",
    ],
  });


  const data = {
    labels: [aggregate.label, ""],
    datasets: datasets,
  };

  const options = {
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
            content: value + "%", 
            color: colors.textColor,
            font: {
              size: 10,
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

  return <Doughnut id={id} data={data} options={options} />;
}

export default SigPieChart;
