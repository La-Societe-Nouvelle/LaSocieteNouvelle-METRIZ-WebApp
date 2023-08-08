import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
// Libraries
import metaIndics from "/lib/indics";
import { printValue } from "/src/utils/Utils";

const getSuggestedMax = (max) => {
  if (max < 10) {
    return 10;
  }

  switch (true) {
    case max > 10 && max < 25:
      return 25;
    case max > 25 && max < 50:
      return 50;
    default:
      return 100;
  }
};

const ComparativeChart = ({
  id,
  indic,
  footprintDataset,
  prevFootprint,
  targetDataset,
  isPrinting,
}) => {
  const unit = metaIndics[indic].unit;
  const precision = metaIndics[indic].nbDecimals;

  const max = Math.max(...footprintDataset.map((o) => o.value));
  const suggestedMax = unit === "%" ? getSuggestedMax(max) : null;

  // Data for chart
  const chartData = {
    labels: ["France", "Exercice", "Branche"],
    datasets: [
      {
        label: "Empreinte",
        data: footprintDataset.map((data) => data ? data.value : null),
        skipNull: true,
        backgroundColor: [
          "RGBA(176,185,247,1)",
          "RGBA(250,89,95,1)",
          "rgb(255, 182, 66)",
        ],
        borderWidth: 0,
        type: "bar",
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        minBarLength: 2,
      },
      {
        label: "Valeur N-1",
        data: prevFootprint,
        skipNull: true,
        backgroundColor: [
          "RGBA(215,220,251,1)",
          "RGBA(250,89,95,1)",
          "rgb(255 220 141)",
        ],
        borderWidth: 0,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        minBarLength: 2,
      },
      {
        label: "Objectif",
        data: targetDataset.map((data) => data ? data.value : null),
        skipNull: true,
        backgroundColor: [
          "RGBA(215,220,251,1)",
          "RGBA(250,89,95,1)",
          "rgb(255 220 141)",
        ],
        borderWidth: 0,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        minBarLength: 2,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: isPrinting ? false : true,
    devicePixelRatio: 2,
    scales: {
      y: {
        display: true,
        min: 0,
        ticks: {
          color: "#191558",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "#ececff",
          lineWidth : 2,

        },
      },
      x: {
        ticks: {
          color: "#191558",
          font: {
            size: 12,
          },
        },
        grid: {
          lineWidth : 2,
          color: "#ececff",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: function (value, context) {
          if (value) {
            return printValue(value, precision);
          }
        },
        color: "#191558",
        font: {
          size: 9,
          family: "Roboto",
        },
      },
      title: {
        display: true,
        padding: {
          top: 10,
          bottom: 20,
        },
        align: "start",
        text: unit,
        color: "#191558",
        font: {
          size: 11,
        },
      },
      tooltip: {
        backgroundColor: "#191558",
        padding: 10,
        cornerRadius: 2,
        callbacks: {
          label: function (context) {
            return (
              context.dataset.label +
              " : " +
              printValue(context.parsed.y, precision) +
              " " +
              unit
            );
          },
        },
      },
    },
  };

  return (
    <Bar
      id={id}
      data={chartData}
      options={{
        ...commonOptions,
        suggestedMax: suggestedMax,
      }}
    />
  );
};

export default ComparativeChart;
