import React, { useEffect, useState } from "react";
// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Line } from "react-chartjs-2";

function TrendsGraph(props) {

const [data,setData] = useState({ datasets: [] });
const [options,setOptions] = useState({})

useEffect(()=> {
  const trendsData = props.trends.map(data => data.year <= 2020 ? {x :  data.year, y : data.value} : {x :  data.year, y : null});
  const trendsDataForecast =  props.trends.map(data => data.year >= 2020 ? {x :  data.year, y : data.value} : {x :  data.year, y : null});
  const targetData = props.target.map(data =>  ({x :  data.year, y : data.value})  );
  
  const data = {
    datasets: [{
      label: 'Tendance',
      data:  trendsData,
      fill: false,
      borderColor: 'rgba(255,214,156,1)',
      backgroundColor: 'rgba(255,214,156,0.5)',
      tension: 0.1,
      borderDash: [5,0],
      order: 2      
      
    },
    {
      label: 'Objectif de la branche',
      data:  targetData,
      fill: false,
      borderColor: 'rgba(255,234,205,1)',
      backgroundColor: 'rgba(255,234,205,0.5)',
      tension: 0.1,
      borderDash: [5,0],
      order: 4
    },
    {          
      label: 'Evolution de la tendance',
      data:  trendsDataForecast, 
      fill: false,
      borderColor: 'rgba(255,214,156,1)',
      backgroundColor: 'rgb(255,255,255)',
      tension: 0.1,
       borderDash: [5,5],
       order: 3
    },
    {
      type: 'bubble',
      label : "Exercice en cours",
      data: [
        {x: "2021", y: props.current,  r: 5}
      ],
      backgroundColor : 'rgb(250,89,95)',  
      order: 1      
    },
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
          position : "right",
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
          position : "top",
          text : props.title,
          color: "#191558",
          padding : 20,
          align : "start",
          font : {
            size: 16,
            weight : 'bold'
          }
          
        },
      },
  };

  setData(data);
  setOptions(options);

}, [props])



 

  return (
    data && options && 
    <Line  data={data} options={options} />

    );
}

export default TrendsGraph;
