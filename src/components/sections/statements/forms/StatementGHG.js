// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Modal, InputGroup } from "react-bootstrap";
import Select from "react-select";

import { roundValue, valueOrDefault, isValidNumber } from "/src/utils/Utils";
import { unitSelectStyles } from "/config/customStyles";

// Modals
import { AssessmentGHG } from "../modals/AssessmentGHG";

/* ---------- STATEMENT - INDIC #GHG ---------- */

/** Props concerned in impacts data :
 *    - greenhousesGazEmissions
 *    - greenhousesGazEmissionsUnit
 *    - greenhousesGazEmissionsUncertainty
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

const units = {
  "kgCO2e": { label: "kgCO2e",  coef: 1.0     },
  "tCO2e":  { label: "tCO2e",   coef: 1000.0  },
};

const StatementGHG = ({ 
  impactsData, 
  onUpdate
}) => {

  const [greenhousesGazEmissions, setGreenhousesGazEmissions] = 
    useState(valueOrDefault(impactsData.greenhousesGazEmissions, ""));
  const [greenhousesGazEmissionsUnit, setGreenhousesGazEmissionsUnit] = 
    useState(impactsData.greenhousesGazEmissionsUnit || "kgCO2e");
  const [greenhousesGazEmissionsUncertainty, setGreenhousesGazEmissionsUncertainty] = 
    useState(valueOrDefault(impactsData.greenhousesGazEmissionsUncertainty, ""));
  const [info, setInfo] = useState(impactsData.comments.ghg || "");
  const [showModal, setShowModal] = useState(false);

  // update session
  useEffect(() => {
    impactsData.greenhousesGazEmissions = greenhousesGazEmissions;
    impactsData.greenhousesGazEmissionsUncertainty = greenhousesGazEmissionsUncertainty;
    impactsData.greenhousesGazEmissionsUnit = greenhousesGazEmissionsUnit;
    const statementStatus = checkStatement(impactsData);
    onUpdate(statementStatus);
  }, [greenhousesGazEmissions,greenhousesGazEmissionsUncertainty,greenhousesGazEmissionsUnit]);

  // update state
  useEffect(() => 
  {
    if (impactsData.greenhousesGazEmissions!=greenhousesGazEmissions) {
      setGreenhousesGazEmissions(impactsData.greenhousesGazEmissions);
    }
    if (impactsData.greenhousesGazEmissionsUncertainty!=greenhousesGazEmissionsUncertainty) {
      setGreenhousesGazEmissionsUncertainty(impactsData.greenhousesGazEmissionsUncertainty || "");
    }
  }, [impactsData.greenhousesGazEmissions, impactsData.greenhousesGazEmissionsUncertainty]);

  // greenhouse gas emissions
  const updateGreenhousesGazEmissions = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setGreenhousesGazEmissions('');
    } else if (!isNaN(valueAsNumber)) {
      setGreenhousesGazEmissions(valueAsNumber);
      // set default uncertainty
      if (greenhousesGazEmissionsUncertainty=="") {
        let defaultUncertainty = valueAsNumber>0 ? 25.0 : 0.0 ;
        setGreenhousesGazEmissionsUncertainty(defaultUncertainty);
      }
    } else {
      setGreenhousesGazEmissions(value);
    }
  };

  // greenhouse gas emissions unit
  const updateGreenhousesGazEmissionsUnit = (selected) => 
  {
    const nextUnit = selected.value;
    setGreenhousesGazEmissionsUnit(nextUnit);
    // update value
    if (!isNaN(greenhousesGazEmissions)) {
      setGreenhousesGazEmissions(roundValue(greenhousesGazEmissions*(units[greenhousesGazEmissionsUnit].coef/units[nextUnit].coef),0));
    }
  };

  // greenhouse gas emissions uncertainty
  const updateGreenhousesGazEmissionsUncertainty = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setGreenhousesGazEmissionsUncertainty('');
    } else if (!isNaN(valueAsNumber)) {
      setGreenhousesGazEmissionsUncertainty(valueAsNumber);
    } else {
      setGreenhousesGazEmissionsUncertainty(value);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.ghg = info);

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
                    type="number"
                    value={greenhousesGazEmissions}
                    inputMode="numeric"
                    onChange={updateGreenhousesGazEmissions}
                    isInvalid={!isValidValue(greenhousesGazEmissions)}
                    className="me-1"
                  />
                  <Select
                    styles={unitSelectStyles}
                    options={Object.keys(units).map((unit) => {return({label: unit, value: unit })})}
                    value={{
                      label: greenhousesGazEmissionsUnit,
                      value: greenhousesGazEmissionsUnit,
                    }}
                    onChange={updateGreenhousesGazEmissionsUnit}
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
                  type="number"
                  value={greenhousesGazEmissionsUncertainty}
                  inputMode="numeric"
                  onChange={updateGreenhousesGazEmissionsUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidUncertainty(greenhousesGazEmissionsUncertainty)}
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
                className="w-100"
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
            onUpdate={onUpdate}
          />
        </Modal.Body>
      </Modal>
    </Form>
  );
};

export default StatementGHG;

// Check statement
const checkStatement = (impactsData) => 
{
  const {
    greenhousesGazEmissions,
    greenhousesGazEmissionsUncertainty,
  } = impactsData;

  // ok
  if (isValidNumber(greenhousesGazEmissions,0) && isValidNumber(greenhousesGazEmissionsUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // incomplete
  else if (greenhousesGazEmissions=="" || greenhousesGazEmissionsUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  } 
  // error
  else if (greenhousesGazEmissions!="" && isValidNumber(greenhousesGazEmissions,0)) {
    return({
      status: "error",
      errorMessage: isValidNumber(greenhousesGazEmissions) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  } else if (greenhousesGazEmissionsUncertainty!="" && isValidNumber(greenhousesGazEmissionsUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: isValidNumber(greenhousesGazEmissionsUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  } else {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
}

const isValidValue = (value) => value=="" || isValidNumber(value,0)
const isValidUncertainty = (uncertainty) => uncertainty=="" || isValidNumber(uncertainty,0,100)