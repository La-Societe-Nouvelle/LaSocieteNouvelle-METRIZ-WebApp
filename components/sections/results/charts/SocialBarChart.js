import React from 'react';
import { Bar } from 'react-chartjs-2';

const SocialBarChart = ({
  productionFootprint,
  divisionFootprint,
  metaIndicators,
}) => {

  const indicators = Object.keys(metaIndicators);
const productionData = indicators.map(indicator => productionFootprint[indicator]);
const divisionData = indicators.map(indicator => divisionFootprint[indicator]);

const labels = indicators.map(indicator => metaIndicators[indicator].libelle);



  const datasets = [
    {
      label: 'Production',
      backgroundColor: 'rgba(250, 89, 95,1)',
      borderColor: 'rgba(250, 89, 95,0.9)',
      borderWidth: 2, 
      data: productionData,
    },
    {
      label: 'Branche',
      backgroundColor: 'rgba(255, 220, 160,1)',
      borderColor: 'rgba(255, 220, 160,0.9)',
      borderWidth: 2,
      data: divisionData
    }
  ];

  const data = {
    labels : labels,
    datasets : datasets,
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    devicePixelRatio: 2,
    layout : {
      padding : 30,
    },
    scales: {
      y: {
        display: true,
        beginAtZero: true,
        ticks: {
          color: '#191558',
          font: {
            size: 10,
          },
        },
        grid: {
          color: '#ececff',
          lineWidth: 2,
        },
      },
      x: {
        ticks: {
          color: '#191558',
          font: {
            size: 12,
          },
        },
        grid: {
          lineWidth: 2,
          color: '#ececff',
        },
      },
    },
    plugins: {
      datalabels: {
       display : false
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 10,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
  };
  

  return <Bar data={data} options={{ ...commonOptions }} />;
};

export default SocialBarChart;