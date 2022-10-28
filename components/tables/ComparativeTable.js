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
  targetSNBCbranch,
  targetSNBCarea,
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

  const productionEvolutionBranch = getEvolution(
    productionDivisionFootprint.value,
    targetSNBCbranch.productionTarget.value
  );
  const consumptionEvolutionBranch = getEvolution(
    consumptionDivisionFootprint.value,
    targetSNBCbranch.consumptionTarget.value
  );
  const valueAddedEvolutionBranch = getEvolution(
    valueAddedDivisionFootprint.value,
    targetSNBCbranch.valueAddedTarget.value
  );

  return (
    <Table className="mt-5  comparative-table">
      <thead>
        <tr>
          <td>Agrégat</td>
          {targetSNBCarea.valueAddedTarget.value ? (
            <td colSpan="2" className="border-left">France</td>
          ) : (
            <td className="border-left">France</td>
          )}

          <td className="border-left">Exercice en cours</td>
          {printValue(productionDivisionFootprint.value, precision) &&
            printValue(consumptionDivisionFootprint.value, precision) &&
            printValue(valueAddedDivisionFootprint.value, precision) !==
              " - " && <td colSpan="3" className="border-left">Branche</td>}
        </tr>
      </thead>
      <tbody>
        {indic == "ghg" && (
          <tr className="subth">
            <td scope="row"></td>
            <td className="border-left">Valeur</td>
            <td>Objectif 2030</td>
            <td className="border-left">Valeur</td>
            {productionDivisionFootprint.value && (
              <>
                <td className="border-left">Valeur</td>
                <td>Objectif 2030</td>
                <td>Evolution</td>
              </>
            )}
          </tr>
        )}
        <tr>
          <td>Production</td>
          <td className="border-left">
            {printValue(productionAreaFootprint.value, precision)}
            <span className="unit"> {unit}</span>
          </td>
          {indic == "ghg"  && (
              <td>
                {Math.round(targetSNBCarea.productionTarget.value)} <span className="unit">{unit}</span>
              </td>
          )}
          <td className="border-left">
            {printValue(production.footprint.getIndicator(indic).value, 1)}
            <span className="unit"> {unit}</span>
          </td>
          {printValue(productionDivisionFootprint.value, precision) !==
            " - " && (
            <td className="border-left">
              {printValue(productionDivisionFootprint.value, precision)}
              <span className="unit"> {unit}</span>
            </td>
          )}
          {indic == "ghg" && productionDivisionFootprint.value && (
            <>
              <td>
                {Math.round(targetSNBCbranch.productionTarget.value)}
                <span className="unit">{unit}</span>
              </td>
              <td>{productionEvolutionBranch} %</td>
            </>
          )}
        </tr>
        <tr>
          <td>Consommations intermédiaires</td>
          <td className="border-left">
            {printValue(consumptionAreaFootprint.value, precision)}
            <span className="unit"> {unit}</span>
          </td>
          {indic == "ghg"  && (
              <td>
                {Math.round(targetSNBCarea.consumptionTarget.value)} <span className="unit">{unit}</span>
              </td>
          )}
          <td className="border-left">
            {printValue(
              intermediateConsumption.footprint.getIndicator(indic).value,
              precision
            )}
            <span className="unit"> {unit}</span>
          </td>
          {printValue(consumptionDivisionFootprint.value, precision) !==
            " - " && (
            <td className="border-left">
              {printValue(consumptionDivisionFootprint.value, precision)}
              <span className="unit"> {unit}</span>
            </td>
          )}
          {indic == "ghg" && productionDivisionFootprint.value && (
            <>
              <td>
                {Math.round(targetSNBCbranch.consumptionTarget.value)}
                <span className="unit">{unit}</span>
              </td>
              <td>{consumptionEvolutionBranch} %</td>
            </>
          )}
        </tr>
        <tr>
          <td>Valeur ajoutée</td>
          <td className="border-left">
            {printValue(valueAddedAreaFootprint.value, precision)}
            <span className="unit"> {unit}</span>
          </td>
          {indic == "ghg"  && (
              <td>
                {Math.round(targetSNBCarea.valueAddedTarget.value)}
                <span className="unit">{unit}</span>
              </td>
          )}
          <td className="border-left">
            {printValue(netValueAdded.footprint.getIndicator(indic).value, 1)}
            <span className="unit"> {unit}</span>
          </td>
          {printValue(valueAddedDivisionFootprint.value, precision) !==
            " - " && (
            <td className="border-left">
              {printValue(valueAddedDivisionFootprint.value, precision)}
              <span className="unit"> {unit}</span>
            </td>
          )}
          {indic == "ghg" && productionDivisionFootprint.value && (
            <>
              <td>
                {Math.round(targetSNBCbranch.valueAddedTarget.value)}
                <span className="unit"> {unit}</span>
              </td>
              <td>{valueAddedEvolutionBranch}%</td>
            </>
          )}
        </tr>
      </tbody>
    </Table>
  );
};

function getEvolution(value, target) {
  const evolution = ((target - value) / value) * 100;
  return Math.round(evolution);
}
