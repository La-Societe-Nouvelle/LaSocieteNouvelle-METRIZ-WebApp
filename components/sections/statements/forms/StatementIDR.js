// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

import AssessmentDSN from "../modals/AssessmentDSN";
import { isCorrectValue } from "../../../../src/utils/Utils";

/* ---------- STATEMENT - INDIC #IDR ---------- */

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

const StatementIDR = ({ 
  impactsData, 
  onUpdate
}) => {
  // state
  const [hasEmployees, setHasEmployees] = useState(impactsData.hasEmployees);
  const [interdecileRange, setInterdecileRange] = 
    useState(valueOrDefault(impactsData.interdecileRange, ""));
  const [info, setInfo] = useState(impactsData.comments.idr || "");

  // update impacts data when state update
  useEffect(() => {
    impactsData.hasEmployees = hasEmployees;
    impactsData.interdecileRange = interdecileRange;
    const statementStatus = checkStatement(impactsData);
    onUpdate(statementStatus);
  }, [hasEmployees,interdecileRange]);

  // update state when props update
  useEffect(() => 
  {
    if (impactsData.hasEmployees!=hasEmployees) {
      setHasEmployees(impactsData.hasEmployees);
    }
    if ((impactsData.interdecileRange)!=interdecileRange) {
      setInterdecileRange(impactsData.interdecileRange || "");
    }
  }, [impactsData.hasEmployees, impactsData.interdecileRange]);

  // has employees
  const onHasEmployeesChange = (event) => 
  {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        setHasEmployees(true);
        setInterdecileRange("");
        break;
      case "false":
        setHasEmployees(false);
        setInterdecileRange(1.0);
        break;
    }
  };

  // interdecile range
  const updateInterdecileRange = (event) => 
  {
    const { value, valueAsNumber } = event.target.valueAsNumber;
    if (value=="") {
      setInterdecileRange('');
    } else if (!isNaN(valueAsNumber)) {
      setInterdecileRange(valueAsNumber);
    } else {
      setInterdecileRange(value);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.idr = info);

  const updateSocialData = () => {};

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column lg={7}>
              L'entreprise est-elle employeur ?
            </Form.Label>
            <Col className="d-flex justify-content-end">
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Oui"
                value="true"
                checked={hasEmployees === true}
                onChange={onHasEmployeesChange}
              />
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Non"
                value="false"
                checked={hasEmployees === false}
                onChange={onHasEmployeesChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Rapport interdécile D9/D1 des taux horaires bruts
            </Form.Label>
            <Col>
              <div className="d-flex ">
                <div className="input-group custom-input me-1">
                  <Form.Control
                    type="number"
                    value={interdecileRange}
                    inputMode="numeric"
                    onChange={updateInterdecileRange}
                    disabled={hasEmployees === false}
                    isInvalid={!isValidValue(interdecileRange)}
                  />
                </div>

                <AssessmentDSN
                  impactsData={impactsData}
                  onUpdate={onUpdate}
                  updateSocialData={updateSocialData}
                />
              </div>
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
              onBlur={saveInfo}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementIDR;


// Check statement in impacts data
const checkStatement = (impactsData) => 
{
  const {
    hasEmployees,
    interdecileRange
  } = impactsData;

  if (hasEmployees === true) 
  {
    // ok
    if (isCorrectValue(interdecileRange,1)) {
      return({ status: "ok", errorMessage: null });
    } 
    // incomplete
    else if (interdecileRange=="" || interdecileRange==null) {
      return({ status: "incomplete", errorMessage: null });
    } 
    else if (isCorrectValue(interdecileRange)) {
      return({ 
        status: "error", 
        errorMessage: "Valeur saisie incorrecte (inférieure à 1)"
      });
    } else {
      return({ 
        status: "error", 
        errorMessage: "Veuillez saisir une valeur numérique"
      });
    }
  } 
  else if (hasEmployees === false) {
    if (isCorrectValue(interdecileRange,1,1)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({ status: "error", errorMessage: "Erreur application" });
    }
  } 
  else if (hasEmployees === null) {
    // & wage gap not null or empty string
    return({ status: "incomplete", errorMessage: null });
  } 
  else {
    return({ status: "error", errorMessage: "Erreur application" });
  }
}

const isValidValue = (value) => value=="" || isCorrectValue(value,1)