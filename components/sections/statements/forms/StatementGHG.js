// La Société Nouvelle
import React, { useState, useEffect } from "react";

import { Form, Row, Col, Button, Modal, InputGroup } from "react-bootstrap";
import Select from "react-select";

import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { AssessmentGHG } from "../modals/AssessmentGHG";

const StatementGHG = (props) => {
  const [greenhousesGazEmissions, setGreenhousesGazEmissions] = useState(
    valueOrDefault(props.impactsData.greenhousesGazEmissions, undefined)
  );

  const [greenhousesGazEmissionsUnit, setGreenhousesGazEmissionsUnit] =
    useState(props.impactsData.greenhousesGazEmissionsUnit);
  const [
    greenhousesGazEmissionsUncertainty,
    setGreenhousesGazEmissionsUncertainty,
  ] = useState(
    valueOrDefault(
      props.impactsData.greenhousesGazEmissionsUncertainty,
      undefined
    )
  );
  const [
    greenhousesGazEmissionsUnit,
    setGreenhousesGazEmissionsUnit,
  ] = useState(
    valueOrDefault(
      props.impactsData.greenhousesGazEmissionsUnit,
      undefined
    )
  );

  const [info, setInfo] = useState(props.impactsData.comments.ghg || "");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (greenhousesGazEmissions !== props.impactsData.greenhousesGazEmissions) {
      setGreenhousesGazEmissions(props.impactsData.greenhousesGazEmissions);
    }

    if (greenhousesGazEmissionsUnit !== props.impactsData.greenhousesGazEmissionsUnit) {
      setGreenhousesGazEmissionsUnit(props.impactsData.greenhousesGazEmissionsUnit);
    }

    if (
      greenhousesGazEmissionsUncertainty !==
      props.impactsData.greenhousesGazEmissionsUncertainty
    ) {
      setGreenhousesGazEmissionsUncertainty(
        props.impactsData.greenhousesGazEmissionsUncertainty
      );
    }
  }, [
    props.impactsData.greenhousesGazEmissions,
    props.impactsData.greenhousesGazEmissionsUncertainty,
  ]);

  const options = [
    { value: "kgCO2e", label: "kgCO2e" },
    { value: "tCO2e", label: "tCO2e" },
  ];

  const { netValueAdded } = props.impactsData;
  const isValid = greenhousesGazEmissions != null && netValueAdded != null;

  const updateGreenhousesGazEmissions = (input) => {
    props.impactsData.ghgTotal = true;
    props.impactsData.setGreenhousesGazEmissions(input);
    setGreenhousesGazEmissionsUncertainty(
      props.impactsData.greenhousesGazEmissionsUncertainty
    );
    props.onUpdate("ghg");
  };

  const updateGreenhousesGazEmissionsUncertainty = (input) => {
    props.impactsData.greenhousesGazEmissionsUncertainty = input;
    props.onUpdate("ghg");
  };

  const updateGreenhousesGazEmissionsUnit = (selected) => {
    const selectedUnit = selected.value;


    if (selectedUnit !== props.impactsData.greenhousesGazEmissionsUnit) {
      let updatedGreenhousesGazEmissions = props.impactsData.greenhousesGazEmissions;

      if (selectedUnit === "tCO2e") {
        updatedGreenhousesGazEmissions = props.impactsData.greenhousesGazEmissions / 1000;
      } else if (selectedUnit === "kgCO2e") {
        updatedGreenhousesGazEmissions = props.impactsData.greenhousesGazEmissions * 1000;
      }

      updateGreenhousesGazEmissions(updatedGreenhousesGazEmissions);

    }
    setGreenhousesGazEmissionsUnit(selectedUnit)
  

    props.impactsData.greenhousesGazEmissionsUnit = selectedUnit;

    props.onUpdate("ghg");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.ghg = info);
  const onValidate = () => {
    setUpdated(true);
    props.onValidate();
  };

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Emissions directes de Gaz à effet de serre - SCOPE 1
        </Form.Label>
        <Col sm={6}>
          <Row className="align-items-center">
            <Col>
              <Form.Control
                type="number"
                value={roundValue(greenhousesGazEmissions, 0)}
                inputMode="numeric"
                onChange={updateGreenhousesGazEmissions}
                isInvalid={!isValid}
              />
            </Col>
            <Col sm={3}>
              <Select
              className="form-select-control"
                options={options}
                value={{
                  label: greenhousesGazEmissionsUnit,
                  value: greenhousesGazEmissionsUnit,
                }}
                onChange={updateGreenhousesGazEmissionsUnit}
              />
            </Col>
            <Col>
              <Button
                className="btn btn-primary btn-sm"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-calculator"></i> Outil d'évaluation
              </Button>
            </Col>
          </Row>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Incertitude
        </Form.Label>
        <Col sm={6}>
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
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Informations complémentaires
        </Form.Label>
        <Col sm={6}>
          <Form.Control
            as="textarea"
            rows={3}
            className="w-100"
            onChange={updateInfo}
            value={info}
            onBlur={saveInfo}
          />
        </Col>
      </Form.Group>
      <div className="statement-info mt-3 small">
        <p>
          * Vous pouvez également calculer vos émissions de gaz à effet de serre
          en utilisant l'
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
      <div className="text-end">
        <Button variant="light-secondary" disabled={!isValid} onClick={onValidate}>
          Valider
        </Button>
      </div>

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
            impactsData={props.impactsData}
            onGoBack={() => setShowModal(false)}
            handleClose={() => setShowModal(false)}
            onUpdate={props.onUpdate}
          />
        </Modal.Body>
      </Modal>
    </Form>
  );
};

export default StatementGHG;
