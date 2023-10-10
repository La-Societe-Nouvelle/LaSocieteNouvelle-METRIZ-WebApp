import React, { useEffect, useState } from "react";
import Select from "react-select";

import { Button, Col, Form, Row } from "react-bootstrap";

// Utils
import { getDivisionsOptions } from "/src/utils/metaUtils";
// Styles
import { customSelectStyles } from "/config/customStyles";

// Lib
import divisions from "/lib/divisions";

// Division options
const divisionsOptions = getDivisionsOptions(divisions);

export const LegalUnitInfo = ({ session, period, setIsLoading }) => {

  const [comparativeDivision, setComparativeDivision] = useState(session.comparativeData.comparativeDivision);

  const [isFormValid, setIsFormValid] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newCorporateName, setNewCorporateName] = useState(session.legalUnit.corporateName);
  const [newSiren, setNewSiren] = useState(session.legalUnit.siren);

  useEffect(async () => {
    if (comparativeDivision != session.comparativeData.comparativeDivision) {
      // fetch data

      setIsLoading(true);
      session.comparativeData.comparativeDivision = comparativeDivision;
      await session.comparativeData.fetchComparativeData(session.validations[period.periodKey]);

      setIsLoading(false);
    }
  }, [comparativeDivision]);

  useEffect(() => {
    let isCorporateNameValid = true;
    let isSirenValid = true;
    // Check the validity of company name and SIREN
    if (newCorporateName === "") {
      isCorporateNameValid = false;
    }

    if (!/^[0-9]{9}$/.test(newSiren)) {
      isSirenValid = false;
    }

    const isFormValid = isCorporateNameValid && isSirenValid;

    setIsFormValid(isFormValid);
  }, [newCorporateName, newSiren]);

  // ----------------------------------------------------------------------------------------------------
  // Handlers -----------------------------------------

  const handleDivisionChange = async (selectedOption) => {
    const division = selectedOption.value;
    setComparativeDivision(division);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (newCorporateName !== session.legalUnit.corporateName) {
      session.legalUnit.corporateName = newCorporateName;
    }
    if (newSiren != session.legalUnit.siren && /^[0-9]{9}/.test(newSiren)) {
      session.legalUnit.siren = newSiren;
      try {
        await session.legalUnit.fetchLegalUnitData();
        setNewCorporateName(session.legalUnit.corporateName || "");
        if (/^[0-9]{2}/.test(session.legalUnit.activityCode)) {
          let nextDivision = session.legalUnit.activityCode.slice(0, 2);
          setComparativeDivision(nextDivision);
        }
      } catch (error) {
        console.log(error);
      }
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewCorporateName(session.legalUnit.corporateName);
    setNewSiren(session.legalUnit.siren);
  };

  return (
    <div className="legal-unit-info">
      <div className="d-flex legal-unit-form align-items-center">
        <Form className="flex-grow-1">
          <Row className="align-items-center">
            {session.legalUnit.siren && (
              <Col>
                <Form.Group as={Row} className="align-items-center">
                  <Form.Label column sm={5}>
                    SIREN/SIRET :
                  </Form.Label>
                  {isEditing ? (
                    <Col sm={7}>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={newSiren}
                        onChange={(e) => setNewSiren(e.target.value.trim())}
                        pattern="[0-9]{9}"
                        isInvalid={newSiren === ""}
                        required
                      />
                    </Col>
                  ) : (
                    <Form.Label column className="fw-normal">
                      {session.legalUnit.siren}
                    </Form.Label>
                  )}
                </Form.Group>
              </Col>
            )}

            <Col>
              <Form.Group as={Row} className="align-items-center">
                <Form.Label column sm={4}>
                  Unité légale :
                </Form.Label>
                {isEditing ? (
                  <Col sm={8}>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={newCorporateName}
                      onChange={(e) => setNewCorporateName(e.target.value)}
                      required
                      isInvalid={newCorporateName === ""}
                    />
                  </Col>
                ) : (
                  <Form.Label column className="fw-normal">
                    {session.legalUnit.corporateName}
                  </Form.Label>
                )}
              </Form.Group>
            </Col>

            {session.legalUnit.activityCode && (
              <Col>
                <Form.Group as={Row} className="align-items-center">
                  <Form.Label column>Code APE :</Form.Label>
                  <Form.Label column className="fw-normal">
                    {session.legalUnit.activityCode}
                  </Form.Label>
                </Form.Group>
              </Col>
            )}
          </Row>
        </Form>

        {isEditing ? (
          <div className="d-flex align-items-end">
            <Button
              onClick={handleSave}
              variant="secondary"
              size="sm"
              className="me-1"
              disabled={!isFormValid}
            >
              Valider
            </Button>
            <Button onClick={handleCancel} variant="action" size="sm">
              Annuler
            </Button>
          </div>
        ) : (
          <Button onClick={handleEditClick} size="sm" variant="action">
            <i className="bi bi-pencil"></i> Modifier
          </Button>
        )}
      </div>

      <Form className="d-flex align-items-center mt-3">
        <Form.Group as={Row} className="my-2">
          <Form.Label column>Branche de comparaison :</Form.Label>
          <Col>
            <Select
              styles={customSelectStyles("400px")}
              options={divisionsOptions}
              components={{
                IndicatorSeparator: () => null,
              }}
              value={{
                label:
                  comparativeDivision + " - " + divisions[comparativeDivision],
                value: comparativeDivision,
              }}
              placeholder="Choisissez une division"
              onChange={handleDivisionChange}
            />
          </Col>
        </Form.Group>
      </Form>
    </div>
  );
};
