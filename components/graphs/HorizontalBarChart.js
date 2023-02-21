import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
// Libraries

const DeviationChart = ({ id, legalUnitData, branchData, unit, precision }) => {
  const labels = [
    "Production",
    "Consommations intermédiaires",
    "Consommations de capital fixe",
    "Valeur ajoutée nette",
  ];

  const data = legalUnitData.map(
    (value, key) =>
      value.toFixed(precision) - branchData[key].toFixed(precision)
  );

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
        backgroundColor: data.map((value) =>
          value > 0 ? "RGBA(250,89,95,0.5)" : "rgba(25, 21, 88, 0.5)"
        ),
        borderWidth: 0,
        type: "bar",
        barPercentage: 0.9, 
        categoryPercentage: 0.4, 
      },
    ],
  };
  return (
    <Bar
      id={id}
      data={chartData}
      options={{
        devicePixelRatio: 3,
        indexAxis: "y",
        scales: {
          y: {
            ticks: {
              display: false,
            },

            grid: {
              display:false,
            },
          },
          x: {
            min: minValue, 
            max: maxValue, 
            grid: {
              color: "#ececff",
            },
            ticks: {
              color: "#191558",
              font: {
                family: "Raleway",
              },
              callback: function (value, index, values) {
                return value === 0 ? value : "";
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
                let label = context.formattedValue + " " + unit;
                return label;
              },
            },
          },
          datalabels: {
            color: "#ffffff",
            font: {
              size: 10,
              family: "Raleway",
            },
      
          },
        },
      }}
    />
  );
};

export default DeviationChart;
