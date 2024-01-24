import React, { useEffect, useMemo, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

// Utils
import { getSuggestedMax } from "./chartsUtils";

// Colors
import { trendChartColors } from "./chartColors";
import { colors } from "./chartColors";

function TrendChart({
  id,
  unit,
  historical,
  trend,
  target,
  legalUnitTarget,
  aggregate,
  indic,
  isPrinting,
}) {
  const [max, setMax] = useState(null);
  const legalUnitData = [];

  useEffect(() => {
    if (unit === "%") {
      setMax(getSuggestedMax(Math.max(...trend.map((o) => o.value))));
    }
  }, [unit, aggregate]);

  for (const period in aggregate) {
    const periodDetails = aggregate[period];
    legalUnitData.push({
      x: period.slice(2),
      y: periodDetails.footprint.indicators[indic].value,
      r: 5,
    });
  }

  const startYear = legalUnitData[0].x - 10;
  const historicalData = historical.filter(
    (data) => data.currency != "EUR2022" && data.year >= startYear
  );
  const linearTarget = target.filter(
    (data) => data.path == "LIN" && data.flag == "f"
  );

  const chartData = useMemo(() => {
    const datasets = [
      buildHistoricalDataset(historicalData),
      buildTrendDataset(trend, historicalData),
      buildTargetDataset(linearTarget, historicalData),
      buildLegalUnitLineDataset(legalUnitData),
    ];

    if (legalUnitTarget) {
      const customLegalUnitTarget = buildLegalUnitTargetdataset(legalUnitTarget);
      datasets.push(customLegalUnitTarget);
    }

    return { datasets };
  }, [historicalData, trend, linearTarget, legalUnitData, legalUnitTarget]);

  
  const commonOptions = {
    devicePixelRatio: 2,
    maintainAspectRatio: isPrinting ? false : true,
    scales: {
      y: {
        min: 0,
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
        position: "right",
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

  return (
    <Line
      data={chartData}
      id={id}
      options={{ ...commonOptions, suggestedMax: max }}
    />
  );
}

function buildHistoricalDataset(historicalData) {
  return {
    label: "Historique",
    data: historicalData.map((item) => ({ x: item.year, y: item.value })),
    borderColor: trendChartColors.trend,
    backgroundColor: trendChartColors.trend,
    order: 2,
    borderWidth: 4,
    pointRadius: 0,
    tension: 0.3,
  };
}

function buildTrendDataset(trend, historicalData) {
  const trendData = mergeMissingYears(trend, historicalData);

  return {
    label: "Tendance",
    data: trendData.map((item) => ({ x: item.year, y: item.value })),
    borderColor: trendChartColors.trend,
    backgroundColor: trendChartColors.trend,
    borderWidth: 4,
    borderDash: [12, 6],
    order: 3,
    pointRadius: 0,
    tension: 0.3,
  };
}

function mergeMissingYears(trendData, historicalData) {
  if (
    historicalData.length > 0 &&
    trendData.length > 0 &&
    historicalData.at(-1).year !== trendData[0].year
  ) {
    const firstYearTrend = trendData.at(0).year;
    const lastYearHistorical = historicalData.at(-1).year;
    return [
      ...trendData,
      ...historicalData.filter(
        (data) => data.year >= lastYearHistorical && data.year < firstYearTrend
      ),
    ].sort((a, b) => a.year - b.year);
  }
  return trendData;
}
function buildTargetDataset(target, historicalData) {
  const targetData = mergeTargetData(target, historicalData);
  return {
    label: "Objectif de la branche",
    data: targetData.map((item) => ({ x: item.year, y: item.value })),
    skipNull: true,
    borderColor: trendChartColors.target,
    backgroundColor: trendChartColors.target,
    borderWidth: 4,
    order: 4,
    pointRadius: 0,
    tension: 0.3,
  };
}

function buildLegalUnitTargetdataset(legalUnitTarget) {

  return {
    label: "Objectif de l'unité légale",
    data: legalUnitTarget.map((item) => ({ x: item.year, y: item.value })),
    borderColor: trendChartColors.legalunitTarget,
    backgroundColor: trendChartColors.legalunitTarget,
    borderWidth: 4,
    pointRadius: 0,
    tension: 0.3,
  };
}

function mergeTargetData(targetData, historicalData) {
  if (
    historicalData.length > 0 &&
    targetData.length > 0 &&
    historicalData.at(-1).year !== targetData[0].year
  ) {
    const lastYearHistorical = historicalData.at(-1).year;
    const firstYearTarget = targetData
      .filter((data) => data.year > lastYearHistorical)
      .at(0).year;
    return [
      ...targetData.filter((data) => data.year > lastYearHistorical),
      ...historicalData.filter(
        (data) => data.year >= lastYearHistorical && data.year < firstYearTarget
      ),
    ].sort((a, b) => a.year - b.year);
  }
  return targetData;
}

function buildLegalUnitLineDataset(data) {
  return {
    label: "Situation",
    data: data,
    borderColor: trendChartColors.legalunit,
    tension: 0.3,
    borderWidth: 4,
    backgroundColor : trendChartColors.legalunit,
    pointRadius: 5,
    tooltip: {
      enabled: false,
    },
  };
}

export default TrendChart;
