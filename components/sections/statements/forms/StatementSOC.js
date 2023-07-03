import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

/* ---------- DECLARATION - INDIC #SOC ---------- */

const StatementSOC = ({ impactsData, onUpdate }) => {
  const [info, setInfo] = useState(impactsData.comments.soc || "");
  const [hasSocialPurpose, setHasSocialPurpose] = useState(
    impactsData.hasSocialPurpose
  );

  const onSocialPurposeChange = (event) => {
    const radioValue = event.target.value;

    switch (radioValue) {
      case "true":
        impactsData.hasSocialPurpose = true;
        break;
      case "false":
        impactsData.hasSocialPurpose = false;
        break;
    }

    setHasSocialPurpose(impactsData.hasSocialPurpose);
    onUpdate("soc");
  };
  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.soc = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column >
              L'entreprise est-elle d'utilité sociale ou dotée d'une raison
              d'être ?
            </Form.Label>
            <Col className="text-end">
              <Form.Check
                inline
                type="radio"
                id="hasSocialPurpose"
                label="Oui"
                value="true"
                checked={hasSocialPurpose === true}
                onChange={onSocialPurposeChange}
              />
              <Form.Check
                inline
                type="radio"
                id="hasSocialPurpose"
                label="Non"
                value="false"
                checked={hasSocialPurpose === false}
                onChange={onSocialPurposeChange}
              />
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label className="col-form-label">
              Informations complémentaires
            </Form.Label>{" "}
            <Form.Control
              as="textarea"
              rows={3}
              className="w-100"
              onChange={updateInfo}
              value={info}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementSOC;
