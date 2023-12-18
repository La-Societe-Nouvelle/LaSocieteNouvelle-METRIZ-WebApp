// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/formatters";

// Builder
import {buildFixedCapitalConsumptionsAggregates,buildIntermediateConsumptionsAggregates} from "/src/formulas/aggregatesBuilder";

// Lib
import metaIndics from "/lib/indics";
import { TableHeaderRow, TableHeaderRowUnits } from "./utils";

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorMainAggregatesTable = ({ session, period, prevPeriod, indic }) => {
  // Session data -------------------------------------
  const { financialData } = session;

  const { revenue, storedProduction, immobilisedProduction } = financialData.productionAggregates;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  // Meta data ----------------------------------------

  const { unit, nbDecimals, unitAbsolute } = metaIndics[indic];
  // --------------------------------------------------

  // state
  const [
    intermediateConsumptionsAggregates,
    setIntermediateConsumptionsAggregates,
  ] = useState([]);

  const [
    fixedCapitalConsumptionsAggregates,
    setFixedCapitalConsumptionsAggregates,
  ] = useState([]);


    // Prev period 
    const periods = [period];
    if (prevPeriod) periods.push(prevPeriod);

  // build aggregates
  useEffect(async () => {
    const intermediateConsumptionsAggregates =
      await buildIntermediateConsumptionsAggregates(financialData, periods);
    setIntermediateConsumptionsAggregates(intermediateConsumptionsAggregates);

    const fixedCapitalConsumptionsAggregates =
      await buildFixedCapitalConsumptionsAggregates(financialData, periods);
    setFixedCapitalConsumptionsAggregates(fixedCapitalConsumptionsAggregates);
  }, [period]);


  const [showColumn, setShowColumn] = useState(false);

  const toggleColumn = () => {
    setShowColumn(!showColumn);
  };

   // Show Gross Impact column
  const indicsWithGrossImpact = new Set(["ghg", "haz", "mat", "nrg", "was", "wat"]);
  const showGrossImpact = indicsWithGrossImpact.has(indic);

  return (
    <div className="d-flex">
      <Table id="mainAggregates" className="mb-0">
        <thead>
          <tr>
            <th>Agrégat</th>
            <th colSpan={showGrossImpact ? "4" : "3"} className="text-center">
              Année N
            </th>
          </tr>

          <tr>
            <th></th>
            <th className="text-end">Montant</th>
            {TableHeaderRow(showGrossImpact)}
          </tr>
          <tr className="small fw-normal">
            <td></td>
            {TableHeaderRowUnits(showGrossImpact, unit, unitAbsolute)}
          </tr>
        </thead>
        <tbody>
          <tr className="fw-bold">
          <td>&emsp;Production</td>
            {renderDataRow(production, period, indic, nbDecimals, showGrossImpact)}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            {renderDataRow(revenue, period, indic, nbDecimals, showGrossImpact)}
          </tr>
          {storedProduction != 0 && (
            <tr>
              <td>&emsp;Production stockée</td>
              {renderDataRow(storedProduction, period, indic, nbDecimals, showGrossImpact)}
            </tr>
          )}
          {immobilisedProduction.periodsData[period.periodKey].amount > 0 && (
            <tr>
              <td>&emsp;Production immobilisée</td>
              {renderDataRow(immobilisedProduction, period, indic, nbDecimals, showGrossImpact)}
            </tr>
          )}
          <tr className=" fw-bold">
            <td>Consommations intermédiaires</td>
            {renderDataRow(intermediateConsumptions, period, indic, nbDecimals, showGrossImpact)}
          </tr>
          {intermediateConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                <td>&emsp;{aggregate.label}</td>
                {renderDataRow(aggregate, period, indic, nbDecimals, showGrossImpact)}
              </tr>
            )
          )}

          <tr className="fw-bold">
            <td>Consommations de capital fixe</td>
            {renderDataRow(fixedCapitalConsumptions, period, indic, nbDecimals, showGrossImpact)}
          </tr>

          {fixedCapitalConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                <td>&emsp;{aggregate.label}</td>
                {renderDataRow(aggregate, period, indic, nbDecimals, showGrossImpact)}

              </tr>
            )
          )}

          <tr className="fw-bold">
            <td>Valeur ajoutée nette</td>
            {renderDataRow(netValueAdded, period, indic, nbDecimals, showGrossImpact)}

          </tr>
        </tbody>
      </Table>
      {prevPeriod && showColumn && (
        <Table className="prevTable">
          <thead>
            <tr>
              <th
                colSpan={showGrossImpact ? "4" : "3"}
                className="text-center"
              >
                Année N-1
              </th>
            </tr>
            <tr>
            <th className="text-end">Montant</th>
              {TableHeaderRow(showGrossImpact,unit,unitAbsolute)}
            </tr>
            <tr className="small fw-normal">
            {TableHeaderRowUnits(showGrossImpact,unit,unitAbsolute)}
            </tr>
          </thead>
          <tbody>
            <tr className="fw-bold">
              {renderDataRow(production, prevPeriod, indic, nbDecimals, showGrossImpact)}
            </tr>
            <tr>
              {renderDataRow(revenue, prevPeriod, indic, nbDecimals, showGrossImpact)}
            </tr>
            {storedProduction != 0 && (
              <tr>
                {renderDataRow(storedProduction, prevPeriod, indic, nbDecimals, showGrossImpact)}
            </tr>
            )}
            {immobilisedProduction.periodsData[prevPeriod.periodKey].amount > 0 && (
               <tr>
                 {renderDataRow(immobilisedProduction, prevPeriod, indic, nbDecimals, showGrossImpact)}
              </tr>
            )}
          <tr className=" fw-bold">
            {renderDataRow(intermediateConsumptions, prevPeriod, indic, nbDecimals, showGrossImpact)}
          </tr>
          {intermediateConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                {renderDataRow(aggregate, prevPeriod, indic, nbDecimals, showGrossImpact)}
              </tr>
            )
          )}
           <tr className="fw-bold">
            {renderDataRow(fixedCapitalConsumptions, prevPeriod, indic, nbDecimals, showGrossImpact)}
          </tr>
  
          {fixedCapitalConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                {renderDataRow(aggregate, prevPeriod, indic, nbDecimals, showGrossImpact)}
              </tr>
            ))}

          <tr className="fw-bold">
            {renderDataRow(netValueAdded, prevPeriod, indic, nbDecimals, showGrossImpact)}
          </tr>
            
          </tbody>
        </Table>
      )}
      {prevPeriod && (
        <Button onClick={toggleColumn} className="vertical-button">
          {showColumn ? (
            <>
              <i className="bi bi-dash-circle me-2"></i> Masquer N-1
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i> Afficher N-1
            </>
          )}
        </Button>
      )}
    </div>
  );
};

const renderDataRow = (data, period, indic, nbDecimals, showGrossImpact) => {
  return (
    <>
      <td className="text-end">
        {printValue(data.periodsData[period.periodKey].amount, 0)}
      </td>
      <td className="text-end">
        {printValue(
          data.periodsData[period.periodKey].footprint.indicators[
            indic
          ].getValue(),
          nbDecimals
        )}
      </td>
      <td className="text-end uncertainty">
        <u>+</u>
        {printValue(
          data.periodsData[period.periodKey].footprint.indicators[
            indic
          ].getUncertainty(),
          0
        )}
      </td>
      {showGrossImpact && (
        <td className="text-end">
          {printValue(
            data.periodsData[period.periodKey].footprint.indicators[
              indic
            ].getGrossImpact(data.periodsData[period.periodKey].amount),
            nbDecimals
          )}
        </td>
      )}
    </>
  );
};
