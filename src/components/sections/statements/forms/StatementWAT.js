// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { roundValue, valueOrDefault, isValidNumber } from "/src/utils/Utils";
import { unitSelectStyles } from "/config/customStyles";
import { checkStatementWAT } from "./utils";

/* ---------- STATEMENT - INDIC #WAT ---------- */

/** Props concerned in impacts data :
 *    - waterConsumption
 *    - waterConsumptionUnit
 *    - waterConsumptionUncertainty
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
  "m3": { label: "m³",  coef: 1.0     }, // default
  "L":  { label: "L",   coef: 0.0001  },
};

const StatementWAT = ({ 
  impactsData, 
  onUpdate
}) => {
  // State
  const [waterConsumption, setWaterConsumption] = 
    useState(valueOrDefault(impactsData.waterConsumption, ""));
  const [waterConsumptionUnit, setWaterConsumptionUnit] = 
    useState(impactsData.waterConsumptionUnit);
  const [waterConsumptionUncertainty, setWaterConsumptionUncertainty] =
    useState(valueOrDefault(impactsData.waterConsumptionUncertainty, ""));
  const [info, setInfo] = useState(impactsData.comments.wat || "");

  // update impacts data when state update
  useEffect(() => {
    impactsData.waterConsumption = waterConsumption;
    impactsData.waterConsumptionUnit = waterConsumptionUnit;
    impactsData.waterConsumptionUncertainty = waterConsumptionUncertainty;
    const statementStatus = checkStatementWAT(impactsData);
    onUpdate(statementStatus);
  }, [waterConsumption,waterConsumptionUnit,waterConsumptionUncertainty]);

  // update state when props update
  useEffect(() => {
    // ...
  }, []);

  // water consumption
  const updateWaterConsumption = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setWaterConsumption('');
    } else if (!isNaN(valueAsNumber)) {
      setWaterConsumption(valueAsNumber);
      if (waterConsumptionUncertainty=="") {
        let defaultUncertainty = valueAsNumber> 0 ? 25.0 : 0.0;
        setWaterConsumptionUncertainty(defaultUncertainty);
      }
    } else {
      setWaterConsumption(value);
    }
  };

  // water consumption unit
  const updateWaterConsumptionUnit = (selected) => 
  {
    const nextUnit = selected.value;
    setWaterConsumptionUnit(nextUnit);
    // update value
    if (!isNaN(waterConsumption)) {
      setWaterConsumption(roundValue(waterConsumption*(units[waterConsumptionUnit].coef/units[nextUnit].coef),1));
    }
  };

  // water consumption uncertainty
  const updateWaterConsumptionUncertainty = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setWaterConsumptionUncertainty('');
    } else if (!isNaN(valueAsNumber)) {
      setWaterConsumptionUncertainty(valueAsNumber);
    } else {
      setWaterConsumptionUncertainty(value);
    }
  };

  // comment
  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.wat = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Consommation totale d'eau
            </Form.Label>
            <Col>
              <div className="custom-input with-select input-group">
                <Form.Control
                  type="number"
                  value={waterConsumption}
                  inputMode="numeric"
                  onChange={updateWaterConsumption}
                  className="me-1"
                  isInvalid={!isValidValue(waterConsumption)}
                />

                <Select
                  options={Object.keys(units).map((unit) => {return({label: unit, value:unit})})}
                  styles={unitSelectStyles}
                  value={{
                    label: waterConsumptionUnit,
                    value: waterConsumptionUnit,
                  }}
                  onChange={updateWaterConsumptionUnit}
                />
              </div>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>Incertitude</Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="number"
                  value={waterConsumptionUncertainty}
                  inputMode="numeric"
                  onChange={updateWaterConsumptionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidUncertainty(waterConsumptionUncertainty)}
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
}

export default StatementWAT;

const isValidValue = (value) => value=="" || isValidNumber(value,0)
const isValidUncertainty = (uncertainty) => uncertainty=="" || isValidNumber(uncertainty,0,100)