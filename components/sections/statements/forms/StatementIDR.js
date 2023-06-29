// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Modal } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { IndividualsData } from "../modals/IndividualsData";
import { ImportDSN } from "../modals/ImportDSN";

/* ---------- DECLARATION - INDIC #IDR ---------- */

const StatementIDR = (props) => {
  const [interdecileRange, setInterdecileRange] = useState(
    valueOrDefault(props.impactsData.interdecileRange, "")
  );
  const [info, setInfo] = useState(props.impactsData.comments.idr || "");
  const [disableStatement, setDisableStatement] = useState(
    props.disableStatement
  );

  const [showCalculatorModal, setShowCalulatorModal] = useState(false);
  const [showDSN, setShowDSN] = useState(false);

  useEffect(() => {
    if (disableStatement !== props.disableStatement) {
      setDisableStatement(props.disableStatement);
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
        break;
    }

    props.impactsData.setHasEmployees(newHasEmployees);
    props.impactsData.wageGap = newWageGap;
    setInterdecileRange(valueOrDefault(props.impactsData.interdecileRange, ""));
    props.onUpdate("idr");
    props.onUpdate("geq");
  };

  const updateInterdecileRange = (input) => {
    props.impactsData.interdecileRange = input.target.value;
    setInterdecileRange(props.impactsData.interdecileRange);
    props.onUpdate("idr");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.idr = info);

  return (
    <div className="statement">
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
                disabled={hasEmployees === false || disableStatement}
                inputMode="numeric"
                onChange={updateInterdecileRange}
                isInvalid={interdecileRange > 100 ? true : false}
              />
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label>Informations complémentaires</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="w-100"
              onChange={updateInfo}
              value={info}
              onBlur={saveInfo}
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
