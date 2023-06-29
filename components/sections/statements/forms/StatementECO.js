import React, { useState, useEffect } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

const StatementECO = (props) => {
  const [domesticProduction, setDomesticProduction] = useState(
    valueOrDefault(props.impactsData.domesticProduction, undefined)
  );
  const [info, setInfo] = useState(props.impactsData.comments.eco || "");

  const isAllActivitiesInFrance = props.impactsData.isAllActivitiesInFrance;
  const netValueAdded = props.impactsData.netValueAdded;

  const isValid =
    netValueAdded != null &&
    domesticProduction >= 0 &&
    domesticProduction <= netValueAdded;

  useEffect(() => {
    if (domesticProduction !== props.impactsData.domesticProduction) {
      setDomesticProduction(props.impactsData.domesticProduction);
    }
  }, [props.impactsData.domesticProduction]);

  const onIsAllActivitiesInFranceChange = (event) => {
    const radioValue = event.target.value;
    let newIsAllActivitiesInFrance = null;
    let newDomesticProduction = 0;

    switch (radioValue) {
      case "true":
        newIsAllActivitiesInFrance = true;
        newDomesticProduction = props.impactsData.netValueAdded;
        break;
      case "false":
        newIsAllActivitiesInFrance = false;
        break;
    }

    props.impactsData.setIsAllActivitiesInFrance(newIsAllActivitiesInFrance);
    props.impactsData.domesticProduction = newDomesticProduction;

    setDomesticProduction(valueOrDefault(newDomesticProduction, ""));
    props.onUpdate("eco");
  };

  const updateDomesticProduction = (input) => {
    props.impactsData.domesticProduction = input.target.value;

    setDomesticProduction(props.impactsData.domesticProduction);
    props.onUpdate("eco");
  };

  const updateInfo = (event) => {
    props.impactsData.comments.eco = info;
    setInfo(event.target.value);
  };

  return (
    <Form className="statement">
      <Row>
        <Col>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column lg={7}>
              Les activités de l'entreprise sont-elles localisées en France ?
            </Form.Label>
            <Col>
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Oui"
                value="true"
                checked={isAllActivitiesInFrance === true}
                onChange={onIsAllActivitiesInFranceChange}
              />

              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Non"
                value="false"
                checked={isAllActivitiesInFrance === false}
                onChange={onIsAllActivitiesInFranceChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Partiellement"
                value="null"
                checked={
                  isAllActivitiesInFrance === null && domesticProduction !== ""
                }
                onChange={onIsAllActivitiesInFranceChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Valeur ajoutée nette produite en France
            </Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(domesticProduction, 0)}
                  inputMode="numeric"
                  onChange={updateDomesticProduction}
                  isInvalid={!isValid}
                  disabled={isAllActivitiesInFrance !== null}
                />
                <InputGroup.Text>&euro;</InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label className="col-form-label">Informations complémentaires</Form.Label>
            <Form.Control
              as="textarea"
              className="w-100"
              rows={3}
              onChange={updateInfo}
              value={info}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};
export default StatementECO;
