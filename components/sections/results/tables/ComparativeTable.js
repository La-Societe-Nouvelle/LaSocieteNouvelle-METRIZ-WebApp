// La Société Nouvelle

import { Col, Row, Table } from "react-bootstrap";
// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import { getEvolution } from "/src/utils/Utils";

export const ComparativeTable = ({
  financialData,
  indic,
  comparativeData,
  period,
  prevPeriod,
}) => {
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
    comparativeData.production.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value
  );
  const consumptionEvolutionBranch = getEvolution(
    comparativeData.intermediateConsumptions.divisionFootprint.indicators[indic]
      .value,
    comparativeData.intermediateConsumptions.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value
  );
  const valueAddedEvolutionBranch = getEvolution(
    comparativeData.netValueAdded.divisionFootprint.indicators[indic].value,
    comparativeData.netValueAdded.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value
  );

  const fixedCapitalConsumptionsEvolutionBranch = getEvolution(
    comparativeData.fixedCapitalConsumptions.divisionFootprint.indicators[indic]
      .value,
    comparativeData.fixedCapitalConsumptions.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value
  );

  const displayTargetColumn =
    comparativeData.production.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value == null &&
    comparativeData.netValueAdded.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value == null &&
    comparativeData.intermediateConsumptions.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value == null &&
    comparativeData.fixedCapitalConsumptions.targetDivisionFootprint.indicators[
      indic
    ].data.at(-1).value == null
      ? false
      : true;

  const displayDivisionColumn =
    comparativeData.production.divisionFootprint.indicators[indic].value ==
      null &&
    comparativeData.netValueAdded.divisionFootprint.indicators[indic].value ==
      null &&
    comparativeData.intermediateConsumptions.divisionFootprint.indicators[indic]
      .value == null &&
    comparativeData.fixedCapitalConsumptions.divisionFootprint.indicators[indic]
      .value == null
      ? false
      : true;

  return (
    <Row>
      <Col>
          <Table className="comparative-table shadow-sm">
            <thead>
              <tr>
                <td>Agrégat</td>
                <td
                  colSpan={displayTargetColumn ? 2 : 0}
                  className="border-left text-center"
                >
                  France
                  <span className="tw-normal small d-block"> {unit}</span>
                </td>
                <td className="border-left text-center">
                  Exercice en cours
                  <span className="tw-normal small d-block"> {unit}</span>
                </td>
                {prevPeriod && (
                  <td className="border-left text-center">
                    Exercice précédent
                    <span className="tw-normal small d-block"> {unit}</span>
                  </td>
                )}
                {displayDivisionColumn && (
                  <td
                    colSpan={displayTargetColumn ? 3 : 2}
                    className="border-left text-center"
                  >
                    Branche
                    <span className="tw-normal small d-block"> {unit}</span>
                  </td>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="subth">
                <td scope="row"></td>
                <td className="border-left text-end">Empreinte</td>
                {displayTargetColumn && (
                  <td className="text-end">Objectif 2030</td>
                )}
                <td className="border-left text-end">Empreinte</td>
                {prevPeriod && (
                  <td className="border-left text-end">Empreinte</td>
                )}
                {displayDivisionColumn && (
                  <>
                    <td className="border-left text-end">Empreinte</td>
                    {displayTargetColumn && (
                      <>
                        <td className="text-end">Objectif 2030</td>
                        <td className="text-end">Evolution (%)</td>
                      </>
                    )}
                  </>
                )}
              </tr>

              <tr>
                <td>Production</td>
                <td className="border-left text-end">
                  {getValue(
                    comparativeData.production.areaFootprint.indicators[indic]
                      .value,
                    unit,
                    precision
                  )}
                </td>
                {displayTargetColumn && (
                  <td className="text-end">
                    {getValue(
                      comparativeData.production.targetAreaFootprint.indicators[
                        indic
                      ].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
                <td className="border-left text-end">
                  {printValue(
                    production.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    precision
                  )}
                </td>
                {prevPeriod && (
                  <td className="border-left text-end">
                    {printValue(
                      production.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                      precision
                    )}
                  </td>
                )}
                {displayDivisionColumn && (
                  <td className="border-left text-end">
                    {getValue(
                      comparativeData.production.divisionFootprint.indicators[
                        indic
                      ].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
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
                      {productionEvolutionBranch != "-"}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td>Consommations intermédiaires</td>
                <td className="border-left text-end">
                  {getValue(
                    comparativeData.intermediateConsumptions.areaFootprint
                      .indicators[indic].value,
                    unit,
                    precision
                  )}
                </td>
                {displayTargetColumn && (
                  <td className="text-end">
                    {getValue(
                      comparativeData.intermediateConsumptions
                        .targetAreaFootprint.indicators[indic].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
                <td className="border-left text-end">
                  {printValue(
                    intermediateConsumptions.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    precision
                  )}
                </td>
                {prevPeriod && (
                  <td className="border-left text-end">
                    {printValue(
                      intermediateConsumptions.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                      precision
                    )}
                  </td>
                )}
                {displayDivisionColumn && (
                  <td className="border-left text-end">
                    {getValue(
                      comparativeData.intermediateConsumptions.divisionFootprint
                        .indicators[indic].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
                {displayTargetColumn && (
                  <>
                    <td className="text-end">
                      {getValue(
                        comparativeData.intermediateConsumptions.targetDivisionFootprint.indicators[
                          indic
                        ].data.at(-1).value,
                        unit,
                        precision
                      )}
                    </td>
                    <td className="text-end">
                      {consumptionEvolutionBranch}
                      {consumptionEvolutionBranch != "-"}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td>Consommations de capital fixe</td>
                <td className="border-left text-end">
                  {getValue(
                    comparativeData.fixedCapitalConsumptions.areaFootprint
                      .indicators[indic].value,
                    unit,
                    precision
                  )}
                </td>
                {displayTargetColumn && (
                  <td className="text-end">
                    {getValue(
                      comparativeData.fixedCapitalConsumptions
                        .targetAreaFootprint.indicators[indic].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
                <td className="border-left text-end">
                  {printValue(
                    fixedCapitalConsumptions.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    precision
                  )}
                </td>
                {prevPeriod && (
                  <td className="border-left text-end">
                    {printValue(
                      fixedCapitalConsumptions.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                      precision
                    )}
                  </td>
                )}
                {displayDivisionColumn && (
                  <td className="border-left text-end">
                    {getValue(
                      comparativeData.fixedCapitalConsumptions.divisionFootprint
                        .indicators[indic].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
                {displayTargetColumn && (
                  <>
                    <td className="text-end">
                      {getValue(
                        comparativeData.fixedCapitalConsumptions.targetDivisionFootprint.indicators[
                          indic
                        ].data.at(-1).value,
                        unit,
                        precision
                      )}
                    </td>
                    <td className="text-end">
                      {fixedCapitalConsumptionsEvolutionBranch}
                      {fixedCapitalConsumptionsEvolutionBranch != "-"}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td>Valeur ajoutée</td>
                <td className="border-left text-end">
                  {getValue(
                    comparativeData.netValueAdded.areaFootprint.indicators[
                      indic
                    ].value,
                    unit,
                    precision
                  )}
                </td>
                {displayTargetColumn && (
                  <td className="text-end">
                    {getValue(
                      comparativeData.netValueAdded.targetAreaFootprint
                        .indicators[indic].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
                <td className="border-left text-end">
                  {printValue(
                    netValueAdded.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    precision
                  )}
                </td>
                {prevPeriod && (
                  <td className="border-left text-end">
                    {printValue(
                      netValueAdded.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                      precision
                    )}
                  </td>
                )}
                {displayDivisionColumn && (
                  <td className="border-left text-end">
                    {getValue(
                      comparativeData.netValueAdded.divisionFootprint
                        .indicators[indic].value,
                      unit,
                      precision
                    )}
                  </td>
                )}
                {displayTargetColumn && (
                  <>
                    <td className="text-end">
                      {getValue(
                        comparativeData.netValueAdded.targetDivisionFootprint.indicators[
                          indic
                        ].data.at(-1).value,
                        unit,
                        precision
                      )}
                    </td>
                    <td className="text-end">
                      {valueAddedEvolutionBranch}
                      {valueAddedEvolutionBranch != "-"}{" "}
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </Table>
      </Col>
    </Row>
  );
};

function getValue(value, unit, precision) {
  if (value !== null) {
    return <>{printValue(value, precision)}</>;
  } else {
    return <>{printValue(value, precision)}</>;
  }
}
