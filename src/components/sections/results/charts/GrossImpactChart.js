// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Doughnut } from "react-chartjs-2";

// Utils
import { getLabelPeriod, getPrevPeriod } from "../../../../utils/periodsUtils";

// Colors
import {
  prevAggregatesChartColors,
  aggregatesChartColors,
  tooltips,
  colors,
} from "../../../../constants/chartColors";

/* ---------- GROSS IMPACT CHART ---------- */

/** Chart to show production impact distribution through main aggregates
 *  
 *  Args :
 *    - id
 *    - session
 *    - datasetOptions
 *    - printOptions
 * 
 *  datsetOptions :
 *    - period
 *    - indic
 * 
 *  printOpions :
 *    - printMode -> to maintain aspect ratio
 *    - showPreviousPeriod
 * 
 */

export const GrossImpactChart = ({
  id,
  session,
  datasetOptions,
  printOptions
}) => {

  // --------------------------------------------------
  // data
   
  const chartData = buildChartData(
    session,
    datasetOptions,
    printOptions
  );

  // --------------------------------------------------
  // chart options

  const chartOptions = buildChartOptions(printOptions);

  // --------------------------------------------------

  return (
    <Doughnut 
      id={id} 
      data={chartData} 
      options={chartOptions}
    />
  );
};

// ################################################## DATASET ##################################################

const buildChartData = (session,datasetOptions,printOptions) => 
{
  const { availablePeriods, financialData } = session;
  const {
    production,
  } = financialData.mainAggregates;

  const {
    period,
    indic
  } = datasetOptions;

  const {
    showPrevPeriod
  } = printOptions;

  // --------------------------------------------------

  const chartData = {
    labels: [
      "Consommations intermédiaires",
      "Consommations de capital fixe",
      "Valeur ajoutée nette",
    ],
    datasets: [],
  };

  // --------------------------------------------------
  // prev period

  const prevPeriod = getPrevPeriod(availablePeriods,period);
  if (showPrevPeriod && prevPeriod) 
  {
    const prevProductionGrossImpacts = getGrossImpact(production, prevPeriod, indic);
    const prevGrossImpactsDistribution = getGrossImpactsDistribution(financialData.mainAggregates, prevPeriod, indic, prevProductionGrossImpacts);
  
    const prevData = {
      label: getLabelPeriod(prevPeriod),
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

    chartData.datasets.push(prevData);
  }

  // --------------------------------------------------
  // current period

  const productionGrossImpacts = getGrossImpact(production, period, indic);
  const grossImpactsDistribution = getGrossImpactsDistribution(financialData.mainAggregates, period, indic, productionGrossImpacts);

  const currentPeriod = {
    label: getLabelPeriod(period),
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
  
  chartData.datasets.push(currentPeriod);

  // --------------------------------------------------

  return chartData;
}

const getGrossImpact = (aggregate, period, indic) => {
  let amount = aggregate.periodsData[period.periodKey].amount;
  let footprint = aggregate.periodsData[period.periodKey].footprint;
  return footprint.indicators[indic].getGrossImpact(amount);
};

const getGrossImpactsDistribution = (mainAggregates, period, indic, productionGrossImpacts) => {

  const {
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded
  } = mainAggregates;

  const impactDistribution = {
    intermediateConsumptions: Math.round(
      (getGrossImpact(intermediateConsumptions, period, indic) /
        productionGrossImpacts) *
        100
    ),
    fixedCapitalConsumptions: Math.round(
      (getGrossImpact(fixedCapitalConsumptions, period, indic) /
        productionGrossImpacts) *
        100
    ),
    netValueAdded: Math.round(
      (getGrossImpact(netValueAdded, period, indic) /
        productionGrossImpacts) *
        100
    ),
  };

  return impactDistribution;
};

// ################################################## OPTIONS ##################################################

const buildChartOptions = (printOptions) => 
{
  const {
    printMode
  } = printOptions;

  // --------------------------------------------------

  const chartOptions = {
    devicePixelRatio: 2,
    maintainAspectRatio: printMode ? false : true,
    plugins: {
      legend: {
        display:  printMode ? false : true,
        position: "bottom",
        labels: {
          boxWidth: 10,
          color : colors.textColor,
          font: {
            size: 10,
            family: "Roboto",
          },
          generateLabels: (chart) => {
            const labels = [];
            const dataset = chart.data.datasets.length > 1? chart.data.datasets[1] :chart.data.datasets[0];  
            chart.data.labels.forEach((label,index) => {
              labels.push({
                text: chart.data.labels[index],
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.backgroundColor[index],
                lineWidth: 0,
                hidden: false,
                boxWidth: 10,
              });
                    
            })
        
            return labels;
          },
       
        },
      },
      datalabels: {
        align : printMode ? "center" : "bottom",
        backgroundColor : printMode ? colors.transparent : colors.lightBackground,
        borderRadius: 5,
        color : printMode ? "#FFF" : colors.textColor,
        font: {
          size: printMode ? 32 : 10,
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
            const value = context.parsed;
            return `Empreinte  ${value}%`;
          },
          title: (context) => {
            return context[0]?.dataset.label
          },

        },
      },
      
    },
    
  };

  return chartOptions;
}