import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
// Libraries
import metaIndics from "/lib/indics";

const ComparativeGraphs = (props) => {

  const id  = props.id;
  const unit  = metaIndics[props.indic].unit;
  const precision = metaIndics[props.indic].nbDecimals;

  const labels = ["France", ["Exercice", "en cours"], "Branche"];

  // Remove "Branche" label if no comparative division selected
  if(props.graphDataset[2] == null) {
    labels.pop()
  }

  // Data for chart 
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Valeur ",
        data: props.graphDataset.map(data => data ? data.toFixed(precision) : null),
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
      },
      {
        label: "Objectif ",
        data: props.targetData.map(data => data ? data.toFixed(precision) : null),
        skipNull: true,
        backgroundColor: [
          "RGBA(215,220,251,1)",
          "RGBA(215,220,251,1)",
          "rgb(255 220 141)",
        ],
        borderWidth: 0,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      },
    ],
  };
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
                size: 10,
                weight : 'bolder'
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
          tooltip: {
            backgroundColor: '#191558',
            padding : 10,
            cornerRadius: 2
          }
        },
     
      }}
    />
  );
};

export default ComparativeGraphs;
