import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";


// Libraries
import metaIndics from "/lib/indics.json";
import { roundValue } from "/src/utils/Utils";

const RingChart = ({
  session,
  period,
  aggregate,
  indic
}) => {

  const [width, setWidth] = useState(100);

  const {
    financialData,
    comparativeData
  } = session;

  const companyFootprint = financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
  const divisionFootprint = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;

  const backgroundColor = "rgba(245, 245, 245, 0.75)";
  const backgroundColorBis = "rgba(245, 245, 245, 0)";
  const colors = {
    art: ["rgba(213, 181, 255, 1)", "rgba(213, 181, 255, 0.5)"],
    eco: ["rgb(204, 253, 255)", "rgba(204, 253, 255,0.5)"],
    soc: ["rgba(255, 220, 160,1)", "rgba(255, 220, 160,0.5)"],
    knw: ["rgba(255, 220, 160,1)", "rgba(255, 220, 160,0.5)"],
  };

  const datasets = [{
    data: [divisionFootprint,roundValue(100-divisionFootprint,2)],
    backgroundColor: [colors[indic][1], backgroundColorBis],
    label: "Branche",
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
  },{
    data: [companyFootprint,roundValue(100-companyFootprint,2)],
    backgroundColor: [colors[indic][0], backgroundColor],
    label: financialData.mainAggregates[aggregate].label,
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
    }
  ];

  const data = {
    labels: [financialData.mainAggregates[aggregate].label],
    datasets: datasets,
  };

  const getCutOut = (chart) => {
    return 50;
  }

  const handleResize = (chart) => {
    setWidth(chart.canvas.width)
  };

  const options = {
    maintainAspectRatio: true,
    responsive: true,
    onResize: handleResize,
    layout: {
      padding: 10,
    },
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          return `${value}%`;
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
          boxWidth: 12,
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
    cutout: width/5,
  };

  return <Doughnut  id="proportionalChart" data={data} options={options} />;
};

export default RingChart;
