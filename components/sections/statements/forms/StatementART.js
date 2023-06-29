// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

/* ---------- DECLARATION - INDIC #ART ---------- */

/** Component in IndicatorMainTab
 *  Props :
 *    - impactsData
 *    - onUpdate -> update footprints, update table
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

  const { isValueAddedCrafted, netValueAdded } = props.impactsData;

  /* ------------------------- */
  useEffect(() => {
    if (craftedProduction !== props.impactsData.craftedProduction) {
      setCraftedProduction(props.impactsData.craftedProduction);
    }
  }, [props.impactsData.craftedProduction]);
  /* ------------------------- */

  const onIsValueAddedCraftedChange = (event) => {
    // To do : change null radio value'
    setShowSuccessMessage(false);

    let radioValue = event.target.value;

    switch (radioValue) {
      case "true":
        props.impactsData.isValueAddedCrafted = true;
        props.impactsData.craftedProduction = netValueAdded;
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

    if (props.impactsData.isValueAddedCrafted != null) {
      return;
    }

    if (
      isNaN(inputValue) ||
      netValueAdded == null ||
      inputValue >= netValueAdded
    ) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    props.impactsData.comments.art = event.target.value;
  
  };

  return (
    <Form className="statement">
      <Row>
        <Col>
          <Form.Group as={Row} className="form-group align-items-center">
          <Form.Label column lg={7}>
              L'entreprise est-elle une entreprise artisanale ?
            </Form.Label>
            <Col>
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
                label="Non"
                value="false"
                checked={isValueAddedCrafted === false}
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
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
          <Form.Label column lg={7}>Part de la valeur ajoutée artisanale</Form.Label>
            <Col>
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
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label>Informations complémentaires</Form.Label>
            <Col>
              <Form.Control
                as="textarea"
                className="w-100"
                rows={3}
                onChange={updateInfo}
                value={info}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementART;
