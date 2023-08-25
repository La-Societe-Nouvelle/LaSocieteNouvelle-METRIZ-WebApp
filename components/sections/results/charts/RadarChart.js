// La Société Nouvelle

// React
import React from "react";

import Chart from "chart.js/auto";
import { Radar } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics.json";

/* ---------- RADAR CHART ---------- */

/** Rader chart to show environnemental footprint
 *  
 *  Args :
 *    - id
 *    - indic
 *    - session,
 *    - aggregate
 *    - isPrinting -> use in report
 * 
 */

function RadarChart({ 
  labels, 
  divisionFootprint, 
  productionFootprint 
}) {

  const companyData = [];
  const reference = [];
  Object.keys(productionFootprint).forEach((indic) => {
    if (productionFootprint[indic] && divisionFootprint[indic]>0) {
      companyData.push(productionFootprint[indic]/divisionFootprint[indic]);
      reference.push(1.0);
    }
  })

  const min = 0.0;
  const max = Math.max(2.0,...companyData.map((value) => value*1.2));

  const data = {
    labels: Object.entries(productionFootprint).filter(([_,value]) => value!=null).map(([indic,_]) => {
      const label = metaIndics[indic].libelleGrandeur;
      const unit = metaIndics[indic].unit;
      return unit ? `${label} (${unit})` : label;
    }),
    datasets: [
      {
        label: "Exercice",
        data: companyData,
        fill: false,
        backgroundColor : "rgb(250,89,95)",
        pointBackgroundColor: "rgb(250,89,95)",
        pointBorderColor: "rgb(250,89,95)",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
      {
        label: "Référence",
        data: reference,
        fill: false,
        backgroundColor : "rgb(255, 182, 66)",
        pointBackgroundColor: "rgb(255, 182, 66)",
        pointBorderColor: "rgb(255, 182, 66)",
        pointHoverBackgroundColor: "rgb(255, 182, 66)",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const datasetBorderColor = (context) => {
    const datasetIndex = context.datasetIndex;
    const colors = ["rgba(250,89,95,0.5)", "rgba(255, 182, 66, 0.5)"];
    return colors[datasetIndex];
  };

  const options = {
    scales: {
      r: {
        grid: {
          color: "rgb(219, 222, 241)",
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
        suggestedMin: min,
        suggestedMax: max,
        min: min,
        max: max,
      },
    },

    elements: {
      point: {
        radius: 0,
        hoverRadius: 3,
      },
      line: {
        borderWidth: 3,
        borderColor: datasetBorderColor,
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#191558",
          font: {
            size: 12,
            weight: "600",
            family: "Raleway",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(25,21,88,0.9)",
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
        intersect: false,
      },
    },
  };

  return <Radar id="environmentalChart" data={data} options={options} />;
}

export default RadarChart;
