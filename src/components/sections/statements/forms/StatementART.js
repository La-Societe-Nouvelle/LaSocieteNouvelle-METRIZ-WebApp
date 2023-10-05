// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";

import { checkStatementART } from "./utils";
import { isValidInput, isValidInputNumber } from "../../../../utils/Utils";

/* ---------- STATEMENT - INDIC #ART ---------- */

/** Props concerned in impacts data :
 *    - isValueAddedCrafted
 *    - craftedProduction
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

const StatementART = ({ 
  impactsData,
  onUpdate, 
}) => {

  const [isValueAddedCrafted, setIsValueAddedCrafted] = useState(impactsData.isValueAddedCrafted);
  const [craftedProduction, setCraftedProduction] = useState(impactsData.craftedProduction);
  const [info, setInfo] = useState(impactsData.comments.art || "");

  // update impacts data when state update
  useEffect(() => {
    impactsData.isValueAddedCrafted = isValueAddedCrafted;
    impactsData.craftedProduction = craftedProduction;
    const statementStatus = checkStatementART(impactsData);
    onUpdate(statementStatus);
  }, [isValueAddedCrafted,craftedProduction]);

  // update state when props update
  useEffect(() => 
  {
    if (impactsData.isValueAddedCrafted!=isValueAddedCrafted) {
      setIsValueAddedCrafted(impactsData.isValueAddedCrafted);
    }
    if ((impactsData.craftedProduction)!=craftedProduction) {
      setCraftedProduction(impactsData.craftedProduction || "");
    }
  }, [impactsData.isValueAddedCrafted, impactsData.craftedProduction]);

  // radio button - crafted activities
  const onIsValueAddedCraftedChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        setIsValueAddedCrafted(true);
        setCraftedProduction(impactsData.netValueAdded);
        break;
      case "partially":
        setIsValueAddedCrafted("partially");
        setCraftedProduction("");
        break;
      case "false":
        setIsValueAddedCrafted(false);
        setCraftedProduction(0);
        break;
    }
  };

  // amount input
  const handleAmountValueAddedCrafted = (event) => {
    const input = event.target.value;
    if (isValidInputNumber(input,0)) {
      setCraftedProduction(input);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.art = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column>
              L'entreprise est-elle une entreprise artisanale ?
            </Form.Label>
            <Col className="text-end">
              <Form.Check
                inline
                type="radio"
                label="Oui"
                value="true"
                checked={isValueAddedCrafted === true}
                onChange={onIsValueAddedCraftedChange}
              />
              <Form.Check
                inline
                type="radio"
                label="Non"
                value="false"
                checked={isValueAddedCrafted === false}
                onChange={onIsValueAddedCraftedChange}
              />
              <Form.Check
                inline
                type="radio"
                label="Partiellement"
                value="partially"
                checked={isValueAddedCrafted === "partially"}
                onChange={onIsValueAddedCraftedChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Part de la valeur ajoutée artisanale
            </Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="text"
                  value={craftedProduction}
                  onChange={handleAmountValueAddedCrafted}
                  disabled={isValueAddedCrafted !== "partially"}
                  isInvalid={!isValidInput(craftedProduction,0,impactsData.netValueAdded)}
                />
                <InputGroup.Text>&euro;</InputGroup.Text>
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

export default StatementART;