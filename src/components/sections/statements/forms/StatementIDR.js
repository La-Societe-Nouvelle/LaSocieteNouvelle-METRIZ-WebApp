// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { valueOrDefault } from "/src/utils/Utils";

import AssessmentDSN from "../modals/AssessmentDSN";
import { isValidNumber } from "/src/utils/Utils";
import { checkStatementIDR } from "./utils";
import { isValidInputNumber } from "../../../../utils/Utils";

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

  useEffect(() => {
    if (hasEmployees==null && isValidNumber(interdecileRange,1) && interdecileRange>1) {
      setHasEmployees(true);
    }
  }, []);

  // update impacts data when state update
  useEffect(() => {
    impactsData.hasEmployees = hasEmployees;
    impactsData.interdecileRange = interdecileRange;
    const statementStatus = checkStatementIDR(impactsData);
    onUpdate(statementStatus);
  }, [hasEmployees,interdecileRange]);

  // update state when props update
  useEffect(() => {

    if (impactsData.hasEmployees != hasEmployees) {
      setHasEmployees(impactsData.hasEmployees);
    }
    if (impactsData.interdecileRange != interdecileRange) {
      setInterdecileRange(impactsData.interdecileRange || "");
    }

    if (!impactsData.hasEmployees) {
      setInterdecileRange(1.0);
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
  const updateInterdecileRange = (event) => {
    const input = event.target.value;
    if (isValidInputNumber(input,1)) {
      setInterdecileRange(input);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.idr = info);

  const onAssessmentSubmit = () => {
    if ((impactsData.interdecileRange)!=interdecileRange) {
      setInterdecileRange(impactsData.interdecileRange || "");
    }
  }

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
                    type="text"
                    value={interdecileRange}
                    onChange={updateInterdecileRange}
                    disabled={hasEmployees === false}
                    isInvalid={!isValidValue(interdecileRange)}
                  />
                </div>

                <AssessmentDSN
                  impactsData={impactsData}
                  submit={onAssessmentSubmit}
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

const isValidValue = (value) => value=="" || isValidNumber(value,1)