// La Société Nouvelle

import React, { useState } from "react";
import Select from "react-select";

import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { unitSelectStyles } from "../../../../src/utils/customStyles";

const StatementHAZ = ({ impactsData, onUpdate, onError }) => {
  const [hazardousSubstancesConsumption, setHazardousSubstancesConsumption] =
    useState(valueOrDefault(impactsData.hazardousSubstancesConsumption, ""));

  const [
    hazardousSubstancesConsumptionUnit,
    setHazardousSubstancesConsumptionUnit,
  ] = useState(impactsData.hazardousSubstancesConsumptionUnit);

  const [
    hazardousSubstancesConsumptionUncertainty,
    setHazardousSubstancesConsumptionUncertainty,
  ] = useState(
    valueOrDefault(impactsData.hazardousSubstancesConsumptionUncertainty, "")
  );

  const [isInvalid, setIsInvalid] = useState(false);

  const [info, setInfo] = useState(impactsData.comments.haz || "");

  const options = [
    { value: "kg", label: "kg" },
    { value: "t", label: "t" },
  ];

  const updateHazardousSubstancesConsumption = (input) => {

    let errorMessage = "";
    const inputValue = input.target.valueAsNumber;

    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    }
    if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    }

    setIsInvalid(errorMessage !== "");
    onError("haz", errorMessage);

    setHazardousSubstancesConsumption(input.target.value);

    impactsData.setHazardousSubstancesConsumption(input.target.value);
    setHazardousSubstancesConsumptionUncertainty(
      impactsData.hazardousSubstancesConsumptionUncertainty
    );

    onUpdate("haz");
  };

  const updateHazardousSubstancesConsumptionUncertainty = (input) => {
    impactsData.hazardousSubstancesConsumptionUncertainty = input.target.value;
    onUpdate("haz");
  };

  const updateHazardousSubstancesConsumptionUnit = (selected) => {
    const selectedUnit = selected.value;

    if (selectedUnit !== impactsData.hazardousSubstancesConsumptionUnit) {
      let updatedHazardousSubstancesConsumption =
        impactsData.hazardousSubstancesConsumption;

      if (selectedUnit === "t") {
        updatedHazardousSubstancesConsumption =
          impactsData.hazardousSubstancesConsumption / 1000;
      } else if (selectedUnit === "kg") {
        updatedHazardousSubstancesConsumption =
          impactsData.hazardousSubstancesConsumption * 1000;
      }

      setHazardousSubstancesConsumption(updatedHazardousSubstancesConsumption);
      impactsData.setHazardousSubstancesConsumption(
        updatedHazardousSubstancesConsumption
      );
    }
    setHazardousSubstancesConsumptionUnit(selectedUnit);

    impactsData.hazardousSubstancesConsumptionUnit = selectedUnit;

    onUpdate("ghg");
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.haz = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>
              Utilisation de produits dangereux - santé/environnement
            </Form.Label>
            <Col>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    value={roundValue(hazardousSubstancesConsumption, 0)}
                    inputMode="numeric"
                    onChange={updateHazardousSubstancesConsumption}
                    isInvalid={isInvalid}
                  />
                </Col>
                <Col sm={4}>
                  <Select
                    styles={unitSelectStyles}
                    options={options}
                    defaultValue={{
                      label: hazardousSubstancesConsumptionUnit,
                      value: hazardousSubstancesConsumptionUnit,
                    }}
                    className="small"
                    onChange={updateHazardousSubstancesConsumptionUnit}
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
                  value={roundValue(
                    hazardousSubstancesConsumptionUncertainty,
                    0
                  )}
                  inputMode="numeric"
                  onChange={updateHazardousSubstancesConsumptionUncertainty}
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
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementHAZ;
