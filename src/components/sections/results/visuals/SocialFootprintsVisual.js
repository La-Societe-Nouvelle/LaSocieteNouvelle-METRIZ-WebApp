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
  const nbIndics = ["geq","idr","knw"].filter((indic) => validations.includes(indic)).length;
  console.log(nbIndics);

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
      <Row className=".row.inline-block">
        {nbIndics<3 && <Col lg={(3-nbIndics)*2}/>}
        {validations.includes("geq") &&
          <Col lg={4}>
            <VerticalBarChart
              id={"socialfootprintvisual_geq"}
              session={session}
              period={period}
              aggregate={"production"}
              indic={"geq"}
              showDivisionData={true}
            />
          </Col>}
        {validations.includes("idr") &&
          <Col lg={4}>
            <VerticalBarChart
              id={"socialfootprintvisual_idr"}
              session={session}
              period={period}
              aggregate={"production"}
              indic={"idr"}
              showDivisionData={true}
            />
          </Col>}
        {validations.includes("knw") &&
          <Col lg={4}>
            <RingChart
              id={"socialfootprintvisual_knw"}
              session={session}
              period={period}
              indic={"knw"}
            />
          </Col>}
        {nbIndics<3 && <Col lg={(3-nbIndics)*2}/>}
      </Row>
    </div>
  );
}