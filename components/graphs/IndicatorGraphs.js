// La Société Nouvelle

// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import { Bar } from "react-chartjs-2";

// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import { Col, Row, Table } from "react-bootstrap";
import {
  ComparativeGraphsData,
  ComparativeGraphsOptions,
} from "./ComparativeGraphs.config";

export const IndicatorGraphs = ({
  allSectorFootprint,
  comparativeDivisionFootprint,
  financialData,
  indic,
  targetSNBC,
}) => {
  const { production, netValueAdded, intermediateConsumption } =
    financialData.aggregates;

  const {
    productionAreaFootprint,
    valueAddedAreaFootprint,
    consumptionAreaFootprint,
  } = allSectorFootprint;
  const {
    productionDivisionFootprint,
    valueAddedDivisionFootprint,
    consumptionDivisionFootprint,
  } = comparativeDivisionFootprint;

  const unit = metaIndics[indic].unit;
  const precision = metaIndics[indic].nbDecimals;

  // PRODUCTION CHART
  const labels = ["France", "Exercice en cours"];

  if (comparativeDivisionFootprint) {
    labels.push("Branche");
  }

  const dataP = [
    productionAreaFootprint.value.toFixed(precision),
    production.footprint.getIndicator(indic).value.toFixed(precision),
  ];

  let dataComparativeP;

  if (productionDivisionFootprint) {
    dataP.push(productionDivisionFootprint.value.toFixed(precision));
  }
  if (targetSNBC) {
    dataComparativeP = targetSNBC.productionTarget.value.toFixed(precision);
  }

  const productionDataConfig = ComparativeGraphsData(
    "Production",
    dataP,
    dataComparativeP
  );
  const productionOptionConfig = ComparativeGraphsOptions(
    labels,
    unit
  );

  // CONSUMPTION CHART

  const dataC = [
    consumptionAreaFootprint.value.toFixed(precision),
    intermediateConsumption.footprint
      .getIndicator(indic)
      .value.toFixed(precision),
  ];
  if (consumptionDivisionFootprint) {
    dataC.push(consumptionDivisionFootprint.value.toFixed(precision));
  }
  let dataComparativeC;

  if (targetSNBC) {
    dataComparativeC = targetSNBC.consumptionTarget.value.toFixed(precision);
  }

  const consumptionDataConfig = ComparativeGraphsData(
    "Consommation",
    dataC,
    dataComparativeC
  );
  const consumptionOptionConfig = ComparativeGraphsOptions(
    labels,
    unit
  );

  // VALUE CHART
  let dataComparativeV;
   
  const dataV = [
    valueAddedAreaFootprint.value.toFixed(precision),
    netValueAdded.footprint.getIndicator(indic).value.toFixed(precision),
  ];
  if (valueAddedDivisionFootprint) {
    dataV.push(valueAddedDivisionFootprint.value.toFixed(precision));
  }

  if (targetSNBC) {
    dataComparativeV = targetSNBC.valueAddedTarget.value.toFixed(precision);
  }

  const dataValueAddedConfig = ComparativeGraphsData(
    labels,
    dataV,
    dataComparativeV
  );
  const ValueAddedOptionConfig = ComparativeGraphsOptions(
    labels,
    unit
  );

  return (
    <>
      <Row className="graphs">
      
       <Col sm={4} xl={4} lg={4} md={4}>
          <h5 className="mb-4">▪ Production</h5>
          <Bar
            id="Production"
            data={productionDataConfig}
            options={productionOptionConfig}
          />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
        <h5 className="mb-4">▪ Consommations intermédiaires</h5>
          <Bar
            id="Consumption"
            data={consumptionDataConfig}
            options={consumptionOptionConfig}
          />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
        <h5 className="mb-4">▪ Valeur ajoutée</h5>
          <Bar
            id="Value"
            data={dataValueAddedConfig}
            options={ValueAddedOptionConfig}
          />
        </Col>
      </Row>

      <Table className="mt-5">
        <thead>
          <tr>
            <td>Agrégat</td>
            <td>France</td>
            <td>Exercice en cours</td>
            {printValue(productionDivisionFootprint.value, precision) &&
              printValue(consumptionDivisionFootprint.value, precision) &&
              printValue(valueAddedDivisionFootprint.value, precision) !==
                " - " && <td>Branche</td>}
            {targetSNBC && <td>Objectifs 2030 pour la branche</td>}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Production</td>
            <td>
              {printValue(productionAreaFootprint.value, precision)}
              <span className="unit"> {unit}</span>
            </td>
            <td>
              {printValue(production.footprint.getIndicator(indic).value, 1)}
              <span className="unit"> {unit}</span>
            </td>
            {printValue(productionDivisionFootprint.value, precision) !==
              " - " && (
              <td>
                {printValue(productionDivisionFootprint.value, precision)}
                <span className="unit"> {unit}</span>
              </td>
            )}
            {targetSNBC && (
              <td>
                {dataComparativeP} <span className="unit">{unit}</span>
              </td>
            )}
          </tr>
          <tr>
            <td>Consommations intermédiaires</td>
            <td>
              {printValue(consumptionAreaFootprint.value, precision)}
              <span className="unit"> {unit}</span>
            </td>
            <td>
              {printValue(
                intermediateConsumption.footprint.getIndicator(indic).value,
                precision
              )}
              <span className="unit"> {unit}</span>
            </td>
            {printValue(consumptionDivisionFootprint.value, precision) !==
              " - " && (
              <td>
                {printValue(consumptionDivisionFootprint.value, precision)}
                <span className="unit">{unit}</span>
              </td>
            )}
            {targetSNBC && (
              <td>
                {dataComparativeC} <span className="unit">{unit}</span>
              </td>
            )}
          </tr>
          <tr>
            <td>Valeur ajoutée</td>
            <td>
              {printValue(valueAddedAreaFootprint.value, precision)}
              <span className="unit"> {unit}</span>
            </td>
            <td>
              {printValue(netValueAdded.footprint.getIndicator(indic).value, 1)}
              <span className="unit"> {unit}</span>
            </td>
            {printValue(valueAddedDivisionFootprint.value, precision) !==
              " - " && (
              <td>
                {printValue(valueAddedDivisionFootprint.value, precision)}
                <span className="unit"> {unit}</span>
              </td>
            )}
            {targetSNBC && (
              <td>
                {dataComparativeV} <span className="unit"> {unit}</span>
              </td>
            )}
          </tr>
        </tbody>
      </Table>
    </>
  );
};
