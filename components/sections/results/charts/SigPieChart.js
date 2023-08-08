import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartAnnotation from "chartjs-plugin-annotation";
Chart.register(ChartDataLabels, ChartAnnotation);
import { Doughnut } from "react-chartjs-2";

function SigPieChart({ value, title, id,isPrinting }) {
  const chartData = [value, 100 - value];
  const filteredData = chartData.filter((d) => d !== 0);

  const data = {
    labels: [title, ""],
    datasets: [
      {
        data: filteredData,
        datalabels: {
          display: false,
        },

        borderAlign: "inner",
        borderWidth: 0,
        backgroundColor: ["RGB(25, 21, 88)", "RGB(215,220,251,1)"],
      },
    ],
  };
  const options = {
    devicePixelRatio: 2,
    responsive: true,
    maintainAspectRatio: isPrinting ? false : true,
    cutout: 55,
    hover: { mode: null },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },

      annotation: {
        annotations: [
          {
            type: "label",
            xScaleID: "x-axis-0", // Modifier cette ligne
            x: "50%",
            y: "50%",
            content: value + "%",
            color: "#191558",
            font: {
              size: 20,
              family: "Raleway",
              weight: "bold",
            },
          },
        ],
      },

      tooltip: {
        enabled: false,
      },
    },
  };

  return <Doughnut id={id} data={data} options={options} />;
}

export default SigPieChart;
