// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

/* ---------- STATEMENT - INDIC #ART ---------- */


const StatementART = ({ impactsData, onUpdate, onError }) => {
  const [craftedProduction, setCraftedProduction] = useState( impactsData.craftedProduction || "" );
  const [isValueAddedCrafted, setIsValueAddedCrafted] = useState(impactsData.isValueAddedCrafted || "");
  const [info, setInfo] = useState(impactsData.comments.art || "");
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (craftedProduction !== impactsData.craftedProduction) {
      setCraftedProduction(impactsData.craftedProduction || "");
    }
  }, [impactsData.craftedProduction]);

  const onIsValueAddedCraftedChange = (event) => {
    let radioValue = event.target.value;

    switch (radioValue) {
      case "true":
        impactsData.isValueAddedCrafted = true;
        impactsData.craftedProduction = impactsData.netValueAdded;
        setIsInvalid(false);
        onError("art", false);
        break;
      case "partial":
        impactsData.isValueAddedCrafted = null;
        impactsData.craftedProduction = "";
        setIsInvalid(false);
        onError("art", false);
        break;
      case "false":
        impactsData.isValueAddedCrafted = false;
        impactsData.craftedProduction = 0;
        setIsInvalid(false);
        onError("art", false);
        break;
    }
    setCraftedProduction(impactsData.craftedProduction);
    onUpdate("art");
  };

  const handleIsValueAddedCrafted = (event) => {
    const inputValue = event.target.valueAsNumber;
    let errorMessage = "";

    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    } else if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    } else if (inputValue >= impactsData.netValueAdded) {
      errorMessage =
        "La valeur saisie ne peut pas être supérieure à la valeur ajoutée nette.";
    }

    setIsInvalid(errorMessage !== "");
    onError("art", errorMessage);

    impactsData.craftedProduction = event.target.value;
    setCraftedProduction(event.target.value);
    onUpdate("art");
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.art = event.target.value;
  };

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
                checked={impactsData.isValueAddedCrafted === true}
                onChange={onIsValueAddedCraftedChange}
              />
              <Form.Check
                inline
                type="radio"
                label="Non"
                value="false"
                checked={impactsData.isValueAddedCrafted === false}
                onChange={onIsValueAddedCraftedChange}
              />
              <Form.Check
                inline
                type="radio"
                label="Partiellement"
                value="partial"
                checked={impactsData.isValueAddedCrafted === null}
                onChange={onIsValueAddedCraftedChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>
              Part de la valeur ajoutée artisanale
            </Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(craftedProduction, 0)}
                  inputMode="numeric"
                  onChange={handleIsValueAddedCrafted}
                  disabled={impactsData.isValueAddedCrafted !== null}
                  isInvalid={isInvalid}
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
              className="w-100"
              rows={3}
              onChange={updateInfo}
              value={info}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementART;
