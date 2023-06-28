// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Modal } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { IndividualsData } from "../modals/IndividualsData";
import { ImportDSN } from "../modals/ImportDSN";

/* ---------- DECLARATION - INDIC #IDR ---------- */

const StatementIDR = ({ impactsData, onUpdate, onError }) => {
  const [interdecileRange, setInterdecileRange] = useState(
    valueOrDefault(impactsData.interdecileRange, "")
  );
  const [info, setInfo] = useState(impactsData.comments.idr || "");
  const [disableStatement, setDisableStatement] = useState(disableStatement);

  const [isInvalid, setIsInvalid] = useState(false);

  const [showCalculatorModal, setShowCalulatorModal] = useState(false);
  const [showDSN, setShowDSN] = useState(false);

  useEffect(() => {
    if (disableStatement !== disableStatement) {
      setDisableStatement(disableStatement);
    }

    if (interdecileRange !== valueOrDefault(impactsData.interdecileRange, "")) {
      setInterdecileRange(valueOrDefault(impactsData.interdecileRange, ""));
    }
  }, [
    disableStatement,
    impactsData.hasEmployees,
    interdecileRange,
    impactsData.netValueAdded,
    impactsData.interdecileRange,
  ]);

  const hasEmployees = impactsData.hasEmployees;

  const onHasEmployeesChange = (event) => {
    const radioValue = event.target.value;
    let newHasEmployees = null;
    let newWageGap = null;

    if (radioValue === "true") {
      newHasEmployees = true;
      setIsInvalid(false);
      onError("idr", false);
    } else if (radioValue === "false") {
      newHasEmployees = false;
      newWageGap = 0;
      setIsInvalid(false);
      onError("idr", false);
    }

    impactsData.setHasEmployees(newHasEmployees);
    impactsData.wageGap = newWageGap;
    setInterdecileRange(valueOrDefault(impactsData.interdecileRange, ""));
    onUpdate("idr");
    onUpdate("geq");
  };

  const updateInterdecileRange = (event) => {
    console.log("change");
    const inputValue = event.target.valueAsNumber;
    let errorMessage = "";
    console.log(inputValue);
    // Validation checks for the input value
    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    } else if (inputValue > 100) {
      errorMessage = "La valeur ne peut pas être supérieure à 100.";
    }

    setIsInvalid(errorMessage !== "");
    onError("idr", errorMessage);

    impactsData.interdecileRange = event.target.value;
    setInterdecileRange(event.target.value);
    onUpdate("idr");
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.idr = event.target.value;
  };

  return (
    <Form className="statement">
      <Row>
        <Col>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column lg={7}>
              L'entreprise est-elle employeur ?
            </Form.Label>
            <Col>
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Oui"
                value="true"
                checked={hasEmployees === true}
                onChange={onHasEmployeesChange}
                disabled={disableStatement}
              />
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Non"
                value="false"
                checked={hasEmployees === false}
                onChange={onHasEmployeesChange}
                disabled={disableStatement}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Rapport interdécile D9/D1 des taux horaires bruts
            </Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={roundValue(interdecileRange, 1)}
                inputMode="numeric"
                onChange={updateInterdecileRange}
                disabled={hasEmployees === false || disableStatement}
                isInvalid={isInvalid}
              />
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
              disabled={disableStatement}
            />
          </Form.Group>
        </Col>
        <div className="m-3 text-end">
          <Button
            variant="light-secondary"
            className="btn-sm me-2"
            onClick={() => setShowDSN(true)}
            disabled={hasEmployees && !disableStatement ? false : true}
          >
            <i className="bi bi-calculator"></i>
            &nbsp;Import Fichiers DSN
          </Button>
          <Button
            variant="light-secondary"
            className="btn-sm"
            onClick={() => setShowCalulatorModal(true)}
            disabled={hasEmployees && !disableStatement ? false : true}
          >
            <i className="bi bi-calculator"></i>
            &nbsp;Outil d'évaluation
          </Button>
        </div>
      </Row>
      <Modal
        show={showCalculatorModal}
        size="xl"
        centered
        onHide={() => setShowCalulatorModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Données sociales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IndividualsData
            impactsData={impactsData}
            onGoBack={() => setShowCalulatorModal(false)}
            handleClose={() => setShowCalulatorModal(false)}
            onUpdate={onUpdate}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={showDSN}
        size="xl"
        centered
        onHide={() => setShowCalulatorModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Données sociales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImportDSN
            impactsData={impactsData}
            onGoBack={() => setShowDSN(false)}
            handleClose={() => setShowDSN(false)}
            onUpdate={onUpdate}
          />
        </Modal.Body>
      </Modal>
    </Form>
  );
};

export default StatementIDR;
