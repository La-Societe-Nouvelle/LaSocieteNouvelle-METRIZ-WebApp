import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { roundValue, valueOrDefault } from "../../../../src/utils/Utils";

const StatementECO = (props) => {
  const [domesticProduction, setDomesticProduction] = useState(
    valueOrDefault(props.impactsData.domesticProduction, undefined)
  );
  const [info, setInfo] = useState(props.impactsData.comments.eco || "");

  useEffect(() => {
    if (domesticProduction !== props.impactsData.domesticProduction) {
      setDomesticProduction(props.impactsData.domesticProduction);
    }
  }, [props.impactsData.domesticProduction]);

  const isAllActivitiesInFrance = props.impactsData.isAllActivitiesInFrance;
  const netValueAdded = props.impactsData.netValueAdded;

  const isValid =
    netValueAdded != null &&
    domesticProduction >= 0 &&
    domesticProduction <= netValueAdded;

  const onIsAllActivitiesInFranceChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        props.impactsData.setIsAllActivitiesInFrance(true);
        props.impactsData.domesticProduction = props.impactsData.netValueAdded;
        break;
      case "null":
        props.impactsData.setIsAllActivitiesInFrance(null);
        props.impactsData.domesticProduction = 0;
        break;
      case "false":
        props.impactsData.setIsAllActivitiesInFrance(false);
        props.impactsData.domesticProduction = 0;
        break;
    }
    setDomesticProduction(
      valueOrDefault(props.impactsData.domesticProduction, "")
    );
    props.onUpdate("eco");
  };

  const updateDomesticProduction = (input) => {
    props.impactsData.domesticProduction = input;
    setDomesticProduction(props.impactsData.domesticProduction);
    props.onUpdate("eco");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (props.impactsData.comments.eco = info);
  const onValidate = () => props.onValidate();

  return (
    <Form className="statement">
      <Form.Group as={Row} className="form-group align-items-center">
        <Form.Label column sm={4}>
          Les activités de l'entreprise sont-elles localisées en France ?
        </Form.Label>
        <Col sm={6}>
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
            label="Partiellement"
            value="null"
            checked={
              isAllActivitiesInFrance === null && domesticProduction !== ""
            }
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
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Valeur ajoutée nette produite en France
        </Form.Label>
        <Col sm={6}>
          <Form.Control
            type="number"
            value={roundValue(domesticProduction, 0)}
            inputMode="numeric"
            onChange={updateDomesticProduction}
            isInvalid={!isValid}
            disabled={isAllActivitiesInFrance !== null}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="form-group">
        <Form.Label column sm={4}>
          Informations complémentaires
        </Form.Label>
        <Col sm={6}>
          <Form.Control
            as="textarea"
            className="w-100"
            rows={3}
            onChange={updateInfo}
            onBlur={saveInfo}
            value={info}
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
export default StatementECO;
