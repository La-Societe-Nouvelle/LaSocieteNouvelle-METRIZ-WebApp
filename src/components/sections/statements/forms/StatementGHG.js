// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Modal, InputGroup } from "react-bootstrap";
import Select from "react-select";

import { unitSelectStyles } from "/config/customStyles";

// Utils
import { roundValue, valueOrDefault, isValidNumber } from "/src/utils/Utils";
import { checkStatementGHG } from "./utils";
import { isValidInputNumber } from "/src/utils/Utils";

// Modals
import { AssessmentGHG } from "../modals/AssessmentGHG";

// Lib
import indicators from "/lib/indics";


/* ---------- STATEMENT - INDIC #GHG ---------- */

/** Props concerned in impacts data :
 *    - greenhouseGasEmissions
 *    - greenhouseGasEmissionsUnit
 *    - greenhouseGasEmissionsUncertainty
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



const StatementGHG = ({ 
  impactsData, 
  onUpdate
}) => {

  const [greenhouseGasEmissions, setGreenhouseGasEmissions] = 
    useState(valueOrDefault(impactsData.greenhouseGasEmissions, ""));
  const [greenhouseGasEmissionsUnit, setGreenhouseGasEmissionsUnit] = 
    useState(impactsData.greenhouseGasEmissionsUnit || "kgCO2e");
  const [greenhouseGasEmissionsUncertainty, setGreenhouseGasEmissionsUncertainty] = 
    useState(valueOrDefault(impactsData.greenhouseGasEmissionsUncertainty, ""));
  const [info, setInfo] = useState(impactsData.comments.ghg || "");
  const [showModal, setShowModal] = useState(false);

  // Units
  const units = indicators["ghg"].statementUnits


  // update session
  useEffect(() => {
    impactsData.greenhouseGasEmissions = greenhouseGasEmissions;
    impactsData.greenhouseGasEmissionsUncertainty = greenhouseGasEmissionsUncertainty;
    impactsData.greenhouseGasEmissionsUnit = greenhouseGasEmissionsUnit;
    const statementStatus = checkStatementGHG(impactsData);
    onUpdate(statementStatus);
  }, [greenhouseGasEmissions,greenhouseGasEmissionsUncertainty,greenhouseGasEmissionsUnit]);

  // update state
  useEffect(() => 
  {
    if (impactsData.greenhouseGasEmissions!=greenhouseGasEmissions) {
      setGreenhouseGasEmissions(impactsData.greenhouseGasEmissions);
    }
    if (impactsData.greenhouseGasEmissionsUncertainty!=greenhouseGasEmissionsUncertainty) {
      setGreenhouseGasEmissionsUncertainty(impactsData.greenhouseGasEmissionsUncertainty || "");
    }
  }, [impactsData.greenhouseGasEmissions, impactsData.greenhouseGasEmissionsUncertainty]);

  // greenhouse gas emissions
  const updateGreenhouseGasEmissions = (event) => 
  {
    const input = event.target.value;
    if (isValidInputNumber(input,0)) {
      setGreenhouseGasEmissions(input);
      if (greenhouseGasEmissionsUncertainty=="") {
        let defaultUncertainty = parseFloat(input)>0 ? 25.0 : 0.0 ;
        setGreenhouseGasEmissionsUncertainty(defaultUncertainty);
      }
    } 
  };

  // greenhouse gas emissions unit
  const updateGreenhouseGasEmissionsUnit = (selected) => 
  {
    const nextUnit = selected.value;
    setGreenhouseGasEmissionsUnit(nextUnit);
    // update value
    if (!isNaN(greenhouseGasEmissions)) {
      setGreenhouseGasEmissions(roundValue(greenhouseGasEmissions*(units[greenhouseGasEmissionsUnit].coef/units[nextUnit].coef),0));
    }
  };

  // greenhouse gas emissions uncertainty
  const updateGreenhouseGasEmissionsUncertainty = (event) => 
  {
    const input = event.target.value;
    if (isValidInputNumber(input,0)) {
      setGreenhouseGasEmissionsUncertainty(input);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.ghg = info);

  const onAssessmentSubmit = () => {
    if (impactsData.greenhouseGasEmissions!=greenhouseGasEmissions) {
      setGreenhouseGasEmissions(impactsData.greenhouseGasEmissions);
    }
    if (impactsData.greenhouseGasEmissionsUncertainty!=greenhouseGasEmissionsUncertainty) {
      setGreenhouseGasEmissionsUncertainty(impactsData.greenhouseGasEmissionsUncertainty || "");
    }
    setShowModal(false);
  }

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Emissions directes de Gaz à effet de serre - SCOPE 1 *
            </Form.Label>
            <Col>
              <div className=" d-flex align-items-center justify-content-between">
                <div className="me-1 custom-input with-select input-group">
                  <Form.Control
                    type="texte"
                    value={greenhouseGasEmissions}
                    onChange={updateGreenhouseGasEmissions}
                    isInvalid={!isValidValue(greenhouseGasEmissions)}
                    className="me-1"
                  />
                  <Select
                    styles={unitSelectStyles}
                    options={Object.keys(units).map((unit) => {return({label: unit, value: unit })})}
                    value={{
                      label: greenhouseGasEmissionsUnit,
                      value: greenhouseGasEmissionsUnit,
                    }}
                    onChange={updateGreenhouseGasEmissionsUnit}
                  />
                </div>

                <div>
                  <Button
                    variant="light-secondary"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="bi bi-calculator"></i>
                  </Button>
                </div>
              </div>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Incertitude
            </Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="text"
                  value={greenhouseGasEmissionsUncertainty}
                  onChange={updateGreenhouseGasEmissionsUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidUncertainty(greenhouseGasEmissionsUncertainty)}
                />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
          <div className="my-3 text-end">
            <p className="small mt-3">
              *Vous pouvez aussi calculer vos émissions avec l'{" "}
              <a
                className="text-link text-decoration-underline"
                href="https://www.bilans-climat-simplifies.ademe.fr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Outil de l'Ademe
              </a>
              .
            </p>
          </div>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label className="col-form-label">
              Informations complémentaires
            </Form.Label>
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

      <Modal
        show={showModal}
        size="xl"
        centered
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Outils de mesure des émissions directes de Gaz à effet de serre
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AssessmentGHG
            impactsData={impactsData}
            onGoBack={() => setShowModal(false)}
            handleClose={() => setShowModal(false)}
            submit={onAssessmentSubmit}
          />
        </Modal.Body>
      </Modal>
    </Form>
  );
};

export default StatementGHG;

const isValidValue = (value) => value=="" || isValidNumber(value,0)
const isValidUncertainty = (uncertainty) => uncertainty=="" || isValidNumber(uncertainty,0,100)