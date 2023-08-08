// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";
import AssessmentDSN from "../modals/AssessmentDSN";

const StatementGEQ = ({ impactsData, onUpdate, onError }) => {
  const [wageGap, setWageGap] = useState(
    valueOrDefault(impactsData.wageGap, "")
  );
  const [info, setInfo] = useState(impactsData.comments.geq || "");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const hasEmployees = impactsData.hasEmployees;

  useEffect(() => {
    if (impactsData.hasEmployees == false) {
      onUpdate("geq");
    }
  }, [impactsData]);

  useEffect(() => {

    if (!impactsData.hasEmployees && wageGap === 0) {
      setIsDisabled(false);
    }
    if (
      impactsData.hasEmployees &&
      wageGap !== "" &&
      impactsData.netValueAdded !== null
    ) {
      setIsDisabled(false);
    }

    if (impactsData.hasEmployees && wageGap === "") {
      setIsDisabled(true);
    }

    if (wageGap !== valueOrDefault(impactsData.wageGap, "")) {
      setWageGap(valueOrDefault(impactsData.wageGap, ""));
      onUpdate("geq");
    }
  }, [
    impactsData.hasEmployees,
    impactsData.netValueAdded,
    impactsData.wageGap,

  ]);

  const onHasEmployeesChange = (event) => {
    let radioValue = event.target.value;
    switch (radioValue) {
      case "true":
        impactsData.hasEmployees = true;
        impactsData.wageGap = null;
        onError("geq", false);
        break;
      case "false":
        impactsData.hasEmployees = false;
        impactsData.wageGap = 0;
        setIsDisabled(false);
        onError("geq", false);

        break;
    }
    setWageGap(valueOrDefault(impactsData.wageGap, ""));
    onUpdate("geq");
  };

  const updateWageGap = (input) => {
    const inputValue = input.target.valueAsNumber;

    impactsData.wageGap = input.target.value;
    let errorMessage = "";
    // Validation checks for the input value
    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    }

    setIsInvalid(errorMessage !== "");
    onError("geq", errorMessage);

    setWageGap(impactsData.wageGap);
    setIsDisabled(false);
    onUpdate("geq");
  };

  const updateInfo = (event) => setInfo(event.target.value);
  const saveInfo = () => (impactsData.comments.geq = info);

  const updateSocialData = (updatedData) => {

    impactsData.interdecileRange  = updatedData.interdecileRange ;
    impactsData.wageGap = updatedData.wageGap;
    impactsData.knwDetails.apprenticesRemunerations = updatedData.knwDetails.apprenticesRemunerations;
    if (impactsData.wageGap) {
      setWageGap(impactsData.wageGap);
    }
  };

  return (
    <Form className="statement">
      <Row>
        <Col lg={7}>
          <Form.Group as={Row} className="form-group align-items-center">
            <Form.Label column lg={7}>
              L'entreprise est-elle employeur ?
            </Form.Label>

            <Col className="text-end">
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Oui"
                value="true"
                checked={hasEmployees === true}
                onChange={onHasEmployeesChange}
              />
              <Form.Check
                inline
                type="radio"
                id="hasEmployees"
                label="Non"
                value="false"
                checked={hasEmployees === false}
                onChange={onHasEmployeesChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="form-group">
            <Form.Label column lg={7}>
              Ecart de rémunérations Femmes/Hommes{" "}
              <span className="d-block small">
                (en % du taux horaire brut moyen)
              </span>
            </Form.Label>
            <Col>
              <div className="d-flex justify-content-between">
                <InputGroup className="custom-input me-1">
                  <Form.Control
                    type="number"
                    value={roundValue(wageGap, 1)}
                    disabled={hasEmployees === false}
                    inputMode="numeric"
                    onChange={updateWageGap}
                    isInvalid={isInvalid}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>

                <AssessmentDSN
                  impactsData={impactsData}
                  onUpdate={onUpdate}
                  updateSocialData={updateSocialData}
                />
              </div>
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group className="form-group">
            <Form.Label className="col-form-label">
              Informations complémentaires
            </Form.Label>{" "}
            <Col>
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
        </Col>
      </Row>
    </Form>
  );
};

export default StatementGEQ;
