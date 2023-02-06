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
        datalabels: {
          color: "#FFF",
        },
        backgroundColor: [
          "rgb(25, 21, 88)",
          "rgba(25, 21, 88, 0.5)",
          "RGB(251, 122, 127)",
        ],
      },
    ],
  };

  const options = {
    devicePixelRatio: 2,

    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        fullSize: false,
        labels: {
          padding: 10 ,
          font: {
            size: 13,
          },
          boxWidth : 20,
          boxHeight : 20,
          useBorderRadius : true,
          borderRadius: 10
        },
      },
      tooltip: {
        backgroundColor: "#191558",
        padding: 10,
        cornerRadius: 2,
      },
    },
  };

  return (
    <Doughnut
      id={props.id ? props.id : "PieChart"}
      data={data}
      options={options}
    />
  );
}

export default PieGraph;
