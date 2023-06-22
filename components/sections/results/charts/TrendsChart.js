import React, { useEffect, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

function TrendsChart({ trends, target, unit, aggregate, indic, id, isPrinting }) {

  const [chartData, setChartData] = useState({
    datasets: [
      {
        label: "Historique - Branche",
        data: [],
        borderColor: "rgb(255, 182, 66)",
        backgroundColor: "rgb(255, 182, 66)",
        order: 2,
        borderWidth: 4,
        skipNull: true,
        tooltip: {
          enabled: true,
        },
      },
      {
        label: "Tendance - Branche",
        data: [],
        borderColor: "rgb(255, 182, 66)",
        backgroundColor: "rgb(255, 182, 66)",
        borderWidth: 4,
        borderDash: [5, 8],
        order: 3,
        skipNull: true,
        tooltip: {
          enabled: true,
        },
      },
      {
        label: "Objectif - Branche",
        data: [],
        skipNull: true,
        borderColor: "rgb(255, 238, 200)",
        backgroundColor: "rgb(255, 238, 200)",
        borderWidth: 4,
        order: 4,
        tooltip: {
          enabled: true,
        },
      },
      {
        label: "Situation",
        type: "bubble",
        data: [],
        backgroundColor: "rgb(250,89,95)",
        borderColor: "rgb(250,89,95)",
        borderWidth: 4,
        order: 1,
        tooltip: {
          enabled: true,
        },
      },
      {
        data: [],
        type: "line",
        borderColor: "rgb(250,89,95)",
        fill: false,
        tooltip: {
          enabled: false,
        },
      },
    ],
  });

  const [options, setOptions] = useState({});


  useEffect(() => {

    const trendsEstimatedData = [];
    const trendsForecastData = [];

    const targetData = target.data.map((data) => ({
      x: data.year,
      y: data.value,
    }));

    //separate data in trendsEstimatedData into observed trends and trend forecasts.

    for (const data of trends.data) {
      const estimatedData = {
        x: new Date(data.year),
        y: data.flag == "e" ? data.value : null,
      };
      const trendForecast = {
        x: new Date(data.year),
        y: data.flag == "f" ? data.value : null,
      };
      trendsEstimatedData.push(estimatedData);
      trendsForecastData.push(trendForecast);
    }

    const firstForecastData = trendsForecastData.find(
      (element) => element.y != null
    );

    // Get the year of the last trend data point and the year of the first forecast data point
    let lastTrendYear = trendsEstimatedData[trendsEstimatedData.length - 1].x.getFullYear();
    let firstForecastYear = firstForecastData.x.getFullYear();

    if (lastTrendYear !== firstForecastYear) {

  // If there is a gap, add a new trendsEstimatedData point with first value of trendsForecastData 
      trendsEstimatedData.push({
        x: new Date(`${firstForecastYear}`),
        y: firstForecastData.y,
      });
    }

    const legalUnitData = [];

    for (const period in aggregate) {
      const periodDetails = aggregate[period];

      legalUnitData.push({
        x: period.slice(2),
        y: periodDetails.footprint.indicators[indic].value,
        r: 5,
      });
    }

    let suggestedMax = null;
    if (unit === '%') {
      const max = Math.max(...trends.data.map(({ value }) => value));
      suggestedMax = max < 10 ? 10 : Math.ceil(max / 25) * 25;
    }
    

    setChartData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: trendsEstimatedData.filter((data) => data.y !== null),
        },
        {
          ...prevData.datasets[1],
          data: trendsForecastData.filter((data) => data.y !== null),
        },
        {
          ...prevData.datasets[2],
          data: targetData,
        },
        {
          ...prevData.datasets[3],
          data: legalUnitData,
        },
        {
          ...prevData.datasets[4],
          data: legalUnitData,
        },
      ],
    }));

    const options = {
      maintainAspectRatio: isPrinting ? false : true,
      devicePixelRatio: 2,
      pointRadius: 0,
      scales: {
        y: {
          display: true,
          min: 0,
          suggestedMax: suggestedMax,
          ticks: {
            color: "#191558",
            font: {
              size: 10,
              family: "Roboto",
            },
          },
          grid: {
            color: "#ececff",
          },
        },
        x: {
          ticks: {
            color: "#191558",
            font: {
              size: 10,
            },
          },
          grid: {
            color: "#ececff",
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
            color: "#191558",
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
                  lineDashOffset: i == 1 ? 10 : 0,
                  lineDash: i == 1 ? [5, 3] : [],
                  order: data.order,
                  pointStyle: "line",
                  strokeStyle: data.borderColor,
                  text:
                    data.label === undefined || data.label === ""
                      ? null
                      : data.label,
                }))
                .filter((label) => label.text !== null)
                .sort((a, b) => a.order - b.order);
            },
          },

          onClick(click, legendItem, legend) {
            legend.chart.toggleDataVisibility(legendItem.index);

            if (legend.chart.getDatasetMeta(legendItem.index).hidden == true) {
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
          enabled: true,
          intersect: false,
          filter: function (tooltipItem) {
            return tooltipItem.datasetIndex !== 4; // Dataset à exclure
          },
          callbacks: {
            title: function (tooltipItems, data) {
              let date = new Date(tooltipItems[0].raw.x);
              let year = date.getFullYear();
              return year;
            },
            label: function (context) {
              let label = " " + context.parsed.y + " " + unit;
              return label;
            },
          },
        },
      },
    };
    setOptions(options);
  }, [indic, aggregate, id]);
console.log(chartData)
  return <Line data={chartData} id={id} options={options} />;
}

export default TrendsChart;
