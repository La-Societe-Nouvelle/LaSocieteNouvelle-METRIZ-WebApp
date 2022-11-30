import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";

function TrendsGraph(props) {

    console.log(props)
    const data = {
        labels:  props.comparativeData.map(data => data.year) ,
        datasets: [{
          label: 'Empreinte',
          data:  props.comparativeData.map(data => data.value) ,
          fill: false,
          borderColor: 'rgb(250, 89, 95)',
          tension: 0.1
        }]
      };


      const options = {

        scales: {
            y: {
              display: true,
              title: {
                display: true,
                text: props.unit,
                color: "#191558",
              },
              ticks: {
                color: "#191558",
              },
              grid: {
                color: '#dbdef1'
              }
            },
            x: {
                ticks: {
                  color: "#191558",

                },
                grid: {
                    color: '#dbdef1'
                  }
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
              display: true,
              text : props.title,
              color: "#191558",
            },
          },
      };

  return (
    <Line  data={data} options={options} />

    );
}

export default TrendsGraph;
