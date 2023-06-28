import React, { useState, useEffect } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

const StatementECO = ({ impactsData, onUpdate, onError }) => {
  const [domesticProduction, setDomesticProduction] = useState(
    valueOrDefault(impactsData.domesticProduction, undefined)
  );
  const [info, setInfo] = useState(impactsData.comments.eco || "");
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (domesticProduction !== impactsData.domesticProduction) {
      setDomesticProduction(impactsData.domesticProduction);
    }
  }, [impactsData.domesticProduction]);



  const onIsAllActivitiesInFranceChange = (event) => {
    const radioValue = event.target.value;
  
    switch (radioValue) {
      case "true":
        impactsData.isAllActivitiesInFrance = true;
        impactsData.domesticProduction = impactsData.netValueAdded;
        setIsInvalid(false);
        onError("eco", false);
        break;
      case "null":
        impactsData.isAllActivitiesInFrance = null;
        impactsData.domesticProduction = null;
        break;
      case "false":
        impactsData.isAllActivitiesInFrance = false;
        impactsData.domesticProduction = 0;
        setIsInvalid(false);
        onError("eco", false);
        break;
    }

    setDomesticProduction(impactsData.domesticProduction);
    onUpdate("eco"); 
  };

  const updateDomesticProduction = (event) => {

    const inputValue = event.target.valueAsNumber;
    let errorMessage = "";

    // Validation checks for the input value
    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    } else if (impactsData.netValueAdded == null) {
      errorMessage = "La valeur ajoutée nette n'est pas définie.";
    } else if (inputValue >= impactsData.netValueAdded) {
      errorMessage =
        "La valeur saisie ne peut pas être supérieure à la valeur ajoutée nette.";
    }

    
    setIsInvalid(errorMessage !== "");
    onError("eco", errorMessage);

    impactsData.domesticProduction = event.target.value;

    setDomesticProduction(event.target.value);
    onUpdate("eco");
  };

  const updateInfo = (event) => {
    impactsData.comments.eco = info;
    setInfo(event.target.value);
  };

  return (
    <Form className="statement">
      <Row>
      <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column >
              Les activités de l'entreprise sont-elles localisées en France ?
            </Form.Label>
            <Col className="text-end">
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Oui"
                value="true"
                checked={impactsData.isAllActivitiesInFrance === true}
                onChange={onIsAllActivitiesInFranceChange}
              />

              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Non"
                value="false"
                checked={impactsData.isAllActivitiesInFrance === false}
                onChange={onIsAllActivitiesInFranceChange}
              />
              <Form.Check
                inline
                type="radio"
                id="isAllActivitiesInFrance"
                label="Partiellement"
                value="null"
                checked={
                  impactsData.isAllActivitiesInFrance === null && domesticProduction !== ""
                }
                onChange={onIsAllActivitiesInFranceChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column >
              Valeur ajoutée nette produite en France
            </Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={roundValue(domesticProduction, 0)}
                  inputMode="numeric"
                  onChange={updateDomesticProduction}
                  isInvalid={isInvalid}
                  disabled={impactsData.isAllActivitiesInFrance !== null}
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
