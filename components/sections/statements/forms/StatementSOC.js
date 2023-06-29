import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

/* ---------- DECLARATION - INDIC #SOC ---------- */

const StatementSOC = (props) => {
  const [info, setInfo] = useState(props.impactsData.comments.soc || "");

  const hasSocialPurpose = props.impactsData.hasSocialPurpose;

  const onSocialPurposeChange = (event) => {
    const radioValue = event.target.value;
    let newHasSocialPurpose = null;

    switch (radioValue) {
      case "true":
        newHasSocialPurpose = true;
        break;
      case "false":
        newHasSocialPurpose = false;
        break;
    }

    props.impactsData.hasSocialPurpose = newHasSocialPurpose;
    props.onUpdate("soc");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.soc = info);

  return (
    <Form className="statement">
      <Row>
        <Col>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column lg={7}>
              L'entreprise est-elle d'utilité sociale ou dotée d'une raison
              d'être ?
            </Form.Label>
            <Col>
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
            <Form.Label>Informations complémentaires</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="w-100"
              onChange={updateInfo}
              value={info}
              onBlur={saveInfo}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementSOC;
