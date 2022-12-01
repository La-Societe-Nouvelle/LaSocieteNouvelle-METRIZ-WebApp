import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";

function TrendsGraph(props) {

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
                font : {
                  size: 8,
                  weight : 'bold'
                }
              },
              ticks: {
                color: "#191558",
                font : {
                  size: 10,
                }
              },
              grid: {
                color: '#ececff'
              }
            },
            x: {
                ticks: {
                  color: "#191558",
                  font : {
                    size: 10,
                  }
                },
                grid: {
                    color: '#ececff'
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
              padding : 20
            },
          },
      };

  return (
    <Line  data={data} options={options} />

    );
}

export default TrendsGraph;
