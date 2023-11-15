// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Doughnut } from "react-chartjs-2";

// Colors
import { grossImpactChartColors } from "./chartColors";

export const GrossImpactChart = ({
  id,
  session,
  period,
  indic,
  isPrinting
}) => {

  const {
    financialData
  } = session;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded
  } = financialData.mainAggregates;

  const productionGrossImpacts = getGrossImpact(production,period,indic);
  const grossImpactsDistribution = {
    intermediateConsumptions: Math.round((getGrossImpact(intermediateConsumptions,period,indic) / productionGrossImpacts) * 100),
    fixedCapitalConsumptions: Math.round((getGrossImpact(fixedCapitalConsumptions,period,indic) / productionGrossImpacts) * 100),
    netValueAdded:            Math.round((getGrossImpact(netValueAdded,period,indic) / productionGrossImpacts) * 100),
  }

  const data = {
    labels: [
      "Consommations intermédiaires",
      "Consommations de capital fixe",
      "Valeur ajoutée nette",
    ],
    datasets: [
      {
        data: [
          grossImpactsDistribution.intermediateConsumptions,
          grossImpactsDistribution.fixedCapitalConsumptions,
          grossImpactsDistribution.netValueAdded,
        ],
        skipNull: true,
        backgroundColor: [
         grossImpactChartColors.intermediateConsumptions,
        grossImpactChartColors.fixedCapitalConsumptions,
        grossImpactChartColors.netValueAdded
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    devicePixelRatio: 2,
    maintainAspectRatio: isPrinting ? false : true,

    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "#FFF",
        font: {
          size: 18,
          family: "Raleway",
          weight: "bold",
        },
        formatter: (value) => {
          if (value !== 0) {
            return value + "%";
          } else {
            return null;
          }
        },
      },
      tooltip: {
        backgroundColor: grossImpactChartColors.tooltipBackground,
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            let label = context.label;
            return label;
          },
        },
      },
    },
  };

  return <Doughnut id={id} data={data} options={options} />;
}

const getGrossImpact = (aggregate,period,indic) => {
  let amount =    aggregate.periodsData[period.periodKey].amount;
  let footprint = aggregate.periodsData[period.periodKey].footprint;
  return footprint.indicators[indic].getGrossImpact(amount);
}