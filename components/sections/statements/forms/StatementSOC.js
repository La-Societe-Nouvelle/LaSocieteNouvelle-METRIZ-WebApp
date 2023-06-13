import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

/* ---------- DECLARATION - INDIC #SOC ---------- */

const StatementSOC = (props) => {
  
  const [info, setInfo] = useState(props.impactsData.comments.soc || "");

  const hasSocialPurpose = props.impactsData.hasSocialPurpose;
  const netValueAdded = props.impactsData.netValueAdded;

  const isValid = hasSocialPurpose !== null && netValueAdded != null;

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
  const onValidate = () => props.onValidate('soc');

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group align-items-center">
        <Form.Label column sm={4}>
          L'entreprise est-elle d'utilité sociale ou dotée d'une raison d'être ?
        </Form.Label>
        <Col sm={6}>
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

      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Informations complémentaires
        </Form.Label>
        <Col sm={6}>
          <Form.Control
            as="textarea"
            rows={3}
            className="w-100"
            onChange={updateInfo}
            value={info}
            onBlur={saveInfo}
          />
        </Col>
      </Form.Group>
      <div className="text-end">
        <Button disabled={!isValid} variant="light-secondary" onClick={onValidate}>
          Valider
        </Button>
      </div>
    </Form>
  );
};

export default StatementSOC;
