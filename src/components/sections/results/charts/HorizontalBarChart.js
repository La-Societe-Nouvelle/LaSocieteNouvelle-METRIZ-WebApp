// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { aggregatesChartColors, colors, prevAggregatesChartColors } from "../../../../constants/chartColors";
Chart.register(ChartDataLabels);

// Libraries

// to rename

const HorizontalBarChart = ({ 
  id,
  session,
  period,
  indic 
}) => {

  const {
    financialData,
    comparativeData
  } = session;

  const labels = [
    "Production",
    "Consommations intermédiaires",
    "Consommations de capital fixe",
    "Valeur ajoutée nette",
  ];

  const aggregates = [
    "production",
    "intermediateConsumptions",
    "fixedCapitalConsumptions",
    "netValueAdded"
  ];

  const data = [];
  for (let aggregate of aggregates) {
    let companyFootprint = financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
    let divisionFootprint = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
    
    if (divisionFootprint !== 0) {
      let value = Math.round((companyFootprint - divisionFootprint) / divisionFootprint * 100);
      data.push(value);
    } else {

      data.push(0);
    }
  }
  
  const maxValue = Math.max(
    Math.abs(Math.min(...data)),
    Math.abs(Math.max(...data))
  );
  const minValue = -maxValue;

  // Data for chart
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: prevAggregatesChartColors.production,
        borderWidth: 0,
        type: "bar",
        borderWidth: 0,
        barPercentage: 1,
        categoryPercentage: 0.70,
        minBarLength: 2,
      },
    ],
  };
  return (
    <Bar
      id={id}
      data={chartData}
      options={{
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
      }}
    />
  );
};

export default HorizontalBarChart;
