// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

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

  useEffect(() => {
    if (craftedProduction !== props.impactsData.craftedProduction) {
      setCraftedProduction(props.impactsData.craftedProduction);
    }
  }, [props.impactsData.craftedProduction]);

  const { isValueAddedCrafted, netValueAdded } = props.impactsData;

  const isValid =
    netValueAdded != null &&
    craftedProduction >= 0 &&
    craftedProduction <= netValueAdded;

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

  const updateInfo = (event) => setInfo(event.target.value);

  const saveInfo = () => (props.impactsData.comments.art = info);

  const onValidate = () => props.onValidate();

  return (
    <Form className="statement">
      <Form.Group>
        <Form.Label>
          L'entreprise est-elle une entreprise artisanale ?
        </Form.Label>
        <Form>
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
        </Form>
      </Form.Group>
      {console.log(craftedProduction)}
      <Form.Group>
        <Form.Label>Part de la valeur ajoutée artisanale</Form.Label>
        <InputGroup>
          <Form.Control
            type="number"
            value={roundValue(craftedProduction, 0)}
            inputMode="numeric"
            onChange={updateCraftedProduction}
            isInvalid={!isValid}
            disabled={isValueAddedCrafted !== null}
          />
          <InputGroup.Text>&euro;</InputGroup.Text>
        </InputGroup>

        {/* <InputNumber
          value={roundValue(craftedProduction, 0)}
          onUpdate={updateCraftedProduction}
          disabled={isValueAddedCrafted !== null}
          placeholder="&euro;"
          isInvalid={!isValid}
        /> */}
      </Form.Group>

      <Form.Group>
        <Form.Label>Informations complémentaires</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          onChange={updateInfo}
          value={info}
          onBlur={saveInfo}
        />
      </Form.Group>
      <button
        disabled={!isValid}
        className="btn btn-secondary btn-sm"
        onClick={onValidate}
      >
        Valider
      </button>
    </Form>
  );
};

export default StatementART;
