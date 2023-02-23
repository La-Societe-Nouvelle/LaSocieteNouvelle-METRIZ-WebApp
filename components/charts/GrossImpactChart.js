import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Doughnut } from "react-chartjs-2";

function GrossImpactChart(props) {
  let intermediateConsumption = props.intermediateConsumption;
  let capitalConsumption = props.capitalConsumption;
  let netValueAdded = props.netValueAdded;

  let total =
    props.intermediateConsumption +
    props.capitalConsumption +
    props.netValueAdded;

  intermediateConsumption = (intermediateConsumption / total) * 100;
  capitalConsumption = (capitalConsumption / total) * 100;
  netValueAdded = (netValueAdded / total) * 100;

  const data = {
    labels: [
      "Consommations intermédiaires",
      "Consommations de capital fixe",
      "Valeur ajoutée nette",
    ],
    datasets: [
      {
        data: [
          Math.round(intermediateConsumption),
          Math.round(capitalConsumption),
          Math.round(netValueAdded),
        ],
        skipNull: true,
        backgroundColor: [
          "rgb(25, 21, 88)",
          "rgba(25, 21, 88, 0.5)",
          "RGB(251, 122, 127)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    devicePixelRatio: 2,
    maintainAspectRatio: true,
    aspectRatio: 1, // specify aspect ratio
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "#FFF",
        font: {
          size: 18,
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
        backgroundColor: "rgba(25,21,88,0.9)",
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            let label = context.label;
            return label;
          },
        },
      },
    },
  };

  return <Doughnut id={props.id} data={data} options={options} />;
}

export default GrossImpactChart;
