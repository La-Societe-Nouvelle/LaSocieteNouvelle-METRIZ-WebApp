// ComparativeDataCharts.js
import React from "react";
import { Row, Col } from "react-bootstrap";
import { VerticalBarChart } from "../charts/VerticalBarChart";

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
    <div>
      <h4>Comparaison par activité</h4>
      <Row>
        {Object.keys(aggregates).map((aggregate) => (
          <React.Fragment key={aggregate}>
            <Col sm={3} xl={3} lg={3} md={3}>
              <h5 className="mb-4">{aggregates[aggregate]}</h5>
              
              <VerticalBarChart
                id={`${aggregate}-${indic}`}
                session={session}
                period={period}
                aggregate={aggregate}
                indic={indic}
                printMode={false}
                showDivisionData={true}
                showAreaData={true}
                showTargetData={true}
                showPreviousData={false}
                useIndicColors={false}
                label={"Exercice"}
              />

            </Col>
          </React.Fragment>
        ))}
      </Row>
    </div>
  );
};