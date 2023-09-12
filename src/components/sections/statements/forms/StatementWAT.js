// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { unitSelectStyles } from "/config/customStyles";

// Utils
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { checkStatementWAT } from "./utils";
import { isValidInput, isValidInputNumber } from "/src/utils/Utils";

// Lib
import metaIndics from "/lib/indics";

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



const StatementWAT = ({ 
  impactsData, 
  onUpdate
}) => {
  // State
  const [waterConsumption, setWaterConsumption] = useState(
    valueOrDefault(impactsData.waterConsumption, "")
  );
  const [waterConsumptionUnit, setWaterConsumptionUnit] = useState(
    impactsData.waterConsumptionUnit
  );
  const [waterConsumptionUncertainty, setWaterConsumptionUncertainty] =
    useState(valueOrDefault(impactsData.waterConsumptionUncertainty, ""));
  const [info, setInfo] = useState(impactsData.comments.wat || "");

  // Units
  const units = metaIndics["wat"].statementUnits;

  // update impacts data when state update
  useEffect(() => {
    impactsData.waterConsumption = waterConsumption;
    impactsData.waterConsumptionUnit = waterConsumptionUnit;
    impactsData.waterConsumptionUncertainty = waterConsumptionUncertainty;
    const statementStatus = checkStatementWAT(impactsData);
    onUpdate(statementStatus);
  }, [waterConsumption, waterConsumptionUnit, waterConsumptionUncertainty]);

  // update state when props update
  useEffect(() => {
    // ...
  }, []);

  // water consumption
  const updateWaterConsumption = (event) => {
    const input = event.target.value;
    if (isValidInputNumber(input, 0)) {
      setWaterConsumption(input);
      if (waterConsumptionUncertainty == "") {
        let defaultUncertainty = parseFloat(input) > 0 ? 25.0 : 0.0;
        setWaterConsumptionUncertainty(defaultUncertainty);
      }
    }
  };

  // water consumption unit
  const updateWaterConsumptionUnit = (selected) => {
    const nextUnit = selected.value;
    setWaterConsumptionUnit(nextUnit);
    // update value
    if (!isNaN(waterConsumption)) {
      setWaterConsumption(
        roundValue(
          waterConsumption *
            (units[waterConsumptionUnit].coef / units[nextUnit].coef),
          1
        )
      );
    }
  };

  // water consumption uncertainty
  const updateWaterConsumptionUncertainty = (event) => {
    const input = event.target.value;
    if (isValidInputNumber(input, 0)) {
      setWaterConsumptionUncertainty(input);
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
                  type="text"
                  value={waterConsumption}
                  onChange={updateWaterConsumption}
                  className="me-1"
                  isInvalid={!isValidInput(waterConsumption, 0)}
                />

                <Select
                  options={Object.keys(units).map((unit) => {
                    return { label: unit, value: unit };
                  })}
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
            <Form.Label column lg={7}>
              Incertitude
            </Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="text"
                  value={waterConsumptionUncertainty}
                  onChange={updateWaterConsumptionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidInput(waterConsumptionUncertainty, 0, 100)}
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
}

export default StatementWAT;