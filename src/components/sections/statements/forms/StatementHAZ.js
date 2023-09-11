// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { unitSelectStyles } from "/config/customStyles";

// Utils
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { checkStatementHAZ } from "./utils";
import { isValidInput, isValidInputNumber } from "/src/utils/Utils";

// Lib
import indicators from "/lib/indics";


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

    // Units
    const units = indicators["haz"].statementUnits

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
    const input = event.target.value;
    if (isValidInputNumber(input,0)) {
      setHazardousSubstancesConsumption(input);
      if (hazardousSubstancesConsumptionUncertainty=="") {
        let defaultUncertainty = parseFloat(input)>0 ? 25.0 : 0.0;
        setHazardousSubstancesConsumptionUncertainty(defaultUncertainty);
      }
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
    const input = event.target.value;
    if (isValidInputNumber(input,0)) {
      setHazardousSubstancesConsumptionUncertainty(input);
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
                    type="text"
                    value={hazardousSubstancesConsumption}
                    onChange={updateHazardousSubstancesConsumption}
                    isInvalid={!isValidInput(hazardousSubstancesConsumption,0)}
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
                  type="text"
                  value={hazardousSubstancesConsumptionUncertainty}
                  onChange={updateHazardousSubstancesConsumptionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidInput(hazardousSubstancesConsumptionUncertainty,0,100)}
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