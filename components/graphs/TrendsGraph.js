import React from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";

function TrendsGraph(props) {

    const data = {
        labels:  props.trends.map(data => data.year) ,
        datasets: [{
          label: 'Tendance',
          data:  props.trends.map(data => data.year <= 2020 ? data.value : null),
          fill: false,
          borderColor: 'rgb(255, 214, 156)',
          backgroundColor: 'rgb(255, 214, 156)',
          tension: 0.1,
          borderDash: [5,0]
        },
        {
          label: 'Objectif',
          data:  props.trends.map(data => data.year <= 2020 ? data.value + 50 : null),
          fill: false,
          borderColor: 'rgb(255, 234, 205)',
          backgroundColor: 'rgb(255, 234, 205)',
          tension: 0.1,
          borderDash: [5,0]
        },
        {
          data:  props.trends.map(data => data.year >= 2020 ? data.value : null),
          fill: false,
          borderColor: 'rgb(255, 214, 156)',
          backgroundColor: 'rgb(255, 214, 156)',
          tension: 0.1,
           borderDash: [5,5]
        },
        {
          data:  props.trends.map(data => data.year >= 2020 ? data.value + 50 : null),
          fill: false,
          borderColor: 'rgb(255, 234, 205)',
          backgroundColor: 'rgb(255, 234, 205)',
          tension: 0.1,
          borderDash: [5,5]
        },
        {
          
          type: 'bubble',
          label : "Exercice en cours",
          data: [
            {x: "2022", y: props.current,  r: 5}
          ],
          backgroundColor : 'rgb(250,89,95)',        },
      ],
        
        
      };


      const options = {
        pointRadius : 0,
        scales: {
            y: {
              display: true,
              min: 0,
              title: {
                display: true,
                text: props.unit,
                color: "#191558",
                font : {
                  size: 10,
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
            interaction: {
              mode: 'x'
          },
            legend: {
              display: true,
              labels: {
                filter: item => {
                  return item.text != undefined
              }
            }
  
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
