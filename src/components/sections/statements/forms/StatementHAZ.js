// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { roundValue, valueOrDefault, isValidNumber } from "/src/utils/Utils";
import { unitSelectStyles } from "/config/customStyles";
import { checkStatementHAZ } from "./utils";

/* ---------- STATEMENT - INDIC #HAZ ---------- */

/** Props concerned in impacts data :
 *    - hazardousSubstancesConsumption
 *    - hazardousSubstancesConsumptionUnit
 *    - hazardousSubstancesConsumptionUncertainty
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
  "kg": { label: "kg",  coef: 1.0       }, // default
  "t":  { label: "t",   coef: 1000.0    }
};

const StatementHAZ = ({ 
  impactsData, 
  onUpdate 
}) => {
  // state
  const [hazardousSubstancesConsumption, setHazardousSubstancesConsumption] =
    useState(valueOrDefault(impactsData.hazardousSubstancesConsumption, ""));
  const [hazardousSubstancesConsumptionUnit, setHazardousSubstancesConsumptionUnit] = 
    useState(impactsData.hazardousSubstancesConsumptionUnit);
  const [hazardousSubstancesConsumptionUncertainty, setHazardousSubstancesConsumptionUncertainty] = 
    useState(valueOrDefault(impactsData.hazardousSubstancesConsumptionUncertainty, ""));  
  const [info, setInfo] = useState(impactsData.comments.haz || "");

  // update impacts data when state update
  useEffect(() => {
    impactsData.hazardousSubstancesConsumption = hazardousSubstancesConsumption;
    impactsData.hazardousSubstancesConsumptionUnit = hazardousSubstancesConsumptionUnit;
    impactsData.hazardousSubstancesConsumptionUncertainty = hazardousSubstancesConsumptionUncertainty;
    const statementStatus = checkStatementHAZ(impactsData);
    onUpdate(statementStatus);
  }, [hazardousSubstancesConsumption,hazardousSubstancesConsumptionUnit,hazardousSubstancesConsumptionUncertainty]);

  // update state when props update
  useEffect(() => {
    // ...
  }, []);

  // hazardous substances consumption
  const updateHazardousSubstancesConsumption = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setHazardousSubstancesConsumption('');
    } else if (!isNaN(valueAsNumber)) {
      setHazardousSubstancesConsumption(valueAsNumber);
      if (hazardousSubstancesConsumptionUncertainty=="") {
        let defaultUncertainty = valueAsNumber> 0 ? 25.0 : 0.0;
        setHazardousSubstancesConsumptionUncertainty(defaultUncertainty);
      }
    } else {
      setHazardousSubstancesConsumption(value);
    }
  };

  // hazardous substances consumption unit
  const updateHazardousSubstancesConsumptionUnit = (selected) => 
  {
    const nextUnit = selected.value;
    setHazardousSubstancesConsumptionUnit(nextUnit);
    // update value
    if (!isNaN(hazardousSubstancesConsumption)) {
      setHazardousSubstancesConsumption(roundValue(hazardousSubstancesConsumption*(units[hazardousSubstancesConsumptionUnit].coef/units[nextUnit].coef),0));
    }
  };

  // hazardous substances consumption uncertainty
  const updateHazardousSubstancesConsumptionUncertainty = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setHazardousSubstancesConsumptionUncertainty('');
    } else if (!isNaN(valueAsNumber)) {
      setHazardousSubstancesConsumptionUncertainty(valueAsNumber);
    } else {
      setHazardousSubstancesConsumptionUncertainty(value);
    }
  };


  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.haz = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Utilisation de produits dangereux - santé/environnement
            </Form.Label>
            <Col>
            <div className=" d-flex align-items-center justify-content-between">
                <div className="input-group custom-input with-select">
                  <Form.Control
                    type="number"
                    value={hazardousSubstancesConsumption}
                    inputMode="numeric"
                    onChange={updateHazardousSubstancesConsumption}
                    isInvalid={!isValidValue(hazardousSubstancesConsumption)}
                    className="me-1"
                  />
                   <Select
                    styles={unitSelectStyles}
                    options={Object.keys(units).map((indic) => {return({label: indic, value: indic})})}
                    defaultValue={{
                      label: hazardousSubstancesConsumptionUnit,
                      value: hazardousSubstancesConsumptionUnit,
                    }}
                    className="small"
                    onChange={updateHazardousSubstancesConsumptionUnit}
                  />
                </div>
                <div>
                 
                </div>
              </div>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>Incertitude</Form.Label>
            <Col>
              <InputGroup className="custom-input ">
                <Form.Control
                  type="number"
                  value={roundValue(
                    hazardousSubstancesConsumptionUncertainty,
                    0
                  )}
                  inputMode="numeric"
                  onChange={updateHazardousSubstancesConsumptionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidUncertainty(hazardousSubstancesConsumptionUncertainty)}
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
            </Form.Label>
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

export default StatementHAZ;

const isValidValue = (value) => value=="" || isValidNumber(value,0)
const isValidUncertainty = (uncertainty) => uncertainty=="" || isValidNumber(uncertainty,0,100)