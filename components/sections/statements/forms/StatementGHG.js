// La Société Nouvelle
import React, { useState } from "react";
import Select from "react-select";

import { Form, Row, Col, Button, Modal, InputGroup } from "react-bootstrap";

import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { AssessmentGHG } from "../modals/AssessmentGHG";
import { unitSelectStyles } from "../../../../src/utils/customStyles";

const StatementGHG = ({ impactsData, onUpdate, onError }) => {
  const [greenhousesGazEmissions, setGreenhousesGazEmissions] = useState(
    valueOrDefault(impactsData.greenhousesGazEmissions, "")
  );

  const [greenhousesGazEmissionsUnit, setGreenhousesGazEmissionsUnit] =
    useState(impactsData.greenhousesGazEmissionsUnit);

  const [
    greenhousesGazEmissionsUncertainty,
    setGreenhousesGazEmissionsUncertainty,
  ] = useState(
    valueOrDefault(impactsData.greenhousesGazEmissionsUncertainty, "")
  );
  const [info, setInfo] = useState(impactsData.comments.ghg || "");
  const [showModal, setShowModal] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const options = [
    { value: "kgCO2e", label: "kgCO2e" },
    { value: "tCO2e", label: "tCO2e" },
  ];

  const updateGreenhousesGazEmissions = (input) => {
    let errorMessage = "";
    const inputValue = input.target.valueAsNumber;

    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    }
    if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    }

    setIsInvalid(errorMessage !== "");
    onError("ghg", errorMessage);

    setGreenhousesGazEmissions(input.target.value);

    impactsData.ghgTotal = true;

    impactsData.setGreenhousesGazEmissions(input.target.value);
    setGreenhousesGazEmissionsUncertainty(
      impactsData.greenhousesGazEmissionsUncertainty
    );

    onUpdate("ghg");
  };

  const updateGreenhousesGazEmissionsUncertainty = (input) => {
    impactsData.greenhousesGazEmissionsUncertainty = input.target.value;
    setGreenhousesGazEmissionsUncertainty(input.target.value);
    onUpdate("ghg");
  };

  const updateGreenhousesGazEmissionsUnit = (selected) => {
    const selectedUnit = selected.value;

    if (selectedUnit !== impactsData.greenhousesGazEmissionsUnit) {
      let updatedGreenhousesGazEmissions = impactsData.greenhousesGazEmissions;

      if (selectedUnit === "tCO2e") {
        updatedGreenhousesGazEmissions =
          impactsData.greenhousesGazEmissions / 1000;
      } else if (selectedUnit === "kgCO2e") {
        updatedGreenhousesGazEmissions =
          impactsData.greenhousesGazEmissions * 1000;
      }

      setGreenhousesGazEmissions(updatedGreenhousesGazEmissions);
      impactsData.setGreenhousesGazEmissions(updatedGreenhousesGazEmissions);
    }
    setGreenhousesGazEmissionsUnit(selectedUnit);

    impactsData.greenhousesGazEmissionsUnit = selectedUnit;

    onUpdate("ghg");
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.ghg = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>
              Emissions directes de Gaz à effet de serre - SCOPE 1
            </Form.Label>
            <Col>
              <Row className="align-items-center">
                <Col>
                  <Form.Control
                    type="number"
                    value={roundValue(greenhousesGazEmissions, 0)}
                    inputMode="numeric"
                    onChange={updateGreenhousesGazEmissions}
                    isInvalid={isInvalid}
                  />
                </Col>
                <Col sm={4}>
                  <Select
                    styles={unitSelectStyles}
                    options={options}
                    value={{
                      label: greenhousesGazEmissionsUnit,
                      value: greenhousesGazEmissionsUnit,
                    }}
                    onChange={updateGreenhousesGazEmissionsUnit}
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
                  value={roundValue(greenhousesGazEmissionsUncertainty, 0)}
                  inputMode="numeric"
                  onChange={updateGreenhousesGazEmissionsUncertainty}
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
            <Col>
              <Form.Control
                as="textarea"
                rows={3}
                className="w-100"
                onChange={updateInfo}
                value={info}
              />
            </Col>
          </Form.Group>
        </Col>

        <div className="my-3 text-end">
          <Button
            variant="light-secondary"
            className="btn-sm mt-2"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-calculator"></i> Outil d'évaluation *
          </Button>

          <p className="small mt-3">
            * Vous pouvez également calculer vos émissions de gaz à effet de
            serre en utilisant l'
            <a
              className="text-link"
              href="https://www.bilans-climat-simplifies.ademe.fr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Outil de l'Ademe <i className="bi bi-box-arrow-up-right"></i>
            </a>
            .
          </p>
        </div>
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
          <AssessmentGHG
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

export default StatementGHG;
