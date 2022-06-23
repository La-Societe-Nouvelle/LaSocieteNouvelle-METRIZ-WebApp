import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Pie } from "react-chartjs-2";

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
          intermediateConsumption.toFixed(1),
          capitalConsumption.toFixed(1),
          netValueAdded.toFixed(1),
        ],
        datalabels: {
          color: "#FFF",
          labels: {
            title: {
              font: {
                weight: "bold",
              },
            },
          },
        },
        backgroundColor: [
          "RGB(251, 122, 127)",
          "RGB(219, 222, 241)",
          "RGB(82, 98, 188)",
        ],
      },
    ],
  };

  const options = {
    responsive: true,

        plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <Pie id={props.id ? props.id : "PieChart"} data={data} options={options} />
  );
}

export default PieGraph;
