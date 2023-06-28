// La Société Nouvelle

import React, { useState } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { unitSelectStyles } from "../../../../src/utils/customStyles";
import { useEffect } from "react";

/* ---------- DECLARATION - INDIC #MAT ---------- */

const StatementMAT = ({ impactsData, onUpdate, onError }) => {
  const [materialsExtraction, setMaterialsExtraction] = useState(
    valueOrDefault(impactsData.materialsExtraction, "")
  );

  const [isExtractiveActivities, setIsExtractiveActivities] = useState(
    impactsData.isExtractiveActivities || ""
  );
  const [materialsExtractionUncertainty, setMaterialsExtractionUncertainty] =
    useState(valueOrDefault(impactsData.materialsExtractionUncertainty, ""));

  const [materialsExtractionUnit, setmaterialsExtractionUnit] = useState(
    impactsData.materialsExtractionUnit
  );

  const [info, setInfo] = useState(impactsData.comments.mat || "");

  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {

    impactsData.isExtractiveActivities = isExtractiveActivities;
    impactsData.materialsExtraction = materialsExtraction;
    impactsData.materialsExtractionUncertainty = materialsExtractionUncertainty;
    onUpdate("mat");
  }, [
    isExtractiveActivities,
    materialsExtraction,
    materialsExtractionUncertainty,
  ]);

  const onIsExtractiveActivitiesChange = (event) => {
    const radioValue = event.target.value;

    setIsExtractiveActivities(radioValue === "true");

    if (radioValue === "false") {
      setMaterialsExtraction("");
      setMaterialsExtractionUncertainty("");
      setIsInvalid(false);
      onError("mat", false);
    }
  };

  const updateMaterialsExtraction = (input) => {
    let errorMessage = "";
    const inputValue = input.target.valueAsNumber;

    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    }
    if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    }

    setIsInvalid(errorMessage !== "");
    onError("mat", errorMessage);

    setMaterialsExtraction(input.target.value);
    impactsData.setMaterialsExtraction(input.target.value);

    setMaterialsExtractionUncertainty(
      impactsData.materialsExtractionUncertainty
    );
  };

  const updateMaterialsExtractionUnit = (selected) => {
    const selectedUnit = selected.value;

    if (selectedUnit !== impactsData.materialsExtractionUnit) {
      let updatedMaterialsExtraction = impactsData.materialsExtraction;

      if (selectedUnit === "t") {
        updatedMaterialsExtraction = impactsData.materialsExtraction / 1000;
      } else if (selectedUnit === "kg") {
        updatedMaterialsExtraction = impactsData.materialsExtraction * 1000;
      }

      setMaterialsExtraction(updatedMaterialsExtraction);
      impactsData.setMaterialsExtraction(updatedMaterialsExtraction);
    }

    setmaterialsExtractionUnit(selectedUnit);

    impactsData.materialsExtractionUnit = selectedUnit;
  };

  const options = [
    { value: "kg", label: "kg" },
    { value: "t", label: "t" },
  ];

  const updateMaterialsExtractionUncertainty = (input) => {
    impactsData.materialsExtractionUncertainty = input.target.value;
    setMaterialsExtraction(impactsData.materialsExtraction);
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.mat = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column>
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
                checked={isExtractiveActivities}
                onChange={onIsExtractiveActivitiesChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isNotExtractiveActivities"
                label="Non"
                value="false"
                checked={!isExtractiveActivities}
                onChange={onIsExtractiveActivitiesChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>
              Quantité extraite de matières premières
            </Form.Label>
            <Col>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    value={roundValue(materialsExtraction, 0)}
                    inputMode="numeric"
                    disabled={!isExtractiveActivities}
                    onChange={updateMaterialsExtraction}
                    isInvalid={isInvalid}
                  />
                </Col>
                <Col sm={4}>
                  <Select
                    styles={unitSelectStyles}
                    isDisabled={!isExtractiveActivities}
                    options={options}
                    value={{
                      label: materialsExtractionUnit,
                      value: materialsExtractionUnit,
                    }}
                    onChange={updateMaterialsExtractionUnit}
                  />
                </Col>
              </Row>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>Incertitude</Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(materialsExtractionUncertainty, 0)}
                  inputMode="numeric"
                  disabled={!isExtractiveActivities}
                  onChange={updateMaterialsExtractionUncertainty}
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
              className="w-100"
              onChange={updateInfo}
              value={info}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementMAT;
