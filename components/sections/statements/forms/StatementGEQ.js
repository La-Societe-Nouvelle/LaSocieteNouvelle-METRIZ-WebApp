// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Modal } from "react-bootstrap";
import { InputNumber } from "../../../input/InputNumber";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { ImportDSN } from "../modals/ImportDSN";
import { IndividualsData } from "../modals/IndividualsData";

const StatementGEQ = (props) => {
  const [wageGap, setWageGap] = useState(
    valueOrDefault(props.impactsData.wageGap, "")
  );
  const [info, setInfo] = useState(props.impactsData.comments.geq || "");
  const [isDisabled, setIsDisabled] = useState(false);
  const [showCalculatorModal, setShowCalulatorModal] = useState(false);
  const [showDSN , setShowDSN] = useState(false);

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
    props.impactsData.wageGap = input;
    setWageGap(props.impactsData.wageGap);
    setIsDisabled(false);
    props.onUpdate("geq");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.geq = info);

  const onValidate = () => props.onValidate();

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
          <InputNumber
            value={roundValue(wageGap, 1)}
            disabled={hasEmployees === false}
            onUpdate={updateWageGap}
            placeholder="%"
            isInvalid={isDisabled}
          />
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
      </Form.Group>

      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Informations complémentaires
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          onChange={updateInfo}
          value={info}
          onBlur={saveInfo}
        />
      </Form.Group>
      <div className="text-end">
        <Button variant="secondary" disabled={isDisabled} onClick={onValidate}>
          Valider
        </Button>
      </div>


      
      <Modal show={showCalculatorModal} size="xl" centered onHide={() => setShowCalulatorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Données sociales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IndividualsData impactsData={props.impactsData} onGoBack={() => setShowCalulatorModal(false)} 
          handleClose={() => setShowCalulatorModal(false)}
          onUpdate={props.onUpdate}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showDSN} size="xl" centered onHide={() => setShowCalulatorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Données sociales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImportDSN impactsData={props.impactsData} onGoBack={() => setShowDSN(false)} 
          handleClose={() => setShowDSN(false)}
          onUpdate={props.onUpdate}
          />
        </Modal.Body>
      </Modal>

    </Form>
  );
};

export default StatementGEQ;
