// La Société Nouvelle

import React, { useState, useEffect } from "react";
import Select from "react-select";

import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

const StatementHAZ = (props) => {
  const [hazardousSubstancesConsumption, setHazardousSubstancesConsumption] =
    useState(
      valueOrDefault(
        props.impactsData.hazardousSubstancesConsumption,
        undefined
      )
    );

  const [
    hazardousSubstancesConsumptionUnit,
    setHazardousSubstancesConsumptionUnit,
  ] = useState(props.impactsData.hazardousSubstancesConsumptionUnit);

  const [
    hazardousSubstancesConsumptionUncertainty,
    setHazardousSubstancesConsumptionUncertainty,
  ] = useState(
    valueOrDefault(
      props.impactsData.hazardousSubstancesConsumptionUncertainty,
      undefined
    )
  );
  const [info, setInfo] = useState(props.impactsData.comments.haz || "");

  useEffect(() => {
    if (
      hazardousSubstancesConsumption !==
      props.impactsData.hazardousSubstancesConsumption
    ) {
      setHazardousSubstancesConsumption(
        props.impactsData.hazardousSubstancesConsumption
      );
    }
    if (
      hazardousSubstancesConsumptionUncertainty !==
      props.impactsData.hazardousSubstancesConsumptionUncertainty
    ) {
      setHazardousSubstancesConsumptionUncertainty(
        props.impactsData.hazardousSubstancesConsumptionUncertainty
      );
    }
  }, [
    props.impactsData.hazardousSubstancesConsumption,
    props.impactsData.hazardousSubstancesConsumptionUncertainty,
  ]);

  const options = [
    { value: "kg", label: "kg" },
    { value: "t", label: "t" },
  ];

  const updateHazardousSubstancesConsumption = (input) => {
    props.impactsData.setHazardousSubstancesConsumption(input.target.value);
    setHazardousSubstancesConsumptionUncertainty(
      props.impactsData.hazardousSubstancesConsumptionUncertainty
    );
    props.onUpdate("haz");
  };

  const updateHazardousSubstancesConsumptionUncertainty = (input) => {
    props.impactsData.hazardousSubstancesConsumptionUncertainty =
      input.target.value;
    props.onUpdate("haz");
  };

  const updateHazardousSubstancesConsumptionUnit = (input) => {};

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.haz = info);

  return (
    <Form className="statement">
      <Row>
      <Col lg={7}>

          <Form.Group as={Row} className="form-group">
            <Form.Label column >
              Utilisation de produits dangereux - santé/environnement
            </Form.Label>
            <Col>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    value={roundValue(hazardousSubstancesConsumption, 0)}
                    inputMode="numeric"
                    onChange={updateHazardousSubstancesConsumption}
                  />
                </Col>
                <Col sm={4}>
                  <Select
                    options={options}
                    defaultValue={{
                      label: hazardousSubstancesConsumptionUnit,
                      value: hazardousSubstancesConsumptionUnit,
                    }}
                    className="small"
                    onChange={updateHazardousSubstancesConsumptionUnit}
                  />
                </Col>
              </Row>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="form-group">
            <Form.Label column >
              Incertitude
            </Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(
                    hazardousSubstancesConsumptionUncertainty,
                    0
                  )}
                  inputMode="numeric"
                  onChange={updateHazardousSubstancesConsumptionUncertainty}
                />
                <InputGroup.Text>%</InputGroup.Text>
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
      </Row>
    </Form>
  );
};

export default StatementHAZ;
