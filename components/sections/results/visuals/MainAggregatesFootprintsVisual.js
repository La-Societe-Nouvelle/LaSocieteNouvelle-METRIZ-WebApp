// La Société Nouvelle

import React from "react";
import { Col, Row } from "react-bootstrap";
import SigPieChart from "../charts/SigPieChart";
import { printValue } from "/src/utils/Utils";

// Lib
import metaIndics from "/lib/indics";

export const MainAggregatesFootprintsVisual = ({
  session,
  period,
  indic
}) => {

  const {
    financialData
  } = session;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  const renderChart = (title, value, id) => {
    return (
      <Col lg={3}>
        <h5 className="mb-4 text-center">{title}</h5>
        <div className="sig-piechart-container">
          <SigPieChart
            value={printValue(value, metaIndics[indic].nbDecimals)}
            title={title}
            id={id}
            isPrinting={false}
          />
        </div>
      </Col>
    );
  };

  return (
    <div className="box">
      <Row>
        <h4>Empreintes des Soldes Intermédiaires de Gestion</h4>
        {renderChart(
          "Production",
          production.periodsData[period.periodKey].footprint.indicators[indic].value,
          "prd-" + indic
        )}
        {renderChart(
          "Consommations intermédiaires",
          intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
          "ic-" + indic
        )}
        {renderChart(
          "Consommation de capital fixe",
          fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value,
          "ccf-" + indic
        )}
        {renderChart(
          "Valeur ajoutée nette",
          netValueAdded.periodsData[period.periodKey].footprint.indicators[indic].getValue(),
          "nva-" + indic
        )}
      </Row>
    </div>
  );
}