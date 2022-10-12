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
import { ComparativeGraphsData, ComparativeGraphsOptions } from "./ComparativeGraphs.config";

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
  
  // PRODUCTION CHART
  const labels = ["France", "Exercice en cours"];
  
  if(comparativeDivisionFootprint) {
    labels.push("Branche");
  }

  const dataP = [productionAreaFootprint.value.toFixed(precision),production.footprint.getIndicator(indic).value.toFixed(precision)]
  
  let dataComparativeP;

  if(productionDivisionFootprint) {
    dataP.push(productionDivisionFootprint.value.toFixed(precision));
    
  }
  if(targetSNBC) {
    dataComparativeP = targetSNBC.productionTarget.value.toFixed(precision);
  }


  const productionDataConfig = ComparativeGraphsData("Production",labels, dataP, dataComparativeP);
  const productionOptionConfig = ComparativeGraphsOptions(labels,"Production",unit);

  // CONSUMPTION CHART

  const dataC = [consumptionAreaFootprint.value.toFixed(precision),intermediateConsumption.footprint.getIndicator(indic).value.toFixed(precision)];
  if(consumptionDivisionFootprint) {
    dataC.push(consumptionDivisionFootprint.value.toFixed(precision));
  }
  let dataComparativeC;

  if(targetSNBC) {
    dataComparativeC = targetSNBC.consumptionTarget.value.toFixed(precision);
  }

  const consumptionDataConfig = ComparativeGraphsData("Consommation",labels, dataC, dataComparativeC);
  const consumptionOptionConfig = ComparativeGraphsOptions(labels,"Consommations intermédiaires",unit);

  // VALUE CHART
  let dataComparativeV;

  const dataV = [valueAddedAreaFootprint.value.toFixed(precision),netValueAdded.footprint.getIndicator(indic).value.toFixed(precision)];
  if(valueAddedDivisionFootprint) {
    dataV.push(valueAddedDivisionFootprint.value.toFixed(precision));
  }

  if(targetSNBC) {
    dataComparativeV = targetSNBC.valueAddedTarget.value.toFixed(precision);
  }

  const dataValueAddedConfig = ComparativeGraphsData("Valeur ajoutée",labels, dataV, dataComparativeV);
  const ValueAddedOptionConfig = ComparativeGraphsOptions(labels,"Valeur ajoutée nette",unit);


  return (
    <>
      <Row className="graphs">
        <Col sm={4} xl={4} lg={4} md={4}>
        
          <Bar id="Production" data={productionDataConfig} options={productionOptionConfig} />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
          <Bar id="Consumption" data={consumptionDataConfig} options={consumptionOptionConfig} />
        </Col>
        <Col sm={4} xl={4} lg={4} md={4}>
          <Bar id="Value" data={dataValueAddedConfig} options={ValueAddedOptionConfig} />
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
