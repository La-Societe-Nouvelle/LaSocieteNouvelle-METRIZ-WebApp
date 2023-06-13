import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
// Libraries
import metaIndics from "/lib/indics";
import { printValue } from "/src/utils/Utils";

const ComparativeChart = (props) => {

  const id  = props.id;
  const unit  = metaIndics[props.indic].unit;
  const precision = metaIndics[props.indic].nbDecimals;
  const labels = ["France", "Exercice", "Branche" ];

  // Remove "Branche" label if no comparative division selected
  if( props.firstDataset[2] == null) {
    labels.pop()
  }
  let suggestedMax;
  if (unit == "%") {
    let max = Math.max(... props.firstDataset.map((o) => o));

    if(max < 10) {
      suggestedMax = 10;
    }
   
    switch (true) {
      case max < 10:
         suggestedMax = 10;
        break;
      case max > 10 && max < 25:
         suggestedMax = 25;
        break;
      case max > 25 && max < 50:
         suggestedMax = 50;
        break;
      default:
        suggestedMax = 100;
        break;
    }
  } else {
    suggestedMax = null;
  }

  // Data for chart 
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: [
          "Valeur",
          "Année N-1",
          "Valeur",
        ],
        data: props.firstDataset.map(data => data ? data : null),
        skipNull: true,
        backgroundColor: [
          "RGBA(176,185,247,1)",
          "RGBA(250,89,95,0.5)",
          "rgb(255, 182, 66)",
         
        ],
        borderWidth: 0,
        type: "bar",
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        minBarLength: 2,
      },
      {
        label: [
          "Objectif",
          "Année N",
          "Objectif",
        ],
        data: props.secondDataset.map(data => data ? data : null),
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
  return (
    <Bar
      id={id}
      data={chartData}
      options={{

        devicePixelRatio: 2,
        scales: {
          y: {
            display: true,
            min : 0,
            suggestedMax: suggestedMax,
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
            anchor: "end",
            align: "top",
            formatter: function (value, context) 
            {
              if(value) {
                return  printValue(value, precision) ;
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
              bottom: 20
          },
            align : "start",
            text: unit,
            color: "#191558",
            font : {
              size: 11,
            }
          },
          tooltip: {

            backgroundColor: '#191558',
            padding : 10,
            cornerRadius: 2,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label[context.dataIndex] + " :  " + context.parsed.y + " " + unit;
                return label;
              },
            },
          }
        },
     
      }}
    />
  );
};

export default ComparativeChart;
