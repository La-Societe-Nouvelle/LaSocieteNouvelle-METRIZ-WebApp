import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
// Libraries
import metaIndics from "/lib/indics";

const ComparativeGraphs = (props) => {
  const [chartData, setChartData] = useState({ datasets: [] });

  const [id] = useState(props.id);
  const [unit] = useState(metaIndics[props.indic].unit);

console.log( props.targetData)
  const chart = () => {
    const labels = ["France", "Exercice en cours", "Branche"];

    if(props.comparativeData[2] == null) {
      labels.pop()
    }
    setChartData({
      labels: labels,
      datasets: [
        {
          data: props.comparativeData,
          skipNull: true,
          backgroundColor: [
            "RGBA(176,185,247,1)",
            "RGBA(250,89,95,1)",
            "RGBA(255,214,156,1)",
          ],
          borderWidth: 0,
          type: "bar",
          barPercentage: 0.6,
          categoryPercentage: 0.6,
        },
        {
          label: "Objectifs 2030",
          data: props.targetData,
          skipNull: true,
          backgroundColor: [
            "RGBA(215,220,251,1)",
            "RGBA(215,220,251,1)",
            "RGBA(255,234,205,1)",
          ],
          borderWidth: 0,
          barPercentage: 0.6,
          categoryPercentage: 0.6,
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
              },
              
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
