// La Société Nouvelle

import React from "react";
import { Col, Row } from "react-bootstrap";
import SigPieChart from "../charts/SigPieChart";

// Lib
import { ValueDistributionChart } from "../charts/ValueDistributionChart";
import { getPrevDate } from "../../../../utils/periodsUtils";

export const MainAggregatesFootprintsVisual = ({ session, period, indic }) => {
  const { financialData } = session;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  // Prev period

  const prevDateEnd = getPrevDate(period.dateStart);
  const prevPeriod =
    session.availablePeriods.find((period) => period.dateEnd == prevDateEnd) ||
    false;

  const renderChart = (aggregate, id) => {
    return (
      <Col lg={3}>
        <h5 className="mb-4 text-center">{aggregate.label}</h5>
        <div className="sig-piechart-container">
          
          <SigPieChart
            aggregate={aggregate}
            indic={indic}
            period={period}
            prevPeriod={prevPeriod}
            id={id}
            showPreviousData={true}
            printMode={false}
          />
        </div>
      </Col>
    );
  };

  return (
    <div className="box">
      <Row>
        <Col lg="3" className="border-right border-2">
          <h5 className="text-center mb-4">Répartition de la valeur</h5>
          <ValueDistributionChart
            id={"part-" + indic}
            session={session}
            period={period}
            prevPeriod={prevPeriod}
            printMode={false}
          />
        </Col>
        <Col>
          <Row className="align-items-center h-100">
            {renderChart(production, "prd-" + indic)}
            {renderChart(intermediateConsumptions, "ic-" + indic)}
            {renderChart(fixedCapitalConsumptions, "ccf-" + indic)}
            {renderChart(netValueAdded, "nva-" + indic)}
          </Row>
        </Col>
      </Row>
    </div>
  );
};
