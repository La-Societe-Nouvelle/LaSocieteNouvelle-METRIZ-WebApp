import React, { useEffect, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

function TrendsGraph(props) {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [options, setOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { trends, target,  unit, aggregate,indic } = props;
    const trendsDataForecast = [];

    for (const data of trends.data) {
      if (data.flag === "f") {
        trendsDataForecast.push({ x: new Date(data.year), y: data.value });
      } else {
        trendsDataForecast.push({ x: new Date(data.year), y: null });
      }
    }

    const firstForecastData = trendsDataForecast.find(
      (element) => element.y != null
    );
    let firstForecastYear = firstForecastData.x.getFullYear();

    const trendsData = [];
    for (const data of trends.data) {
      if (data.flag === "e" || data.year == firstForecastYear) {
        trendsData.push({ x: new Date(data.year), y: data.value });
      } else {
        trendsData.push({ x: new Date(data.year), y: null });
      }
    }

    const targetData = target.data.map((data) => ({
      x: data.year,
      y: data.value,
    }));


    const legalUnitData = []
    for (const period in aggregate) {

      const periodDetails = aggregate[period];

      legalUnitData.push({
        x: period.slice(2),
        y: periodDetails.footprint.indicators[indic].value,
        r: 5
      })
      
     
    }
 
    const chartData = {
      datasets: [
        {
          label: "Historique - Branche",
          data: trendsData,
          borderColor: "rgb(255, 182, 66)",
          backgroundColor: "rgb(255, 182, 66)",
          order: 2,
          borderWidth: 4,
        },
        {
          label: "Tendance - Branche",
          data: trendsDataForecast,
          borderColor: "rgb(255, 182, 66)",
          backgroundColor: "rgb(255, 182, 66)",
          borderWidth: 4,
          borderDash: [5, 8],
          order: 3,
        },
        {
          label: "Situation",
          type: "bubble",
          data: legalUnitData,
          backgroundColor: "rgb(250,89,95)",
          borderColor: "rgb(250,89,95)",
          borderWidth: 4,
          order: 1,
        },
        {
          data: legalUnitData,
          type: "line",
          borderColor: "rgb(250,89,95)",
          fill: false,
        }
      ],
    };


    if (targetData.length > 1) {
      chartData.datasets.push({
        label: "Objectif - Branche",
        data: targetData,
        skipNull: true,
        borderColor: "rgb(255, 238, 200)",
        backgroundColor: "rgb(255, 238, 200)",
        borderWidth: 4,
        order: 4,
      });
    }

    let suggestedMax;
    if (unit == "%") {
      let max = Math.max(...trends.data.map((o) => o.value));

      if (max < 10) {
        suggestedMax = 10;
      }

      switch (true) {
        case max < 10:
          suggestedMax = 10;
          break;
        case max > 10 && max < 25:
          suggestedMax = 25;
          break;
        case max > 25 && max < 50:
          suggestedMax = 50;
          break;
        default:
          suggestedMax = 100;
          break;
      }
    } else {
      suggestedMax = null;
    }

    let minYear = trendsData[0].x.getFullYear();

    const options = {
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
          min: minYear.toString(),
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
          callbacks: {
            title: function (tooltipItems, data) {
              let date = new Date(tooltipItems[0].label);
              let year = date.getFullYear();
              //Return value for title
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

    setChartData(chartData);
    setOptions(options);
    setIsLoading(false);
  }, [props.id]);

  return (
    !isLoading && <Line data={chartData} id={props.id} options={options} />
  );
}

export default TrendsGraph;
