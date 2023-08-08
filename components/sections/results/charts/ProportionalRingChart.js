import React from "react";
import { Doughnut } from "react-chartjs-2";

const ProportionalRingChart = ({
  productionFootprint,
  divisionFootprint,
  metaIndicators,
}) => {
  const indicators = Object.keys(metaIndicators);

  const colors = {
    art: ["rgba(213, 181, 255, 1)", "rgba(213, 181, 255, 0.5)"],
    eco: ["rgb(204, 253, 255)", "rgba(204, 253, 255,0.5)"],
    soc: ["rgba(255, 220, 160,1)", "rgba(255, 220, 160,0.5)"],
    knw: ["rgb(226, 255, 192)", "rgba(226, 255, 192,0.5)"],
  };
  const datasets = indicators.reduce((acc, indicator) => {
    const indicatorMeta = metaIndicators[indicator];
    const production = productionFootprint[indicator] || null;
    const division = divisionFootprint[indicator] || null;

    if (production !== null && division !== null) {
      // Add a new dataset to the accumulator if the conditions are met
      acc.push({
        data: [production, division],
        backgroundColor: [colors[indicator][0], colors[indicator][1]],
        label: indicatorMeta.libelle,
        borderWidth: 4,
        hoverBorderColor: "#FFFFFF",
      });
    }

    return acc;
  }, []);
  const data = {
    labels: ["Production", "Branche"],
    datasets: datasets,
  };

  const options = {
    maintainAspectRatio: true,
    responsive: true,
    layout: {
      padding: 100,
    },
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          return `${value}%`;
        },
        color: "#191558",
        font: {
          size: 10,
          family: "Roboto",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label;
            const value = context.parsed;
            return `${label}: ${value}%`;
          },
        },
      },
      legend: {
        display: true,
        position: "bottom",
        align: "start",
        labels: {
          boxWidth: 12,
          font: {
            size: 10,
          },
          generateLabels: (chart) => {
            const labels = [];
            const uniqueIndicators = new Set();
            chart.data.datasets.forEach((dataset) => {
              const indicator = dataset.label;
              if (!uniqueIndicators.has(indicator)) {
                uniqueIndicators.add(indicator);
                const backgroundColor = dataset.backgroundColor[0];
                labels.push({
                  text: indicator,
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  lineWidth: 1,
                  hidden: false,
                  boxWidth: 10,
                });
              }
            });
            return labels;
          },
        },
      },
    },
    cutout: 20,
  };

  return <Doughnut data={data} options={options} />;
};

export default ProportionalRingChart;
