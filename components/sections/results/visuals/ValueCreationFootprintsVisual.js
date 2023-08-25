// La Société Nouvelle

import { Button, Col, Row } from "react-bootstrap";
import { downloadChartImage } from "../utils";
import ComparativeHorizontalBarChart from "../charts/ComparativeHorizontalBarChart";
import RingChart from "../charts/RingChart";

export const ValueCreationFootprintsVisual = ({
  session,
  period,
}) => {

  const validations = session.validations[period.periodKey];

  const nbIndics = ["eco","art","soc"].filter((indic) => validations.includes(indic)).length;

  return (
    <div className="box">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Création de la valeur</h3>
        <Button
          className="btn-light btn-rounded"
          size="sm"
          onClick={() =>
            downloadChartImage(
              "environmentalChart",
              "empreinte_environnementale.png"
            )
          }
        >
          <i className="bi bi-download"></i>
        </Button>
      </div>
      <Row className=".row.inline-block">
        {validations.includes("eco") &&
          <Col lg={12/nbIndics}>
            <RingChart
              session={session}
              period={period}
              indic={"eco"}
            />
          </Col>}
        {validations.includes("art") &&
          <Col lg={12/nbIndics}>
            <RingChart
              session={session}
              period={period}
              indic={"art"}
            />
          </Col>}
        {validations.includes("soc") &&
          <Col lg={12/nbIndics}>
            <RingChart
              session={session}
              period={period}
              indic={"soc"}
            />
          </Col>}
      </Row>
    </div>
  );
}