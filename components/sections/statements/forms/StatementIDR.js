// La Société Nouvelle

import React, { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { roundValue, valueOrDefault } from "/src/utils/Utils";

import AssessmentDSN from "../modals/AssessmentDSN";

/* ---------- DECLARATION - INDIC #IDR ---------- */

const StatementIDR = ({ impactsData, onUpdate, onError }) => {
  const [interdecileRange, setInterdecileRange] = useState(
    valueOrDefault(impactsData.interdecileRange, "")
  );
  const [info, setInfo] = useState(impactsData.comments.idr || "");

  const [isInvalid, setIsInvalid] = useState(false);

  const hasEmployees = impactsData.hasEmployees;

  useEffect(() => {
    if (impactsData.hasEmployees == false) {
      onUpdate("idr");
    }
  }, [impactsData]);

  useEffect(() => {
    if (
      impactsData.interdecileRange &&
      interdecileRange != impactsData.interdecileRange
    ) {
      setInterdecileRange(impactsData.interdecileRange);
    }
  }, [impactsData.interdecileRange]);

  const onHasEmployeesChange = (event) => {
    const radioValue = event.target.value;
    let newHasEmployees = null;
    let newWageGap = null;

    if (radioValue === "true") {
      newHasEmployees = true;
      setIsInvalid(false);
      onError("idr", false);
    } else if (radioValue === "false") {
      newHasEmployees = false;
      newWageGap = 0;
      setIsInvalid(false);
      onError("idr", false);
    }

    impactsData.setHasEmployees(newHasEmployees);
    impactsData.wageGap = newWageGap;
    setInterdecileRange(valueOrDefault(impactsData.interdecileRange, ""));
    onUpdate("idr");
  };

  const updateInterdecileRange = (event) => {
    const inputValue = event.target.valueAsNumber;
    let errorMessage = "";
    // Validation checks for the input value
    if (isNaN(inputValue)) {
      errorMessage = "Veuillez saisir un nombre valide.";
    } else if (inputValue > 100) {
      errorMessage = "La valeur ne peut pas être supérieure à 100.";
    }

    setIsInvalid(errorMessage !== "");
    onError("idr", errorMessage);

    impactsData.interdecileRange = event.target.value;
    setInterdecileRange(event.target.value);
    onUpdate("idr");
  };

  const updateInfo = (event) => {
    setInfo(event.target.value);
    impactsData.comments.idr = event.target.value;
  };

  const updateSocialData = (updatedData) => {

    impactsData.interdecileRange  = updatedData.interdecileRange ;
    impactsData.wageGap = updatedData.wageGap;
    impactsData.knwDetails.apprenticesRemunerations = updatedData.knwDetails.apprenticesRemunerations;
     if (impactsData.interdecileRange) {
      setInterdecileRange(impactsData.interdecileRange);
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
            <Col className="d-flex justify-content-end">
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
              Rapport interdécile D9/D1 des taux horaires bruts
            </Form.Label>
            <Col>
              <div className="d-flex ">
                <div className="input-group custom-input me-1">
                  <Form.Control
                    type="number"
                    value={roundValue(interdecileRange, 1)}
                    inputMode="numeric"
                    onChange={updateInterdecileRange}
                    disabled={hasEmployees === false}
                    isInvalid={isInvalid}
                  />
                </div>

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
            <Form.Control
              as="textarea"
              rows={3}
              className="w-100"
              onChange={updateInfo}
              value={info}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default StatementIDR;
