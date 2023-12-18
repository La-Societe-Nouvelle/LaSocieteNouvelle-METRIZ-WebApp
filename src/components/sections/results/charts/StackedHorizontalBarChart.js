import React from 'react';
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

// Colors
import { colors, aggregatesChartColors } from "./chartColors";

// Lib
import { generateFadeColors, getAggregatesDistribution } from './chartsUtils';

const StackedHorizontalBarChart = ({ financialData, period, prevPeriod, indic }) => {

  const { intermediateConsumptions, fixedCapitalConsumptions, netValueAdded } = financialData.mainAggregates;

  const aggregatesDistribution = getAggregatesDistribution([intermediateConsumptions, fixedCapitalConsumptions, netValueAdded], period.periodKey);

  const prevAggregateDistribution = prevPeriod
    ? getAggregatesDistribution([intermediateConsumptions, fixedCapitalConsumptions, netValueAdded], prevPeriod.periodKey)
    : null;

  const fadeBackgroundColors = generateFadeColors("rgba(25, 21, 88, 1)", 3);
  const prevFadeBackgroundColors = generateFadeColors("rgba(163, 161, 188,1)", 3);

  const periods = [period.periodKey, prevPeriod?.periodKey ?? null]; 

  const chartData = {
    labels: periods.map((period) => period?.substring(2)),
    datasets: [],
  };

  aggregatesDistribution.forEach((aggregate, index) => {
    const matchingPrevAggregate = prevAggregateDistribution
      ? prevAggregateDistribution.find((prevAggregate) => prevAggregate.id === aggregate.id)
      : null;

    const dataset = {
      label: aggregate.label,
      data: [
        aggregate.percentage,
        matchingPrevAggregate ? matchingPrevAggregate.percentage : 0,
      ],
      backgroundColor: [
        fadeBackgroundColors[index],
        matchingPrevAggregate ? prevFadeBackgroundColors[index] : 'transparent', 
      ],
      categoryPercentage: 0.5,
      barPercentage: 1.0,
      skipNull : true,
    };

    chartData.datasets.push(dataset);
  });

    
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
            backgroundColor: aggregatesChartColors.tooltipBackground,
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

  return  <Bar data={chartData} options={chartOptions} />;
};

export default StackedHorizontalBarChart;
