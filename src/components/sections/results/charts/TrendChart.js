import React, { useEffect, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

// Utils
import { getMaxY } from "./chartsUtils";

// Colors
import { trendChartColors } from "../../../../constants/chartColors";
import { colors } from "../../../../constants/chartColors";

function TrendChart({
  historical,
  trend,
  target,
  unit,
  aggregate,
  indic,
  id,
  printMode,
}) {
  const linearTarget = target.filter(
    (data) => data.path == "LIN" && data.flag == "f"
  );

  const legalUnitData = [];

  for (const period in aggregate) {
    const periodDetails = aggregate[period];
    legalUnitData.push({
      x: period.slice(2),
      y: periodDetails.footprint.indicators[indic].value,
      r: 5,
    });
  }

  const filteredHistorical = historical.filter(
    (data) => data.currency != "EUR2022" && data.year >= legalUnitData[0].x - 10
  );

  let updatedTrend = trend;

  if (
    filteredHistorical.length > 0 &&
    trend.length > 0 &&
    filteredHistorical.at(-1).year !== trend[0].year
  ) {
    let firstYearTrend = trend.at(0).year;
    let lastYearHistorical = filteredHistorical.at(-1).year;
    updatedTrend = [
      ...trend,
      ...filteredHistorical.filter(
        (data) => data.year >= lastYearHistorical && data.year < firstYearTrend
      ),
    ].sort((a, b) => a.year - b.year);
  }

  let updatedTarget = linearTarget;

  if (
    filteredHistorical.length > 0 &&
    linearTarget.length > 0 &&
    filteredHistorical.at(-1).year !== linearTarget[0].year
  ) {
    let lastYearHistorical = filteredHistorical.at(-1).year;
    let firstYearTarget = linearTarget
      .filter((data) => data.year > lastYearHistorical)
      .at(0).year;
    updatedTarget = [
      ...linearTarget.filter((data) => data.year > lastYearHistorical),
      ...filteredHistorical.filter(
        (data) => data.year >= lastYearHistorical && data.year < firstYearTarget
      ),
    ].sort((a, b) => a.year - b.year);
  }

// Determine Y-Axis Max
  const targetValues = extractValues(target);
  const trendValues = extractValues(trend);
  const historicalValues = extractValues(historical);

  const legalUnitValues = legalUnitData.map((data) => data.y);

  const maxY = unit === "%" ? getMaxY([
          targetValues,
          trendValues,
          historicalValues,
          legalUnitValues,
        ])
      : null;

  const chartData = {
    datasets: [
      {
        label: "Historique",
        data: filteredHistorical.map((data) => ({
          x: data.year,
          y: data.value,
        })),
        borderColor: trendChartColors.trend,
        backgroundColor: trendChartColors.trend,
        order: 2,
        borderWidth: 4,
        tension: 0.3,
      },
      {
        label: "Tendance",
        data: updatedTrend.map((data) => ({ x: data.year, y: data.value })),
        borderColor: trendChartColors.trend,
        backgroundColor: trendChartColors.trend,
        borderWidth: 4,
        borderDash: [12, 6],
        order: 3,
        tension: 0.3,
      },
      {
        label: "Objectif",
        data: updatedTarget.map((data) => ({ x: data.year, y: data.value })),
        skipNull: true,
        borderColor: trendChartColors.target,
        backgroundColor: trendChartColors.target,
        borderWidth: 4,
        order: 4,
        tension: 0.3,
      },
      {
        label: "Situation",
        type: "bubble",
        data: legalUnitData,
        backgroundColor: trendChartColors.legalunit,
        borderColor: trendChartColors.legalunit,
        borderWidth: 4,
        order: 1,
        tooltip: {
          enabled: true,
        },
      },
      {
        data: legalUnitData,
        type: "line",
        borderColor: trendChartColors.legalunit,
        fill: false,
        tooltip: {
          enabled: false,
        },
      },
    ],
  };

  const commonOptions = {
    devicePixelRatio: 2,
    maintainAspectRatio: printMode ? false : true,
    pointRadius: 0,

    scales: {
      y: {
        min: 0,
        max: maxY,
        title: {
          display: false,
        },
        ticks: {
          color: colors.textColor,
          font: {
            size: 11,
            family: "Roboto",
          },
        },
        grid: {
          color: colors.gridColor,
          lineWidth: 2,
        },
      },
      x: {
        ticks: {
          color: colors.textColor,
          font: {
            size: 11,
          },
        },
        grid: {
          color: colors.gridColor,
          lineWidth: 2,
        },
        type: "time",
        time: {
          time: {
            unit: "year",
          },
        },
      },
    },

    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          fullsize: true,
          color: colors.textColor,
          padding: 20,
          font: {
            size: 12,
            family: "Roboto",
          },
          generateLabels: function (chart) {
            const dataset = chart.data.datasets;
            return dataset
              .map((data, i) => ({
                hidden: !chart.getDataVisibility(i),
                index: i,
                lineWidth: 3,
                lineDashOffset: i === 1 ? 10 : 0,
                lineDash: i === 1 ? [6, 3] : [],
                order: data.order,
                pointStyle: "line",
                strokeStyle: data.borderColor,
                text:
                  data.label === undefined || data.label === ""
                    ? null
                    : data.label,
              }))
              .filter((label) => label.text !== null)
              .filter((label) => {
                const datasetIndex = label.index;
                const dataset = chart.data.datasets[datasetIndex];
                return dataset.data.some((value) => value !== null);
              })
              .sort((a, b) => a.order - b.order);
          },
        },
        onClick(click, legendItem, legend) {
          legend.chart.toggleDataVisibility(legendItem.index);
          if (legend.chart.getDatasetMeta(legendItem.index).hidden === true) {
            legend.chart.getDatasetMeta(legendItem.index).hidden = false;
          } else {
            legend.chart.getDatasetMeta(legendItem.index).hidden = true;
          }
          legend.chart.update();
          return;
        },
      },
      datalabels: {
        labels: {
          display: false,
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
          size: 12,
        },
      },
      tooltip: {
        backgroundColor: trendChartColors.tooltipBackground,
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
        intersect: false,
        filter: function (tooltipItem) {
          return tooltipItem.datasetIndex !== 4; // Dataset à exclure
        },
        callbacks: {
          title: function (tooltipItems, data) {
            if (tooltipItems.length > 0) {
              let date = new Date(tooltipItems[0].raw.x);
              let year = date.getFullYear();
              return year;
            }
          },
          label: function (context) {
            let label = " " + context.parsed.y + " " + unit;
            return label;
          },
        },
      },
    },
  };

  return <Line data={chartData} id={id} options={{ ...commonOptions }} />;
}

const extractValues = (data) => data.map((item) => item.value);

export default TrendChart;
