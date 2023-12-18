// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Doughnut } from "react-chartjs-2";

// Colors
import {
  prevAggregatesChartColors,
  aggregatesChartColors,
  tooltips,
} from "../../../../constants/chartColors";

export const GrossImpactChart = ({
  id,
  session,
  period,
  prevPeriod,
  indic,
  printMode,
}) => {
  const { financialData } = session;

  const {
    production,
  } = financialData.mainAggregates;

  const productionGrossImpacts = getGrossImpact(production, period, indic);
  const grossImpactsDistribution = calculateGrossImpactsDistribution(financialData.mainAggregates, period, indic, productionGrossImpacts);

   
  const data = {
    labels: [
      "Consommations intermédiaires",
      "Consommations de capital fixe",
      "Valeur ajoutée nette",
    ],
    datasets: [],
  };
  
  
    // prev

    if (prevPeriod) {
      const prevProductionGrossImpacts = getGrossImpact(production, prevPeriod, indic);
      const prevGrossImpactsDistribution = calculateGrossImpactsDistribution(financialData.mainAggregates, prevPeriod, indic, prevProductionGrossImpacts);
    
      const prevData = {
        data: [
          prevGrossImpactsDistribution.intermediateConsumptions,
          prevGrossImpactsDistribution.fixedCapitalConsumptions,
          prevGrossImpactsDistribution.netValueAdded,
        ],
        backgroundColor: [
          prevAggregatesChartColors.intermediateConsumptions,
          prevAggregatesChartColors.fixedCapitalConsumptions,
          prevAggregatesChartColors.netValueAdded,
        ],
        borderWidth: 2,
        weight: 0.4
  
      };
      data.datasets.push(prevData);
    }

    const currentPeriod = {
      data: [
        grossImpactsDistribution.intermediateConsumptions,
        grossImpactsDistribution.fixedCapitalConsumptions,
        grossImpactsDistribution.netValueAdded,
      ],
      backgroundColor: [
        aggregatesChartColors.intermediateConsumptions,
        aggregatesChartColors.fixedCapitalConsumptions,
        aggregatesChartColors.netValueAdded,
      ],
      borderWidth: 2,
    };
    data.datasets.push(currentPeriod);


  const options = {
    devicePixelRatio: 2,
    maintainAspectRatio: printMode ? false : true,

    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        color: "#FFFFFF",
        font: {
          size: 10,
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
        backgroundColor: tooltips.tooltipBackground,
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            let label = context.label;
            if (context.datasetIndex === 0) {
              label += " (N-1)"; 
            }
            return label;
          },
        },
      },
      
    },
    layout: {
      padding: {
        left: 50,
        right: 50,
        top : 0
      },
    },
  };
  return <Doughnut id={id} data={data} options={options} />;
};

const getGrossImpact = (aggregate, period, indic) => {
  let amount = aggregate.periodsData[period.periodKey].amount;
  let footprint = aggregate.periodsData[period.periodKey].footprint;
  return footprint.indicators[indic].getGrossImpact(amount);
};

const calculateGrossImpactsDistribution = (aggregate, period, indic, productionGrossImpacts) => {
  const impactDistribution = {
    intermediateConsumptions: Math.round(
      (getGrossImpact(aggregate.intermediateConsumptions, period, indic) /
        productionGrossImpacts) *
        100
    ),
    fixedCapitalConsumptions: Math.round(
      (getGrossImpact(aggregate.fixedCapitalConsumptions, period, indic) /
        productionGrossImpacts) *
        100
    ),
    netValueAdded: Math.round(
      (getGrossImpact(aggregate.netValueAdded, period, indic) /
        productionGrossImpacts) *
        100
    ),
  };
  return impactDistribution;
};