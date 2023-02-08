import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartAnnotation from "chartjs-plugin-annotation";
Chart.register(ChartDataLabels, ChartAnnotation);
import { Doughnut } from "react-chartjs-2";

function DoughnutChart({ value, title, id }) {
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
        // backgroundColor: ["rgb(25, 21, 88)", "rgba(25, 21, 88,0.2)"],
        backgroundColor: ["RGB(82, 98, 188)", "RGB(215,220,251,1)"],
      },
    ],
  };

  const options = {
    maintainAspectRatio: true,
    devicePixelRatio: 2,
    cutoutPercentage: 80,
    hover: { mode: null },
    layout: {
      autoPadding: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      annotation: {
        annotations: [
          {
            type: "label",
   
            xValue: 2.5,
            yValue: 60,
            content: value + "%",
            color: "#191558",
            font: {
              size: 20,
              family: "Raleway",
            },
          },
        ],

      },

      tooltip: {
        enabled: false,
      },
    },
  };

  return <Doughnut id={"dn-" + id} data={data} options={options} />;
}

export default DoughnutChart;
