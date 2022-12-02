import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
// Libraries
import metaIndics from "/lib/indics";

const ComparativeGraphs = (props) => {
  const [chartData, setChartData] = useState({ datasets: [] });

  const [id, setId] = useState(props.id);
  const [unit, setUnit] = useState(metaIndics[props.indic].unit);
  const [precision, setPrecision] = useState(
    metaIndics[props.indic].nbDecimals
  );

  const chart = () => {
    const labels = ["France", "Exercice en cours", "Branche"];

    setChartData({
      labels: labels,
      datasets: [
        {
          data: props.comparativeData,
          backgroundColor: [
            "RGBA(176,185,247,1)",
            "RGBA(250,89,95,1)",
            "RGBA(255,214,156,1)",
          ],
          borderWidth: 0,
          type: "bar",
          barPercentage: 0.8,
          categoryPercentage: 0.8,
        },
        {
          label: "Objectifs 2030",
          data: props.targetData,
          backgroundColor: [
            "RGBA(215,220,251,1)",
            "RGBA(215,220,251,1)",
            "RGBA(255,234,205,1)",
          ],
          borderWidth: 0,
          barPercentage: 1,
          categoryPercentage: 0.3,
        },
      ],
    });
  };

  useEffect(() => {
    chart();
  }, [props.indic, props.comparativeData]);

  return (
    <Bar
      id={id}
      data={chartData}
      options={{
        devicePixelRatio: 2,
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: unit,
              color: "#191558",
              font : {
                size: 8,
                weight : 'bold'
              }
            },
            ticks: {
              color: "#191558",
              font : {
                size: 10,
              }
            },
            grid: {
              color: "#ececff",
            },
          },
          x: {
            ticks: {
              color: "#191558",
              font : {
                size: 12,
              }
            },
            grid: {
              color: "#ececff",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            labels: {
              display: false,
            },
          },
          title: {
            display: false,
          },
        },
      }}
    />
  );
};

export default ComparativeGraphs;
