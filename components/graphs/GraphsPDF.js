// La Société Nouvelle

// Modules
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Col, Row } from "react-bootstrap";
Chart.register(ChartDataLabels);
import { Bar } from "react-chartjs-2";
import PieGraph from "./PieGraph";

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

  console.log(allSectorFootprint)
  const printGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );
  const unit = metaIndics[indic].unit;

  // TARGET SNBC VALUE
  let valueAddedTargetData;
  let productionTargetData;
  let consumptionTargetData;

  if (targetSNBC) {
    productionTargetData = [
      targetSNBC.productionTarget.value,
      targetSNBC.productionTarget.value,
      targetSNBC.productionTarget.value,
    ];
    consumptionTargetData = [
      targetSNBC.consumptionTarget.value,
      targetSNBC.consumptionTarget.value,
      targetSNBC.consumptionTarget.value,
    ];
    valueAddedTargetData = [
      targetSNBC.valueAddedTarget.value,
      targetSNBC.valueAddedTarget.value,
      targetSNBC.valueAddedTarget.value,
    ];
  }
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
        borderWidth: 1,
        borderColor: [
          "RGB(202, 209, 240)",
          "RGB(241, 97, 103)",
          "RGB(146, 159, 249)",
        ],
        barPercentage: 1,
        barThickness: 50,
        type: "bar",
        yAxisID: "y2",
        xAxisID: "x2",
      },
    ],
  };
  if (productionTargetData) {
    dataProduction.datasets.push({
      label: "Trajectoire SNBC",
      data: productionTargetData,
      type: "line",
      yAxisID: "y1",
      xAxisID: "x1",
      backgroundColor: "RGBA(255, 152, 7,0.4)",
      borderWidth: 1,
      borderColor: "RGB(255, 152, 7)",
      pointRadius: [0, 0, 5],
    });
  }

  const optionsP = {
    scales: {
      x2: {
        type: "category",
        labels: labelsP,
        ticks: {
          color: "#212529",
        },
      },
      x1: {
        labels: labelsP,
        display: false,
        offset: false,
      },
      y1: {
        display: false,
        type: "linear",
        position: "left",
        ticks: {
          max: 100,
          min: 0,
        },
      },
      y2: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: "#212529",
        },
        ticks: {
          color: "#212529",
        },
      },
    },
    plugins: {
      datalabels: {
        labels: {
          display: false,
        },
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 18,
          weight: "bold",
        },
        display: true,
        align: "center",
        position: "top",
        color: "#191558",
        text: "Production",
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
        label: "Trajectoire SNBC",
        data: consumptionTargetData,
        type: "line",
        yAxisID: "y1",
        xAxisID: "x1",
        backgroundColor: "RGBA(255, 152, 7,0.4)",
        borderWidth: 1,
        borderColor: "RGBA(255, 152, 7, 0.7)",
        pointRadius: [0, 0, 5],
      },
      {
        label: "Consommation",
        data: dataC,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(176, 185, 247)",
        ],
        borderWidth: 1,
        borderColor: [
          "RGB(202, 209, 240)",
          "RGB(241, 97, 103)",
          "RGB(146, 159, 249)",
        ],
        barPercentage: 1,
        barThickness: 50,
        type: "bar",
        yAxisID: "y2",
        xAxisID: "x2",
      },
    ],
  };

  const optionsC = {
    scales: {
      x2: {
        type: "category",
        labels: labelsC,
        ticks: {
          color: "#212529",
        },
      },
      x1: {
        labels: labelsC,
        display: false,
        offset: false,
      },
      y1: {
        display: false,
        type: "linear",
        position: "left",
        ticks: {
          max: 100,
          min: 0,
        },
      },
      y2: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: "#212529",
        },
        ticks: {
          color: "#212529",
        },
      },
    },
    plugins: {
      datalabels: {
        labels: {
          display: false,
        },
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 18,
          weight: "bold",
        },
        display: true,
        align: "center",
        position: "top",
        color: "#191558",
        text: "Consommations intermédiaires",
      },
    },
  };

  // VALUE CHART
  const labelsV = ["France", ["Exercice", "en cours"], "Branche"];
console.log(valueAddedAreaFootprint)
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
        label: "Trajectoire SNBC",
        data: valueAddedTargetData,
        type: "line",
        yAxisID: "y1",
        xAxisID: "x1",
        backgroundColor: "RGBA(255, 152, 7,0.4)",
        borderWidth: 1,
        borderColor: "RGB(255, 152, 7)",
        pointRadius: [0, 0, 5],
      },
      {
        label: "Valeur ajoutée",
        data: dataV,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(176, 185, 247)",
        ],
        borderWidth: 1,
        borderColor: [
          "RGB(202, 209, 240)",
          "RGB(241, 97, 103)",
          "RGB(146, 159, 249)",
        ],
        barPercentage: 1,
        barThickness: 50,
        type: "bar",
        yAxisID: "y2",
        xAxisID: "x2",
      },
    ],
  };

  const optionsV = {
    scales: {
      x2: {
        type: "category",
        labels: labelsV,
        ticks: {
          color: "#212529",
        },
      },
      x1: {
        labels: labelsV,
        display: false,
        offset: false,
      },
      y1: {
        display: false,
        type: "linear",
        position: "left",
        ticks: {
          max: 100,
          min: 0,
        },
      },
      y2: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: "#212529",
        },
        ticks: {
          color: "#212529",
        },
      },
    },
    plugins: {
      datalabels: {
        labels: {
          display: false,
        },
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 18,
          weight: "bold",
        },
        display: true,
        align: "center",
        color: "#191558",
        position: "top",
        text: "Valeur ajoutée ",
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
