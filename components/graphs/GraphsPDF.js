// La Société Nouvelle

// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Col, Row } from "react-bootstrap";
Chart.register(ChartDataLabels);
import { Bar } from "react-chartjs-2";
import PieGraph from "./PieGraph";
import {
  ComparativeGraphsData,
  ComparativeGraphsOptions,
} from "./ComparativeGraphs.config";

// Libraries
import metaIndics from "/lib/indics";

export const GraphsPDF = ({
  allSectorFootprint,
  comparativeDivisionFootprint,
  financialData,
  indic,
  targetSNBC,
}) => {
  const {
    capitalConsumption,
    netValueAdded,
    intermediateConsumption,
    production,
  } = financialData.aggregates;

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

  const printGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );
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
    <div className="hidden">
      {printGrossImpact && (
        <div className="piechart-container">
          <PieGraph
            id={"piechart-" + indic}
            intermediateConsumption={intermediateConsumption.footprint.indicators[
              indic
            ].getGrossImpact(intermediateConsumption.amount)}
            capitalConsumption={capitalConsumption.footprint.indicators[
              indic
            ].getGrossImpact(capitalConsumption.amount)}
            netValueAdded={netValueAdded.footprint.indicators[
              indic
            ].getGrossImpact(netValueAdded.amount)}
          />
        </div>
      )}

      <Row className="graphs">
      <Col sm={4} xl={4} lg={4} md={4}>
          <Bar
            id={"print-Production-" + indic}
            data={productionDataConfig}
            options={productionOptionConfig}
          />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
          <Bar
            id={"print-Consumption-" + indic}
            data={consumptionDataConfig}
            options={consumptionOptionConfig}
          />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
          <Bar
            id={"print-Value-" + indic}
            data={dataValueAddedConfig}
            options={ValueAddedOptionConfig}
          />
        </Col>
      </Row>
    </div>
  );
};

