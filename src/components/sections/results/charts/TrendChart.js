import React, { useEffect, useMemo, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
Chart.register(ChartDataLabels);

// Utils
import { getMaxY } from "./chartsUtils";

// Lib
import metaIndics from "/lib/indics";

// Styles
import { tooltips, trendChartColors } from "../../../../constants/chartColors";
import { colors } from "../../../../constants/chartColors";

/* ---------- TREND CHART ---------- */

/** Chart to show evolution through years
 *  
 *  Args :
 *    - id
 *    - session
 *    - datasetOptions
 *    - printOptions
 * 
 *  datasetOptions :
 *    - aggregate
 *    - indic
 * 
 *  printOptions :
 *    - printMode -> to maintain aspect ratio
 * 
 */

export const TrendChart = ({
  id,
  session,
  datasetOptions,
  printOptions
}) => {

  // --------------------------------------------------
  // Data

  const chartData = buildChartData(
    session,
    datasetOptions
  );

  // --------------------------------------------------
  // Options

  const chartOptions = buildChartOptions(
    printOptions,
    datasetOptions,
    chartData
  );

  // --------------------------------------------------

  return (
    <Line 
      id={id} 
      data={chartData} 
      options={chartOptions}
    />
  );
}

// ################################################## DATASET ##################################################

const buildChartData = (session,datasetOptions) => 
{
  const {
    financialData,
    comparativeData
  } = session;

  const {
    aggregate,
    indic
  } = datasetOptions;

  const datasets = [];
  const labels = [];

  // --------------------------------------------------
  // Legal unit situation & evolution

  const legalUnitData = buildLegalUnitData(
    financialData,
    aggregate,
    indic
  );

  const lastItemIndex = legalUnitData.length - 1;
  const legalunitEvolutionDataset = {
    label : "Unité légale",
    data: legalUnitData,
    type: "line",
    fill: false,
    tension: 0.3,
    borderColor : trendChartColors.previous,
    borderWidth: (context) => {
      return context.dataset.type === 'line' ? 4 : 1;
    }, 
    pointBorderColor: (context) => {
      return context.dataIndex !== lastItemIndex || legalUnitData.length == 1 ? trendChartColors.legalunit : trendChartColors.previous;
    },
    backgroundColor: (context) => {
      return context.dataIndex !== lastItemIndex || legalUnitData.length == 1 ?  trendChartColors.legalunit :  trendChartColors.previous;
    },
    pointRadius: (context) => {
      return context.dataIndex !== lastItemIndex || legalUnitData.length == 1  ?  6 :  4;
    },
 
  };
  datasets.push(legalunitEvolutionDataset);


  // --------------------------------------------------
  // Division - Historical

  const branchHistoricalData = buildBranchHistoricalData(
    comparativeData,
    aggregate,
    indic
  );
  const branchHistoricalDataset = {
    label: "Historique - Branche",
    data: branchHistoricalData.map((item) => ({
      x: item.year,
      y: item.value,
    })),
    borderColor: trendChartColors.trend,
    backgroundColor: trendChartColors.trend,
    order: 3,
    borderWidth: 4,
    tension: 0.3,
  };
  datasets.push(branchHistoricalDataset);

  // --------------------------------------------------
  // Division - Trend

  if (branchHistoricalData.length > 0)
  {
    const branchTrendData = buildBranchTrendData(
      comparativeData,
      aggregate,
      indic,
      branchHistoricalData
    );
    const branchTrendDataset ={
      label: "Tendance - Branche",
      data: branchTrendData.map((data) => ({ 
        x: data.year, 
        y: data.value 
      })),
      borderColor: trendChartColors.trend,
      backgroundColor: trendChartColors.trend,
      borderWidth: 4,
      borderDash: [12, 6],
      order: 4,
      tension: 0.3,
    };
    datasets.push(branchTrendDataset);
  }

  // --------------------------------------------------
  // Division - Target

  if (branchHistoricalData.length > 0)
  {
    const branchTargetData = buildBranchTargetData(
      comparativeData,
      aggregate,
      indic,
      branchHistoricalData
    );
    const branchTargetDataset = {
      label: "Objectif - Branche",
      data: branchTargetData.map((data) => ({ 
        x: data.year, 
        y: data.value
      })),
      skipNull: true,
      borderColor: trendChartColors.target,
      backgroundColor: trendChartColors.target,
      borderWidth: 4,
      order: 5,
      tension: 0.3,
    };
    datasets.push(branchTargetDataset);
  }

  

  const legalUnitTargetData = buildLegalUnitTargetData(comparativeData,aggregate,indic, legalUnitData);
  if (legalUnitTargetData.length > 0){
  const legalUnitTargetDataset = {
    label: "Objectif - Unité légale",
    data: legalUnitTargetData.map((data) => ({ 
      x: data.year, 
      y: data.value
    })),
    skipNull: true,
    borderColor: trendChartColors.legalunitTarget,
    backgroundColor: trendChartColors.legalunitTarget,
    borderWidth: 4,
    order: 2,
    tension: 0.3,
  };
  datasets.push(legalUnitTargetDataset);
}

  // --------------------------------------------------

  const chartData = {
    datasets,
    labels
  };

  return chartData;
}

const buildLegalUnitData = (
  financialData,
  aggregate,
  indic
) => {

  const data = [];

  const aggregateData = financialData.mainAggregates[aggregate].periodsData;

  for (const period in aggregateData) {
    const periodDetails = aggregateData[period];
    data.push({
      x: period.slice(2),
      y: periodDetails.footprint.indicators[indic].value,
      r: 5,
    });
  }
  
  return data;
}

const buildBranchHistoricalData = (
  comparativeData,
  aggregate,
  indic
) => {

  const data = comparativeData[aggregate].division.history.data[indic]
    //.filter((data) => data.currency == "CPEUR" || data.currency == "NA")
    .sort((a, b) => a.year - b.year);

  return data;
}

const buildBranchTrendData = (
  comparativeData,
  aggregate,
  indic,
  historicalData
) => {

  let lastYearHistoricalData = historicalData.at(-1).year;

  let data = comparativeData[aggregate].division.trend.data[indic]
    .filter((item) => item.year > lastYearHistoricalData)
    .concat([historicalData.at(-1)])
    .sort((a, b) => a.year - b.year);

  return data;
}

const buildBranchTargetData = (
  comparativeData,
  aggregate,
  indic,
  historicalData
) => {

  const path = "GEO";

  let lastYearHistoricalData = historicalData.at(-1).year;

  const data = comparativeData[aggregate].division.target.data[indic]
    .filter((item) => item.path == path)
    .filter((item) => item.year > lastYearHistoricalData)
    .concat([historicalData.at(-1)])
    .sort((a, b) => a.year - b.year);
  return data;
}
const buildLegalUnitTargetData = (
  comparativeData,
  aggregate,
  indic,
  legalUnitData
) => {

  let lastYearlegalUnitData = legalUnitData.at(-1).x;
  let legalUnitTargetData = comparativeData[aggregate].legalUnit.target.data[indic] ?? []
  let data = [];
  if(legalUnitTargetData.length > 0) {

      data = comparativeData[aggregate].legalUnit.target.data[indic]
      .filter((item) => parseInt(item.year) > parseInt(lastYearlegalUnitData))
      .concat([{value : legalUnitData.at(-1).y, year : legalUnitData.at(-1).x}])
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))

  }

  return data;
}

// ################################################## OPTIONS ##################################################

const buildChartOptions = (printOptions,datasetOptions,chartData) => 
{
  const {
    printMode
  } = printOptions;

  const {
    indic
  } = datasetOptions;

  const {
    unit
  } = metaIndics[indic];

  const maxY = unit === "%" ? getMaxY(chartData.datasets) : null;

  const chartOptions = {
    devicePixelRatio: 2,
    maintainAspectRatio: printMode ? false : true,
    pointRadius: 0,
    scales: {
      y: {
        offset: true,
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
          unit: "year",
          displayFormats: {
            year: "YYYY",
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
        backgroundColor: tooltips.backgroundColor,
        padding: tooltips.padding,
        cornerRadius: tooltips.cornerRadius,
        usePointStyle: true,
        intersect: false,
        callbacks: {
          title: (context) => {
            if (context[0].datasetIndex == 0) {
              return context[0]?.dataset.label;
            } else {
              return `${context[0]?.dataset.label}`;
            }
          },
          label: function (context) {

   
            if (context.dataIndex !== 0 || context.datasetIndex == 0) {
              if (context.datasetIndex == 0) {
                return `Exercice ${context.raw.x} : ${context.raw.y} ${unit}`;
              } else {
                return `${context.raw.x} : ${context.raw.y} ${unit}`;
              }
            } else {
              return null;
            }
          },
        },
      },
    },
  };

  return chartOptions;
}
