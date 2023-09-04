// La Société Nouvelle

// React
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Modal, InputGroup } from "react-bootstrap";

import { roundValue, valueOrDefault } from "/src/utils/Utils";

// Modals
import { AssessmentKNW } from "../modals/AssessmentKNW";
import { isValidNumber } from "/src/utils/Utils";
import { checkStatementKNW } from "./utils";

/* ---------- STATEMENT - INDIC #KNW ---------- */

/** Props concerned in impacts data :
 *    - researchAndTrainingContribution
 * 
 *  key functions :
 *    - useEffect on state
 *    - useEffect on props
 *    - checkStatement
 * 
 *  onUpdate -> send status to form container :
 *    - status : "ok" | "error" | "incomplete"
 *    - errorMessage : null | {message}
 */

const StatementKNW = ({ 
  impactsData, 
  onUpdate
}) => {

  const [researchAndTrainingContribution, setResearchAndTrainingContribution] =
    useState(valueOrDefault(impactsData.researchAndTrainingContribution, ""));
  const [info, setInfo] = useState(impactsData.comments.knw || " ");
  const [showModal, setShowModal] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  // update impacts data when state update
  useEffect(() => {
    impactsData.researchAndTrainingContribution = researchAndTrainingContribution;
    const statementStatus = checkStatementKNW(impactsData);
    onUpdate(statementStatus);
  }, [researchAndTrainingContribution]);

  // update state when props update
  useEffect(() => 
  {
    if (impactsData.researchAndTrainingContribution!=researchAndTrainingContribution) {
      setResearchAndTrainingContribution(impactsData.researchAndTrainingContribution || "");
    }
  }, [impactsData.researchAndTrainingContribution]);

  // reasearch and training contribution
  const updateResearchAndTrainingContribution = (event) => {
    const { value, valueAsNumber } = event.target;
    if (value=="") {
      setResearchAndTrainingContribution('');
    } else if (!isNaN(valueAsNumber)) {
      setResearchAndTrainingContribution(valueAsNumber);
    } else {
      setResearchAndTrainingContribution(value);
    }
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.knw = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Valeur ajoutée nette dédiée à la recherche ou à la formation
            </Form.Label>
            <Col>
              <div className="d-flex justify-content-between">
                <InputGroup className="custom-input me-1">
                  <Form.Control
                    type="number"
                    value={roundValue(researchAndTrainingContribution, 0)}
                    inputMode="numeric"
                    onChange={updateResearchAndTrainingContribution}
                    isInvalid={!isValidNumber(researchAndTrainingContribution,0,impactsData.netValueAdded)}
                  />
                  <InputGroup.Text>&euro;</InputGroup.Text>
                </InputGroup>
                <Button
                  variant="light-secondary"
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-calculator"></i>
                </Button>
              </div>
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
              onBlur={saveInfo}
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
          <Modal.Title>Outils de mesure pour l'indicateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AssessmentKNW
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

export default StatementKNW;