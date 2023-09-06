// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";

import { roundValue, valueOrDefault, isValidNumber } from "/src/utils/Utils";
import { checkStatementECO } from "./utils";

/* ---------- STATEMENT - INDIC #ECO ---------- */

/** Props concerned in impacts data :
 *    - isAllActivitiesInFrance
 *    - domesticProduction
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

const StatementECO = ({ 
  impactsData, 
  onUpdate
}) => {

  const [isAllActivitiesInFrance, setIsAllActivitiesInFrance] = useState(impactsData.isAllActivitiesInFrance);
  const [domesticProduction, setDomesticProduction] = useState(impactsData.domesticProduction);
  const [info, setInfo] = useState(impactsData.comments.eco || "");
  const [isInvalid, setIsInvalid] = useState(false);

  // update impacts data when state update
  useEffect(() => {
    impactsData.isAllActivitiesInFrance = isAllActivitiesInFrance;
    impactsData.domesticProduction = domesticProduction;
    const statementStatus = checkStatementECO(impactsData);
    setIsInvalid(statementStatus.status=="error");
    onUpdate(statementStatus);
  }, [isAllActivitiesInFrance,domesticProduction]);

  // update state when props update
  useEffect(() => 
  {
    if (impactsData.isAllActivitiesInFrance!=isAllActivitiesInFrance) {
      setIsAllActivitiesInFrance(impactsData.isAllActivitiesInFrance);
    }
    if ((impactsData.domesticProduction)!=domesticProduction) {
      setDomesticProduction(impactsData.domesticProduction || "");
    }
  }, [impactsData.isAllActivitiesInFrance, impactsData.domesticProduction]);

  // radio button - 
  const onIsAllActivitiesInFranceChange = (event) => {
    const radioValue = event.target.value;
    onUpdate("eco"); 

    switch (radioValue) {
      case "true":
        setIsAllActivitiesInFrance(true);
        setDomesticProduction(impactsData.netValueAdded);
        break;
      case "partially":
        setIsAllActivitiesInFrance("partially");
        setDomesticProduction("");
        break;
      case "false":
        setIsAllActivitiesInFrance(false);
        setDomesticProduction(0);
        break;
    }
  };

  const updateDomesticProduction = (event) => {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setDomesticProduction('');
    } else if (!isNaN(valueAsNumber)) {
      setDomesticProduction(valueAsNumber);
    } else {
      setDomesticProduction(value);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.eco = info);

  return (
    <Form className="statement">
      <Row>
      <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
          <Form.Label column lg={7}>
              Les activités de l'entreprise sont-elles localisées en France ?
            </Form.Label>
            <Col className="text-end">
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Oui"
                value="true"
                checked={impactsData.isAllActivitiesInFrance === true}
                onChange={onIsAllActivitiesInFranceChange}
              />

              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Non"
                value="false"
                checked={impactsData.isAllActivitiesInFrance === false}
                onChange={onIsAllActivitiesInFranceChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Partiellement"
                value="partially"
                checked={
                  impactsData.isAllActivitiesInFrance === "partially"
                }
                onChange={onIsAllActivitiesInFranceChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Valeur ajoutée nette produite en France
            </Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="number"
                  value={roundValue(domesticProduction, 0)}
                  inputMode="numeric"
                  onChange={updateDomesticProduction}
                  isInvalid={isInvalid}
                  disabled={impactsData.isAllActivitiesInFrance !== "partially"}
                />
                <InputGroup.Text>&euro;</InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label className="col-form-label">Informations complémentaires</Form.Label>
            <Form.Control
              as="textarea"
              className="w-100"
              rows={3}
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

export default StatementECO;