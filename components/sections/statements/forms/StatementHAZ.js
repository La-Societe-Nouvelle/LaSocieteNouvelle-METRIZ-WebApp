// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { roundValue, valueOrDefault, isCorrectValue } from "/src/utils/Utils";
import { unitSelectStyles } from "../../../../config/customStyles";

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
    const statementStatus = checkStatement(impactsData);
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

export default StatementHAZ;

// Check statement
const checkStatement = (impactsData) => 
{
  const {
    hazardousSubstancesConsumption,
    hazardousSubstancesConsumptionUncertainty,
  } = impactsData;

  // ok
  if (isCorrectValue(hazardousSubstancesConsumption,0) && isCorrectValue(hazardousSubstancesConsumptionUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // valid value (empty or correct)
  else if (!isValidValue(hazardousSubstancesConsumption) && !isValidUncertainty(hazardousSubstancesConsumptionUncertainty)) {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
  // error value for energy consumption
  else if (!isValidValue(hazardousSubstancesConsumption)) {
    return({
      status: "error",
      errorMessage: isCorrectValue(hazardousSubstancesConsumption) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  }
  // error value for uncertainty
  else if (!isValidUncertainty(hazardousSubstancesConsumptionUncertainty)) {
    return({
      status: "error",
      errorMessage: isCorrectValue(hazardousSubstancesConsumptionUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  }
  // incomplete statement
  else if (hazardousSubstancesConsumption=="" || hazardousSubstancesConsumptionUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  }
  // other
  else {
    return({ status: "error", errorMessage: "Erreur Application" });
  }
}

const isValidValue = (value) => value=="" || isCorrectValue(value,0)
const isValidUncertainty = (uncertainty) => uncertainty=="" || isCorrectValue(uncertainty,0,100)