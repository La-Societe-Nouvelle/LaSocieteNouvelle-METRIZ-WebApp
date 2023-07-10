import React from "react";
import { Col, Row, Table } from "react-bootstrap";
import metaIndics from "/lib/indics";
import { getEvolution } from "../../../../src/utils/Utils";
import { getClosestYearData } from "../utils";
import { printValue } from "../../../../src/utils/Utils";

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
  } = financialData;

  const { unit, nbDecimals } = metaIndics[indic];
  const year = period.periodKey.slice(2);

  const getValue = (data, aggregate, category, serie, indicator) => {
    const closestYearData = getClosestYearData(
      data[aggregate][category][serie].data[indicator.toUpperCase()],
      year
    );
    return closestYearData?.value.toFixed(nbDecimals) ?? "-";
  };

  const getFormattedValue = (data, periodKey, indicator, precision) => {
    const value =
      data.periodsData[periodKey].footprint.getIndicator(indicator).value;
    return printValue(value, precision);
  };

  const displayAreaTarget =
    comparativeData.production.area.target.data[indic.toUpperCase()];
  const displayBrancheTarget =
    comparativeData.production.division.target.data[indic.toUpperCase()];

  return (
    <Row>
      <Col>
        <Table className="comparative-table shadow-sm">
          <thead>
            <tr>
              <td>Agrégat</td>
              {displayAreaTarget && (
                <>
                  <td colSpan={2} className="border-left text-center">
                    France
                    <span className="tw-normal small d-block"> {unit}</span>
                  </td>
                </>
              )}
              {!displayAreaTarget && (
                <>
                  <td className="border-left text-center">
                    France
                    <span className="tw-normal small d-block"> {unit}</span>
                  </td>
                </>
              )}
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

              {displayBrancheTarget && (
                <>
                  <td colSpan={3} className="border-left text-center">
                    Branche
                    <span className="tw-normal small d-block"> {unit}</span>
                  </td>
                </>
              )}
              {!displayBrancheTarget && (
                <>
                  <td className="border-left text-center">
                    Branche
                    <span className="tw-normal small d-block"> {unit}</span>
                  </td>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            <tr className="subth">
              <td scope="row"></td>
              <td className="border-left text-end">Empreinte</td>
              {displayAreaTarget && (
                <td className="text-end">Objectif 2030</td>
              )}
              <td className="border-left text-end">Empreinte</td>
              {prevPeriod && (
                <td className="border-left text-end">Empreinte</td>
              )}

              <td className="border-left text-end">Empreinte</td>
              {displayBrancheTarget && (
                <>
                  <td className="text-end">Objectif 2030</td>
                  <td className="text-end">Evolution (%)</td>
                </>
              )}
            </tr>

            <tr>
              <td>Production</td>
              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "production",
                  "area",
                  "macrodata",
                  indic
                )}
              </td>
              {displayAreaTarget && (
                <td className="text-end">
                  {getValue(
                    comparativeData,
                    "production",
                    "area",
                    "target",
                    indic
                  )}
                </td>
              )}
              <td className="border-left text-end">
                {getFormattedValue(
                  production,
                  period.periodKey,
                  indic,
                  nbDecimals
                )}
              </td>
              {prevPeriod && (
                <td className="border-left text-end">
                  {getFormattedValue(
                    production,
                    prevPeriod.periodKey,
                    indic,
                    nbDecimals
                  )}
                </td>
              )}

              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "production",
                  "division",
                  "macrodata",
                  indic
                )}
              </td>
              {displayBrancheTarget && (
                <>
                  <td className="text-end">
                    {getValue(
                      comparativeData,
                      "production",
                      "division",
                      "target",
                      indic
                    )}
                  </td>
                  <td className="text-end">
                    {getEvolution(
                      getValue(
                        comparativeData,
                        "production",
                        "division",
                        "macrodata",
                        indic
                      ),
                      comparativeData.production.division.target.data[
                        indic.toUpperCase()
                      ].at(-1).value
                    )}
                  </td>
                </>
              )}
            </tr>

            <tr>
              <td>Consommations intermédiaires</td>
              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "intermediateConsumptions",
                  "area",
                  "macrodata",
                  indic
                )}
              </td>
              {displayAreaTarget && (
                <td className="text-end">
                  {getValue(
                    comparativeData,
                    "intermediateConsumptions",
                    "area",
                    "target",
                    indic
                  )}
                </td>
              )}
              <td className="border-left text-end">
                {getFormattedValue(
                  intermediateConsumptions,
                  period.periodKey,
                  indic,
                  nbDecimals
                )}
              </td>
              {prevPeriod && (
                <td className="border-left text-end">
                  {getFormattedValue(
                    intermediateConsumptions,
                    prevPeriod.periodKey,
                    indic,
                    nbDecimals
                  )}
                </td>
              )}

              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "intermediateConsumptions",
                  "division",
                  "macrodata",
                  indic
                )}
              </td>

              {displayBrancheTarget && (
                <>
                  <td className="text-end">
                    {getValue(
                      comparativeData,
                      "intermediateConsumptions",
                      "division",
                      "target",
                      indic
                    )}
                  </td>
                  <td className="text-end">
                    {getEvolution(
                      getValue(
                        comparativeData,
                        "intermediateConsumptions",
                        "division",
                        "macrodata",
                        indic
                      ),

                      comparativeData.intermediateConsumptions.division.target.data[
                        indic.toUpperCase()
                      ].at(-1).value
                    )}
                  </td>
                </>
              )}
            </tr>

            <tr>
              <td>Consommations de capital fixe</td>
              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "fixedCapitalConsumptions",
                  "area",
                  "macrodata",
                  indic
                )}
              </td>
              {displayAreaTarget && (
                <td className="text-end">
                  {getValue(
                    comparativeData,
                    "fixedCapitalConsumptions",
                    "area",
                    "target",
                    indic
                  )}
                </td>
              )}
              <td className="border-left text-end">
                {getFormattedValue(
                  fixedCapitalConsumptions,
                  period.periodKey,
                  indic,
                  nbDecimals
                )}
              </td>
              {prevPeriod && (
                <td className="border-left text-end">
                  {getFormattedValue(
                    fixedCapitalConsumptions,
                    prevPeriod.periodKey,
                    indic,
                    nbDecimals
                  )}
                </td>
              )}

              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "fixedCapitalConsumptions",
                  "division",
                  "macrodata",
                  indic
                )}
              </td>

              {displayBrancheTarget && (
                <>
                  <td className="text-end">
                    {getValue(
                      comparativeData,
                      "fixedCapitalConsumptions",
                      "division",
                      "target",
                      indic
                    )}
                  </td>
                  <td className="text-end">
                    {getEvolution(
                      getValue(
                        comparativeData,
                        "fixedCapitalConsumptions",
                        "division",
                        "macrodata",
                        indic
                      ),

                      comparativeData.fixedCapitalConsumptions.division.target.data[
                        indic.toUpperCase()
                      ].at(-1).value
                    )}
                  </td>
                </>
              )}
            </tr>

            <tr>
              <td>Valeur ajoutée nette</td>
              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "netValueAdded",
                  "area",
                  "macrodata",
                  indic
                )}
              </td>
              {displayAreaTarget && (
                <td className="text-end">
                  {getValue(
                    comparativeData,
                    "netValueAdded",
                    "area",
                    "target",
                    indic
                  )}
                </td>
              )}
              <td className="border-left text-end">
                {getFormattedValue(
                  netValueAdded,
                  period.periodKey,
                  indic,
                  nbDecimals
                )}
              </td>
              {prevPeriod && (
                <td className="border-left text-end">
                  {getFormattedValue(
                    netValueAdded,
                    prevPeriod.periodKey,
                    indic,
                    nbDecimals
                  )}
                </td>
              )}

              <td className="border-left text-end">
                {getValue(
                  comparativeData,
                  "netValueAdded",
                  "division",
                  "macrodata",
                  indic
                )}
              </td>

              {displayBrancheTarget && (
                <>
                  <td className="text-end">
                    {getValue(
                      comparativeData,
                      "netValueAdded",
                      "division",
                      "target",
                      indic
                    )}
                  </td>
                  <td className="text-end">
                    {getEvolution(
                      getValue(
                        comparativeData,
                        "netValueAdded",
                        "division",
                        "macrodata",
                        indic
                      ),

                      comparativeData.netValueAdded.division.target.data[
                        indic.toUpperCase()
                      ].at(-1).value
                    )}
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
