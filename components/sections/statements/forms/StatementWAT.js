// La Société Nouvelle
/* ---------- DECLARATION - INDIC #WAT ---------- */

import React, { useState, useEffect } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

const StatementWAT = (props) => {
  const [waterConsumption, setWaterConsumption] = useState(
    valueOrDefault(props.impactsData.waterConsumption, undefined)
  );
  const [waterConsumptionUncertainty, setWaterConsumptionUncertainty] =
    useState(
      valueOrDefault(props.impactsData.waterConsumptionUncertainty, undefined)
    );
  const [info, setInfo] = useState(props.impactsData.comments.wat || "");

  useEffect(() => {
    if (waterConsumption !== props.impactsData.waterConsumption) {
      setWaterConsumption(props.impactsData.waterConsumption);
    }
    if (
      waterConsumptionUncertainty !==
      props.impactsData.waterConsumptionUncertainty
    ) {
      setWaterConsumptionUncertainty(
        props.impactsData.waterConsumptionUncertainty
      );
    }
  }, [
    props.impactsData.waterConsumption,
    props.impactsData.waterConsumptionUncertainty,
  ]);

  const netValueAdded = props.impactsData.netValueAdded;
  const isValid = waterConsumption !== null && netValueAdded !== null;

  const options = [
    { value: "m³", label: "m³" },
    { value: "L", label: "L" },
  ];
  const updateWaterConsumption = (input) => {
    props.impactsData.setWaterConsumption(input.target.value);
    setWaterConsumptionUncertainty(
      props.impactsData.waterConsumptionUncertainty
    );
    props.onUpdate("wat");
  };

  const updateWaterConsumptionUncertainty = (input) => {
    props.impactsData.waterConsumptionUncertainty = input.target.value;
    props.onUpdate("wat");
  };

  // updateWaterConsumptionUnit = (selected) => {
  //   const selectedUnit = selected.value;

  //   const {
  //     waterConsumption,
  //     waterConsumptionUnit,
  //   } = this.props.impactsData;

  //   if (selectedUnit !== waterConsumptionUnit) {
  //     let updatedWaterConsumption =
  //       waterConsumption;

  //     if (selectedUnit === "m³") {
  //       updatedWaterConsumption =
  //         waterConsumption / 1000;
  //     } else if (selectedUnit === "L") {
  //       updatedWaterConsumption =
  //         waterConsumption * 1000;
  //     }

  //     this.updateWaterConsumption(
  //       updatedWaterConsumption
  //     );
  //   }

  //   this.setState({
  //     waterConsumptionUnit: selectedUnit,
  //   });

  //   this.props.impactsData.waterConsumptionUnit = selectedUnit;

  //   this.props.onUpdate("wat");
  // };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.wat = info);

  return (
    <Form className="statement">
      <Row>
        <Col>
          <Form.Group as={Row} className="form-group">
            <Form.Label column sm={7}>
              Consommation totale d'eau
            </Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(waterConsumption, 0)}
                  inputMode="numeric"
                  onChange={updateWaterConsumption}
                />
                <InputGroup.Text>m³</InputGroup.Text>
              </InputGroup>
              {/* <Select
                  options={options}
                  defaultValue={{
                    label: waterConsumptionUnit,
                    value: waterConsumptionUnit,
                  }}
                  onChange={this.updateWaterConsumptionUnit}
                /> */}
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column sm={7}>
              Incertitude
            </Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(waterConsumptionUncertainty, 0)}
                  inputMode="numeric"
                  onChange={updateWaterConsumptionUncertainty}
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

export default StatementWAT;
