// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

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
    props.impactsData.setWasteProduction(input.target.value);
    setWasteProductionUncertainty(props.impactsData.wasteProductionUncertainty);
    props.onUpdate("was");
  };

  const updateWasteProductionUncertainty = (input) => {
    props.impactsData.wasteProductionUncertainty = input.target.value;
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

  return (
    <Form className="statement">
      <Row>
        <Col>
          <Form.Group as={Row} className="form-group">
            <Form.Label column sm={7}>
              Productiont totale de déchets (y compris DAOM<sup>1</sup>)
            </Form.Label>
            <Col>
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
            <Form.Label column sm={7}>
              Incertitude
            </Form.Label>
            <Col>
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
        </Col>
        <Col>
          <Form.Group  className="form-group">
            <Form.Label>
              Informations complémentaires
            </Form.Label>
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

      <div className="d-flex justify-content-between">
        <p className="small">
          <sup>1</sup> Déchets assimilés aux ordures ménagères
        </p>
      </div>
    </Form>
  );
};

export default StatementWAS;
