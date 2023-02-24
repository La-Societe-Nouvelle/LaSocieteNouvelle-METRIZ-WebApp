import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

// Libraries

const DeviationChart = ({ id, legalUnitData, branchData, unit, precision }) => {
  const labels = [
    "Production",
    "Consommations intermédiaires",
    "Consommations de capital fixe",
    "Valeur ajoutée nette",
  ];

  const data = legalUnitData.map((value, key) => {
    if (value) {
      const difference = value - branchData[key];
      const percentage = (difference / branchData[key]) * 100;
      return Math.round(percentage);
    } else {
      return 0;
    }
  });

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
        backgroundColor: ["rgb(140, 138, 171)"],
        borderWidth: 0,
        type: "bar",
        barPercentage: 1,
        categoryPercentage: 0.5,
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
            ticks: {
              display: false,
            },

            grid: {
              display: false,
            },
          },
          x: {
            min: minValue - 10,
            max: maxValue + 10,

            grid: {
              color: "#ececff",
            },
            ticks: {
              color: "#8c8aab",
              font: {
                family: "Raleway",
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
            backgroundColor: "rgba(25,21,88,0.9)",
            cornerRadius: 3,
            callbacks: {
              label: function (context) {
                let label = context.formattedValue + "%";
                return label;
              },
            },
          },
          datalabels: {
            anchor: "start",
            color: "#191558",
            align: "top",
            padding: {
              bottom: 20,
            },
            font: {
              size: 9,
              family: "Raleway",
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

export default DeviationChart;
