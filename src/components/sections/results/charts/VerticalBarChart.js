// La Société Nouvelle

// React
import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

// Libraries
import metaIndics from "/lib/indics";

// utils
import { printValue } from "/src/utils/formatters";
import { changeOpacity, getSuggestedMax } from "./chartsUtils";


/* ---------- VERTICAL BAR CHART ---------- */

/** Bar chart to compare footprint with macro & branch
 *  
 *  Args :
 *    - id
 *    - indic
 *    - session,
 *    - aggregate
 *    - printMode -> use in report
 * 
 */
export const VerticalBarChart = ({
  id,
  session,
  period,
  aggregate,
  indic,
  printMode,
  showDivisionData,
  showAreaData,
  showTargetData,
  showPreviousData,
  useIndicColors,
  label
}) => {

  const { unit, nbDecimals } = metaIndics[indic];

  const indicColor = metaIndics[indic].color;
  const branchIndicColor = changeOpacity( indicColor, 0.3); 

  // Datasets --------------------------------------------------------------

  const {financialData,comparativeData} = session
  const mainAggregates = financialData.mainAggregates;
 

    // targets

    const dataset_target = [];

    let areaTargetValue = comparativeData[aggregate].area.target.data[indic].length>0 ? 
    comparativeData[aggregate].area.target.data[indic].slice(-1)[0].value : null;
    dataset_target.push(showAreaData ? areaTargetValue : null);

  // current footprints

  const dataset_currentFootprints = [];
  const labels =[];
  const backgroundColors = [];
  // area
  if (showAreaData) {
    let areaValue = comparativeData[aggregate].area.history.data[indic].slice(-1)[0].value;
    
    dataset_currentFootprints.push(areaValue);
    labels.push("France");
    backgroundColors.push("RGBA(176,185,247,1)");
  }
  // company
  let companyValue = mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value;
  dataset_currentFootprints.push(companyValue);
  labels.push(label);

  if(showAreaData && showDivisionData) {
    dataset_target.push(null);
  }

  if(useIndicColors) {
    
    backgroundColors.push(indicColor);
  }
  else {
   
    backgroundColors.push("RGBA(250,89,95,1)");

  }

  let divisionTargetValue = comparativeData[aggregate].division.target.data[indic].length>0 ? 
  comparativeData[aggregate].division.target.data[indic].slice(-1)[0].value : null;
  dataset_target.push(showDivisionData ? divisionTargetValue : null);

  // division
  if (showDivisionData) {
    let divisionValue = comparativeData[aggregate].division.history.data[indic].slice(-1)[0].value;
    dataset_currentFootprints.push(divisionValue);


    labels.push("Branche");
    if(useIndicColors) {

      backgroundColors.push(branchIndicColor);
      
    } else {
      backgroundColors.push("rgb(255, 182, 66)");
    }
  }

  // prev footprints

  const prevDateEnd = period.dateEnd;
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const dataset_prevFootprints = [
    null,
    prevPeriod ? mainAggregates[aggregate].periodsData[prevPeriod.periodKey].footprint.indicators[indic].value : null,
    null
  ];



  const datasets = [{
    label: "Empreinte",
    data: dataset_currentFootprints,
    skipNull: true,
    backgroundColor: backgroundColors,
    borderWidth: 0,
    type: "bar",
    barPercentage: 0.6,
    categoryPercentage: 0.6,
    minBarLength: 2,
  }];
  if (showPreviousData) datasets.push({
    label: "Valeur N-1",
    data: dataset_prevFootprints,
    skipNull: true,
    backgroundColor: backgroundColors,
    borderWidth: 0,
    barPercentage: 0.6,
    categoryPercentage: 0.6,
    minBarLength: 2,
  });
  if (showTargetData) datasets.push({
    label: "Objectif",
    data: dataset_target,
    skipNull: true,
    backgroundColor: backgroundColors,
    borderWidth: 0,
    barPercentage: 0.6,
    categoryPercentage: 0.6,
    minBarLength: 2,
  });

  // Data for chart --------------------------------------------------------

  const max = Math.max(...dataset_currentFootprints.filter((o) => o!=null));
  const suggestedMax = unit === "%" ? getSuggestedMax(max) : null;

  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  // Options
  const commonOptions = {
    responsive: true,
    devicePixelRatio: 2,
    aspectRatio: 1,
    layout: {
      padding : {
        left: printMode ? 0 : 10,
        right : printMode ? 0 : 10,
        top : printMode ? 0 : 30
      },
    },
    scales: {
      y: {
        display: true,
        min: 0,
        max: suggestedMax,
        ticks: {
          color: "#191558",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "rgba(245, 245, 245, 0.5)",
          lineWidth : printMode ? 0 : 1,
        },
      },
      x: {
        ticks: {
          color: "#191558",
          font: {
            size: printMode ? 12 : 9,
          },
        },
        grid: {
          lineWidth : 1,
          color: "rgba(245, 245, 245, 0.5)",
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
            return printValue(value, nbDecimals) + " " + unit;
          }
        },
        color: "#191558",
        font: {
          size: printMode ? 12 : 9,
          family: "Roboto",
        },
      },
      title: {
        display: false,
   
      },
      tooltip: {
        backgroundColor: "#191558",
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