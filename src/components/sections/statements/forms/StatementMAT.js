// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { roundValue } from "/src/utils/Utils";
import { unitSelectStyles } from "/config/customStyles";
import { checkStatementMAT } from "./utils";
import { isValidInput, isValidInputNumber } from "../../../../utils/Utils";

/* ---------- STATEMENT - INDIC #MAT ---------- */

/** Props concerned in impacts data :
 *    - isExtractiveActivities
 *    - materialsExtraction
 *    - materialsExtractionUnit
 *    - materialsExtractionUncertainty
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

const StatementMAT = ({ 
  impactsData, 
  onUpdate
}) => {
  // state
  const [isExtractiveActivities, setIsExtractiveActivities] = 
    useState(impactsData.isExtractiveActivities);
  const [materialsExtraction, setMaterialsExtraction] = 
    useState(impactsData.materialsExtraction);
  const [materialsExtractionUnit, setmaterialsExtractionUnit] = 
    useState(impactsData.materialsExtractionUnit);
  const [materialsExtractionUncertainty, setMaterialsExtractionUncertainty] =
    useState(impactsData.materialsExtractionUncertainty);
  const [info, setInfo] = useState(impactsData.comments.mat || "");

  // update impacts data when state update
  useEffect(() => {
    impactsData.isExtractiveActivities = isExtractiveActivities;
    impactsData.materialsExtraction = materialsExtraction;
    impactsData.materialsExtractionUnit = materialsExtractionUnit;
    impactsData.materialsExtractionUncertainty = materialsExtractionUncertainty;
    const statementStatus = checkStatementMAT(impactsData);
    onUpdate(statementStatus);
  }, [isExtractiveActivities,materialsExtraction,materialsExtractionUnit,materialsExtractionUncertainty]);

  // update state when props update
  useEffect(() => {
    // ...
  }, []);

  // is extractive activities
  const onIsExtractiveActivitiesChange = (event) => 
  {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        setIsExtractiveActivities(true);
        setMaterialsExtraction("");
        setMaterialsExtractionUncertainty("");
        break;
      case "false":
        setIsExtractiveActivities(false);
        setMaterialsExtraction(0);
        setMaterialsExtractionUncertainty(0);
        break;
    }
  };

  // materials extraction
  const updateMaterialsExtraction = (event) => 
  {
    const input = event.target.value;
    if (isValidInputNumber(input,0)) {
      setMaterialsExtraction(input);
      if (materialsExtractionUncertainty=="") {
        let defaultUncertainty = parseFloat(input)> 0 ? 25.0 : 0.0;
        setMaterialsExtractionUncertainty(defaultUncertainty);
      }
    }
  };

  // materials extraction unit
  const updateMaterialsExtractionUnit = (selected) => 
  {
    const nextUnit = selected.value;
    setmaterialsExtractionUnit(nextUnit);
    // update value
    if (!isNaN(materialsExtraction)) {
      setMaterialsExtraction(roundValue(materialsExtraction*(units[materialsExtractionUnit].coef/units[nextUnit].coef),0));
    }
  };

  // materials extraction uncertainty
  const updateMaterialsExtractionUncertainty = (event) => 
  {
    const input = event.target.value;
    if (isValidInputNumber(input,0)) {
      setMaterialsExtractionUncertainty(input);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.mat = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column lg={7}>
              L'entreprise réalise-t-elle des activités agricoles ou extractives
              ?
            </Form.Label>
            <Col className="text-end">
              <Form.Check
                inline
                type="radio"
                id="isExtractiveActivities"
                label="Oui"
                value="true"
                checked={isExtractiveActivities === true}
                onChange={onIsExtractiveActivitiesChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isNotExtractiveActivities"
                label="Non"
                value="false"
                checked={isExtractiveActivities === false}
                onChange={onIsExtractiveActivitiesChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Quantité extraite de matières premières
            </Form.Label>
            <Col>
              <div className=" d-flex align-items-center justify-content-between">
                <div className="custom-input with-select input-group">
                  <Form.Control
                    type="text"
                    value={materialsExtraction}
                    disabled={!isExtractiveActivities}
                    onChange={updateMaterialsExtraction}
                    isInvalid={!isValidInput(materialsExtraction,0)}
                    className="me-1 border-right-3"
                  />
                  <Select
                    styles={unitSelectStyles}
                    isDisabled={!isExtractiveActivities}
                    options={Object.keys(units).map((unit) => {return({label:unit, value:unit})})}
                    value={{
                      label: materialsExtractionUnit,
                      value: materialsExtractionUnit,
                    }}
                    onChange={updateMaterialsExtractionUnit}
                  />
                </div>
              </div>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>Incertitude</Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="text"
                  value={materialsExtractionUncertainty}
                  disabled={!isExtractiveActivities}
                  onChange={updateMaterialsExtractionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidInput(materialsExtractionUncertainty,0,100)}
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

export default StatementMAT;