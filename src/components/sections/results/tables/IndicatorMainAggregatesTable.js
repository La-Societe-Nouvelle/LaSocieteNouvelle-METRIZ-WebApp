// La Société Nouvelle

// React
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";

// Utils
import { printValue } from "/src/utils/formatters";
import { getPrevDate } from "/src/utils/periodsUtils";

// Builder
import {buildFixedCapitalConsumptionsAggregates,buildIntermediateConsumptionsAggregates} from "/src/formulas/aggregatesBuilder";

// Lib
import metaIndics from "/lib/indics";

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorMainAggregatesTable = ({ session, period, indic }) => {
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


  // build aggregates
  useEffect(async () => {
    const intermediateConsumptionsAggregates =
      await buildIntermediateConsumptionsAggregates(financialData, periods);
    setIntermediateConsumptionsAggregates(intermediateConsumptionsAggregates);

    const fixedCapitalConsumptionsAggregates =
      await buildFixedCapitalConsumptionsAggregates(financialData, periods);
    setFixedCapitalConsumptionsAggregates(fixedCapitalConsumptionsAggregates);
  }, [period]);


  // Prev period 

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const periods = [period];
  if (prevPeriod) periods.push(prevPeriod);

  const [showColumn, setShowColumn] = useState(false);

  const toggleColumn = () => {
    setShowColumn(!showColumn);
  };

   // Show Gross Impact column
  const indicsWithGrossImpact = new Set(["ghg", "haz", "mat", "nrg", "was", "wat"]);
  const includeGrossImpact = indicsWithGrossImpact.has(indic);


  return (
    <div className="d-flex">
      <Table id="mainAggregates" className="mb-0">
        <thead>
          <tr>
            <th>Agrégat</th>
            <th colSpan={includeGrossImpact ? "4" : "3"} className="text-center">
              Année N
            </th>
          </tr>

          <tr>
            <td></td>
            {TableHeaderRow(includeGrossImpact)}

          </tr>
          <tr className="small fw-normal">
            <td></td>
            {TableHeaderRowUnits(includeGrossImpact,unit,unitAbsolute)}
          </tr>
        </thead>
        <tbody>
          <tr className="fw-bold">
          <td>&emsp;Production</td>
            {renderDataRow(production, period, indic, nbDecimals, includeGrossImpact)}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            {renderDataRow(revenue, period, indic, nbDecimals, includeGrossImpact)}
          </tr>
          {storedProduction != 0 && (
            <tr>
              <td>&emsp;Production stockée</td>
              {renderDataRow(storedProduction, period, indic, nbDecimals, includeGrossImpact)}
            </tr>
          )}
          {immobilisedProduction.periodsData[period.periodKey].amount > 0 && (
            <tr>
              <td>&emsp;Production immobilisée</td>
              {renderDataRow(immobilisedProduction, period, indic, nbDecimals, includeGrossImpact)}
            </tr>
          )}
          <tr className=" fw-bold">
            <td>Consommations intermédiaires</td>
            {renderDataRow(intermediateConsumptions, period, indic, nbDecimals, includeGrossImpact)}
          </tr>
          {intermediateConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                <td>&emsp;{aggregate.label}</td>
                {renderDataRow(aggregate, period, indic, nbDecimals, includeGrossImpact)}
              </tr>
            )
          )}

          <tr className="fw-bold">
            <td>Consommations de capital fixe</td>
            {renderDataRow(fixedCapitalConsumptions, period, indic, nbDecimals, includeGrossImpact)}
          </tr>

          {fixedCapitalConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                <td>&emsp;{aggregate.label}</td>
                {renderDataRow(aggregate, period, indic, nbDecimals, includeGrossImpact)}

              </tr>
            )
          )}

          <tr className="fw-bold">
            <td>Valeur ajoutée nette</td>
            {renderDataRow(netValueAdded, period, indic, nbDecimals, includeGrossImpact)}

          </tr>
        </tbody>
      </Table>
      {prevPeriod && showColumn && (
        <Table className="prevTable">
          <thead>
            <tr>
              <th
                colSpan={includeGrossImpact ? "4" : "3"}
                className="text-center"
              >
                Année N-1
              </th>
            </tr>
            <tr>
              {TableHeaderRow(includeGrossImpact,unit,unitAbsolute)}

            </tr>
            <tr className="small fw-normal">
            {TableHeaderRowUnits(includeGrossImpact,unit,unitAbsolute)}
            </tr>
          </thead>
          <tbody>
            <tr className="fw-bold">
              {renderDataRow(production, prevPeriod, indic, nbDecimals, includeGrossImpact)}
            </tr>
            <tr>
              {renderDataRow(revenue, prevPeriod, indic, nbDecimals, includeGrossImpact)}
            </tr>
            {storedProduction != 0 && (
              <tr>
                {renderDataRow(storedProduction, prevPeriod, indic, nbDecimals, includeGrossImpact)}
            </tr>
            )}
            {immobilisedProduction.periodsData[prevPeriod.periodKey].amount > 0 && (
               <tr>
                 {renderDataRow(immobilisedProduction, prevPeriod, indic, nbDecimals, includeGrossImpact)}
              </tr>
            )}
          <tr className=" fw-bold">
            {renderDataRow(intermediateConsumptions, prevPeriod, indic, nbDecimals, includeGrossImpact)}
          </tr>
          {intermediateConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                {renderDataRow(aggregate, prevPeriod, indic, nbDecimals, includeGrossImpact)}
              </tr>
            )
          )}
           <tr className="fw-bold">
            {renderDataRow(fixedCapitalConsumptions, prevPeriod, indic, nbDecimals, includeGrossImpact)}
          </tr>
  
          {fixedCapitalConsumptionsAggregates.map(
            (aggregate, index) => (
              <tr key={index}>
                {renderDataRow(aggregate, prevPeriod, indic, nbDecimals, includeGrossImpact)}
              </tr>
            )
          )}

          <tr className="fw-bold">
            {renderDataRow(netValueAdded, prevPeriod, indic, nbDecimals, includeGrossImpact)}
          </tr>
            
          </tbody>
        </Table>
      )}
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
    </div>
  );
};


// Table Rows

const TableHeaderRow = (includeGrossImpact) => {
  return (
    <>
      <th className="text-end">Montant</th>
      <th className="text-end">Empreinte</th>
      <th className="text-end">Incertitude</th>
      {includeGrossImpact && <th className="text-end">Impact</th>}
    </>
  );
};

const TableHeaderRowUnits = (includeGrossImpact, unit, unitAbsolute) => {
  return (
    <>
      <th className="text-end">&euro;</th>
      <th className="text-end">{unit}</th>
      <th className="text-end uncertainty">%</th>
      {includeGrossImpact && <th className="text-end">{unitAbsolute}</th>}
    </>
  );
};

const renderDataRow = (data, period, indic, nbDecimals, includeGrossImpact) => {
  return (
    <>
      <td className="text-end">
        {printValue(data.periodsData[period.periodKey].amount, 0)}
      </td>
      <td className="text-end">
        {printValue(
          data.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
          nbDecimals
        )}
      </td>
      <td className="text-end uncertainty">
        <u>+</u>
        {printValue(
          data.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(),
          0
        )}
      </td>
      {includeGrossImpact && (
        <td className="text-end">
          {printValue(
            data.periodsData[period.periodKey].footprint.indicators[indic].getGrossImpact(
              data.periodsData[period.periodKey].amount
            ),
            nbDecimals
          )}
        </td>
      )}
    </>
  );
};
