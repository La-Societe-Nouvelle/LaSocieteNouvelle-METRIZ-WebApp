// La Société Nouvelle

// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import { Table } from "react-bootstrap";
import { buildFixedCapitalConsumptionsAggregates, buildIntermediateConsumptionsAggregates } from "../../src/formulas/aggregatesBuilder";
import { useEffect, useState } from "react";

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorMainAggregatesTable = ({ indic, session, period }) => 
{ 

  const financialData = session.financialData;

  const nbDecimals = metaIndics[indic].nbDecimals;
  const unit = metaIndics[indic].unit;
  const unitGrossImpact = metaIndics[indic].unitAbsolute;
  const printGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );

  const [intermediateConsumptionsAggregates, setIntermediateConsumptionsAggregates] = useState([]);
  const [fixedCapitalConsumptionsAggregates, setFixedCapitalConsumptionsAggregates] = useState([]);

  useEffect(async () => {
    const intermediateConsumptionsAggregates = await buildIntermediateConsumptionsAggregates(financialData,period.periodKey);
    setIntermediateConsumptionsAggregates(intermediateConsumptionsAggregates);
    const fixedCapitalConsumptionsAggregates = await buildFixedCapitalConsumptionsAggregates(financialData,period.periodKey);
    setFixedCapitalConsumptionsAggregates(fixedCapitalConsumptionsAggregates);
  }, []);

  
  console.log(intermediateConsumptionsAggregates);
  console.log(fixedCapitalConsumptionsAggregates);
  
  const {
    revenue,
    storedProduction,
    immobilisedProduction
  } = financialData.productionAggregates;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  return (
    <>
      <Table id="mainAggregates" size="sm" responsive>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td  className="text-end">Montant</td>
            <td  className="text-end">Empreinte</td>
            <td  className="text-end">Incertitude</td>
            {printGrossImpact ? (
              <td  className="text-end">
                Impact
              </td>
            ) : null}
          </tr>
        </thead>
        <tbody>
          <tr  className="fw-bold">
            <td >Production</td>
            <td  className="text-end">
              {printValue(production.periodsData[period.periodKey].amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                production.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span >{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                production.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  production.periodsData[period.periodKey].footprint.indicators[indic].getGrossImpact(
                    production.periodsData[period.periodKey].amount
                  ),
                  nbDecimals
                )}<span > {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            <td  className="text-end">
              {printValue(revenue.periodsData[period.periodKey].amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                revenue.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span >{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                revenue.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  revenue.periodsData[period.periodKey].footprint.indicators[indic].getGrossImpact(
                    revenue.periodsData[period.periodKey].amount
                  ),
                  nbDecimals
                )}
                <span > {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          {storedProduction != 0 && (
            <tr>
              <td>&emsp;Production stockée</td>
              <td  className="text-end" >
                {printValue(storedProduction.periodsData[period.periodKey].amount, 0)} &euro;
              </td>
              <td  className="text-end">
                {printValue(
                  storedProduction.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
                  nbDecimals
                )} <span >{unit}</span>
              </td>
              <td  className="text-end" >
                <u>+</u>
                {printValue(
                  storedProduction.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(),
                  0
                )}
                %
              </td>
              {printGrossImpact ? (
                <td  className="text-end">
                  {printValue(
                    storedProduction.periodsData[period.periodKey].footprint.indicators[indic].getGrossImpact(
                      storedProduction.periodsData[period.periodKey].amount
                    ),
                    nbDecimals
                  )}
                  <span > {unitGrossImpact}</span>
                </td>
              ) : null}
            </tr>
          )}
          {immobilisedProduction.periodsData[period.periodKey].amount > 0 && (
            <tr>
              <td>&emsp;Production immobilisée</td>
              <td  className="text-end">
                ({printValue(immobilisedProduction.periodsData[period.periodKey].amount, 0)}) &euro;
              </td>
              <td  className="text-end">
                {printValue(
                  immobilisedProduction.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
                  nbDecimals
                )} <span >{unit}</span>
              </td>
              <td  className="text-end">
                <u>+</u>
                {printValue(
                  immobilisedProduction.periodsData[period.periodKey].footprint.indicators[
                    indic
                  ].getUncertainty(),
                  0
                )}
                %
              </td>
              {printGrossImpact ? (
                <td  className="text-end" >
                  (
                  {printValue(
                    immobilisedProduction.periodsData[period.periodKey].footprint.indicators[
                      indic
                    ].getGrossImpact(immobilisedProduction.periodsData[period.periodKey].amount),
                    nbDecimals
                  )}
                  )
                  <span > {unitGrossImpact}</span>
                </td>
              ) : null}
            </tr>
          )}
          <tr className="border-top  fw-bold">
            <td>Consommations intermédiaires</td>
            <td className="text-end">
              {printValue(intermediateConsumptions.periodsData[period.periodKey].amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span >{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[
                  indic
                ].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[
                    indic
                  ].getGrossImpact(intermediateConsumptions.periodsData[period.periodKey].amount),
                  nbDecimals
                )}
                <span > {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>

          {intermediateConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({label,amount,footprint}, index) => (
              <tr key={index}>
                <td>&emsp;{label}</td>
                <td  className="text-end">{printValue(amount, 0)} &euro;</td>
                <td  className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )} <span >{unit}</span>
                </td>
                <td  className="text-end">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                  %
                </td>
                {printGrossImpact ? (
                  <td  className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    <span > {unitGrossImpact}</span>
                  </td>
                ) : null}
              </tr>
            ))}

          <tr className="border-top  fw-bold">
            <td>Consommations de capital fixe</td>
            <td  className="text-end">
              {printValue(fixedCapitalConsumptions.periodsData[period.periodKey].amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span >{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td  className="text-end">
                {printValue(
                  fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].getGrossImpact(
                    capitalConsumption.amount
                  ),
                  nbDecimals
                )} <span > {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          {fixedCapitalConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ label, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{label}</td>
                <td  className="text-end">{printValue(amount, 0)} &euro;</td>
                <td  className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )} <span > {unit} </span>
                </td>
                <td  className="text-end">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                  %
                </td>
                {printGrossImpact ? (
                  <td  className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    <span > {unitGrossImpact}</span>
                  </td>
                ) : null}
              </tr>
            ))}

          <tr className="border-top  fw-bold">
            <td>Valeur ajoutée nette</td>
            <td  className="text-end">
              {printValue(netValueAdded.periodsData[period.periodKey].amount, 0)} &euro;
            </td>
            <td  className="text-end">
              {printValue(
                netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
                nbDecimals
              )} <span >{unit}</span>
            </td>
            <td  className="text-end">
              <u>+</u>
              {printValue(
                netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td className="text-end" title="Impact direct de l'entreprise">
                {printValue(
                  netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].getGrossImpact(
                    netValueAdded.periodsData[period.periodKey].amount
                  ),
                  nbDecimals
                )}
                <span > {unitGrossImpact}</span>
              </td>
            ) : null}

          </tr>
        </tbody>
      </Table>

    </>
  );
};