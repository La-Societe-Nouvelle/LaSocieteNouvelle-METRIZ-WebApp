import React from "react";
import { Col, Row } from "react-bootstrap";

const FootprintReport = () => {
  return (
    <section className="step">
      <Row>
        <Col>
          <div className="text-center bg-light py-2">
            <h3 className="mb-0">Empreinte sociale</h3>
          </div>
        </Col>
        <Col>
          <div className="text-center bg-light py-2">
            <h3 className="mb-0">Empreinte environnementale</h3>
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default FootprintReport;
