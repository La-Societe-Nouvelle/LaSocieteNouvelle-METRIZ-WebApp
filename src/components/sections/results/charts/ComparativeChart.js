// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics";

import { printValue } from "/src/utils/Utils";

const getSuggestedMax = (max) => {
  if (max < 10) {
    return 10;
  } else if (max < 20) {
    return 25;
  } else if (max < 45) {
    return 50;
  } else {
    return 100;
  }
};

/* ---------- COMPARATIVE CHART ---------- */

/** Bar chart to compare footprint with macro & branch
 *  
 *  Args :
 *    - id
 *    - indic
 *    - session,
 *    - aggregate
 *    - isPrinting -> use in report
 * 
 */

export const ComparativeChart = ({
  id,
  session,
  period,
  aggregate,
  indic,
  isPrinting,
}) => {

  const { unit, nbDecimals } = metaIndics[indic];

  // Datasets --------------------------------------------------------------

  const {
    financialData,
    comparativeData
  } = session
  const mainAggregates = financialData.mainAggregates;

  // current footprints

  const dataset_currentFootprints = [
    comparativeData[aggregate].area.macrodata.data[indic.toUpperCase()].slice(-1)[0].value,
    mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value,
    comparativeData[aggregate].division.macrodata.data[indic.toUpperCase()].slice(-1)[0].value
  ];

  // prev footprints

  const prevDateEnd = period.dateEnd;
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const dataset_prevFootprints = [
    null,
    prevPeriod ? mainAggregates[aggregate].periodsData[prevPeriod.periodKey].footprint.indicators[indic].value : null,
    null
  ];

  // targets

  const dataset_target = [
    comparativeData[aggregate].area.target.data[indic.toUpperCase()] ? 
      comparativeData[aggregate].area.target.data[indic.toUpperCase()].slice(-1)[0].value : null,
    null,
    comparativeData[aggregate].division.target.data[indic.toUpperCase()] ? 
      comparativeData[aggregate].division.target.data[indic.toUpperCase()].slice(-1)[0].value : null,
  ];

  // Data for chart --------------------------------------------------------

  const max = Math.max(...dataset_currentFootprints.filter((o) => o!=null));
  const suggestedMax = unit === "%" ? getSuggestedMax(max) : null;

  const chartData = {
    labels: ["France", "Exercice", "Branche"],
    datasets: [
      {
        label: "Empreinte",
        data: dataset_currentFootprints,
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
        data: dataset_prevFootprints,
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
        data: dataset_target,
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

  // Options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: isPrinting ? false : true,
    devicePixelRatio: 2,
    scales: {
      y: {
        display: true,
        min: 0,
        max: suggestedMax,
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
            return printValue(value, nbDecimals);
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
              printValue(context.parsed.y, nbDecimals) +
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
}