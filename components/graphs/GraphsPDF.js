// La Société Nouvelle

// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Col, Row } from "react-bootstrap";
Chart.register(ChartDataLabels);
import { Bar } from "react-chartjs-2";
import PieGraph from "./PieGraph";

export const GraphsPDF = ({
  allSectorFootprint,
  comparativeDivisionFootprint,
  financialData,
  indic,
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
  } = allSectorFootprint[indic.toUpperCase()];

  const {
    productionDivisionFootprint,
    valueAddedDivisionFootprint,
    consumptionDivisionFootprint,
  } = comparativeDivisionFootprint[indic.toUpperCase()];

  
  const printGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );
  // // PRODUCTION CHART
  const labelsP = ["France", ["Exercice", "en cours"], "Branche"];
  const dataP = [
    roundNumber(productionAreaFootprint.value),
    roundNumber(production.footprint.getIndicator(indic).value),
    roundNumber(productionDivisionFootprint.value),
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
          "RGB(176, 185, 247)",
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
        color: "#555",
        labels: {
          title: {
            font: {
              weight: "bold",
            },
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
          weight: "bold",
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
    roundNumber(consumptionAreaFootprint.value),
    roundNumber(intermediateConsumption.footprint.getIndicator(indic).value),
    roundNumber(consumptionDivisionFootprint.value),
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
          "RGB(176, 185, 247)",
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
        color: "#555",
        labels: {
          title: {
            font: {
              weight: "bold",
            },
          },
        },
      },
      datalabels: {
        color: "#555",
        labels: {
          title: {
            font: {
              weight: "bold",
            },
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
  const labelsV = ["France", ["Exercice", "en cours"], "Branche"];

  // To Do : round value Number().toFixed(2); // 1.00
  const dataV = [
    roundNumber(valueAddedAreaFootprint.value),
    roundNumber(netValueAdded.footprint.getIndicator(indic).value),
    roundNumber(valueAddedDivisionFootprint.value),
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
          "RGB(176, 185, 247)",
        ],
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
          display: false,
        },
      },
      y: {
        display: false,
      },
    },
    plugins: {
      datalabels: {
        color: "#555",
        labels: {
          title: {
            font: {
              weight: "bold",
            },
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
          weight: "bold",
          size: 15,
          family: "Roboto",
        },
        text: "Valeur ajoutée",
      },
    },
  };

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
        <Col>
          <Bar
            id={"print-Production-" + indic}
            data={dataProduction}
            options={optionsP}
          />
        </Col>
        <Col>
          <Bar
            id={"print-Consumption-" + indic}
            data={dataConsumption}
            options={optionsC}
          />
        </Col>
        <Col>
          <Bar
            id={"print-Value-" + indic}
            data={dataValueAdded}
            options={optionsV}
          />
        </Col>
      </Row>
    </div>
  );
};

function roundNumber(num) {
  if (num !== null) {
    return parseFloat(num.toFixed(1));
  }
  return num;
}
