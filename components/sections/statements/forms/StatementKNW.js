// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Modal, InputGroup } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { AssessmentKNW } from "../modals/AssessmentKNW";

const StatementKNW = (props) => {
  const [researchAndTrainingContribution, setResearchAndTrainingContribution] =
    useState(
      valueOrDefault(
        props.impactsData.researchAndTrainingContribution,
        undefined
      )
    );
  const [info, setInfo] = useState(props.impactsData.comments.knw || " ");
  const [showModal, setShowModal] = useState(false);

  const netValueAdded = props.impactsData.netValueAdded;

  useEffect(() => {
    if (
      researchAndTrainingContribution !==
      props.impactsData.researchAndTrainingContribution
    ) {
      setResearchAndTrainingContribution(
        props.impactsData.researchAndTrainingContribution
      );
    }
  }, [
    props.impactsData.researchAndTrainingContribution,
    researchAndTrainingContribution,
  ]);

  const updateResearchAndTrainingContribution = (input) => {
    props.impactsData.researchAndTrainingContribution = input;
    props.onUpdate("knw");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.knw = info);

  const onValidate = () => props.onValidate('knw');

  const isValid =
    researchAndTrainingContribution !== null && netValueAdded !== null;

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Valeur ajoutée nette dédiée à la recherche ou à la formation
        </Form.Label>
        <Col sm={6}>
          <Row className="align-items-center">
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(researchAndTrainingContribution, 0)}
                  inputMode="numeric"
                  onChange={updateResearchAndTrainingContribution}
                  isInvalid={!isValid}
                />
                <InputGroup.Text>&euro;</InputGroup.Text>
              </InputGroup>
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
      <div className="text-end">
        <Button disabled={!isValid} variant="secondary" onClick={onValidate}>
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
          <Modal.Title>Outils de mesure pour l'indicateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AssessmentKNW
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

export default StatementKNW;
