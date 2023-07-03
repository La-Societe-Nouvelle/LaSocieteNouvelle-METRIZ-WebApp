// La Société Nouvelle

import React, { useState, useEffect } from "react";
import Select from "react-select";

import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
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

  const options = [
    { value: "MJ", label: "MJ" },
    { value: "GJ", label: "GJ" },
    { value: "kWh", label: "kWh" },
    { value: "MWh", label: "MWh" },
  ];
  const updateEnergyConsumption = (input) => {
    props.impactsData.nrgTotal = true;
    props.impactsData.setEnergyConsumption(input.target.value);
    setEnergyConsumptionUncertainty(
      props.impactsData.energyConsumptionUncertainty
    );
    props.onUpdate("nrg");
  };

  const updateEnergyConsumptionUncertainty = (input) => {
    props.impactsData.energyConsumptionUncertainty = input.target.value;
    props.onUpdate("nrg");
  };

  const updateEnergyConsumptionUnit = (selected) => {
    const selectedUnit = selected.value;

    const { energyConsumption, energyConsumptionUnit } = this.props.impactsData;

    if (selectedUnit !== energyConsumptionUnit) {
      const convertedValue = this.convertEnergyConsumption(
        energyConsumption,
        energyConsumptionUnit,
        selectedUnit
      );

      this.updateEnergyConsumption(convertedValue);
    }

    this.setState({
      energyConsumptionUnit: selectedUnit,
    });

    this.props.impactsData.energyConsumptionUnit = selectedUnit;

    this.props.onUpdate("nrg");
  };

  const convertEnergyConsumption = (value, fromUnit, toUnit) => {
    const conversionFactors = {
      GJ: {
        MJ: 1000,
        kWh: 3.6,
        MWh: 3600,
      },
      MJ: {
        GJ: 1 / 1000,
        kWh: 1 / 3.6,
        MWh: 1 / 3600,
      },
      kWh: {
        GJ: 1 / 3.6,
        MJ: 3.6,
        MWh: 1 / 1000,
      },
      MWh: {
        GJ: 1 / 3600,
        MJ: 3600,
        kWh: 1000,
      },
    };
    const conversionFactor = conversionFactors[fromUnit][toUnit];
    const convertedValue = value * conversionFactor;
    return convertedValue;
  };
  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.nrg = info);

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>Consommation totale d'énergie</Form.Label>
            <Col>
              <Row className="align-items-center">
                <Col>
                  <Form.Control
                    type="number"
                    value={roundValue(energyConsumption, 0)}
                    inputMode="numeric"
                    onChange={updateEnergyConsumption}
                  />
                </Col>
                <Col>
                  <Select
                    options={options}
                    // value={{
                    //   label: energyConsumptionUnit,
                    //   value: energyConsumptionUnit,
                    // }}
                    onChange={updateEnergyConsumptionUnit}
                  />
                </Col>
              </Row>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column>Incertitude</Form.Label>
            <Col>
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
