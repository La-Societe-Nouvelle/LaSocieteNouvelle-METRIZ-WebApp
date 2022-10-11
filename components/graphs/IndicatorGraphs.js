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

export const IndicatorGraphs = ({
  allSectorFootprint,
  comparativeDivisionFootprint,
  financialData,
  indic,
  targetSNBC
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

  // TARGET SNBC VALUE

  
  if(targetSNBC) {
    productionTargetData = [targetSNBC.productionTarget.value,targetSNBC.productionTarget.value,targetSNBC.productionTarget.value];
    consumptionTargetData = [targetSNBC.consumptionTarget.value,targetSNBC.consumptionTarget.value,targetSNBC.consumptionTarget.value];
    valueAddedTargetData = [targetSNBC.valueAddedTarget.value,targetSNBC.valueAddedTarget.value,targetSNBC.valueAddedTarget.value];
    productionTargetDataS =     targetSNBC.productionTarget.value;

  }
  
  // PRODUCTION CHART
  const labelsP = ["France", ["Exercice", "en cours"]];
  
  const dataP = [productionAreaFootprint.value.toFixed(precision),production.footprint.getIndicator(indic).value.toFixed(precision)]
  if(productionDivisionFootprint) {
    dataP.push(productionDivisionFootprint.value);
    labelsP.push("Branche");
  }
  if(targetSNBC) {
    dataP.push(targetSNBC.productionTarget.value);
    labelsP.push("Objectif SNBC")
  }

  const dataProduction = {
    datasets: [
      {
        label: "Trajectoire SNBC",
        data : dataP,
        type : 'line',
        yAxisID: 'y1',
        xAxisID: 'x1',
        backgroundColor: "RGBA(255, 152, 7,0.4)",
        borderWidth : 1,
        borderColor: "RGB(255, 152, 7)",   
        pointRadius: [5,5,5,5],    
      },
      {
        label: "Production",
        data: dataP,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(176, 185, 247)",
          "RGBA(255, 152, 7,0.4)",
        ],
        borderWidth : 1,
        borderColor: [
          "RGB(202, 209, 240)",
          "RGB(241, 97, 103)",
          "RGB(146, 159, 249)",
          "RGBA(255, 152, 7,0.4)"
        ], 
        barPercentage: 1,
        barThickness: 50,
        type: 'bar',
        yAxisID: 'y2',
        xAxisID: 'x2',
      },
      
    ],
  };

  const optionsP = {

    scales: {
      x2: {
        type: 'category',
        labels: labelsP,
        ticks: {
          color: '#212529',
        },
        grid: {
          display: false
        }
      },
      x1:{
        labels: labelsP,
        display : false,
         
      },
      y1: {
        display: true,
        position: 'right',
      },
      y2: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: '#212529',
        },
        ticks: {
          color: '#212529',
          
        },
      },
      
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        labels: {
         display : false
        },
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 18,
          weight : 'bold',
        },
        display: true,
        align: "center",
        position: "top",
        color : "#191558",
        text: "Production",
      },
    },
  };

  // CONSUMPTION CHART

  const labelsC = ["France", ["Exercice", "en cours"]];

  const dataC = [consumptionAreaFootprint.value.toFixed(precision),intermediateConsumption.footprint.getIndicator(indic).value.toFixed(precision)];
  if(consumptionDivisionFootprint) {
    dataC.push(consumptionDivisionFootprint.value.toFixed(precision));
    labelsC.push("Branche")
  }

  if(targetSNBC) {
    dataC.push(targetSNBC.consumptionTarget.value.toFixed(precision));
    labelsC.push("Objectif SNBC")
  }

  const dataConsumption = {
    labels: labelsC,
    datasets: [
      {
        label: "Trajectoire SNBC",
        data : dataC,
        type : 'line',
        yAxisID: 'y1',
        xAxisID: 'x1',
        backgroundColor: "RGBA(255, 152, 7,0.4)",
        borderWidth : 1,
        borderColor: "RGBA(255, 152, 7, 0.7)",       
        pointRadius: [5,5,5,5],
      },
      {
        label: "Consommation",
        data: dataC,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(176, 185, 247)",
          "RGBA(255, 152, 7,0.4)",
        ],
        borderWidth : 1,
        borderColor: [
          "RGB(202, 209, 240)",
          "RGB(241, 97, 103)",
          "RGB(146, 159, 249)",
          "RGBA(255, 152, 7,0.4)",
        ],
        barPercentage: 1,
        barThickness: 50,
        type: 'bar',
        yAxisID: 'y2',
        xAxisID: 'x2',
      },
    ],
  };

  const optionsC = {
    scales: {
      x2: {
        type: 'category',
        labels: labelsC,
        ticks: {
          color: '#212529',
        },
        grid: {
          display: false
        }
      },
      x1:{
        labels: labelsC,
        display : false,
        
      },
      y1: {
        display: false,
        type: 'linear',
        position: 'left',

      },
      y2: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: '#212529',
        },
        ticks: {
          color: '#212529',
        },
      },
      
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        labels: {
         display : false
        },
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 18,
          weight : 'bold',
        },
        display: true,
        align: "center",
        position: "top",
        color : '#191558',
        text: "Consommations intermédiaires",
      },
    },
  };

  // VALUE CHART
  const labelsV = ["France", ["Exercice", "en cours"]];

  const dataV = [valueAddedAreaFootprint.value.toFixed(precision),netValueAdded.footprint.getIndicator(indic).value.toFixed(precision)];
  if(valueAddedDivisionFootprint) {
    dataV.push(valueAddedDivisionFootprint.value.toFixed(precision));
    labelsV.push("Branche")
  }

  if(targetSNBC) {
    dataV.push(targetSNBC.valueAddedTarget.value.toFixed(precision));
    labelsV.push("Objectif SNBC")
  }



  const dataValueAdded = {
    labels: labelsV,
    datasets: [
      {
        label: "Trajectoire SNBC",
        data : dataV,
        type : 'line',
        yAxisID: 'y1',
        xAxisID: 'x1',
        backgroundColor: "RGBA(255, 152, 7,0.4)",
        borderWidth : 1,
        borderColor: "RGB(255, 152, 7)",       
        pointRadius: [5,5,5,5],
      },
      {
        label: "Valeur ajoutée",
        data: dataV,
        backgroundColor: [
          "RGB(219, 222, 241)",
          "RGB(251, 122, 127)",
          "RGB(176, 185, 247)",
          "RGBA(255, 152, 7,0.4)",
        ],
        borderWidth : 1,
        borderColor: [
          "RGB(202, 209, 240)",
          "RGB(241, 97, 103)",
          "RGB(146, 159, 249)",
          "RGBA(255, 152, 7,0.4)",
        ],
        barPercentage: 1,
        barThickness: 50,
        type: 'bar',
        yAxisID: 'y2',
        xAxisID: 'x2',
      },
    ],
  };

  const optionsV = {
    scales: {
      x2: {
        type: 'category',
        labels: labelsV,
        ticks: {
          color: '#212529',
        },
        grid: {
          display: false
        }
      },
      x1:{
        labels: labelsV,
        display : false,        
      },
      y1: {
        display: false,
        type: 'linear',
        position: 'left',

      },
      y2: {
        display: true,
        title: {
          display: true,
          text: unit,
          color: '#212529',
        },
        ticks: {
          color: '#212529',
        },
      },
      
    },
    plugins: {
      legend: false,
      datalabels: {
        labels: {
         display : false
        },
      },
      title: {
        padding: {
          top: 0,
          bottom: 25,
        },
        font: {
          size: 18,
          weight : 'bold',
        },
        display: true,
        align: "center",
        color : '#191558',
        position: "top",
        text: "Valeur ajoutée ",
      },
    },
   
  };

  return (
    <>
      <Row className="graphs">
        <Col sm={4} xl={4} lg={4} md={4}>
        
          <Bar id="Production" data={dataProduction} options={optionsP} />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
          <Bar id="Consumption" data={dataConsumption} options={optionsC} />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
          <Bar id="Value" data={dataValueAdded} options={optionsV} />
        </Col>
      </Row>

      <Table>
        <thead>
          <tr>
            <td className="auto">Agrégat</td>
            <td className="column_value">France</td>
            <td className="column_value align-center">Exercice en cours</td>
            {printValue(productionDivisionFootprint.value, precision) &&
            printValue(consumptionDivisionFootprint.value, precision) &&
            printValue(valueAddedDivisionFootprint.value, precision) !==
              " - " ? (
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
              {printValue(productionAreaFootprint.value, precision)}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="short align-center">
              {printValue(production.footprint.getIndicator(indic).value, 1)}{" "}
              <span className="unit">{unit}</span>
            </td>
            {printValue(productionDivisionFootprint.value, precision) !==
            " - " ? (
              <td className="short right">
                {printValue(productionDivisionFootprint.value, precision)}{" "}
                <span className="unit">{unit}</span>
              </td>
            ) : (
              <td></td>
            )}
          </tr>
          <tr>
            <td>Consommations intermédiaires</td>
            <td className="short right">
              {printValue(consumptionAreaFootprint.value, precision)}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="short align-center">
              {printValue(
                intermediateConsumption.footprint.getIndicator(indic).value,
                precision
              )}{" "}
              <span className="unit">{unit}</span>
            </td>
            {printValue(consumptionDivisionFootprint.value, precision) !==
            " - " ? (
              <td className="short right">
                {printValue(consumptionDivisionFootprint.value, precision)}{" "}
                <span className="unit">{unit}</span>
              </td>
            ) : (
              <td></td>
            )}
          </tr>
          <tr>
            <td>Valeur ajoutée</td>
            <td className="short right">
              {printValue(valueAddedAreaFootprint.value, precision)}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="short align-center">
              {printValue(netValueAdded.footprint.getIndicator(indic).value, 1)}{" "}
              <span className="unit">{unit}</span>
            </td>
            {printValue(valueAddedDivisionFootprint.value, precision) !==
            " - " ? (
              <td className="short right">
                {printValue(valueAddedDivisionFootprint.value, precision)}{" "}
                <span className="unit">{unit}</span>
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

function roundNumber(num, nbDecimal) {
  if (num !== null) {
    return parseFloat(num.toFixed(nbDecimal));
  }
  return num;
}
