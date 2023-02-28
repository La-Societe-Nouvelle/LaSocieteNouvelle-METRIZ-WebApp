// La Société Nouvelle

// Utils
import { printValue } from "/src/utils/Utils";

// Libraries
import metaIndics from "/lib/indics";

// Chart
import SigPieChart from "../charts/SigPieChart";

import { Button, Col, Row, Table } from "react-bootstrap";
import { exportIndicXLSX } from "../../src/writers/ExportXLSX";

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
      <Table id="mainAggregates" size="sm" responsive>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td className="text-end">Montant</td>
            <td className="text-end">Empreinte</td>
            <td className="text-end">Incertitude</td>
            {printGrossImpact ? <td className="text-end">Impact</td> : null}
          </tr>
        </thead>
        <tbody>
          <tr className="fw-bold">
            <td>Production</td>
            <td className="text-end">
              {printValue(production.amount, 0)} &euro;
            </td>
            <td className="text-end">
              {printValue(
                production.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="text-end">
              <u>+</u>
              {printValue(
                production.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td className="text-end">
                {printValue(
                  production.footprint.indicators[indic].getGrossImpact(
                    production.amount
                  ),
                  nbDecimals
                )}
                <span className="unit"> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            <td className="text-end">{printValue(revenue.amount, 0)} &euro;</td>
            <td className="text-end">
              {printValue(
                revenue.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="text-end">
              <u>+</u>
              {printValue(
                revenue.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td className="text-end">
                {printValue(
                  revenue.footprint.indicators[indic].getGrossImpact(
                    revenue.amount
                  ),
                  nbDecimals
                )}
                <span> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          {storedProduction != 0 && (
            <tr>
              <td>&emsp;Production stockée</td>
              <td className="text-end">
                {printValue(storedProduction.amount, 0)} &euro;
              </td>
              <td className="text-end">
                {printValue(
                  storedProduction.footprint.indicators[indic].getValue(),
                  nbDecimals
                )}{" "}
                <span className="unit">{unit}</span>
              </td>
              <td className="text-end">
                <u>+</u>
                {printValue(
                  storedProduction.footprint.indicators[indic].getUncertainty(),
                  0
                )}
                %
              </td>
              {printGrossImpact ? (
                <td className="text-end">
                  {printValue(
                    storedProduction.footprint.indicators[indic].getGrossImpact(
                      storedProduction.amount
                    ),
                    nbDecimals
                  )}
                  <span> {unitGrossImpact}</span>
                </td>
              ) : null}
            </tr>
          )}
          {immobilisedProduction.amount > 0 && (
            <tr>
              <td>&emsp;Production immobilisée</td>
              <td className="text-end">
                ({printValue(immobilisedProduction.amount, 0)}) &euro;
              </td>
              <td className="text-end">
                {printValue(
                  immobilisedProduction.footprint.indicators[indic].getValue(),
                  nbDecimals
                )}{" "}
                <span className="unit">{unit}</span>
              </td>
              <td className="text-end">
                <u>+</u>
                {printValue(
                  immobilisedProduction.footprint.indicators[
                    indic
                  ].getUncertainty(),
                  0
                )}
                %
              </td>
              {printGrossImpact ? (
                <td className="text-end">
                  (
                  {printValue(
                    immobilisedProduction.footprint.indicators[
                      indic
                    ].getGrossImpact(immobilisedProduction.amount),
                    nbDecimals
                  )}
                  )<span className="unit"> {unitGrossImpact}</span>
                </td>
              ) : null}
            </tr>
          )}
          <tr className="border-top  fw-bold">
            <td>Consommations intermédiaires</td>
            <td className="text-end">
              {printValue(intermediateConsumption.amount, 0)} &euro;
            </td>
            <td className="text-end">
              {printValue(
                intermediateConsumption.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="text-end">
              <u>+</u>
              {printValue(
                intermediateConsumption.footprint.indicators[
                  indic
                ].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td className="text-end">
                {printValue(
                  intermediateConsumption.footprint.indicators[
                    indic
                  ].getGrossImpact(intermediateConsumption.amount),
                  nbDecimals
                )}
                <span> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>

          {intermediateConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ accountLib, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{accountLib}</td>
                <td className="text-end">{printValue(amount, 0)} &euro;</td>
                <td className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}
                  <span className="unit">{unit}</span>
                </td>
                <td className="text-end">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}%
                </td>
                {printGrossImpact ? (
                  <td className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    <span> {unitGrossImpact}</span>
                  </td>
                ) : null}
              </tr>
            ))}

          <tr className="border-top  fw-bold">
            <td> Consommations de capital fixe</td>
            <td className="text-end">
              {printValue(capitalConsumption.amount, 0)} &euro;
            </td>
            <td className="text-end">
              {printValue(
                capitalConsumption.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="text-end">
              <u>+</u>
              {printValue(
                capitalConsumption.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td className="text-end">
                {printValue(
                  capitalConsumption.footprint.indicators[indic].getGrossImpact(
                    capitalConsumption.amount
                  ),
                  nbDecimals
                )}{" "}
                <span className="unit"> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
          {fixedCapitalConsumptionsAggregates
            .filter((aggregate) => aggregate.amount != 0)
            .map(({ accountLib, amount, footprint }, index) => (
              <tr key={index}>
                <td>&emsp;{accountLib}</td>
                <td className="text-end">{printValue(amount, 0)} &euro;</td>
                <td className="text-end">
                  {printValue(
                    footprint.indicators[indic].getValue(),
                    nbDecimals
                  )}{" "}
                  <span className="unit"> {unit} </span>
                </td>
                <td className="text-end">
                  <u>+</u>
                  {printValue(footprint.indicators[indic].getUncertainty(), 0)}%
                </td>
                {printGrossImpact ? (
                  <td className="text-end">
                    {printValue(
                      footprint.indicators[indic].getGrossImpact(amount),
                      nbDecimals
                    )}
                    <span> {unitGrossImpact}</span>
                  </td>
                ) : null}
              </tr>
            ))}

          <tr className="border-top  fw-bold">
            <td>Valeur ajoutée nette</td>
            <td className="text-end">
              {printValue(netValueAdded.amount, 0)} &euro;
            </td>
            <td className="text-end">
              {printValue(
                netValueAdded.footprint.indicators[indic].getValue(),
                nbDecimals
              )}{" "}
              <span className="unit">{unit}</span>
            </td>
            <td className="text-end">
              <u>+</u>
              {printValue(
                netValueAdded.footprint.indicators[indic].getUncertainty(),
                0
              )}
              %
            </td>
            {printGrossImpact ? (
              <td className="text-end" title="Impact direct de l'entreprise">
                {printValue(
                  netValueAdded.footprint.indicators[indic].getGrossImpact(
                    netValueAdded.amount
                  ),
                  nbDecimals
                )}
                <span> {unitGrossImpact}</span>
              </td>
            ) : null}
          </tr>
        </tbody>
      </Table>
      <div className="text-end">
        <Button
          variant="tertiary"
          size="sm"
          className="me-0 mb-2"
          onClick={() => exportIndicXLSX(indic, session)}
        >
          Télécharger les données <i className="bi bi-download"></i>
        </Button>
      </div>
      {metaIndics[indic].type == "proportion" && (
        <Row>
          <hr />
          <Col>
            <h5 className="mb-4 text-center">▪ Production</h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  production.footprint.indicators[indic].value,
                  nbDecimals
                )}
                title={"Production"}
                id={"prd-" + indic}
              />
            </div>
          </Col>
          <Col>
            <h5 className="mb-4 text-center">▪ Consommations intermédiaires</h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  intermediateConsumption.footprint.indicators[indic].value,
                  nbDecimals
                )}
                title={"Consommations intermédiaires"}
                id={"ic-" + indic}
              />
            </div>
          </Col>
          <Col>
            <h5 className="mb-4 text-center">▪ Consommations de capital fixe</h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  capitalConsumption.footprint.indicators[indic].value,
                  nbDecimals
                )}
                title={"Consommation de capital fixe"}
                id={"ccf-" + indic}
              />
            </div>
          </Col>
          <Col>
            <h5 className="mb-4 text-center">▪ Valeur ajoutée nette</h5>
            <div className="doughtnut-chart-container">
              <SigPieChart
                value={printValue(
                  netValueAdded.footprint.indicators[indic].getValue(),
                  nbDecimals
                )}
                title={"Valeur ajoutée nette"}
                id={"nva-" + indic}
              />
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

/* ----- GROUP FUNCTIONS ----- */

// External expenses
export const getIntermediateConsumptionsAggregatesGroups = (financialData) => {
  let expensesGroups = financialData.getIntermediateConsumptionsAggregates();
  return expensesGroups;
};

// Depreciation expenses
export const getFixedCapitalConsumptionsAggregatesGroups = (financialData) => {
  let expensesGroups = financialData.getFixedCapitalConsumptionsAggregates();
  return expensesGroups;
};
