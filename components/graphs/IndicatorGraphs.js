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
};

// productionSectorFootprint={productionSectorFootprint}
// valueAddedSectorFootprint={valueAddedSectorFootprint}
// consumptionSectorFootprint={consumptionSectorFootprint}

export const IndicatorGraphs = ({
  session,
  indic,
  comparativeFootprints,
  productionSectorFootprint,
  valueAddedSectorFootprint,
  consumptionSectorFootprint,
}) => {
  const { financialData } = session;
  const { production, netValueAdded, intermediateConsumption } =
    financialData.aggregates;
  const {
    allSectorsProductionAreaFootprint,
    allSectorsValueAddedAreaFootprint,
    allSectorsConsumptionFootprint,
  } = comparativeFootprints;

  // PRODUCTION CHART

  const labelsP = ["France", ["Exercice", "en cours"], "Branche"];

  const dataP = [
    roundNumber(allSectorsProductionAreaFootprint.getIndicator(indic).value),
    roundNumber(production.footprint.getIndicator(indic).value),
    roundNumber(productionSectorFootprint.getIndicator(indic).value),
  ];
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
        label: "Production",
        data: dataP,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(219, 222, 241)",
        ],
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
          display: false,
        },
      },
      y: {
        display: false,
      },
    },
    plugins: {
      datalabels: {
        color: "#191558",
        labels: {
          title: {
            font: {},
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 15,
          family: "Roboto",
        },
        display: true,
        align: "start",
        position: "top",
        text: "Production",
        fontColor: "#FFF",
      },
    },
  };

  // CONSUMPTION CHART

  const labelsC = ["France", ["Exercice", "en cours"], "Branche"];

  const dataC = [
    roundNumber(allSectorsConsumptionFootprint.getIndicator(indic).value),
    roundNumber(intermediateConsumption.footprint.getIndicator(indic).value),
    roundNumber(consumptionSectorFootprint.getIndicator(indic).value),
  ];

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
        label: "Consommation",
        data: dataC,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(219, 222, 241)",
        ],
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
          display: false,
        },
      },
      y: {
        display: false,
      },
    },
    plugins: {
      datalabels: {
        color: "#191558",
        labels: {
          title: {
            font: {},
          },
        },
      },
      datalabels: {
        color: "#191558",
        labels: {
          title: {
            font: {},
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
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
  const labelsV = ["France", ["Exercice", "en cours"], "Branche"];

  const dataV = [
    roundNumber(allSectorsValueAddedAreaFootprint.getIndicator(indic).value),
    roundNumber(netValueAdded.footprint.getIndicator(indic).value),
    roundNumber(valueAddedSectorFootprint.getIndicator(indic).value),
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
        label: "Valeur ajoutée",
        data: dataV,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(219, 222, 241)",
        ],
      },
    ],
  };

  const optionsV = {
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
      },
    },
    plugins: {
      datalabels: {
        color: "#191558",
        labels: {
          title: {
            font: {},
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        padding: {
          top: 0,
          bottom: 25,
        },
        align: "start",
        position: "top",
        font: {
          size: 15,
          family: "Roboto",
        },
        text: "Valeur ajoutée",
      },
    },
  };

  const unit = metaIndics[indic].unit;

  return (
    <>
      <Row className="graphs">
        <Col>
          <Bar id="Production" data={dataProduction} options={optionsP} />
        </Col>
        <Col>
          <Bar id="Consumption" data={dataConsumption} options={optionsC} />
        </Col>
        <Col>
          <Bar id="Value" data={dataValueAdded} options={optionsV} />
        </Col>
      </Row>

      <Table>
        <thead>
          <tr>
            <td className="auto">Agrégat</td>
            <td className="column_value">France</td>
            <td className="column_value align-center">Exercice en cours</td>
            {printValue(
              productionSectorFootprint.getIndicator(indic).value,
              1
            ) &&
            printValue(
              consumptionSectorFootprint.getIndicator(indic).value,
              1
            ) &&
            printValue(
              valueAddedSectorFootprint.getIndicator(indic).value,
              1
            ) !== " - " ? (
              <td className="column_value">Branche</td>
            ) : (
              <td></td>
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Production</td>
            <td className="short right">
              {printValue(
                allSectorsProductionAreaFootprint.getIndicator(indic).value,
                1
              )} <span className="unit">{unit}</span>
            </td>
            <td className="short align-center">
              {printValue(production.footprint.getIndicator(indic).value, 1)} <span className="unit">{unit}</span>
            </td>
            {printValue(
              productionSectorFootprint.getIndicator(indic).value,
              1
            ) !== " - " ? (
              <td className="short right">
                {printValue(
                  productionSectorFootprint.getIndicator(indic).value,
                  1
                )} <span className="unit">{unit}</span>
              </td>
            ) : (
              <td></td>
            )}
          </tr>
          <tr>
            <td>Consommations intermédiaires</td>
            <td className="short right">
              {printValue(
                allSectorsConsumptionFootprint.getIndicator(indic).value,
                1
              )} <span className="unit">{unit}</span>
            </td>
            <td className="short align-center">
              {printValue(
                intermediateConsumption.footprint.getIndicator(indic).value,
                1
              )} <span className="unit">{unit}</span>
            </td>
            {printValue(
              consumptionSectorFootprint.getIndicator(indic).value,
              1
            ) !== " - " ? (
              <td className="short right">
                {printValue(
                  consumptionSectorFootprint.getIndicator(indic).value,
                  1
                )} <span className="unit">{unit}</span>
              </td>
            ) : (
              <td></td>
            )}
          </tr>
          <tr>
            <td>Valeur ajoutée</td>
            <td className="short right">
              {printValue(
                allSectorsValueAddedAreaFootprint.getIndicator(indic).value,
                1
              )} <span className="unit">{unit}</span>
            </td>
            <td className="short align-center">
              {printValue(netValueAdded.footprint.getIndicator(indic).value, 1)} <span className="unit">{unit}</span>
            </td>
            {printValue(
              valueAddedSectorFootprint.getIndicator(indic).value,
              1
            ) !== " - " ? (
              <td className="short right">
                {printValue(
                  valueAddedSectorFootprint.getIndicator(indic).value,
                  1
                )} <span className="unit">{unit}</span>
              </td>
            ) : (
              <td></td>
            )}
          </tr>
        </tbody>
      </Table>
    </>
  );
};

function roundNumber(num) {
  if (num !== null) {
    return parseFloat(num.toFixed(1));
  }
  return num;
}
