// La Société Nouvelle


// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import { Table } from "react-bootstrap";


export const ComparativeTable = ({
  allSectorFootprint,
  comparativeDivisionFootprint,
  financialData,
  indic,
  targetSNBC,
}) => {

  const { production, netValueAdded, intermediateConsumption } = financialData.aggregates;

  const { productionAreaFootprint,valueAddedAreaFootprint,consumptionAreaFootprint} = allSectorFootprint;
  const { productionDivisionFootprint,valueAddedDivisionFootprint,consumptionDivisionFootprint} = comparativeDivisionFootprint;
  const { productionTarget, valueAddedTarget, consumptionTarget} = targetSNBC;

  const unit = metaIndics[indic].unit;
  const precision = metaIndics[indic].nbDecimals;

  const productionEvolution =getEvolution(productionDivisionFootprint.value,productionTarget.value);
  const consumptionEvolution = getEvolution(consumptionDivisionFootprint.value, consumptionTarget.value);
  const valueAddedEvolution = getEvolution(valueAddedDivisionFootprint.value,valueAddedTarget.value);

  return (
   
      <Table className="mt-5">
        <thead>
          <tr>
            <td>Agrégat</td>
            <td>France</td>
            <td>Exercice en cours</td>
            {printValue(productionDivisionFootprint.value, precision) &&
              printValue(consumptionDivisionFootprint.value, precision) &&
              printValue(valueAddedDivisionFootprint.value, precision) !==
                " - " && (
                <td colSpan="3">
                  Branche
                </td>
              )}
          </tr>
        </thead>
        <tbody>
          <tr className="subth">
            {indic == 'ghg' && productionDivisionFootprint.value && (
              <>
                <td scope="row">&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td >Valeur</td>
                <td >Objectif 2030</td>
                <td >Evolution</td>
              </>
            )}
          </tr>
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
              <td >
                {printValue(productionDivisionFootprint.value, precision)}
                <span className="unit"> {unit}</span>
              </td>
            )}

            {indic == 'ghg' && productionDivisionFootprint.value  && (
              <>
                <td >
                  {targetSNBC.productionTarget.value} <span className="unit">{unit}</span>
                </td>
                <td >
                  <span className={productionEvolution < 0 ? "negative" : "positive"}>
                    {productionEvolution} %
                  </span>
                </td>
              </>
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
              <td >
                {printValue(consumptionDivisionFootprint.value, precision)}
                <span className="unit"> {unit}</span>
              </td>
            )}
            {indic == 'ghg' && productionDivisionFootprint.value  && (
              <>
                <td >
                  {targetSNBC.consumptionTarget.value} <span className="unit">{unit}</span>
                </td>
                <td>
                <span className={consumptionEvolution < 0 ? "negative" : "positive"}>

                  {consumptionEvolution}   %
                </span>
                </td>
              </>
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
              <td >
                {printValue(valueAddedDivisionFootprint.value, precision)}
                <span className="unit"> {unit}</span>
              </td>
            )}
            {indic == 'ghg' && productionDivisionFootprint.value  && (
              <>
                <td>
                  {targetSNBC.valueAddedTarget.value} <span className="unit"> {unit}</span>
                </td>
                <td >
                <span className={valueAddedEvolution < 0 ? "negative" : "positive"}>

                  {valueAddedEvolution}
                  %
                  </span>
                </td>
              </>
            )}
          </tr>
        </tbody>
      </Table>

  );
};

function getEvolution(value, target) {
  const evolution = ((target - value) / value) * 100;
  return evolution.toFixed(1);
}
