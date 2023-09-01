// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { roundValue, valueOrDefault, isValidNumber } from "/src/utils/Utils";
import { unitSelectStyles } from "/config/customStyles";

/* ---------- STATEMENT - INDIC #WAS ---------- */

/** Props concerned in impacts data :
 *    - wasteProduction
 *    - wasteProductionUnit
 *    - wasteProductionUncertainty
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
  "kg": { label: "kg",  coef: 1.0     }, // default
  "t":  { label: "t",   coef: 1000.0  },
};

const StatementWAS = ({ 
  impactsData, 
  onUpdate 
}) => {
  // satte
  const [wasteProduction, setWasteProduction] = 
    useState(valueOrDefault(impactsData.wasteProduction, ""));
  const [wasteProductionUnit, setWasteProductionUnit] = 
    useState(impactsData.wasteProductionUnit);
  const [wasteProductionUncertainty, setWasteProductionUncertainty] = 
    useState(valueOrDefault(impactsData.wasteProductionUncertainty, ""));
  const [info, setInfo] = useState(impactsData.comments.was || "");

  // update impacts data when state update
  useEffect(() => {
    impactsData.wasteProduction = wasteProduction;
    impactsData.wasteProductionUnit = wasteProductionUnit;
    impactsData.wasteProductionUncertainty = wasteProductionUncertainty;
    const statementStatus = checkStatement(impactsData);
    onUpdate(statementStatus);
  }, [wasteProduction,wasteProductionUnit,wasteProductionUncertainty]);

  // update state when props update
  useEffect(() => {
    // ...
  }, []);

  // waste production
  const updateWasteProduction = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setWasteProduction('');
    } else if (!isNaN(valueAsNumber)) {
      setWasteProduction(valueAsNumber);
      if (wasteProductionUncertainty=="") {
        let defaultUncertainty = valueAsNumber> 0 ? 25.0 : 0.0;
        setWasteProductionUncertainty(defaultUncertainty);
      }
    } else {
      setWasteProduction(value);
    }
  };

  // waste production unit
  const updateWasteProductionUnit = (selected) => 
  {
    const nextUnit = selected.value;
    setWasteProductionUnit(nextUnit);
    // update value
    if (!isNaN(wasteProduction)) {
      setWasteProduction(roundValue(wasteProduction*(units[wasteProductionUnit].coef/units[nextUnit].coef),0));
    }
  };

  // waste production uncertainty
  const updateWasteProductionUncertainty = (event) => 
  {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setWasteProductionUncertainty('');
    } else if (!isNaN(valueAsNumber)) {
      setWasteProductionUncertainty(valueAsNumber);
    } else {
      setWasteProductionUncertainty(value);
    }
  };

  // comment
  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.was = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Productiont totale de déchets (y compris DAOM<sup>1</sup>)
              <p className="small mb-0 mt-1">
                <sup>1</sup> Déchets assimilés aux ordures ménagères
              </p>
            </Form.Label>
            <Col>
              <div className="custom-input with-select input-group me-1">
                <Form.Control
                  type="number"
                  value={wasteProduction}
                  inputMode="numeric"
                  onChange={updateWasteProduction}
                  isInvalid={!isValidValue(wasteProduction)}
                  className="me-1"
                />

                <Select
                  options={Object.keys(units).map((unit) => {return({label: unit, value:unit})})}
                  styles={unitSelectStyles}
                  value={{
                    label: wasteProductionUnit,
                    value: wasteProductionUnit,
                  }}
                  onChange={updateWasteProductionUnit}
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
                  type="number"
                  value={roundValue(wasteProductionUncertainty, 0)}
                  inputMode="numeric"
                  onChange={updateWasteProductionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidUncertainty(wasteProductionUncertainty)}
                />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label>Informations complémentaires</Form.Label>
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

export default StatementWAS;

// Check statement
const checkStatement = (impactsData) => 
{
  const {
    wasteProduction,
    wasteProductionUncertainty,
  } = impactsData;

  // ok
  if (isValidNumber(wasteProduction,0) && isValidNumber(wasteProductionUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // valid value (empty or correct)
  else if (!isValidValue(wasteProduction) && !isValidUncertainty(wasteProductionUncertainty)) {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
  // error value for waste production
  else if (!isValidValue(wasteProduction)) {
    return({
      status: "error",
      errorMessage: isValidNumber(wasteProduction) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  }
  // error value for uncertainty
  else if (!isValidUncertainty(wasteProductionUncertainty)) {
    return({
      status: "error",
      errorMessage: isValidNumber(wasteProductionUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  }
  // incomplete statement
  else if (wasteProduction=="" || wasteProductionUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  }
  // other
  else {
    return({ status: "error", errorMessage: "Erreur Application" });
  }
}

const isValidValue = (value) => value=="" || isValidNumber(value,0)
const isValidUncertainty = (uncertainty) => uncertainty=="" || isValidNumber(uncertainty,0,100)