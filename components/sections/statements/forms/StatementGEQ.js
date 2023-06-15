// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Modal, InputGroup } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import { ImportDSN } from "../modals/ImportDSN";
import { IndividualsData } from "../modals/IndividualsData";

const StatementGEQ = (props) => {
  const [wageGap, setWageGap] = useState(
    valueOrDefault(props.impactsData.wageGap, "")
  );
  const [info, setInfo] = useState(props.impactsData.comments.geq || "");
  const [isDisabled, setIsDisabled] = useState(false);
  const [showCalculatorModal, setShowCalulatorModal] = useState(false);
  const [showDSN, setShowDSN] = useState(false);

  const hasEmployees = props.impactsData.hasEmployees;

  useEffect(() => {
    if (!props.impactsData.hasEmployees && wageGap === 0) {
      setIsDisabled(false);
    }
    if (
      props.impactsData.hasEmployees &&
      wageGap !== "" &&
      props.impactsData.netValueAdded !== null
    ) {
      setIsDisabled(false);
    }

    if (props.impactsData.hasEmployees && wageGap === "") {
      setIsDisabled(true);
    }

    if (wageGap !== valueOrDefault(props.impactsData.wageGap, "")) {
      setWageGap(valueOrDefault(props.impactsData.wageGap, ""));
    }
  }, [
    props.impactsData.hasEmployees,
    props.impactsData.netValueAdded,
    props.impactsData.wageGap,
    wageGap,
  ]);

  const onHasEmployeesChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        props.impactsData.setHasEmployees(true);
        props.impactsData.wageGap = null;
        break;
      case "false":
        props.impactsData.setHasEmployees(false);
        props.impactsData.wageGap = 0;
        setIsDisabled(false);
        break;
    }
    setWageGap(valueOrDefault(props.impactsData.wageGap, ""));
    props.onUpdate("geq");
    props.onUpdate("idr");
  };

  const updateWageGap = (input) => {
    props.impactsData.wageGap = input.target.value;
    setWageGap(props.impactsData.wageGap);
    setIsDisabled(false);
    props.onUpdate("geq");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.geq = info);

  const onValidate = () => props.onValidate('geq');

  return (
    <Form className="statement">
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
          />
          <Form.Check
            inline
            type="radio"
            id="hasEmployees"
            label="Non"
            value="false"
            checked={hasEmployees === false}
            onChange={onHasEmployeesChange}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Ecart de rémunérations Femmes/Hommes (en % du taux horaire brut moyen)
        </Form.Label>
        <Col sm={6}>
          <Row className="align-items-center">
            <Col>
              <InputGroup>
              <Form.Control
                type="number"
                value={roundValue(wageGap, 1)}
                disabled={hasEmployees === false}
                inputMode="numeric"
                onChange={updateWageGap}
                isInvalid={isDisabled}
              />
                <InputGroup.Text>%</InputGroup.Text>
              </InputGroup>
           
            </Col>
            <Col>
              <div>
                <Button
                  variant="primary"
                  className="btn-sm me-2"
                  onClick={() => setShowDSN(true)}
                  disabled={hasEmployees ? false : true}
                >
                  <i className="bi bi-calculator"></i>
                  &nbsp;Import Fichiers DSN
                </Button>
                <Button
                  variant="primary"
                  className="btn-sm"
                  onClick={() => setShowCalulatorModal(true)}
                  disabled={hasEmployees ? false : true}
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
          />
        </Col>
      </Form.Group>
      <div className="text-end">
        <Button variant="light-secondary" disabled={isDisabled} onClick={onValidate}>
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
    </Form>
  );
};

export default StatementGEQ;
