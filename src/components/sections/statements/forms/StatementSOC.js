// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { checkStatementSOC } from "./utils";

/* ---------- STATEMENT - INDIC #SOC ---------- */

/** Props concerned in impacts data :
 *    - hasSocialPurpose
 * 
 *  key functions :
 *    - useEffect on state
 *    - useEffect on props
 *    - checkStatement
 * 
 *  onUpdate -> send status to form container :
 *    - status : "ok" | "error" | "incomplete"
 *    - errorMessage : null | {message}
 */

const StatementSOC = ({ 
  impactsData, 
  onUpdate 
}) => {

  const [hasSocialPurpose, setHasSocialPurpose] = 
    useState(impactsData.hasSocialPurpose);
  const [info, setInfo] = useState(impactsData.comments.soc || "");

  // update impacts data when state update
  useEffect(() => {
    impactsData.hasSocialPurpose = hasSocialPurpose;
    const statementStatus = checkStatementSOC(impactsData);
    onUpdate(statementStatus);
  }, [hasSocialPurpose]);

  // has social purpose
  const onSocialPurposeChange = (event) => {
    const radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        setHasSocialPurpose(true);
        break;
      case "false":
        setHasSocialPurpose(false);
        break;
    }
  };
  
  // comment
  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.soc = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column lg={7} >
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
              onblur={saveInfo}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementSOC;