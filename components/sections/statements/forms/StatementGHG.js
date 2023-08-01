// La Société Nouvelle
import React, { useEffect, useState } from "react";
import Select from "react-select";

import { Form, Row, Col, Button, Modal, InputGroup } from "react-bootstrap";

import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { AssessmentGHG } from "../modals/AssessmentGHG";
import { unitSelectStyles } from "../../../../config/customStyles";

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

  useEffect(() => {
    if (greenhousesGazEmissions != impactsData.greenhousesGazEmissions) {
      setGreenhousesGazEmissions(impactsData.greenhousesGazEmissions);
      setGreenhousesGazEmissionsUncertainty(
        impactsData.greenhousesGazEmissionsUncertainty
      );
    }
  }, [impactsData.greenhousesGazEmissions]);

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
            <Form.Label column lg={7}>
              Emissions directes de Gaz à effet de serre - SCOPE 1 *
            </Form.Label>
            <Col>
              <div className=" d-flex align-items-center justify-content-between">
                <div className="me-1 custom-input with-select input-group">
                  <Form.Control
                    type="number"
                    value={roundValue(greenhousesGazEmissions, 0)}
                    inputMode="numeric"
                    onChange={updateGreenhousesGazEmissions}
                    isInvalid={isInvalid}
                    className="me-1"
                  />
                  <Select
                    styles={unitSelectStyles}
                    options={options}
                    value={{
                      label: greenhousesGazEmissionsUnit,
                      value: greenhousesGazEmissionsUnit,
                    }}
                    onChange={updateGreenhousesGazEmissionsUnit}
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
            <Form.Label column lg={7}>
              Incertitude
            </Form.Label>
            <Col>
              <InputGroup className="custom-input">
                <Form.Control
                  type="number"
                  value={roundValue(greenhousesGazEmissionsUncertainty, 0)}
                  inputMode="numeric"
                  onChange={updateGreenhousesGazEmissionsUncertainty}
                  className="uncertainty-input"
                />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
          <div className="my-3 text-end">
            <p className="small mt-3">
              *Vous pouvez aussi calculer vos émissions avec l'{" "}
              <a
                className="text-link text-decoration-underline"
                href="https://www.bilans-climat-simplifies.ademe.fr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Outil de l'Ademe
              </a>
              .
            </p>
          </div>
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
