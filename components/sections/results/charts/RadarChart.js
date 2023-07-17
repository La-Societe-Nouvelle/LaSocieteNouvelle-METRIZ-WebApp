import React from "react";
// Modules
import Chart from "chart.js/auto";

import { Radar } from "react-chartjs-2";

function RadarChart({ labels, divisionFootprint, productionFootprint }) {
  console.log(labels);
  console.log(divisionFootprint);
  console.log(productionFootprint);

  const data = {
    labels: Object.values(labels).map((indicator) => indicator.libelleGrandeur),
    datasets: [
      {
        label: "Exercice",
        data: Object.values(productionFootprint),
        fill: true,
        backgroundColor: "rgba(250,89,95,0.4)",
        pointBackgroundColor: "rgb(250,89,95)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Branche",
        data: Object.values(divisionFootprint),
        fill: true,
        backgroundColor: "rgba(255, 182, 66,0.4)",
        pointBackgroundColor: "rgb(255, 182, 66)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 182, 66)",
      },
    ],
  };

  const options = {
    devicePixelRatio: 2,
    responsive: true,

    scales: {
      r: {
        grid: {
          color: "rgb(240, 240, 248)",
        },
        ticks: {
          display: false,
        },
        pointLabels: {
          display: true,
          font: {
            family: "Raleway",
            size: 10,
            weight: "600",
          },
          color: "#191558",
        },
      },
    },

    elements: {
      point: {
        radius: 2, // Masque les points dans le graphique
        hoverRadius: 3, // Masque les points au survol
      },
      line: {
        borderWidth: 0, // Largeur des traits du graphique
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: true,
        position: "bottom",
        padding: 0,
        labels: {
          color: "#191558",
          font: {
            size: 12,
            weight: "600",
            family: "Raleway",
          },
        },
      },
    },
  };

  return <Radar data={data} options={options} />;
}

export default RadarChart;
