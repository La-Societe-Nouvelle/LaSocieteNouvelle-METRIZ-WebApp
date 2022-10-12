export const ComparativeGraphsData = (title, labels, dataset1, dataset2) => {

  let datasets = [
    {
      label: title,
      data: dataset1,
      backgroundColor: [
        "RGBA(176,185,247,0.9)",
        "RGBA(250,89,95,0.9)",
        "RGBA(255,214,156,0.9)",
      ],
      borderWidth: 2,
      borderColor: [
        "RGBA(176,185,247,1)",
        "RGBA(250,89,95,1)",
        "RGBA(255,214,156,1)",
      ],
      type: "bar",

    },
  ];
  if (dataset2) {
    datasets.push({
        spangaps: true,
      label: "Objectif 2030",
      data: [dataset2, null, dataset2],
      backgroundColor: ["RGBA(176,185,247,0.5)", null, "RGBA(255,214,156,0.5)"],
      borderWidth: 2,
      borderColor: ["RGBA(176,185,247,0.6)", null, "RGBA(255,214,156,0.6)"],
    });
  }

  const comparativeGraphsData = {
    labels,
    datasets,
  };
  return comparativeGraphsData;
};

export const ComparativeGraphsOptions = (labels, title, unit) => {
  const options = {
    scales: {
      x: 
        {
          labels: labels,
          barThickness: 30,
          barPercentage: 1.0,
          categoryPercentage : 1.0,
        },
      y: 
        {
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
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 18,
          weight: "bold",
        },
        display: true,
        align: "center",
        position: "top",
        color: "#191558",
        text: title,
      },
    },
  };

  return options;
};
