import React, { useEffect, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";

function TrendsGraph(props) {

  const [data, setData] = useState({ datasets: [] });
  const [options, setOptions] = useState({});

  useEffect(() => {
    
    const trendsData = props.trends.data.map((data) =>
      data.flag == 'e'
        ? { x: data.year, y: data.value }
        : { x: data.year, y: null }
    );
    let lastNonNull = trendsData.findLast((element) => element.y != null);

    const trendsDataForecast = props.trends.data.map((data) =>
      data.flag == 'f' || data.year == lastNonNull.x
        ? { x: data.year, y: data.value }
        : { x: data.year, y: null }
    );

    console.log(trendsDataForecast);
    const targetData = props.target.data.map((data) => ({
      x: data.year,
      y: data.value,
    }));
console.log(props.unit)
    const data = {
      datasets: [
        {
          label: "Historique",
          data: trendsData,
          borderColor: "rgb(255, 182, 66)",
          backgroundColor: "rgb(255, 182, 66)",
          order: 2,
          borderWidth: 4,
        },
        {
          label: "Tendance",
          data: trendsDataForecast,
          borderColor: "rgb(255, 182, 66)",
          backgroundColor: "rgb(255, 182, 66)",
          borderWidth: 4,
          borderDash: [5, 8],
          order: 3,
        },
        {
          type: "bubble",
          label: "Unité légale analysée",
          data: [{ x: "2021", y: props.current, r: 5 }],
          backgroundColor: "rgb(250,89,95)",
          borderColor: "rgb(250,89,95)",
          borderWidth: 4,
          order: 1,
        },
      ],
    };

    if (targetData.length > 1) {
      data.datasets.push({
        label: "Objectif",
        data: targetData,
        skipNull: true,
        borderColor: "rgb(255, 238, 200)",
        backgroundColor: "rgb(255, 238, 200)",
        borderWidth: 4,
        order: 4,
      });
    }
    
    const options = {
      pointRadius: 0,
      scales: {
        y: {
          display: true,
          min: 0, 
          suggestedMax: props.unit == '%' ? 100 : null,
          title: {
            display: true,
            text: props.unit,
            color: "#191558",
            font: {
              size: 12,
              weight: "bold",
              family : 'Roboto'

            },
          },
          ticks: {
            color: "#191558",
            font: {
              size: 11,
              family : 'Roboto'

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
              size: 11,
            },
          },
          grid: {
            color: "#ececff",
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
                  text: data.label,
                }))
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
          text: props.title, 
          color: "#251f81",
          font: {
            size: 15,
            weight : 'bold',
            family : 'Raleway'
          },
          padding: {
                    top: 10,
                    bottom: 30
                }
      },
        tooltip: {
          backgroundColor: 'rgba(25,21,88,0.9)',
          padding: 15,
          cornerRadius: 3,
          usePointStyle: true,
          callbacks: {
            label: function (context) {
              let label = " " + context.parsed.y + " " + props.unit;
              return label;
            },
          },
        },
      },
    };

    setData(data);
    setOptions(options);

  }, [props]);

  return data && options && <Line data={data} options={options} />;
}

export default TrendsGraph;
