// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Modal, InputGroup } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
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
    props.impactsData.researchAndTrainingContribution = input.target.value;
    props.onUpdate("knw");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.knw = info);

  const isValid =
    researchAndTrainingContribution !== null && netValueAdded !== null;

  return (
    <Form className="statement">
      <Row>
        <Col>
          <Form.Group as={Row} className="form-group">
            <Form.Label column sm={7}>
              Valeur ajoutée nette dédiée à la recherche ou à la formation
            </Form.Label>
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
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label className="col-form-label">Informations complémentaires</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="w-100"
              onChange={updateInfo}
              value={info}
              onBlur={saveInfo}
            />
          </Form.Group>
        </Col>
        <div className="text-end my-3">
          <Button
          variant="light-secondary"
            className="btn-sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-calculator"></i> Outil d'évaluation
          </Button>
        </div>
      </Row>

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
