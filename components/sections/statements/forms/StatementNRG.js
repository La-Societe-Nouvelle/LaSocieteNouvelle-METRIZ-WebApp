// La Société Nouvelle

import React, { useState } from "react";
import Select from "react-select";

import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { AssessmentNRG } from "../modals/AssessmentNRG";
import { unitSelectStyles } from "../../../../config/customStyles";

/* ---------- DECLARATION - INDIC #NRG ---------- */

const StatementNRG = ({ impactsData, onUpdate, onError }) => {
  const [energyConsumption, setEnergyConsumption] = useState(
    valueOrDefault(impactsData.energyConsumption, "")
  );
  const [energyConsumptionUncertainty, setEnergyConsumptionUncertainty] =
    useState(valueOrDefault(impactsData.energyConsumptionUncertainty, ""));

  const [energyConsumptionUnit, setEnergyConsumptionUnit] = useState(
    impactsData.energyConsumptionUnit
  );

  const [isInvalid, setIsInvalid] = useState(false);
  const [info, setInfo] = useState(impactsData.comments.nrg || "");

  const [showModal, setShowModal] = useState(false);

  const options = [
    { value: "MJ", label: "MJ" },
    { value: "GJ", label: "GJ" },
    { value: "kWh", label: "kWh" },
    { value: "MWh", label: "MWh" },
  ];
  const updateEnergyConsumption = (input) => {
    let errorMessage = "";

    const inputValue = input.target.valueAsNumber;

    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    }
    if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    }
    setIsInvalid(errorMessage !== "");
    onError("nrg", errorMessage);

    impactsData.nrgTotal = true;
    impactsData.setEnergyConsumption(input.target.value);

    setEnergyConsumption(input.target.value);
    setEnergyConsumptionUncertainty(impactsData.energyConsumptionUncertainty);
    onUpdate("nrg");
  };

  const updateEnergyConsumptionUncertainty = (input) => {
    impactsData.energyConsumptionUncertainty = input.target.value;
    setEnergyConsumptionUncertainty(input.target.value);
    onUpdate("nrg");
  };

  const updateEnergyConsumptionUnit = (selected) => {
    const selectedUnit = selected.value;

    if (selectedUnit !== impactsData.energyConsumptionUnit) {
      const convertedValue = convertEnergyConsumption(
        impactsData.energyConsumption,
        impactsData.energyConsumptionUnit,
        selectedUnit
      );
      setEnergyConsumption(convertedValue);
      impactsData.setEnergyConsumption(convertedValue);
    }
    setEnergyConsumptionUnit(selectedUnit);

    impactsData.energyConsumptionUnit = selectedUnit;

    onUpdate("nrg");
  };

  const convertEnergyConsumption = (value, fromUnit, toUnit) => {
    const conversionFactors = {
      GJ: {
        MJ: 1000,
        kWh: 3.6,
        MWh: 3600,
      },
      MJ: {
        GJ: 1 / 1000,
        kWh: 1 / 3.6,
        MWh: 1 / 3600,
      },
      kWh: {
        GJ: 1 / 3.6,
        MJ: 3.6,
        MWh: 1 / 1000,
      },
      MWh: {
        GJ: 1 / 3600,
        MJ: 3600,
        kWh: 1000,
      },
    };
    const conversionFactor = conversionFactors[fromUnit][toUnit];
    const convertedValue = value * conversionFactor;
    return convertedValue;
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.nrg = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>Consommation totale d'énergie</Form.Label>
            <Col>
              <div className=" d-flex align-items-center justify-content-between">
                <div className="custom-input with-select input-group me-1">
                  <Form.Control
                    type="number"
                    value={roundValue(energyConsumption, 0)}
                    inputMode="numeric"
                    isInvalid={isInvalid}
                    onChange={updateEnergyConsumption}
                    className="me-1"
                  />
                  <Select
                    styles={unitSelectStyles}
                    options={options}
                    value={{
                      label: energyConsumptionUnit,
                      value: energyConsumptionUnit,
                    }}
                    onChange={updateEnergyConsumptionUnit}
                  />
                </div>

                <div>
                  <Button
                    variant="light-secondary"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="bi bi-calculator"></i>
                  </Button>
                </div>
              </div>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>Incertitude</Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="number"
                  value={roundValue(energyConsumptionUncertainty, 0)}
                  inputMode="numeric"
                  onChange={updateEnergyConsumptionUncertainty}
                  className="uncertainty-input"
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

      <Modal
        show={showModal}
        size="xl"
        centered
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Outils de mesure des émissions directes de Gaz à effet de serre
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AssessmentNRG
            impactsData={impactsData}
            onGoBack={() => setShowModal(false)}
            handleClose={() => setShowModal(false)}
            onUpdate={onUpdate}
          />
        </Modal.Body>
      </Modal>
    </Form>
  );
};

export default StatementNRG;
