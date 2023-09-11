// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { unitSelectStyles } from "/config/customStyles";

// Utils
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { checkStatementWAS } from "./utils";
import { isValidInput, isValidInputNumber } from "/src/utils/Utils";

// Lib
import indicators from "/lib/indics";

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


const StatementWAS = ({ 
  impactsData, 
  onUpdate 
}) => {
  // satte
  const [wasteProduction, setWasteProduction] = useState(
    valueOrDefault(impactsData.wasteProduction, "")
  );
  const [wasteProductionUnit, setWasteProductionUnit] = useState(
    impactsData.wasteProductionUnit
  );
  const [wasteProductionUncertainty, setWasteProductionUncertainty] = useState(
    valueOrDefault(impactsData.wasteProductionUncertainty, "")
  );
  const [info, setInfo] = useState(impactsData.comments.was || "");

  // Units
  const units = indicators["was"].statementUnits;

  // update impacts data when state update
  useEffect(() => {
    impactsData.wasteProduction = wasteProduction;
    impactsData.wasteProductionUnit = wasteProductionUnit;
    impactsData.wasteProductionUncertainty = wasteProductionUncertainty;
    const statementStatus = checkStatementWAS(impactsData);
    onUpdate(statementStatus);
  }, [wasteProduction, wasteProductionUnit, wasteProductionUncertainty]);

  // update state when props update
  useEffect(() => {
    // ...
  }, []);

  // waste production
  const updateWasteProduction = (event) => {
    const input = event.target.value;
    if (isValidInputNumber(input, 0)) {
      setWasteProduction(input);
      if (wasteProductionUncertainty == "") {
        let defaultUncertainty = parseFloat(input) > 0 ? 25.0 : 0.0;
        setWasteProductionUncertainty(defaultUncertainty);
      }
    }
  };

  // waste production unit
  const updateWasteProductionUnit = (selected) => {
    const nextUnit = selected.value;
    setWasteProductionUnit(nextUnit);
    // update value
    if (!isNaN(wasteProduction)) {
      setWasteProduction(
        roundValue(
          wasteProduction *
            (units[wasteProductionUnit].coef / units[nextUnit].coef),
          0
        )
      );
    }
  };

  // waste production uncertainty
  const updateWasteProductionUncertainty = (event) => {
    const input = event.target.value;
    if (isValidInputNumber(input)) {
      setWasteProductionUncertainty(input);
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
                  type="text"
                  value={wasteProduction}
                  onChange={updateWasteProduction}
                  isInvalid={!isValidInput(wasteProduction, 0)}
                  className="me-1"
                />

                <Select
                  options={Object.keys(units).map((unit) => {
                    return { label: unit, value: unit };
                  })}
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
                  type="text"
                  value={wasteProductionUncertainty}
                  onChange={updateWasteProductionUncertainty}
                  className="uncertainty-input"
                  isInvalid={!isValidInput(wasteProductionUncertainty, 0, 100)}
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