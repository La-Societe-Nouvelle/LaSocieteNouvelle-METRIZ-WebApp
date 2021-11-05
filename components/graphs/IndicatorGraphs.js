// La Société Nouvelle

// Modules
import { Chart } from "react-google-charts";

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import metaIndics from '/lib/indics';

/* ---------- INDICATOR STATEMENT TABLE ---------- */

const viewsForIndic = {
  art: {min:0, max:100},
  dis: {min:0, max:100},
  eco: {min:0, max:100},
  geq: {min:0, max:100},
  ghg: {min:0},
  haz: {min:0},
  knw: {min:0, max:100},
  mat: {min:0},
  nrg: {min:0},
  was: {min:0},
  wat: {min:0},
  soc: {min:0, max:100},
}

export const IndicatorGraphs = ({session,indic}) =>
{
  const {legalUnit,productionFootprint,netValueAddedFootprint,intermediateConsumptionFootprint} = session;
  const {productionSectorFootprint,valueAddedSectorFootprint,consumptionSectorFootprint,productionAreaFootprint,valueAddedAreaFootprint} = legalUnit;
  
  const dataProduction = [
    ["", "title", { role: "style" }],
    ["Situation", productionFootprint.getIndicator(indic).value || 0.0, "#616161"],
    ["Branche", productionSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
    ["France", productionAreaFootprint.getIndicator(indic).value || 0.0, "#818181"],
  ]

  const dataValueAdded = [
    ["", "title", { role: "style" }],
    ["Situation", netValueAddedFootprint.getIndicator(indic).value || 0.0, "#616161"],
    ["Branche", valueAddedSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
    ["France", valueAddedAreaFootprint.getIndicator(indic).value || 0.0, "#818181"],
  ]
  
  const dataConsumption = [
    ["", "title", { role: "style" }],
    ["Situation", intermediateConsumptionFootprint.getIndicator(indic).value || 0.0, "#616161"],
    ["Branche", consumptionSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
  ]
  
  const unit = metaIndics[indic].unit;
  const viewWindow = viewsForIndic[indic];

  return (
    <div>
      <div className="chart-container" align="center">
        <ColumnChart title="titre" data={dataProduction} viewWindow={viewWindow} title="Production"/>
        <ColumnChart title="titre" data={dataConsumption} viewWindow={viewWindow} title="Consommations"/>
        <ColumnChart title="titre" data={dataValueAdded} viewWindow={viewWindow} title="Valeur Ajoutée"/>
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
            <td className="short right">{printValue(productionFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(productionSectorFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(productionAreaFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
          </tr>
          <tr>
            <td>Consommations intermédiaires</td>
            <td className="short right">{printValue(intermediateConsumptionFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(consumptionSectorFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(null,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
          </tr>
          <tr>
            <td>Valeur ajoutée</td>
            <td className="short right">{printValue(netValueAddedFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(valueAddedSectorFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="short right">{printValue(valueAddedAreaFootprint.getIndicator(indic).value,1)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
          </tr>
        </tbody>
      </table>
    </div>)
}

/* ----- CHARTS ----- */

function ColumnChart({title, data, viewWindow}) {
  return (
    <div align="center">
      <Chart
        height={"200px"}
        chartType="ColumnChart"
        loader={<div>Chargement</div>}
        data={data}
        options={{
          title: title,
          legend: {position: 'none'},
          vAxis: {viewWindow: viewWindow, viewWindowMode: "explicit"},
          enableInteractivity: false,
          animation:{duration:600, easing:"inAndOut"}
        }}
      />
    </div>)
}