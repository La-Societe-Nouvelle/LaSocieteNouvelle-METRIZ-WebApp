import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics.json";

// Utils
import { roundValue } from "/src/utils/Utils";
import { changeOpacity, getCutOut } from "./chartsUtils";

const RingChart = ({
  session,
  period,
  aggregate,
  indic,
  cutOut
}) => {

  const [width, setWidth] = useState(100);

  const {financialData,comparativeData} = session;

  const companyFootprint = financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
  const divisionFootprint = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;

  const backgroundColor = "rgba(245, 245, 245, 0.75)";
  const backgroundColorBis = "rgba(245, 245, 245, 0)";

  const indicColor = metaIndics[indic].color;
  const branchIndicColor = changeOpacity( indicColor, 0.3); 

  const datasets = [{
    data: [divisionFootprint,roundValue(100-divisionFootprint,2)],
    backgroundColor: [branchIndicColor, backgroundColorBis],
    label: "Branche",
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
  },{
    data: [companyFootprint,roundValue(100-companyFootprint,2)],
    backgroundColor: [indicColor, backgroundColor],
    label: financialData.mainAggregates[aggregate].label,
    borderWidth: 0,
    hoverBorderColor: "#FFFFFF",
    }
  ];

  const data = {
    labels: [financialData.mainAggregates[aggregate].label],
    datasets: datasets,
  };

  const handleResize = (chart) => {
    setWidth(chart.canvas.width)
  };

  const options = {
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
    cutout:getCutOut(width,cutOut ?? 5),
  };

  return <Doughnut  data={data} options={options} />;
};

export default RingChart;
