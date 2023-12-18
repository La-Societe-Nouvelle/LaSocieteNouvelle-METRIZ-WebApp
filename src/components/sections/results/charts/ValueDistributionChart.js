// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Doughnut } from "react-chartjs-2";

// Colors
import {
  prevAggregatesChartColors,
  aggregatesChartColors,
  tooltips,
} from "./chartColors";

import { getAggregatesDistribution } from "./chartsUtils";

export const ValueDistributionChart = ({
  id,
  session,
  period,
  prevPeriod,
  printMode,
}) => {
  const { financialData } = session;

  const {
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded
  } = financialData.mainAggregates;

  const aggregates = [intermediateConsumptions,fixedCapitalConsumptions,netValueAdded];

  const distribution = getAggregatesDistribution(aggregates,period.periodKey);
  const labels = distribution.map((item) => item.label); 
  const backgrounds =  distribution.map((item) => aggregatesChartColors[item.id]); 
 
  const data = {
    labels: labels,
    datasets: [],
  };


    // prev

  if (prevPeriod) {

    const prevDistribution = getAggregatesDistribution(aggregates,prevPeriod.periodKey);
    const labels = prevDistribution.map((item) => item.label); 
    const backgrounds = prevDistribution.map((item) => prevAggregatesChartColors[item.id]); 
   

    const prevData = {
      labels : labels,
      data: prevDistribution.map(aggregate => aggregate.percentage),
      borderWidth: 2,
      backgroundColor: backgrounds,
      weight: 0.4
    };
    data.datasets.push(prevData);
  }


  const currentPeriod = {
    data: distribution.map((aggregate) => aggregate.percentage),
    borderWidth: 2,
    backgroundColor: backgrounds,
  };

  data.datasets.push(currentPeriod);

  console.log
  const options = {
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

  return <Doughnut id={id} data={data} options={options} />;
};


