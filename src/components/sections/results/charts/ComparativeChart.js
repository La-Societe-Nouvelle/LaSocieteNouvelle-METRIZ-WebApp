// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics";

// Utils
import { printValue } from "/src/utils/formatters";
import { getSuggestedMax } from "./chartsUtils";
import { getPrevDate } from "../../../../utils/periodsUtils";

// Colors
import { comparativeChartColors } from "./chartColors";
import { colors } from "./chartColors"


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
    comparativeData[aggregate].area.history.data[indic].slice(-1)[0].value,
    mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value,
    comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value
  ];

  // prev footprints

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod = session.availablePeriods
    .find((period) => period.dateEnd == prevDateEnd);

  const dataset_prevFootprints = [
    null,
    prevPeriod ? mainAggregates[aggregate].periodsData[prevPeriod.periodKey].footprint.indicators[indic].value : null,
    null
  ];

  // targets

  const dataset_target = [
    comparativeData[aggregate].area.target.data[indic].length>0 ? 
      comparativeData[aggregate].area.target.data[indic].slice(-1)[0].value : null,
    null,
    comparativeData[aggregate].division.target.data[indic].length>0 ? 
      comparativeData[aggregate].division.target.data[indic].slice(-1)[0].value : null,
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
          comparativeChartColors.area,
          comparativeChartColors.legalunit,
          comparativeChartColors.branch        ],
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
          comparativeChartColors.targetarea,
          comparativeChartColors.previous,
          comparativeChartColors.targetbranch,
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
          comparativeChartColors.targetarea,
          comparativeChartColors.legalunit,
          comparativeChartColors.targetbranch,
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
          color: colors.textColor,
          font: {
            size: 10,
          },
        },
        grid: {
          color: colors.gridColor,
          lineWidth : 1,
        },
      },
      x: {
        ticks: {
          color: colors.textColor,
          font: {
            size: 12,
          },
        },
        grid: {
          lineWidth : 1,
          color: colors.gridColor,
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
        color: colors.textColor,
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
        color: colors.textColor,
        font: {
          size: 11,
        },
      },
      tooltip: {
        backgroundColor: colors.primaryBackgroundColor,
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