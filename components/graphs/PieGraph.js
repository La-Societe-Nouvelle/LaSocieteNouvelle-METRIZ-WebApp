import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Doughnut, Pie } from "react-chartjs-2";

function PieGraph(props) {
  let intermediateConsumption = parseFloat(props.intermediateConsumption);
  let capitalConsumption = parseFloat(props.capitalConsumption);
  let netValueAdded = parseFloat(props.netValueAdded);

  let total = intermediateConsumption + capitalConsumption + netValueAdded;

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
          intermediateConsumption.toFixed(0),
          capitalConsumption.toFixed(0),
          netValueAdded.toFixed(0),
        ],
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
    cutout: 100,
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
          return value + "%";
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

export default PieGraph;
