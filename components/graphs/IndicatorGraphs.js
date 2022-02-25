// La Société Nouvelle

// Modules
// import { Chart } from "react-google-charts";
import Chart from 'chart.js/auto';
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
  const options = {
    responsive : true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
      },
    },
  };
  const labels = ['Situation', 'Branche', 'France'];

  const { financialData } = session;
  const { production, netValueAdded, intermediateConsumption } = financialData.aggregates;
  const { productionSectorFootprint, valueAddedSectorFootprint, consumptionSectorFootprint, productionAreaFootprint, valueAddedAreaFootprint } = comparativeFootprints;

  // const dataProduction = [
  //   ["", "title", { role: "style" }],
  //   ["Situation", production.footprint.getIndicator(indic).value || 0.0, "#616161"],
  //   ["Branche", productionSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
  //   ["France", productionAreaFootprint.getIndicator(indic).value || 0.0, "#818181"],
  // ]

  // const dataValueAdded = [
  //   ["", "title", { role: "style" }],
  //   ["Situation", netValueAdded.footprint.getIndicator(indic).value || 0.0, "#616161"],
  //   ["Branche", valueAddedSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
  //   ["France", valueAddedAreaFootprint.getIndicator(indic).value || 0.0, "#818181"],
  // ]

  // const dataConsumption = [
  //   ["", "title", { role: "style" }],
  //   ["Situation", intermediateConsumption.footprint.getIndicator(indic).value || 0.0, "#616161"],
  //   ["Branche", consumptionSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
  // ]

  const dataProduction = {
    labels,
    datasets: [
      {
        label: 'Production',
        data: [production.footprint.getIndicator(indic).value, productionSectorFootprint.getIndicator(indic).value, productionAreaFootprint.getIndicator(indic).value],
        backgroundColor: 'RGBA(250, 89, 95, 0.8)',
      },
    ],
  };

  const dataValueAdded = {
    labels,
    datasets: [
      {
        label: 'Valeur ajoutée',
        data: [netValueAdded.footprint.getIndicator(indic).value, valueAddedSectorFootprint.getIndicator(indic).value, valueAddedAreaFootprint.getIndicator(indic).value],
        backgroundColor: 'RGBA(250, 89, 95, 0.8)',
      },
    ],
  };
  const dataConsumption = {
    labels,
    datasets: [
      {
        label: 'Consommation',
        data: [intermediateConsumption.footprint.getIndicator(indic).value, consumptionSectorFootprint.getIndicator(indic).value],
        backgroundColor: 'RGBA(250, 89, 95, 0.8)',
      },
    ],
  };
  const unit = metaIndics[indic].unit;
  const viewWindow = viewsForIndic[indic];

  return (
    <>
    <div className="row"> 
      <div className="chart-container" >
        <Bar
          data={dataProduction}
          options={options}
        />
      </div>
      <div className="chart-container">

        <Bar
          data={dataConsumption}
          options={options}
        />
      </div>

      <div className="chart-container">

        <Bar
          data={dataValueAdded}
          options={options}
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
            <td className="column_value" colSpan="2">Unité légale</td>
            <td className="column_value" colSpan="2">Branche</td>
            <td className="column_value" colSpan="2">France</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Production</td>
            <td className="short right">{printValue(production.footprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(productionSectorFootprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(productionAreaFootprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
          </tr>
          <tr>
            <td>Consommations intermédiaires</td>
            <td className="short right">{printValue(intermediateConsumption.footprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(consumptionSectorFootprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(null, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
          </tr>
          <tr>
            <td>Valeur ajoutée</td>
            <td className="short right">{printValue(netValueAdded.footprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(valueAddedSectorFootprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(valueAddedAreaFootprint.getIndicator(indic).value, 1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
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