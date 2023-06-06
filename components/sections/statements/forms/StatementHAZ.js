// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";

const StatementHAZ = (props) => {
  const [hazardousSubstancesConsumption, setHazardousSubstancesConsumption] =
    useState(
      valueOrDefault(
        props.impactsData.hazardousSubstancesConsumption,
        undefined
      )
    );
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
  
  const { netValueAdded } = props.impactsData;
  const isValid =
    hazardousSubstancesConsumption != null && netValueAdded != null;

  const updateHazardousSubstancesConsumption = (input) => {
    props.impactsData.setHazardousSubstancesConsumption(input);
    setHazardousSubstancesConsumptionUncertainty(
      props.impactsData.hazardousSubstancesConsumptionUncertainty
    );
    props.onUpdate("haz");
  };

  const updateHazardousSubstancesConsumptionUncertainty = (input) => {
    props.impactsData.hazardousSubstancesConsumptionUncertainty = input;
    props.onUpdate("haz");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.haz = info);
  const onValidate = () => props.onValidate();

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Utilisation de produits dangereux - santé/environnement
        </Form.Label>
        <Col sm={6}>
          <InputGroup>
            <Form.Control
              type="number"
              value={roundValue(hazardousSubstancesConsumption, 0)}
              inputMode="numeric"
              onChange={updateHazardousSubstancesConsumption}
            />

            <InputGroup.Text>kg</InputGroup.Text>
          </InputGroup>
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
              value={roundValue(hazardousSubstancesConsumptionUncertainty, 0)}
              inputMode="numeric"
              onChange={updateHazardousSubstancesConsumptionUncertainty}
            />
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup>
                {/* <Select
                  options={options}
                  defaultValue={{
                    label: hazardousSubstancesConsumptionUnit,
                    value: hazardousSubstancesConsumptionUnit,
                  }}
                  onChange={this.updatehazardousSubstancesConsumptionUnit}
                /> */}
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
    </Form>
  );
};

export default StatementHAZ;
