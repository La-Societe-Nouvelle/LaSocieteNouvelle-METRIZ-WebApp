// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";
Chart.register(ChartDataLabels);

// Utils
import { getAggregatesDistribution } from "./chartsUtils";

// Styles
import { aggregatesChartColors, colors, prevAggregatesChartColors, tooltips } from "../../../../constants/chartColors";
import { getLabelPeriod, getPrevPeriod } from "../../../../utils/periodsUtils";

/* ---------- VALUE DISTRIBUTION CHART ---------- */

/** Pie chart to show production distribution between main aggregates
 *
 *  Args :
 *    - id
 *    - session
 *    - datasetOptions
 *    - printOptions
 *
 *  datasetOptions :
 *    - period
 *
 *  printOptions :
 *    - printMode -> to maintain aspect ratio
 *    - shpwPreviousPeriod
 *
 */

export const ValueDistributionChart = ({
  id,
  session,
  datasetOptions,
  printOptions,
}) => {
  // --------------------------------------------------
  // Data

  const chartData = buildChartData(session, datasetOptions, printOptions);

  // --------------------------------------------------
  // Options

  const chartOptions = buildChartOptions(printOptions);

  // --------------------------------------------------

  return <Doughnut id={id} data={chartData} options={chartOptions} />;
};

// ################################################## DATASET ##################################################

const buildChartData = (session, datasetOptions, printOptions) => {
  const { availablePeriods, financialData } = session;
  const { intermediateConsumptions, fixedCapitalConsumptions, netValueAdded } =
    financialData.mainAggregates;
  const aggregates = [
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  ];

  const { period } = datasetOptions;
  const { showPreviousData } = printOptions;

  const datasets = [];

  // --------------------------------------------------
  // Previous period
  const prevPeriod = getPrevPeriod(availablePeriods, period);
  if (showPreviousData && prevPeriod) {
    const prevPeriodDistribution = getAggregatesDistribution(
      aggregates,
      prevPeriod.periodKey
    );

    const prevPeriodData = {
      label: getLabelPeriod(prevPeriod),
      data: prevPeriodDistribution.map((aggregate) => aggregate.percentage),
      borderWidth: 2,
      backgroundColor: prevPeriodDistribution.map(
        (item) => prevAggregatesChartColors[item.id]
      ),
      weight: 0.4,
    };

    datasets.push(prevPeriodData);
  }

  // --------------------------------------------------
  // Current period

  const currPeriodDistribution = getAggregatesDistribution(
    aggregates,
    period.periodKey
  );
  const currentPeriod = {
    label: getLabelPeriod(period),
    data: currPeriodDistribution.map((aggregate) => aggregate.percentage),
    borderWidth: 2,
    backgroundColor: currPeriodDistribution.map(
      (item) => aggregatesChartColors[item.id]
    ),
  };

  datasets.push(currentPeriod);

  // --------------------------------------------------

  const chartData = {
    datasets,
    labels: [
      "Consommations intermédiaires",
      "Consommations de capital fixe",
      "Valeur ajoutée nette",
    ],
  };
  return chartData;
};

// ################################################## OPTIONS ##################################################

const buildChartOptions = () => {
  const chartOptions = {
    devicePixelRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: "bottom",

        labels: {
          boxWidth: 10,
          color: colors.textColor,
          font: {
            size: 10,
            family: "Roboto",
          },
          generateLabels: (chart) => {
            const labels = [];
            const dataset =
              chart.data.datasets.length > 1
                ? chart.data.datasets[1]
                : chart.data.datasets[0];
            chart.data.labels.forEach((label, index) => {
              labels.push({
                text: chart.data.labels[index],
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.backgroundColor[index],
                lineWidth: 0,
                hidden: false,
                boxWidth: 10,
              });
            });

            return labels;
          },
        },
      },
      datalabels: {
        align: "bottom",
        backgroundColor: colors.lightBackground,
        borderRadius: 5,
        color: colors.textColor,
        font: {
          size: 10,
          family: "Roboto",
          weight : "bold"
        },
        borderRadius: 5,
        formatter: (value) => {
          if (value !== 0) {
            return `${value}%`;
          } else {
            return null;
          }
        },
      },
      tooltip: {
        backgroundColor: tooltips.backgroundColor,
        padding: tooltips.padding,
        cornerRadius: tooltips.cornerRadius,
        callbacks: {
          label: (context) => {
            return `${context.label} : ${context.parsed}%`;
          },
          title: (context) => {
            return context[0]?.dataset.label;
          },
        },
      },
    },
  };

  return chartOptions;
};
