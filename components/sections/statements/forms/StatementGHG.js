// La Société Nouvelle
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Modal } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { AssessmentGHG } from "../modals/AssessmentGHG";

const StatementGHG = (props) => {
  const [greenhousesGazEmissions, setGreenhousesGazEmissions] = useState(
    valueOrDefault(props.impactsData.greenhousesGazEmissions, undefined)
  );
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

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.ghg = info);
  const onValidate = () => {
    setUpdated(true);
    props.onValidate();
  };

  return (
    <Form>
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
             <Select
                  options={options}
                  value={{
                    label: greenhousesGazEmissionsUnit,
                    value: greenhousesGazEmissionsUnit,
                  }}
                  // onChange={}
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
          <Form.Control
            type="number"
            value={roundValue(greenhousesGazEmissionsUncertainty, 0)}
            inputMode="numeric"
            onChange={updateGreenhousesGazEmissionsUncertainty}
          />
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
        <Button variant="secondary" disabled={!isValid} onClick={onValidate}>
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
          <Modal.Title>Outils de mesure des émissions directes de Gaz à effet de serre</Modal.Title>
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
