// La Société Nouvelle

import { Button, Col, Row } from "react-bootstrap";
import { downloadChartImage } from "../utils";
import ComparativeHorizontalBarChart from "../charts/ComparativeHorizontalBarChart";
import RingChart from "../charts/RingChart";
import { VerticalBarChart } from "../charts/VerticalBarChart";

export const SocialFootprintMainVisual = ({
  session,
  period,
}) => {

  const validations = session.validations[period.periodKey];

  return (
    <div className="box">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Empreinte sociale</h3>
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
      <Row>
        {validations.includes("geq") &&
          <Col>
            <VerticalBarChart
              id={"socialfootprintvisual_knw"}
              session={session}
              period={period}
              aggregate={"production"}
              indic={"geq"}
              showDivisionData={true}
            />
          </Col>}
        {validations.includes("idr") &&
          <Col>
            <RingChart
              session={session}
              period={period}
              indic={"idr"}
            />
          </Col>}
        {validations.includes("knw") &&
          <Col>
            <RingChart
              session={session}
              period={period}
              indic={"knw"}
            />
          </Col>}
      </Row>
    </div>
  );
}