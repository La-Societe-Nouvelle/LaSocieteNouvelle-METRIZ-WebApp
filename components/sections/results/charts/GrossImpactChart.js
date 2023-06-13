import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Doughnut } from "react-chartjs-2";

function GrossImpactChart({intermediateConsumptions, fixedCapitalConsumptions, netValueAdded,id}) {


  let total = intermediateConsumptions + fixedCapitalConsumptions + netValueAdded;

  intermediateConsumptions = (intermediateConsumptions / total) * 100;
  fixedCapitalConsumptions = (fixedCapitalConsumptions / total) * 100;
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
          Math.round(intermediateConsumptions),
          Math.round(fixedCapitalConsumptions),
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
    layout : {
      padding : 50
    },
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

  return <Doughnut id={id} data={data} options={options} />;
}

export default GrossImpactChart;
