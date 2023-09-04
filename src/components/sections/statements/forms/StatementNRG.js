// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";

import { roundValue, valueOrDefault, isValidNumber } from "/src/utils/Utils";
import { unitSelectStyles } from "/config/customStyles";

// Modals
import { AssessmentNRG } from "../modals/AssessmentNRG";
import { checkStatementNRG } from "./utils";

/* ---------- STATEMENT - INDIC #NRG ---------- */

/** Props concerned in impacts data :
 *    - energyConsumption
 *    - energyConsumptionUnit
 *    - energyConsumptionUncertainty
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
  "MJ":  { label: "MJ",   coef: 1.0       }, // default
  "GJ":  { label: "GJ",   coef: 1000.0    },
  "kWh": { label: "kWh",  coef: 0.278     },
  "MWh": { label: "MWh",  coef: 278.0  },
};

const StatementNRG = ({ 
  impactsData, 
  onUpdate 
}) => {
  // state
  const [energyConsumption, setEnergyConsumption] = 
    useState(valueOrDefault(impactsData.energyConsumption, ""));
  const [energyConsumptionUnit, setEnergyConsumptionUnit] = 
    useState(impactsData.energyConsumptionUnit);
  const [energyConsumptionUncertainty, setEnergyConsumptionUncertainty] =
    useState(valueOrDefault(impactsData.energyConsumptionUncertainty, ""));
  const [info, setInfo] = useState(impactsData.comments.nrg || "");
  const [showModal, setShowModal] = useState(false);

  // update impacts data when state update
  useEffect(() => {
    impactsData.energyConsumption = energyConsumption;
    impactsData.energyConsumptionUnit = energyConsumptionUnit;
    impactsData.energyConsumptionUncertainty = energyConsumptionUncertainty;
    const statementStatus = checkStatementNRG(impactsData);
    onUpdate(statementStatus);
  }, [energyConsumption,energyConsumptionUnit,energyConsumptionUncertainty]);

  // update state when props update
  useEffect(() => {
    // ...
  }, []);

  // energy consumption
  const updateEnergyConsumption = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setEnergyConsumption('');
    } else if (!isNaN(valueAsNumber)) {
      setEnergyConsumption(valueAsNumber);
      if (energyConsumptionUncertainty=="") {
        let defaultUncertainty = valueAsNumber> 0 ? 25.0 : 0.0;
        setEnergyConsumptionUncertainty(defaultUncertainty);
      }
    } else {
      setEnergyConsumption(value);
    }
  };

  // energy consumption unit
  const updateEnergyConsumptionUnit = (selected) => 
  {
    const nextUnit = selected.value;
    setEnergyConsumptionUnit(nextUnit);
    // update value
    if (!isNaN(energyConsumption)) {
      setEnergyConsumption(roundValue(energyConsumption*(units[energyConsumptionUnit].coef/units[nextUnit].coef),0));
    }
  };

  // energy consumption uncertainty
  const updateEnergyConsumptionUncertainty = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setEnergyConsumptionUncertainty('');
    } else if (!isNaN(valueAsNumber)) {
      setEnergyConsumptionUncertainty(valueAsNumber);
    } else {
      setEnergyConsumptionUncertainty(value);
    }
  };

  // comment
  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.nrg = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>Consommation totale d'énergie</Form.Label>
            <Col>
              <div className=" d-flex align-items-center justify-content-between">
                <div className="custom-input with-select input-group me-1">
                  <Form.Control
                    type="number"
                    value={energyConsumption}
                    inputMode="numeric"
                    isInvalid={!isValidValue(energyConsumption)}
                    onChange={updateEnergyConsumption}
                    className="me-1"
                  />
                  <Select
                    styles={unitSelectStyles}
                    options={Object.keys(units).map((unit) => {return({label: unit, value:unit})})}
                    value={{
                      label: energyConsumptionUnit,
                      value: energyConsumptionUnit,
                    }}
                    onChange={updateEnergyConsumptionUnit}
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
            <Form.Label column lg={7}>Incertitude</Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="number"
                  value={energyConsumptionUncertainty}
                  inputMode="numeric"
                  onChange={updateEnergyConsumptionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidUncertainty(energyConsumptionUncertainty)}
                />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
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

      <Modal
        show={showModal}
        size="xl"
        centered
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
          Outil de mesure des énergies
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AssessmentNRG
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

export default StatementNRG;

const isValidValue = (value) => value=="" || isValidNumber(value,0)
const isValidUncertainty = (uncertainty) => uncertainty=="" || isValidNumber(uncertainty,0,100)