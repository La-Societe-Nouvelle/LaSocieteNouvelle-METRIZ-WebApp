// La Société Nouvelle

// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import { Table } from "react-bootstrap";
import { getEvolution } from "../../src/utils/Utils";

export const ComparativeTable = ({ financialData, indic, comparativeData, period }) => 
{
  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;


  const unit = metaIndics[indic].unit;
  const precision = metaIndics[indic].nbDecimals;
  
  const productionEvolutionBranch = getEvolution(
    comparativeData.production.divisionFootprint.indicators[indic].value,
    comparativeData.production.targetDivisionFootprint.indicators[indic].data.at(-1).value
  );
  const consumptionEvolutionBranch = getEvolution(
    comparativeData.intermediateConsumption.divisionFootprint.indicators[indic]
      .value,
    comparativeData.intermediateConsumption.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value
  );
  const valueAddedEvolutionBranch = getEvolution(
    comparativeData.netValueAdded.divisionFootprint.indicators[indic].value,
    comparativeData.netValueAdded.targetDivisionFootprint.indicators[indic].data.at(-1).value
  );

  const capitalConsumptionEvolutionBranch = getEvolution(
    comparativeData.fixedCapitalConsumption.divisionFootprint.indicators[indic]
      .value,
    comparativeData.fixedCapitalConsumption.targetDivisionFootprint.indicators[indic].data.at(-1).value
  );


  const displayTargetColumn =
    comparativeData.production.targetDivisionFootprint.indicators[indic].data.at(-1).value ==
      null &&
    comparativeData.netValueAdded.targetDivisionFootprint.indicators[indic].data.at(-1).value ==
      null &&
    comparativeData.intermediateConsumption.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value == null &&
    comparativeData.fixedCapitalConsumption.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value == null
      ? false
      : true;

      const displayDivisionColumn =  comparativeData.production.divisionFootprint.indicators[indic].value == null && comparativeData.netValueAdded.divisionFootprint.indicators[indic].value == null && comparativeData.intermediateConsumption.divisionFootprint.indicators[indic].value == null && comparativeData.fixedCapitalConsumption.divisionFootprint.indicators[indic].value == null
      ? false
      : true;

  return (
    <Table className="mt-5 comparative-table">
      <thead>
        <tr>
          <td>Agrégat</td>
          <td
            colSpan={displayTargetColumn ? 2 : 0}
            className="border-left text-center"
          >
            France
          </td>

          <td className="border-left text-center">Exercice en cours</td>
          {
            displayDivisionColumn && 
            <td
            colSpan={displayTargetColumn ? 3 : 2}
            className="border-left text-center"
          >
            Branche
          </td>
          }
    
        </tr>
      </thead>
      <tbody>
        {displayTargetColumn && (
          <tr className="subth">
            <td scope="row"></td>
            <td className="border-left text-end">Valeur</td>
            <td className="text-end">Objectif 2030</td>
            <td className="border-left text-end">Valeur</td>
            <td className="border-left text-end">Valeur</td>
            <td className="text-end">Objectif 2030</td>
            <td className="text-end">Evolution</td>
          </tr>
        )}

        <tr>
          <td>Production</td>
          <td className="border-left text-end">
            {getValue(
              comparativeData.production.areaFootprint.indicators[indic].value,
              unit,
              precision
            )}
          </td>
          {displayTargetColumn && (
            <td className="text-end">
              {getValue(
                comparativeData.production.targetAreaFootprint.indicators[indic]
                  .value,
                unit,
                precision
              )}
            </td>
          )}
          <td className="border-left text-end">
            {printValue(
              production.periodsData[period.periodKey].footprint.getIndicator(indic).value,
              precision
            )}
            <span > {unit}</span>
          </td>
          {
            displayDivisionColumn && 
          <td className="border-left text-end">
            {getValue(
              comparativeData.production.divisionFootprint.indicators[indic]
                .value,
              unit,
              precision
            )}
          </td>
}
          {displayTargetColumn && (
            <>
              <td className="text-end">
                {getValue(
                  comparativeData.production.targetDivisionFootprint.indicators[
                    indic
                  ].data.at(-1).value,
                  unit,
                  precision
                )}
              </td>
              <td className="text-end">
                {productionEvolutionBranch}
                {productionEvolutionBranch != '-' && "%"}
              </td>
            </>
          )}
        </tr>
        <tr>
          <td>Consommations intermédiaires</td>
          <td className="border-left text-end">
            {getValue(
              comparativeData.intermediateConsumption.areaFootprint.indicators[
                indic
              ].value,
              unit,
              precision
            )}
          </td>
          {displayTargetColumn && (
            <td className="text-end">
              {getValue(
                comparativeData.intermediateConsumption.targetAreaFootprint
                  .indicators[indic].value,
                unit,
                precision
              )}
            </td>
          )}
          <td className="border-left text-end">
            {printValue(
              intermediateConsumptions.periodsData[period.periodKey].footprint.getIndicator(indic).value,
              precision
            )}
            <span > {unit}</span>
          </td>
          {
            displayDivisionColumn && 
          <td className="border-left text-end">
            {getValue(
              comparativeData.intermediateConsumption.divisionFootprint
                .indicators[indic].value,
              unit,
              precision
            )}
          </td>
}
          {displayTargetColumn && (
            <>
              <td className="text-end">
                {getValue(
                  comparativeData.intermediateConsumption
                    .targetDivisionFootprint.indicators[indic].data.at(-1).value,
                  unit,
                  precision
                )}
              </td>
              <td className="text-end">
                {consumptionEvolutionBranch}
                               {consumptionEvolutionBranch != '-' && "%"}

              </td>
            </>
          )}
        </tr>
        <tr>
          <td>Consommations de capital fixe</td>
          <td className="border-left text-end">
            {getValue(
              comparativeData.fixedCapitalConsumption.areaFootprint.indicators[
                indic
              ].value,
              unit,
              precision
            )}
          </td>
          {displayTargetColumn && (
            <td className="text-end">
              {getValue(
                comparativeData.fixedCapitalConsumption.targetAreaFootprint
                  .indicators[indic].value,
                unit,
                precision
              )}
            </td>
          )}
          <td className="border-left text-end">
            {printValue(
              fixedCapitalConsumptions.periodsData[period.periodKey].footprint.getIndicator(indic).value,
              precision
            )}
            <span > {unit}</span>
          </td>
          {
            displayDivisionColumn && 
          <td className="border-left text-end">
            {getValue(
              comparativeData.fixedCapitalConsumption.divisionFootprint
                .indicators[indic].value,
              unit,
              precision
            )}
          </td>
}
          {displayTargetColumn && (
            <>
              <td className="text-end">
                {getValue(
                  comparativeData.fixedCapitalConsumption
                    .targetDivisionFootprint.indicators[indic].data.at(-1).value,
                  unit,
                  precision
                )}
              </td>
              <td className="text-end">
                {capitalConsumptionEvolutionBranch}
                {capitalConsumptionEvolutionBranch != "-" && "%"}
              </td>
            </>
          )}
        </tr>
        <tr>
          <td>Valeur ajoutée</td>
          <td className="border-left text-end">
            {getValue(
              comparativeData.netValueAdded.areaFootprint.indicators[indic]
                .value,
              unit,
              precision
            )}
          </td>
          {displayTargetColumn && (
            <td className="text-end">
              {getValue(
                comparativeData.netValueAdded.targetAreaFootprint.indicators[
                  indic
                ].value,
                unit,
                precision
              )}
            </td>
          )}
          <td className="border-left text-end">
            {printValue(
              netValueAdded.periodsData[period.periodKey].footprint.getIndicator(indic).value,
              precision
            )}
            <span > {unit}</span>
          </td>
          {
            displayDivisionColumn && 
          <td className="border-left text-end">
            {getValue(
              comparativeData.netValueAdded.divisionFootprint.indicators[indic]
                .value,
              unit,
              precision
            )}
          </td>
}
          {displayTargetColumn && (
            <>
              <td className="text-end">
                {getValue(
                  comparativeData.netValueAdded.targetDivisionFootprint
                    .indicators[indic].data.at(-1).value,
                  unit,
                  precision
                )}
              </td>
              <td className="text-end">
                {valueAddedEvolutionBranch}
                {valueAddedEvolutionBranch != "-" && "%"}{" "}

              </td>
            </>
          )}
        </tr>
      </tbody>
    </Table>
  );
};


function getValue(value, unit, precision) {
  if (value !== null) {
    return (
      <>
        {printValue(value, precision)}
        <span > {unit}</span>
      </>
    );
  } else {
    return <>{printValue(value, precision)}</>;
  }
}
