export const ComparativeGraphsData = (title, dataset1, dataset2) => {

  let datasets = [
    {
      label: title,
      data: dataset1,
      backgroundColor: [
        "RGBA(176,185,247,1)",
        "RGBA(250,89,95,1)",
        "RGBA(255,214,156,1)",
      ],
      borderWidth: 0,
      type: "bar",
      barPercentage: 0.8,
      categoryPercentage : 0.8
    },
  ];
  if (dataset2) {
    datasets.push({
      label: "Objectifs 2030",
      data: [dataset2, null, dataset2],
      backgroundColor: ["RGBA(215,220,251,1)", null, "RGBA(255,234,205,1)"],
      borderWidth: 0,
      barPercentage: 1,
      categoryPercentage : 0.3
    });
  }
  const comparativeGraphsData = {
    datasets,
  };
  return comparativeGraphsData;
};

export const ComparativeGraphsOptions = (labels, unit) => {
  const options = {
    devicePixelRatio: 2,
    scales: {
      x : {
        labels :  labels,
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
            color: "#191558"
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
  };

  return options;
};
