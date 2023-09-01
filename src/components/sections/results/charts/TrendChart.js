import React, { useEffect, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import { getSuggestedMax } from "../utils";

function TrendChart({
  historical,
  trend,
  target,
  unit,
  aggregate,
  indic,
  id,
  isPrinting,
}) {
  
  const [max, setMax] = useState(null);
  const linearTarget = target.filter((data) => data.path == "LIN" && data.flag == "f");

  const legalUnitData = [];

  useEffect(() => {
    if (unit === "%") {
      setMax(getSuggestedMax(Math.max(...trend.map((o) => o.value))));
    }
  }, [unit, trend]);

  for (const period in aggregate) {
    const periodDetails = aggregate[period];
    legalUnitData.push({
      x: period.slice(2),
      y: periodDetails.footprint.indicators[indic].value,
      r: 5,
    });
  }

  const filteredHistorical = historical.filter((data) => data.currency != "EUR2022" && data.year >=  (legalUnitData[0].x - 10 ));



  let updatedTrend = trend;

if (filteredHistorical.length > 0 && trend.length > 0 && filteredHistorical[filteredHistorical.length - 1].year !== trend[0].year) {
  updatedTrend = [...trend, filteredHistorical[filteredHistorical.length - 1]].sort((a, b) => a.year - b.year);
}

  const chartData = {
    datasets: [
      {
        label: "Historique",
        data: filteredHistorical.map((data) => ({ x: data.year, y: data.value })),
        borderColor: "rgb(255, 182, 66)",
        backgroundColor: "rgb(255, 182, 66)",
        order: 2,
        borderWidth: 4,
        tension: 0.3,
      },
      {
        label: "Tendance", 
        data: updatedTrend.map((data) => ({ x: data.year, y: data.value })),
            borderColor: "rgb(255, 182, 66)",
        backgroundColor: "rgb(255, 182, 66)",
        borderWidth: 4,
        borderDash: [12, 6],
        order: 3,
        tension: 0.3,
      },
      {
        label: "Objectif",
        data: linearTarget.map((data) => ({ x: data.year, y: data.value })),
        skipNull: true,
        borderColor: "rgb(255, 238, 200)",
        backgroundColor: "rgb(255, 238, 200)",
        borderWidth: 4,
        order: 4,
        tension: 0.3,
      },
      {
        label: "Situation",
        type: "bubble",
        data: legalUnitData,
        backgroundColor: "rgb(250,89,95)",
        borderColor: "rgb(250,89,95)",
        borderWidth: 4,
        order: 1,
        tooltip: {
          enabled: true,
        },
      },
      {
        data: legalUnitData,
        type: "line",
        borderColor: "rgb(250,89,95)",
        fill: false,
        tooltip: {
          enabled: false,
        },
      },
    ],
  };



  const commonOptions = {
    devicePixelRatio: 2,
    maintainAspectRatio: isPrinting ? false : true,
    pointRadius: 0,
    
    scales: {
      y: {
        min: 0,
        title: {
          display: false,
        },
        ticks: {
          color: "#191558",
          font: {
            size: 11,
            family: "Roboto",
          },
        },
        grid: {
          color: "#ececff",
          lineWidth : 2,
        },
      },
      x: {
        ticks: {
          color: "#191558",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#ececff",
          lineWidth : 2,
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
          color: "#191558",
          padding: 20,
          font: {
            size: 12,
            family: "Roboto",
          },
          generateLabels: function (chart) {
            const dataset = chart.data.datasets;
            return dataset
              .map((data, i) => (
                {
                hidden: !chart.getDataVisibility(i) ,
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
        color: "#191558",
        font: {
          size: 12,
        },
      },
      tooltip: {
        backgroundColor: "rgba(25,21,88,0.9)",
        padding: 15,
        cornerRadius: 3,
        usePointStyle: true,
        intersect: false,
        filter: function (tooltipItem) {
          return tooltipItem.datasetIndex !== 4; // Dataset à exclure
        },
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

export default TrendChart;
