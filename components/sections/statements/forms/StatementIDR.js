// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Alert, Form, Row, Col, Button, Modal } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";
import { IndividualsData } from "../modals/IndividualsData";
import { ImportDSN } from "../modals/ImportDSN";

/* ---------- DECLARATION - INDIC #IDR ---------- */

const StatementIDR = (props) => {
  const [interdecileRange, setInterdecileRange] = useState(
    valueOrDefault(props.impactsData.interdecileRange, "")
  );
  const [info, setInfo] = useState(props.impactsData.comments.idr || "");
  const [isDisabled, setIsDisabled] = useState(true);
  const [disableStatement, setDisableStatement] = useState(
    props.disableStatement
  );

  const [showCalculatorModal, setShowCalulatorModal] = useState(false);
  const [showDSN, setShowDSN] = useState(false);

  useEffect(() => {
    if (disableStatement !== props.disableStatement) {
      setDisableStatement(props.disableStatement);
    }

    if (!props.impactsData.hasEmployees && interdecileRange === 1) {
      setIsDisabled(false);
    }

    if (
      props.impactsData.hasEmployees &&
      interdecileRange !== "" &&
      props.impactsData.netValueAdded !== null
    ) {
      setIsDisabled(false);
    }

    if (props.impactsData.hasEmployees && interdecileRange === "") {
      setIsDisabled(true);
    }

    if (
      interdecileRange !==
      valueOrDefault(props.impactsData.interdecileRange, "")
    ) {
      setInterdecileRange(
        valueOrDefault(props.impactsData.interdecileRange, "")
      );
    }
  }, [
    props.disableStatement,
    props.impactsData.hasEmployees,
    interdecileRange,
    props.impactsData.netValueAdded,
    props.impactsData.interdecileRange,
  ]);

  const hasEmployees = props.impactsData.hasEmployees;

  const onHasEmployeesChange = (event) => {
    const radioValue = event.target.value;
    let newHasEmployees = null;
    let newWageGap = null;

    switch (radioValue) {
      case "true":
        newHasEmployees = true;
        newWageGap = null;
        break;
      case "false":
        newHasEmployees = false;
        newWageGap = 0;
        setIsDisabled(false);
        break;
    }

    props.impactsData.setHasEmployees(newHasEmployees);
    props.impactsData.wageGap = newWageGap;
    setInterdecileRange(valueOrDefault(props.impactsData.interdecileRange, ""));
    props.onUpdate("idr");
    props.onUpdate("geq");
  };

  const updateInterdecileRange = (input) => {
    props.impactsData.interdecileRange = input;
    setInterdecileRange(props.impactsData.interdecileRange);
    setIsDisabled(false);
    props.onUpdate("idr");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.idr = info);
  const onValidate = () => props.onValidate('idr');

  return (
    <div className="statement">
      {disableStatement && (
        <Alert variant="warning">
          <p>
            <i className="bi bi-exclamation-circle  me-2"></i>Indicateur
            indisponible lors de la précédente analyse
          </p>
        </Alert>
      )}
      <Form.Group as={Row} className="form-group align-items-center">
        <Form.Label column sm={4}>
          L'entreprise est-elle employeur ?
        </Form.Label>
        <Col sm={6}>
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
        <Form.Label column sm={4}>
          Rapport interdécile D9/D1 des taux horaires bruts
        </Form.Label>
        <Col sm={6}>
          <Row className="align-items-center">
            <Col>
              <Form.Control
                type="number"
                value={roundValue(interdecileRange, 1)}
                disabled={hasEmployees === false || disableStatement}
                inputMode="numeric"
                onChange={updateInterdecileRange}
                isInvalid={interdecileRange > 100 ? true : false}
              />
            </Col>
            <Col>
              <div>
                <Button
                  variant="primary"
                  className="btn-sm me-2"
                  onClick={() => setShowDSN(true)}
                  disabled={hasEmployees && !disableStatement ? false : true}
                >
                  <i className="bi bi-calculator"></i>
                  &nbsp;Import Fichiers DSN
                </Button>
                <Button
                  variant="primary"
                  className="btn-sm"
                  onClick={() => setShowCalulatorModal(true)}
                  disabled={hasEmployees && !disableStatement ? false : true}
                >
                  <i className="bi bi-calculator"></i>
                  &nbsp;Outil d'évaluation
                </Button>
              </div>
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
            disabled={disableStatement}
          />
        </Col>
      </Form.Group>

      <div className="text-end">
        <Button
          disabled={isDisabled || disableStatement}
          variant="light-secondary"
          onClick={onValidate}
        >
          Valider
        </Button>
      </div>

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
            impactsData={props.impactsData}
            onGoBack={() => setShowCalulatorModal(false)}
            handleClose={() => setShowCalulatorModal(false)}
            onUpdate={props.onUpdate}
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
            impactsData={props.impactsData}
            onGoBack={() => setShowDSN(false)}
            handleClose={() => setShowDSN(false)}
            onUpdate={props.onUpdate}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StatementIDR;
