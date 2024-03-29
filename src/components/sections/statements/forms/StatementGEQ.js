// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";

import { valueOrDefault, isValidNumber } from "/src/utils/Utils";

// Modals
import AssessmentDSN from "../modals/AssessmentDSN";
import { checkStatementGEQ } from "./utils";
import { isValidInput, isValidInputNumber } from "../../../../utils/Utils";

/* ---------- STATEMENT - INDIC #GEQ ---------- */

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

const StatementGEQ = ({
  impactsData,
  onUpdate,
}) => {

  const [hasEmployees, setHasEmployees] = useState(impactsData.hasEmployees);
  const [wageGap, setWageGap] = useState(valueOrDefault(impactsData.wageGap, ""));
  const [info, setInfo] = useState(impactsData.comments.geq || "");

  useEffect(() => {
    if (hasEmployees==null && isValidNumber(wageGap,1) && wageGap>0) {
      setHasEmployees(true);
    }
  }, [])

  // update impacts data when state update
  useEffect(() => {
    impactsData.hasEmployees = hasEmployees;
    impactsData.wageGap = wageGap;
    const statementStatus = checkStatementGEQ(impactsData);
    onUpdate(statementStatus);
  }, [hasEmployees, wageGap]);

  // update state when props update
  useEffect(() => {
    if (impactsData.hasEmployees != hasEmployees) {
      setHasEmployees(impactsData.hasEmployees);
    }
    if ((impactsData.wageGap) != wageGap) {
      setWageGap(impactsData.wageGap || "");
    }

    if (!impactsData.hasEmployees) {
      setWageGap(0);
    }

  }, [impactsData.hasEmployees, impactsData.wageGap]);

  // radio button - has employees
  const onHasEmployeesChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        setHasEmployees(true);
        setWageGap("");
        break;
      case "false":
        setHasEmployees(false);
        setWageGap(0);
        break;
    }
  };

  // input
  const updateWageGap = (event) => {
    const input = event.target.value;
    if (isValidInputNumber(input,2)) {
      setWageGap(input);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.geq = info);

  // data from modals
  const updateSocialData = (updatedData) => {
    impactsData.interdecileRange = updatedData.interdecileRange;
    impactsData.wageGap = updatedData.wageGap;
    impactsData.knwDetails.apprenticesRemunerations = updatedData.knwDetails.apprenticesRemunerations;
  };

  const onAssessmentSubmit = () => {
    if ((impactsData.wageGap)!=wageGap) {
      setWageGap(impactsData.wageGap || "");
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

            <Col className="text-end">
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
              Ecart de rémunérations Femmes/Hommes{" "}
              <span className="d-block small">
                (en % du taux horaire brut moyen)
              </span>
            </Form.Label>
            <Col>
              <div className="d-flex justify-content-between">
                <InputGroup className="custom-input me-1">
                  <Form.Control
                    type="text"
                    value={wageGap}
                    disabled={hasEmployees === false}
                    onChange={updateWageGap}
                    isInvalid={!isValidInput(wageGap, 0)}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>

                <AssessmentDSN
                  impactsData={impactsData}
                  onUpdate={onUpdate}
                  updateSocialData={updateSocialData}
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
            <Col>
              <Form.Control
                as="textarea"
                rows={3}
                onChange={updateInfo}
                value={info}
                onBlur={saveInfo}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementGEQ;

const isValidValue = (value) => value == "" || isValidNumber(value, 0)