// ComparativeDataCharts.js
import React from "react";
import { Row, Col } from "react-bootstrap";
import { ComparativeChart } from "../charts/ComparativeChart";

export const ComparativeDataContainer = ({
  session,
  period,
  indic
}) => {

  // Define the aggregates and their corresponding titles
  const aggregates = {
    production: "Production",
    intermediateConsumptions: "Consommations intermédiaires",
    fixedCapitalConsumptions: "Consommations de capital fixe",
    netValueAdded: "Valeur ajoutée nette",
  };

  return (
    <div className="charts-container">
      <h4>Comparaison par activité</h4>
      <Row className="charts">
        {Object.keys(aggregates).map((aggregate) => (
          <React.Fragment key={aggregate}>
            <Col sm={3} xl={3} lg={3} md={3}>
              <h5 className="mb-4">{aggregates[aggregate]}</h5>
              <ComparativeChart
                id={`${aggregate}-${indic}`}
                session={session}
                period={period}
                indic={indic}
                aggregate={aggregate}
                isPrinting={false}
              />
            </Col>
          </React.Fragment>
        ))}
      </Row>
    </div>
  );
};