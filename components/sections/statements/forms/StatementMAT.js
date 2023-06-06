// La Société Nouvelle

/* ---------- DECLARATION - INDIC #MAT ---------- */
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";
import { InputNumber } from "../../../input/InputNumber";

import React, { useState, useEffect } from "react";


const StatementMAT = (props) => {
  const [materialsExtraction, setMaterialsExtraction] = useState(
    valueOrDefault(props.impactsData.materialsExtraction, undefined)
  );
  const [materialsExtractionUncertainty, setMaterialsExtractionUncertainty] =
    useState(
      valueOrDefault(
        props.impactsData.materialsExtractionUncertainty,
        undefined
      )
    );
  const [info, setInfo] = useState(props.impactsData.comments.mat || "");

  useEffect(() => {
    if (materialsExtraction !== props.impactsData.materialsExtraction) {
      setMaterialsExtraction(props.impactsData.materialsExtraction);
    }
    if (
      materialsExtractionUncertainty !==
      props.impactsData.materialsExtractionUncertainty
    ) {
      setMaterialsExtractionUncertainty(
        props.impactsData.materialsExtractionUncertainty
      );
    }
  }, [
    props.impactsData.materialsExtraction,
    props.impactsData.materialsExtractionUncertainty,
  ]);

  const { isExtractiveActivities, netValueAdded } = props.impactsData;
  const isValid = materialsExtraction != null && netValueAdded != null;

  const onIsExtractiveActivitiesChange = (event) => {
    const radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        props.impactsData.setIsExtractiveActivities(true);
        break;
      case "false":
        props.impactsData.setIsExtractiveActivities(false);
        break;
    }
    setMaterialsExtraction(
      valueOrDefault(props.impactsData.materialsExtraction, "")
    );
    setMaterialsExtractionUncertainty(
      valueOrDefault(props.impactsData.materialsExtractionUncertainty, "")
    );
  };

  const updateMaterialsExtraction = (input) => {
    props.impactsData.setMaterialsExtraction(input);
    setMaterialsExtractionUncertainty(
      props.impactsData.materialsExtractionUncertainty
    );
    props.onUpdate("mat");
  };

  // updateUnit = (selected) => {
    
  //   const selectedUnit = selected.value;
  //   const { materialsExtraction, materialsExtractionUnit } =
  //     this.props.impactsData;

  //   if (selectedUnit !== materialsExtractionUnit) {
  //     let updatedMaterialsExtraction = materialsExtraction;

  //     if (selectedUnit === "t") {
  //       updatedMaterialsExtraction = materialsExtraction / 1000;
  //     } else if (selectedUnit === "kg") {
  //       updatedMaterialsExtraction = materialsExtraction * 1000;
  //     }

  //     this.updateMaterialsExtraction(updatedMaterialsExtraction);
  //   }

  //   this.setState({
  //     materialsExtractionUnit: selectedUnit,
  //   });

  //   this.props.impactsData.materialsExtractionUnit = selectedUnit;

  //   this.props.onUpdate("mat");
  // };

  // const options = [
//   { value: "kg", label: "kg" },
//   { value: "t", label: "t" },
// ];

  const updateMaterialsExtractionUncertainty = (input) => {
    props.impactsData.materialsExtractionUncertainty = input;
    setMaterialsExtraction(props.impactsData.materialsExtraction);
    props.onUpdate("mat");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.mat = info);
  const onValidate = () => props.onValidate();

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group align-items-center">
        <Form.Label column sm={4}>
          L'entreprise réalise-t-elle des activités agricoles ou extractives ?
        </Form.Label>
        <Col sm={6}>
          <Form.Check
            inline
            type="radio"
            id="isExtractiveActivities"
            label="Oui"
            value="true"
            checked={isExtractiveActivities === true}
            onChange={onIsExtractiveActivitiesChange}
          />
          <Form.Check
            inline
            type="radio"
            id="isNotExtractiveActivities"
            label="Non"
            value="false"
            checked={isExtractiveActivities === false}
            onChange={onIsExtractiveActivitiesChange}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Quantité extraite de matières premières
        </Form.Label>
        <Col sm={6}>
          <InputGroup>
            <Form.Control
              type="number"
              value={roundValue(materialsExtraction, 0)}
              inputMode="numeric"
              disabled={isExtractiveActivities === false}
              onChange={updateMaterialsExtraction}
            />

            <InputGroup.Text>kg</InputGroup.Text>
          </InputGroup>
            {/* // <Select
        // isDisabled={isExtractiveActivities === false}
        // options={options}
        // defaultValue={{
        //   label: materialsExtractionUnit,
        //   value: materialsExtractionUnit,
        // }}
        // onChange={this.updateUnit}
        // /> */}
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
              value={roundValue(materialsExtractionUncertainty, 0)}
              inputMode="numeric"
              disabled={isExtractiveActivities === false}
              onChange={updateMaterialsExtractionUncertainty}
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
    </Form>
  );
};

export default StatementMAT;
