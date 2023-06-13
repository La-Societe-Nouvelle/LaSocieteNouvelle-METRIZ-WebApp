import React from "react";
import { Col, Row } from "react-bootstrap";

const FootprintReport = () => {
  return (
      <Row>
        <Col>
          <div className="box">
            <div className="text-center bg-light py-2">
              <h3 className="mb-0">Empreinte sociale</h3>
            </div>
          </div>
        </Col>
        <Col>
          <div className="box">
            <div className="text-center bg-light py-2">
              <h3 className="mb-0">Empreinte environnementale</h3>
            </div>
          </div>
        </Col>
      </Row>
  );
};

export default FootprintReport;
