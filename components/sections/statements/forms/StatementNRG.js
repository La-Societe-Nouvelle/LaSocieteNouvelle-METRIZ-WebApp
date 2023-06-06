// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { AssessmentNRG } from "../modals/AssessmentNRG";

/* ---------- DECLARATION - INDIC #NRG ---------- */

const StatementNRG = (props) => {
  const [energyConsumption, setEnergyConsumption] = useState(
    valueOrDefault(props.impactsData.energyConsumption, undefined)
  );
  const [energyConsumptionUncertainty, setEnergyConsumptionUncertainty] =
    useState(
      valueOrDefault(props.impactsData.energyConsumptionUncertainty, undefined)
    );
  const [info, setInfo] = useState(props.impactsData.comments.nrg || "");

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (energyConsumption !== props.impactsData.energyConsumption) {
      setEnergyConsumption(props.impactsData.energyConsumption);
    }
    if (
      energyConsumptionUncertainty !==
      props.impactsData.energyConsumptionUncertainty
    ) {
      setEnergyConsumptionUncertainty(
        props.impactsData.energyConsumptionUncertainty
      );
    }
  }, [
    props.impactsData.energyConsumption,
    props.impactsData.energyConsumptionUncertainty,
  ]);

  const { netValueAdded } = props.impactsData;
  const isValid = energyConsumption != null && netValueAdded != null;

  // const options = [
  //   { value: "MJ", label: "MJ" },
  //   { value: "GJ", label: "GJ" },
  //   { value: "kWh", label: "kWh" },
  //   { value: "MWh", label: "MWh" },
  // ];
  const updateEnergyConsumption = (input) => {
    props.impactsData.nrgTotal = true;
    props.impactsData.setEnergyConsumption(input);
    setEnergyConsumptionUncertainty(
      props.impactsData.energyConsumptionUncertainty
    );
    props.onUpdate("nrg");
  };

  const updateEnergyConsumptionUncertainty = (input) => {
    props.impactsData.energyConsumptionUncertainty = input;
    props.onUpdate("nrg");
  };

  // updateEnergyConsumptionUnit = (selected) => {
  //   const selectedUnit = selected.value;

  //   const { energyConsumption, energyConsumptionUnit } = this.props.impactsData;

  //   if (selectedUnit !== energyConsumptionUnit) {
  //     const convertedValue = this.convertEnergyConsumption(
  //       energyConsumption,
  //       energyConsumptionUnit,
  //       selectedUnit
  //     );

  //     this.updateEnergyConsumption(convertedValue);
  //   }

  //   this.setState({
  //     energyConsumptionUnit: selectedUnit,
  //   });

  //   this.props.impactsData.energyConsumptionUnit = selectedUnit;

  //   this.props.onUpdate("nrg");
  // };

  // convertEnergyConsumption = (value, fromUnit, toUnit) => {
  //   const conversionFactors = {
  //     GJ: {
  //       MJ: 1000,
  //       kWh: 3.6,
  //       MWh: 3600,
  //     },
  //     MJ: {
  //       GJ: 1 / 1000,
  //       kWh: 1 / 3.6,
  //       MWh: 1 / 3600,
  //     },
  //     kWh: {
  //       GJ: 1 / 3.6,
  //       MJ: 3.6,
  //       MWh: 1 / 1000,
  //     },
  //     MWh: {
  //       GJ: 1 / 3600,
  //       MJ: 3600,
  //       kWh: 1000,
  //     },
  //   };
  //   const conversionFactor = conversionFactors[fromUnit][toUnit];
  //   const convertedValue = value * conversionFactor;
  //   return convertedValue;
  // };
  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.nrg = info);
  const onValidate = () => props.onValidate('nrg');

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Consommation totale d'énergie
        </Form.Label>
        <Col sm={6}>
          <Row className="align-items-center">
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(energyConsumption, 0)}
                  inputMode="numeric"
                  onChange={updateEnergyConsumption}
                />
                <InputGroup.Text>MJ</InputGroup.Text>
              </InputGroup>
                   {/* <Select
                  options={options}
                  value={{
                    label: energyConsumptionUnit,
                    value: energyConsumptionUnit,
                  }}
                  onChange={this.updateEnergyConsumptionUnit}
                /> */}
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
              value={roundValue(energyConsumptionUncertainty, 0)}
              inputMode="numeric"
              onChange={updateEnergyConsumptionUncertainty}
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
          <Modal.Title>
            Outils de mesure des émissions directes de Gaz à effet de serre
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AssessmentNRG
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

export default StatementNRG;
