// La Société Nouvelle

// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";
import { Table } from "react-bootstrap";

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorMainAggregatesTable = ({ indic, session }) => {
  const financialData = session.financialData;

  const nbDecimals = metaIndics[indic].nbDecimals;
  const unit = metaIndics[indic].unit;
  const unitGrossImpact = metaIndics[indic].unitAbsolute;
  const printGrossImpact = ["ghg", "haz", "mat", "nrg", "was", "wat"].includes(
    indic
  );

  const intermediateConsumptionsAggregates =
    getIntermediateConsumptionsAggregatesGroups(financialData);
  const fixedCapitalConsumptionsAggregates =
    getFixedCapitalConsumptionsAggregatesGroups(financialData);

  const {
    production,
    revenue,
    storedProduction,
    immobilisedProduction,
    intermediateConsumption,
    capitalConsumption,
    netValueAdded,
  } = financialData.aggregates;

  return (
    <>
      <Table id="mainAggregates" size="sm">
        <thead>
          <tr>
            <td colSpan="2">Agrégat</td>
            <td className="column_value">Valeur</td>
            <td className="column_uncertainty">Incertitude</td>
            {printGrossImpact ? (
              <td className="column_value" colSpan="2">
                Impact
              </td>
            ) : null}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-weight-bold">Production</td>
            <td className="column_value">
              {printValue(production.amount, 0)} &euro;
            </td>
            <td className="column_value">
              {printValue(
                production.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              {unit}
            </td>
            <td className="column_uncertainty">
              <u>+</u>&nbsp;
              {printValue(
                production.footprint.indicators[indic].getUncertainty(),
                0
              )}
              &nbsp;%
            </td>
            {printGrossImpact ? (
              <td className="column_value">
                {printValue(
                  production.footprint.indicators[indic].getGrossImpact(
                    production.amount
                  ),
                  nbDecimals
                )}
              </td>
            ) : null}
            {printGrossImpact ? (
              <td className="column_unit">&nbsp;{unitGrossImpact}</td>
            ) : null}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            <td className="column_value">
              {printValue(revenue.amount, 0)} &euro;
            </td>
            <td className="column_value">
              {printValue(
                revenue.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              {unit}
            </td>
            <td className="column_uncertainty">
              <u>+</u>&nbsp;
              {printValue(
                revenue.footprint.indicators[indic].getUncertainty(),
                0
              )}
              &nbsp;%
            </td>
            {printGrossImpact ? (
              <td className="column_value">
                {printValue(
                  revenue.footprint.indicators[indic].getGrossImpact(
                    revenue.amount
                  ),
                  nbDecimals
                )}
              </td>
            ) : null}
            {printGrossImpact ? (
              <td className="column_unit">&nbsp;{unitGrossImpact}</td>
            ) : null}
          </tr>
          {storedProduction != 0 && (
            <tr>
              <td>&emsp;Production stockée</td>
              <td className="column_value">
                {printValue(storedProduction.amount, 0)} &euro;
              </td>
              <td className="column_value">
                {printValue(
                  storedProduction.footprint.indicators[indic].getValue(),
                  nbDecimals
                )}{" "}
                {unit}
              </td>
              <td className="column_uncertainty">
                <u>+</u>&nbsp;
                {printValue(
                  storedProduction.footprint.indicators[indic].getUncertainty(),
                  0
                )}
                &nbsp;%
              </td>
              {printGrossImpact ? (
                <td className="column_value">
                  {printValue(
                    storedProduction.footprint.indicators[indic].getGrossImpact(
                      storedProduction.amount
                    ),
                    nbDecimals
                  )}
                </td>
              ) : null}
              {printGrossImpact ? (
                <td className="column_unit">&nbsp;{unitGrossImpact}</td>
              ) : null}
            </tr>
          )}
          {immobilisedProduction.amount > 0 && (
            <tr>
              <td>&emsp;Production immobilisée</td>
              <td className="column_value">
                ({printValue(immobilisedProduction.amount, 0)}) &euro;
              </td>
              <td className="column_value">
                {printValue(
                  immobilisedProduction.footprint.indicators[indic].getValue(),
                  nbDecimals
                )}{" "}
                {unit}
              </td>
              <td className="column_uncertainty">
                <u>+</u>&nbsp;
                {printValue(
                  immobilisedProduction.footprint.indicators[
                    indic
                  ].getUncertainty(),
                  0
                )}
                &nbsp;%
              </td>
              {printGrossImpact ? (
                <td className="column_value">
                  (
                  {printValue(
                    immobilisedProduction.footprint.indicators[
                      indic
                    ].getGrossImpact(immobilisedProduction.amount),
                    nbDecimals
                  )}
                  )
                </td>
              ) : null}
              {printGrossImpact ? (
                <td className="column_unit">&nbsp;{unitGrossImpact}</td>
              ) : null}
            </tr>
          )}
          <tr className="with-top-line">
            <td className="font-weight-bold">Consommations intermédiaires</td>
            <td className="column_value">
              {printValue(intermediateConsumption.amount, 0)} &euro;
            </td>
            <td className="column_value">
              {printValue(
                intermediateConsumption.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              {unit}
            </td>
            <td className="column_uncertainty">
              <u>+</u>&nbsp;
              {printValue(
                intermediateConsumption.footprint.indicators[
                  indic
                ].getUncertainty(),
                0
              )}
              &nbsp;%
            </td>
            {printGrossImpact ? (
              <td className="column_value">
                {printValue(
                  intermediateConsumption.footprint.indicators[
                    indic
                  ].getGrossImpact(intermediateConsumption.amount),
                  nbDecimals
                )}
              </td>
            ) : null}
            {printGrossImpact ? (
              <td className="column_unit">&nbsp;{unitGrossImpact}</td>
            ) : null}
          </tr>

          {intermediateConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ accountLib, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{accountLib}</td>
                <td className="column_value">{printValue(amount, 0)} &euro;</td>
                <td className="column_value">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}
                  {unit}
                </td>
                <td className="column_uncertainty">
                  <u>+</u>&nbsp;
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                  &nbsp;%
                </td>
                {printGrossImpact ? (
                  <td className="column_value">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                  </td>
                ) : null}
                {printGrossImpact ? (
                  <td className="column_unit">&nbsp;{unitGrossImpact}</td>
                ) : null}
              </tr>
            ))}

          <tr className="with-top-line">
            <td className="font-weight-bold"> Consommations de capital fixe</td>
            <td className="column_value">
              {printValue(capitalConsumption.amount, 0)} &euro;
            </td>
            <td className="column_value">
              {printValue(
                capitalConsumption.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              {unit}
            </td>
            <td className="column_uncertainty">
              <u>+</u>&nbsp;
              {printValue(
                capitalConsumption.footprint.indicators[indic].getUncertainty(),
                0
              )}
              &nbsp;%
            </td>
            {printGrossImpact ? (
              <td className="column_value">
                {printValue(
                  capitalConsumption.footprint.indicators[indic].getGrossImpact(
                    capitalConsumption.amount
                  ),
                  nbDecimals
                )}
              </td>
            ) : null}
            {printGrossImpact ? (
              <td className="column_unit">&nbsp;{unitGrossImpact}</td>
            ) : null}
          </tr>
          {fixedCapitalConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ accountLib, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{accountLib}</td>
                <td className="column_value">{printValue(amount, 0)} &euro;</td>
                <td className="column_value">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}
                  {unit}
                </td>
                <td className="column_uncertainty">
                  <u>+</u>&nbsp;
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}
                  &nbsp;%
                </td>
                {printGrossImpact ? (
                  <td className="column_value">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                  </td>
                ) : null}
                {printGrossImpact ? (
                  <td className="column_unit">&nbsp;{unitGrossImpact}</td>
                ) : null}
              </tr>
            ))}
          <tr>
            <td className="font-weight-bold">Valeur ajoutée nette</td>
            <td className="align-right">
              {printValue(netValueAdded.amount, 0)} &euro;
            </td>
            <td className="align-right">
              {printValue(
                netValueAdded.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              {unit}
            </td>
            <td className="column_uncertainty">
              <u>+</u>&nbsp;
              {printValue(
                netValueAdded.footprint.indicators[indic].getUncertainty(),
                0
              )}
              &nbsp;%
            </td>
            {printGrossImpact ? (
              <td className="column_value">
                {printValue(
                  netValueAdded.footprint.indicators[indic].getGrossImpact(
                    netValueAdded.amount
                  ),
                  nbDecimals
                )}
              </td>
            ) : null}
            {printGrossImpact ? (
              <td className="column_unit">&nbsp;{unitGrossImpact}</td>
            ) : null}
          </tr>
        </tbody>
      </Table>

    </>
  );
};

/* ----- GROUP FUNCTIONS ----- */

// External expenses
const getIntermediateConsumptionsAggregatesGroups = (financialData) => {
  let expensesGroups = financialData.getIntermediateConsumptionsAggregates();
  return expensesGroups;
};

// Depreciation expenses
const getFixedCapitalConsumptionsAggregatesGroups = (financialData) => {
  let expensesGroups = financialData.getFixedCapitalConsumptionsAggregates();
  return expensesGroups;
};
