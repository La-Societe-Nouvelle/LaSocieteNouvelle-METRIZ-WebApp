// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";

/* ---------- DECLARATION - INDIC #WAS ---------- */

const StatementWAS = (props) => {
  const [wasteProduction, setWasteProduction] = useState(
    valueOrDefault(props.impactsData.wasteProduction, undefined)
  );
  const [wasteProductionUncertainty, setWasteProductionUncertainty] = useState(
    valueOrDefault(props.impactsData.wasteProductionUncertainty, undefined)
  );
  const [info, setInfo] = useState(props.impactsData.comments.was || "");

  useEffect(() => {
    if (wasteProduction !== props.impactsData.wasteProduction) {
      setWasteProduction(props.impactsData.wasteProduction);
    }
    if (
      wasteProductionUncertainty !==
      props.impactsData.wasteProductionUncertainty
    ) {
      setWasteProductionUncertainty(
        props.impactsData.wasteProductionUncertainty
      );
    }
  }, [
    props.impactsData.wasteProduction,
    props.impactsData.wasteProductionUncertainty,
  ]);

  const netValueAdded = props.impactsData.netValueAdded;
  const isValid = wasteProduction !== null && netValueAdded !== null;

  const options = [
    { value: "kg", label: "kg" },
    { value: "t", label: "t" },
  ];

  const updateWasteProduction = (input) => {
    props.impactsData.setWasteProduction(input);
    setWasteProductionUncertainty(props.impactsData.wasteProductionUncertainty);
    props.onUpdate("was");
  };

  const updateWasteProductionUncertainty = (input) => {
    props.impactsData.wasteProductionUncertainty = input;
    props.onUpdate("was");
  };

  // updateWasteProductionUnit = (selected) => {
  //   const selectedUnit = selected.value;

  //   const { wasteProduction, wasteProductionUnit } = this.props.impactsData;

  //   if (selectedUnit !== wasteProductionUnit) {
  //     let updatedWasteProduction = wasteProduction;
  
  //     if (selectedUnit === "t") {
  //       updatedWasteProduction = wasteProduction / 1000;
  //     } else if (selectedUnit === "kg") {
  //       updatedWasteProduction = wasteProduction * 1000;
  //     }
  //     this.updateWasteProduction(updatedWasteProduction);
  //   }

  //   this.setState({
  //     wasteProductionUnit: selectedUnit,
  //   });

  //   this.props.impactsData.wasteProductionUnit = selectedUnit;

  //   this.props.onUpdate("was");
  // };
  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.was = info);
  const onValidate = () => props.onValidate('was');

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Productiont totale de déchets (y compris DAOM<sup>1</sup>)
        </Form.Label>
        <Col sm={6}>
          <InputGroup>
            <Form.Control
              type="number"
              value={roundValue(wasteProduction, 0)}
              inputMode="numeric"
              onChange={updateWasteProduction}
            />
            <InputGroup.Text>kg</InputGroup.Text>
          </InputGroup>
             {/* <Select
                  options={options}
                  defaultValue={{
                    label: wasteProductionUnit,
                    value: wasteProductionUnit,
                  }}
                  onChange={this.updateWasteProductionUnit}
                /> */}
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
              value={roundValue(wasteProductionUncertainty, 0)}
              inputMode="numeric"
              onChange={updateWasteProductionUncertainty}
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

      <div className="d-flex justify-between">
          <p className="small">
            <sup>1</sup> Déchets assimilés aux ordures ménagères
          </p>
        <Button disabled={!isValid} variant="secondary" onClick={onValidate}>
          Valider
        </Button>
      </div>
    </Form>
  );
};

export default StatementWAS;
