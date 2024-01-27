// La Société Nouvelle

// React
import React from 'react';
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

// Lib
import { generateFadeColors, getAggregatesDistribution } from './chartsUtils';

// Utils
import { getPrevPeriod, getYearPeriod } from '../../../../utils/periodsUtils';

// Styles
import { tooltips, colors } from '../../../../constants/chartColors';

/* ---------- STACKED HORIZONTAL BAR CHART ---------- */

/** ... add description
 *  
 *  Args :
 *    - id
 *    - session
 *    - datasetOptions
 *    - printOptions
 * 
 *  datasetOptions :
 *    - period
 *    - indic
 * 
 *  printOptions :
 *    - showPrevPeriod
 * 
 */

export const StackedHorizontalBarChart = ({ 
  id,
  session,
  datasetOptions,
  printOptions
}) => {

  // --------------------------------------------------
  // Data

  const chartData = buildChartData(
    session,
    datasetOptions,
    printOptions
  );

  // --------------------------------------------------
  // Options
    
  const chartOptions = buildChartOptions(
    printOptions
  );
  
  // --------------------------------------------------

  return (
    <Bar 
      id={id}
      data={chartData} 
      options={chartOptions} 
    />
  );
}

// ################################################## DATASET ##################################################

const buildChartData = (
  session,
  datasetOptions,
  printOptions
) => {

  const { availablePeriods, financialData } = session;
  const { 
    intermediateConsumptions, 
    fixedCapitalConsumptions, 
    netValueAdded 
  } = financialData.mainAggregates;
  const aggregates = [intermediateConsumptions, fixedCapitalConsumptions, netValueAdded];

  const {
    period
  } = datasetOptions;

  const {
    showPreviousPeriod
  } = printOptions;

  const fadeBackgroundColors = generateFadeColors("rgba(25, 21, 88, 1)", 3);
  const prevFadeBackgroundColors = generateFadeColors("rgba(163, 161, 188,1)", 3);

  const datasets = [];
  const labels = [];

  // --------------------------------------------------
  // Current period

  const aggregatesDistribution = getAggregatesDistribution(aggregates, period.periodKey);

  aggregatesDistribution.forEach((aggregateData, index) => 
  {    
    const dataset = {
      label: aggregateData.label,
      data: [ aggregateData.percentage ],
      backgroundColor: [ fadeBackgroundColors[index] ],
      categoryPercentage: 0.5,
      barPercentage: 1.0,
      skipNull : true,
    };
    datasets.push(dataset);
  });
  labels.push(getYearPeriod(period));

  // --------------------------------------------------
  // Previous period

  if (showPreviousPeriod)
  {
    const prevPeriod = getPrevPeriod(availablePeriods, period);
    const prevPeriodDistribution = getAggregatesDistribution(
      aggregates,
      prevPeriod.periodKey
    );

    // add data to datasets
    datasets.forEach((dataset,index) => 
    {    
      let aggregateData = prevPeriodDistribution[index];
      dataset.data.push(aggregateData.percentage);
      dataset.backgroundColor.push(prevFadeBackgroundColors[index]);
    });
    labels.push(getYearPeriod(prevPeriod));
  };

  // --------------------------------------------------

  const chartData = {
    datasets,
    labels
  };

  return chartData;
}

// ################################################## OPTIONS ##################################################

const buildChartOptions = (printOptions) => 
{
  const chartOptions = {
    indexAxis: "y",
    plugins: {
      legend: {
        position: "bottom",
        align : "start",
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          textAlign: "left",
          padding: 30,
          color: colors.textColor,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        backgroundColor: tooltips.tooltipBackground,
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
      },
      datalabels: {
        display : false,
      
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: colors.textColor,
          font: {
            size: 10,
          },
        },
        grid: {
          lineWidth: 1,
          color: colors.gridColor,
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: colors.textColor,
          font: {
            size: 10,
            weight: 'bold',
          },
        },
        grid: {
          color: colors.gridColor,
          lineWidth: 0,
        },
      },
    },
    layout: {
      padding: {
        top: 50,
        bottom: 50,
      },
    },
  };

  return chartOptions;
}