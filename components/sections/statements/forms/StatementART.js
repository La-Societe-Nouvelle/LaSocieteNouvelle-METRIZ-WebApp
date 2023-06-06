// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";

/* ---------- DECLARATION - INDIC #ART ---------- */

/** Component in IndicatorMainTab
 *  Props :
 *    - impactsData
 *    - onUpdate -> update footprints, update table
 *    - onValidate -> update validations
 *    - toAssessment -> open assessment view (if defined)
 *  Behaviour :
 *    Edit directly impactsData (session) on inputs blur
 *    Redirect to assessment tool (if defined)
 *    Update footprints on validation
 *  State :
 *    inputs
 */

const StatementART = (props) => {
  const [craftedProduction, setCraftedProduction] = useState(
    valueOrDefault(props.impactsData.craftedProduction, undefined)
  );
  const [info, setInfo] = useState(props.impactsData.comments.art || "");

  const [isInvalid, setIsInvalid] = useState(false);
  const [formErrors, setFormErrors] = useState();
  
  useEffect(() => {
    if (craftedProduction !== props.impactsData.craftedProduction) {
      setCraftedProduction(props.impactsData.craftedProduction);
    }
  }, [props.impactsData.craftedProduction]);

  const { isValueAddedCrafted, netValueAdded } = props.impactsData;

  const onIsValueAddedCraftedChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        props.impactsData.isValueAddedCrafted = true;
        props.impactsData.craftedProduction = props.impactsData.netValueAdded;
        break;
      case "null":
        props.impactsData.isValueAddedCrafted = null;
        props.impactsData.craftedProduction = null;
        break;
      case "false":
        props.impactsData.isValueAddedCrafted = false;
        props.impactsData.craftedProduction = 0;
        break;
    }
    setCraftedProduction(props.impactsData.craftedProduction);
    props.onUpdate("art");
  };

  const updateCraftedProduction = (event) => {
    props.impactsData.craftedProduction = event.target.value;
    setCraftedProduction(event.target.value);
    props.onUpdate("art");
  };

  const handleIsValueAddedCrafted = (event) => {
    const inputValue = event.target.valueAsNumber;

    if (isValueAddedCrafted != null) {
      return;
    }

    let errors = {};

    if (
      isNaN(inputValue) ||
      props.impactsData.netValueAdded == null ||
      inputValue >= props.impactsData.netValueAdded
    ) {
      errors.craftedProduction = "Valeur incorrecte";
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
    console.log(errors)
    setFormErrors(errors);
  };


  const updateInfo = (event) => setInfo(event.target.value);

  const saveInfo = () => (props.impactsData.comments.art = info);

  const onValidate = () => props.onValidate();

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group align-items-center">
        <Form.Label column sm={4}>
          L'entreprise est-elle une entreprise artisanale ?
        </Form.Label>
        <Col sm={6}>
          <Form.Check
            inline
            type="radio"
            id="hasValueAdded"
            label="Oui"
            value="true"
            checked={isValueAddedCrafted === true}
            onChange={onIsValueAddedCraftedChange}
          />

          <Form.Check
            inline
            type="radio"
            id="hasValueAdded"
            label="Partiellement"
            value="null"
            checked={isValueAddedCrafted === null}
            onChange={onIsValueAddedCraftedChange}
          />
          <Form.Check
            inline
            type="radio"
            id="hasValueAdded"
            label="Non"
            value="false"
            checked={isValueAddedCrafted === false}
            onChange={onIsValueAddedCraftedChange}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Part de la valeur ajoutée artisanale
        </Form.Label>
        <Col sm={6}>
          <InputGroup>
            <Form.Control
              type="number"
              value={roundValue(craftedProduction, 0)}
              inputMode="numeric"
              onChange={updateCraftedProduction}
              onInput={handleIsValueAddedCrafted}
              disabled={isValueAddedCrafted !== null}
              isInvalid={isInvalid}
            />
            <InputGroup.Text>&euro;</InputGroup.Text>

          </InputGroup>
       
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Informations complémentaires
        </Form.Label>
        <Col sm={6}>
          <Form.Control
            as="textarea"
            className="w-100"
            rows={3}
            onChange={updateInfo}
            value={info}
            onBlur={saveInfo}
          />
        </Col>
      </Form.Group>
      <div className="text-end">
        <Button
          disabled={isInvalid || isValueAddedCrafted == ""}
          variant="secondary"
          onClick={onValidate}
        >
          Valider
        </Button>
      </div>
    </Form>
  );
};

export default StatementART;
