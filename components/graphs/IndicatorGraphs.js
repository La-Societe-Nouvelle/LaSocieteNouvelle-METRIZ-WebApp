// La Société Nouvelle

// Modules
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);
import { Bar } from 'react-chartjs-2';

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import metaIndics from '/lib/indics';

/* ---------- INDICATOR STATEMENT TABLE ---------- */

const viewsForIndic = {
  art: { min: 0, max: 100 },
  dis: { min: 0, max: 100 },
  eco: { min: 0, max: 100 },
  geq: { min: 0, max: 100 },
  ghg: { min: 0 },
  haz: { min: 0 },
  knw: { min: 0, max: 100 },
  mat: { min: 0 },
  nrg: { min: 0 },
  was: { min: 0 },
  wat: { min: 0 },
  soc: { min: 0, max: 100 },
}

export const IndicatorGraphs = ({ session, indic, comparativeFootprints }) => {




  const { financialData } = session;
  const { production, netValueAdded, intermediateConsumption } = financialData.aggregates;
  const { productionSectorFootprint, valueAddedSectorFootprint, consumptionSectorFootprint, allSectorsProductionAreaFootprint, allSectorsValueAddedAreaFootprint, allSectorsConsumptionFootprint } = comparativeFootprints;

  // PRODUCTION CHART

  const labelsP = ['France', ['Exercice', 'en cours'], 'Branche'];

  const dataP = [
    allSectorsProductionAreaFootprint.getIndicator(indic).value,
    production.footprint.getIndicator(indic).value,
    productionSectorFootprint.getIndicator(indic).value]
    ;

  for (let i = 0; i < dataP.length; i++) {

    if (dataP[i] === null) {

      dataP.splice(i, 1);
      labelsP.splice(i, 1);
    }

  }

  const dataProduction = {
    labels: labelsP,
    datasets: [
      {
        label: 'Production',
        data: dataP,
        backgroundColor: ["RGB(219, 222, 241)", "RGB(251, 122, 127)", "RGB(219, 222, 241)"],
      },
    ],
  };


  const optionsP = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    scales: {
      x: {
        grid: {
          display: false
        },
      },
      y:
      {
        display: false,
      },
    },
    plugins: {
      datalabels: {
        color: '#555',
        labels: {
          title: {
            font: {
              weight: 'bold'
            }
          },
        },

      },
      legend: {
        display: false,
      },
      title: {
        padding: {
          top: 0,
          bottom: 25
        },
        font: {
          weight: "bold",
          size: 15,
          family: "Roboto",
        },
        display: true,
        align: "start",
        position: "top",
        text: "Production",
        fontColor: "#FFF"
      },

    },

  };

  // CONSUMPTION CHART 


  const labelsC = ['France', ['Exercice', 'en cours'], 'Branche'];
  const dataC = [
    allSectorsConsumptionFootprint.getIndicator(indic).value,
    intermediateConsumption.footprint.getIndicator(indic).value,
    consumptionSectorFootprint.getIndicator(indic).value,
  ]


  for (let i = 0; i < dataC.length; i++) {

    if (dataC[i] === null) {

      dataC.splice(i, 1);
      labelsC.splice(i, 1);
    }

  }

  const dataConsumption = {
    labels: labelsC,
    datasets: [
      {
        label: 'Consommation',
        data: dataC,
        backgroundColor: ["RGB(219, 222, 241)", "RGB(251, 122, 127)", "RGB(219, 222, 241)"],
      },
    ],
  };


  const optionsC = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y:
      {
        display: false
      },
    },
    plugins: {
      datalabels: {
        color: '#555',
        labels: {
          title: {
            font: {
              weight: 'bold'
            }
          },
        }
      },
      datalabels: {
        color: '#555',
        labels: {
          title: {
            font: {
              weight: 'bold'
            }
          },
        }
      },
      legend: {
        display: false,
      },
      title: {
        padding: {
          top: 0,
          bottom: 25
        },
        font: {
          weight: "bold",
          size: 15,
          family: "Roboto",
        },
        display: true,
        align: "start",
        position: "top",
        text: "Consommations intermédiaires",
      },

    },

  };

  // VALUE CHART
  const labelsV = ['France', ['Exercice', 'en cours'], 'Branche'];

  // To Do : round value Number().toFixed(2); // 1.00
  const dataV = [
    allSectorsValueAddedAreaFootprint.getIndicator(indic).value,
    valueAddedSectorFootprint.getIndicator(indic).value,
    netValueAdded.footprint.getIndicator(indic).value,
  ];

  for (let i = 0; i < dataV.length; i++) {

    if (dataV[i] === null) {

      dataV.splice(i, 1);
      labelsV.splice(i, 1);
    }

  }

  const dataValueAdded = {
    labels: labelsV,
    datasets: [
      {
        label: 'Valeur ajoutée',
        data: dataV,
        backgroundColor: ["RGB(219, 222, 241)", "RGB(251, 122, 127)", "RGB(219, 222, 241)"],
      },

    ],
  };

  const optionsV = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y:
      {
        display: false,
      },
    },
    plugins: {
      datalabels: {
        color: '#555',
        labels: {
          title: {
            font: {
              weight: 'bold'
            }
          },
        }
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        padding: {
          top: 0,
          bottom: 25
        },
        align: "start",
        position: "top",
        font: {
          weight: "bold",
          size: 15,
          family: "Roboto",
        },
        text: "Valeur ajoutée",
      },

    },

  };

  const unit = metaIndics[indic].unit;
  const viewWindow = viewsForIndic[indic];

  return (
    <>
      <div className="row aln-center">
        <div className="chart-container" >
          <Bar
            id="Production"
            data={dataProduction}
            options={optionsP}
          />
        </div>
        <div className="chart-container">
          <Bar
            id="Consumption"
            data={dataConsumption}
            options={optionsC}
          />
        </div>
        <div className="chart-container">
          <Bar
            id="Value"
            data={dataValueAdded}
            options={optionsV}
          />
          {/* <ColumnChart title="titre" data={dataProduction} viewWindow={viewWindow} title="Production"/>
        <ColumnChart title="titre" data={dataConsumption} viewWindow={viewWindow} title="Consommations"/>
        <ColumnChart title="titre" data={dataValueAdded} viewWindow={viewWindow} title="Valeur Ajoutée"/>  */}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <td className="auto" colSpan="1">Agrégat</td>
            <td className="column_value" >France</td>
            <td className="column_value align-center" >Exercice en cours</td>
            {
              printValue(productionSectorFootprint.getIndicator(indic).value, 1)
                && printValue(consumptionSectorFootprint.getIndicator(indic).value, 1)
                && printValue(valueAddedSectorFootprint.getIndicator(indic).value, 1) !== " - " ?
                
                <td className="column_value" >Branche</td> : ""
            }
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Production</td>
            <td className="short right">{printValue(allSectorsProductionAreaFootprint.getIndicator(indic).value, 1)} {unit}</td>
            <td className="short align-center">{printValue(production.footprint.getIndicator(indic).value, 1)} {unit}</td>
            {
               printValue(productionSectorFootprint.getIndicator(indic).value, 1) !== " - " ?
               <td className="short right">{printValue(productionSectorFootprint.getIndicator(indic).value, 1)} {unit}</td>
               : ""
            }
          </tr>
          <tr>
            <td>Consommations intermédiaires</td>
            <td className="short right">{printValue(allSectorsConsumptionFootprint.getIndicator(indic).value, 1)} {unit}</td>
            <td className="short align-center">{printValue(intermediateConsumption.footprint.getIndicator(indic).value, 1)} {unit}</td>
            {
              printValue(consumptionSectorFootprint.getIndicator(indic).value, 1) !== " - " ? 
              <td className="short right">{printValue(consumptionSectorFootprint.getIndicator(indic).value, 1)} {unit}</td>
              : ""
            }
          </tr>
          <tr>
            <td>Valeur ajoutée</td>
            <td className="short right">{printValue(allSectorsValueAddedAreaFootprint.getIndicator(indic).value, 1)} {unit}</td>
            <td className="short align-center">{printValue(netValueAdded.footprint.getIndicator(indic).value, 1)} {unit}</td>
            {
              printValue(valueAddedSectorFootprint.getIndicator(indic).value, 1) !== " - " ?
              <td className="short right">{printValue(valueAddedSectorFootprint.getIndicator(indic).value, 1)} {unit}</td> 
              : ""
            }
          </tr>
        </tbody>
      </table>
    </>)
}

/* ----- CHARTS ----- */

// function ColumnChart({ title, data, viewWindow }) {
//   return (
//     <div align="center">
//       <Chart
//         height={"200px"}
//         chartType="ColumnChart"
//         loader={<div>Chargement</div>}
//         data={data}
//         options={{
//           title: title,
//           legend: { position: 'none' },
//           vAxis: { viewWindow: viewWindow, viewWindowMode: "explicit" },
//           enableInteractivity: false,
//           animation: { duration: 600, easing: "inAndOut" }
//         }}
//       />
//     </div>)
// }