// La Société Nouvelle
/* ---------- DECLARATION - INDIC #WAT ---------- */

import React, { useState } from "react";
import Select from "react-select";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { unitSelectStyles } from "../../../../src/utils/customStyles";

const StatementWAT = ({ impactsData, onUpdate, onError }) => {
  const [waterConsumption, setWaterConsumption] = useState(
    valueOrDefault(impactsData.waterConsumption, "")
  );
  const [waterConsumptionUncertainty, setWaterConsumptionUncertainty] =
    useState(valueOrDefault(impactsData.waterConsumptionUncertainty, ""));

  const [waterConsumptionUnit, setWaterConsumptionUnit] = useState(
    impactsData.waterConsumptionUnit
  );
  const [info, setInfo] = useState(impactsData.comments.wat || "");
  const [isInvalid, setIsInvalid] = useState(false);

  const options = [
    { value: "m³", label: "m³" },
    { value: "L", label: "L" },
  ];
  const updateWaterConsumption = (input) => {
    let errorMessage = "";

    const inputValue = input.target.valueAsNumber;

    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    }
    if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    }
    setIsInvalid(errorMessage !== "");
    onError("wat", errorMessage);

    impactsData.setWaterConsumption(input.target.value);
    setWaterConsumption(input.target.value);
    setWaterConsumptionUncertainty(impactsData.waterConsumptionUncertainty);
    onUpdate("wat");
  };

  const updateWaterConsumptionUncertainty = (input) => {
    impactsData.waterConsumptionUncertainty = input.target.value;
    onUpdate("wat");
  };

  const updateWaterConsumptionUnit = (selected) => {
    const selectedUnit = selected.value;

    const { waterConsumption, waterConsumptionUnit } = impactsData;

    if (selectedUnit !== impactsData.waterConsumptionUnit) {
      let updatedWaterConsumption = impactsData.waterConsumption;

      if (selectedUnit === "m³") {
        updatedWaterConsumption = impactsData.waterConsumption / 1000;
      } else if (selectedUnit === "L") {
        updatedWaterConsumption = impactsData.waterConsumption * 1000;
      }

      setWaterConsumption(updatedWaterConsumption);
      impactsData.waterConsumption = updatedWaterConsumption;
    }

    setWaterConsumptionUnit(selectedUnit);

    impactsData.waterConsumptionUnit = selectedUnit;

    onUpdate("wat");
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.wat = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>Consommation totale d'eau</Form.Label>
            <Col>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    value={roundValue(waterConsumption, 0)}
                    inputMode="numeric"
                    onChange={updateWaterConsumption}
                  />
                </Col>
                <Col sm={4}>
                  <Select
                    options={options}
                    styles={unitSelectStyles}
                    value={{
                      label: waterConsumptionUnit,
                      value: waterConsumptionUnit,
                    }}
                    onChange={updateWaterConsumptionUnit}
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
                  value={roundValue(waterConsumptionUncertainty, 0)}
                  inputMode="numeric"
                  onChange={updateWaterConsumptionUncertainty}
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

export default StatementWAT;
