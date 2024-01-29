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
    <div className="mb-4">
      <h4>Comparaison par activité</h4>
      <Row>
        {Object.keys(aggregates).map((aggregate) => (
          <React.Fragment key={aggregate}>
            <Col sm={3} xl={3} lg={3} md={3}>
              <h5 className="mb-4">{aggregates[aggregate]}</h5>
              
              <VerticalBarChart
                id={`${aggregate}-${indic}`}
                session={session}
                datasetOptions={{
                  period,
                  aggregate,
                  indic
                }}
                printOptions={{
                  printMode: false,
                  showDivisionData: true,
                  showAreaData: true,
                  showTargetData: true,
                  useIndicColors: false,
                  showLegend : false,
                  showXlabels : true,
                  aspectRatio : 1.5,
                  label: "Empreinte"
                }}
              />

            </Col>
          </React.Fragment>
        ))}
      </Row>
    </div>
  );
};