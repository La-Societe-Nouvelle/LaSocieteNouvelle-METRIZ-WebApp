// La Société Nouvelle

// React
import React from "react";
import { Col, Row, Table } from "react-bootstrap";

// Lib
import metaIndics from "/lib/indics";

// Utils
import { printValue } from "/src/utils/formatters";

const aggregates = [
  "production",
  "intermediateConsumptions",
  "fixedCapitalConsumptions",
  "netValueAdded"
];

export const ComparativeTable = ({
  session,
  period,
  indic,
  showAreaFootprint,
  showTarget,
  showPreviousData,
  showDivisionData
}) => {

  const {
    financialData,
    comparativeData
  } = session;

  const prevDateEnd = period.dateEnd;
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const { unit, nbDecimals } = metaIndics[indic];
  
  const printCompanyFootprint = (aggregate,periodKey) => {
    return printValue(financialData.mainAggregates[aggregate].periodsData[periodKey].footprint.getIndicator(indic).value, 
      nbDecimals
    )
  }

  const printComparativeFootprint = (aggregate, category, dataset) => {
    return comparativeData[aggregate][category][dataset].data[indic].length>0 
      ? printValue(
        comparativeData[aggregate][category][dataset].data[indic].at(-1).value, 
        nbDecimals)
      : null;
  }
  
  const getPercentageGap = (value, reference) => {
    if (reference) {
      const evolution = ((value - reference) / reference) * 100;
      return evolution.toFixed(0);
    } else {
      return "-";
    }
  }

  return (
    <Row>
      <Col>
        <Table className="comparative-table">
          <thead>
            <tr>
              <td>Agrégat</td>
              {showAreaFootprint && (
                <td colSpan={showTarget ? 2 : 1} className="border-left text-center">
                  France
                  <span className="tw-normal small d-block"> {unit}</span>
                </td>
              )}
              <td className="border-left text-center">
                Exercice en cours
                <span className="tw-normal small d-block"> {unit}</span>
              </td>
              {showPreviousData && (
                <td colSpan={2} className="border-left text-center">
                  Exercice précédent
                  <span className="tw-normal small d-block"> {unit}</span>
                </td>
              )}
              {showDivisionData && (
                <td colSpan={showTarget ? 3 : 1} className="border-left text-center">
                  Branche
                  <span className="tw-normal small d-block"> {unit}</span>
                </td>
              )}
            </tr>
          </thead>
          <tbody>

            <tr className="subth">
              <td scope="row"></td>
              {(showAreaFootprint) && (
                <td className="border-left text-center">Empreinte</td>
              )}
              {(showAreaFootprint && showTarget) && (
                <td className="text-center">Objectif 2030</td>
              )}
              <td className="border-left text-center">Empreinte</td>
              {(showPreviousData) && (
                <>
                  <td className="border-left text-center">Empreinte</td>
                  <td className="border-left text-center">Evolution</td>
                </>
              )}
              {(showDivisionData) && (
                <td className="border-left text-center">Empreinte</td>
              )}
              {(showDivisionData && showTarget) && (
                <td className="text-center" colSpan={2}>Objectif 2030</td>
              )}
            </tr>

            {aggregates.map((aggregate) => 
              <tr key={aggregate}>
                <td>{financialData.mainAggregates[aggregate].label}</td>
                {showAreaFootprint && (
                  <td className="border-left text-end">
                    {printComparativeFootprint(aggregate,"area","history")}
                  </td>
                )}
                {(showAreaFootprint && showTarget && comparativeData[aggregate].area.target.data[indic].length>0) && (
                  <td className="text-end">
                    {printComparativeFootprint(aggregate,"area","target")}
                  </td>
                )}
                <td className="border-left text-end">
                  {printCompanyFootprint(aggregate,period.periodKey)}
                </td>
                {(showPreviousData) && (
                  <>
                    <td className="border-left text-end">
                      {printCompanyFootprint(aggregate,prevPeriod.periodKey)}
                    </td> 
                    <td className="text-end">
                      {getPercentageGap(
                        financialData.mainAggregates[aggregate].periodsData[period.periodKey].footprint.indicators[indic].value,
                        financialData.mainAggregates[aggregate].periodsData[prevPeriod.periodKey].footprint.indicators[indic].value
                      )+"%"}
                    </td> 
                  </>
                )}
                {(showDivisionData) && (
                  <td className="border-left text-end">
                    {printComparativeFootprint(aggregate,"division","history")}
                  </td>   
                )}
                {(showDivisionData && showTarget && comparativeData[aggregate].division.target.data[indic].length>0) && (
                  <>
                    <td className="text-end">
                      {printComparativeFootprint(aggregate,"division","target")}
                    </td>
                    <td className="text-end">
                      {getPercentageGap(
                        comparativeData[aggregate].division.target.data[indic].at(-1).value,
                        comparativeData[aggregate].division.history.data[indic].at(-1).value
                      )+"%"}
                    </td>
                  </>
                )}
              </tr>
            )}

          </tbody>
        </Table>
      </Col>
    </Row>
  );
}