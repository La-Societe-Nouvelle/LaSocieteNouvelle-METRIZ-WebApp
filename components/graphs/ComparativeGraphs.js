import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
// Libraries
import metaIndics from "/lib/indics";

const ComparativeGraphs = (props) => {

  const [chartData, setChartData] = useState({ datasets: [] });
  const [sectorData, setSectorData] = useState(props.sectorData);
  const [legalunitData, setLegalUnitData] = useState(props.legalunitData);
  const [divisionData, setDivisionData] = useState(props.divisionData);
  const [targetBranchData, setTargetBranchData] = useState(props.targetBranchData);
  const [targetAreaData, setTargetAreaData] = useState(props.targetAreaData);

  const [titleChart] = useState(props.titleChart);
  const [id, setId] = useState(props.id);
  const [unit, setUnit] = useState(metaIndics[props.indic].unit);
  const [precision, setPrecision] = useState(metaIndics[props.indic].nbDecimals);

  const chart = () => {
    const values = [sectorData, legalunitData];
    const labels = ["France", "Exercice en cours"];
    if (divisionData) {
      values.push(divisionData);
      labels.push("Branche");
    }
    const valuesTarget = [];

    if(targetBranchData) {
        valuesTarget.push(targetAreaData.toFixed(precision));
        valuesTarget.push(0);
        valuesTarget.push(targetBranchData.toFixed(precision));
    }
    setChartData({
      labels: labels,
      datasets: [
        {
          label: titleChart,
          data: values.map((value) =>
            value ? value.toFixed(precision) : null
          ),
          backgroundColor: [
            "RGBA(176,185,247,1)",
            "RGBA(250,89,95,1)",
            "RGBA(255,214,156,1)",
          ],
          borderWidth: 0,
          type: "bar",
          barPercentage: 0.8,
          categoryPercentage: 0.8,
        },
        {
          label: "Objectifs 2030",
          data: valuesTarget,
          backgroundColor: ["RGBA(215,220,251,1)", null, "RGBA(255,234,205,1)"],
          borderWidth: 0,
          barPercentage: 1,
          categoryPercentage: 0.3,
        },
      ],
    });
  };

  useEffect(async() => {

    setUnit(metaIndics[props.indic].unit);
    setPrecision(metaIndics[props.indic].nbDecimals);
    setDivisionData(props.divisionData);
    setLegalUnitData(props.legalunitData);
    setSectorData(props.sectorData);
    setTargetBranchData(props.targetBranchData);
    setTargetAreaData(props.targetAreaData);
    setId(props.id);
 
     chart();
  }, [props, targetBranchData, divisionData, legalunitData, sectorData]);

  return (
  
      <Bar
        id={id}
        data={chartData}
        options={{
          devicePixelRatio: 2,
          scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: unit,
                color: "#191558",
              },
              ticks: {
                color: "#191558",
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              labels: {
                display: false,
              },
            },
            title: {
              display: false,
            },
          },
        }}
      />
 
  );
};

export default ComparativeGraphs;
