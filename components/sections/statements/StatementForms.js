import React, { useState } from "react";
import { Image, Form, Button } from "react-bootstrap";
import { useEffect } from "react";

import {
  StatementART,
  StatementECO,
  StatementGEQ,
  StatementGHG,
  StatementHAZ,
  StatementIDR,
  StatementKNW,
  StatementMAT,
  StatementNRG,
  StatementSOC,
  StatementWAS,
  StatementWAT,
} from "./forms";
import indicators from "/lib/indics";
import IndicatorDetailsModal from "./modals/IndicatorDetailsModal";

const StatementForms = ({
  session,
  period,
  initialSelectedIndicators,
  updateValidations,
}) => {
  const [selectedIndicators, setSelectedIndicators] = useState(
    initialSelectedIndicators
  );

  const [invalidStatements, setInvalidStatements] = useState({});

  const [declaredIndicators, setDeclaredIndicators] = useState(
    initialSelectedIndicators
  );
  const [indicatorModal, setIndicatorModal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Filter out the selected indicators that are not in the invalidStatements list
    const ValidStatements = selectedIndicators.filter(
      (indicator) =>
        !Object.keys(invalidStatements).includes(indicator) &&
        declaredIndicators.includes(indicator)
    );

    const missingStatements = verifySelectedIndicators(
      selectedIndicators,
      session.impactsData[period.periodKey]
    );
    // Update validations for ValidStatements here
    updateValidations(
      ValidStatements,
      Object.keys(invalidStatements),
      missingStatements
    );
  }, [declaredIndicators, selectedIndicators, invalidStatements]);

  const handleModalOpen = (indicator) => {
    setIndicatorModal(indicator);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setIndicatorModal(null);
    setShowModal(false);
  };

  const handleNetValueChange = async (indic) => {
  
    // Remove the indicator from declaredIndicators (if exists)
    const updatedDeclaredIndicators = declaredIndicators.filter(
      (indicator) => indicator !== indic
    );
  
    session.getNetValueAddedIndicator(indic, period.periodKey);
  
    // Add the indicator back to declaredIndicators
    setDeclaredIndicators([...updatedDeclaredIndicators, indic]);
  };
  

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedIndicators((prevSelectedIndicators) => [
        ...prevSelectedIndicators,
        value,
      ]);
    } else {
      setSelectedIndicators((prevSelectedIndicators) =>
        prevSelectedIndicators.filter((indicator) => indicator !== value)
      );
      setDeclaredIndicators((prevDeclaredIndicators) =>
        prevDeclaredIndicators.filter((indicator) => indicator !== value)
      );
      setInvalidStatements((prevInvalidIndicators) => {
        const updatedInvalidIndicators = { ...prevInvalidIndicators };
        delete updatedInvalidIndicators[value];
        return updatedInvalidIndicators;
      });
    }
  };

  const handleError = (field, errorMessage) => {
    if (errorMessage) {
      setInvalidStatements((prevInvalidIndicators) => ({
        ...prevInvalidIndicators,
        [field]: errorMessage,
      }));
    } else {
      setInvalidStatements((prevInvalidIndicators) => {
        const updatedInvalidIndicators = { ...prevInvalidIndicators };
        delete updatedInvalidIndicators[field];
        return updatedInvalidIndicators;
      });
    }
  };

  const renderStatementForm = (key) => {
    const componentProps = {
      impactsData: session.impactsData[period.periodKey],
      onError: handleError,
      onUpdate: handleNetValueChange,
    };

    switch (key) {
      case "eco":
        return <StatementECO {...componentProps} />;
      case "art":
        return <StatementART {...componentProps} />;
      case "soc":
        return <StatementSOC {...componentProps} />;
      case "idr":
        return <StatementIDR {...componentProps} />;
      case "geq":
        return <StatementGEQ {...componentProps} />;
      case "knw":
        return <StatementKNW {...componentProps} />;
      case "ghg":
        return <StatementGHG {...componentProps} />;
      case "nrg":
        return <StatementNRG {...componentProps} />;
      case "wat":
        return <StatementWAT {...componentProps} />;
      case "mat":
        return <StatementMAT {...componentProps} />;
      case "was":
        return <StatementWAS {...componentProps} />;
      case "haz":
        return <StatementHAZ {...componentProps} />;

      default:
        return null;
    }
  };

  const toggleCheckbox = (key) => {
    setSelectedIndicators((prevSelectedIndicators) =>
      prevSelectedIndicators.includes(key)
        ? prevSelectedIndicators.filter((indicator) => indicator !== key)
        : [...prevSelectedIndicators, key]
    );
  };

  const renderIndicators = (category) => {
    const filteredIndicators = Object.entries(indicators).filter(
      ([key, value]) => value.isAvailable && value.category === category
    );

    return filteredIndicators.map(([key, value]) => (
      <div key={key} className="border rounded mb-3 indic-statement bg-light">
        <div className="d-flex align-items-center px-2 py-3  " id={key}>
          <Form className="indic-form">
            <Form.Group key={key}>
              <Form.Check
                type="checkbox"
                value={key}
                checked={selectedIndicators.includes(key)}
                onChange={handleCheckboxChange}
                label={
                  <Form.Check.Label onClick={() => toggleCheckbox(key)}>
                    <div className="d-flex align-items-center">
                      <Image
                        className="mx-2"
                        src={`icons-ese/logo_ese_${key}_bleu.svg`}
                        alt={key}
                        height={20}
                      />
                      <h4 className="my-1">
                        {value.libelle}
                        {value.isBeta && (
                          <span className="beta ms-1">BETA</span>
                        )}
                      </h4>
                    </div>
                  </Form.Check.Label>
                }
              />
            </Form.Group>
          </Form>
          <div className="text-end flex-grow-1">
            <Button
              variant="light"
              className="text-primary"
              size="sm"
              onClick={() => handleModalOpen(key)}
            >
              Informations
              <i className="ms-2 bi bi-info-circle-fill"></i>
            </Button>
          </div>
        </div>

        {selectedIndicators.includes(key) && (
          <div className="px-2 py-2">{renderStatementForm(key)}</div>
        )}
        {renderErrorMessage(key)}
      </div>
    ));
  };

  const renderErrorMessage = (indicator) => {
    if (invalidStatements[indicator]) {
      return (
        <div className="mx-2 my-2 alert alert-danger">
          {invalidStatements[indicator]}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <h3>
        <i className="bi bi-pencil-square"></i> Création de la valeur
      </h3>
      {renderIndicators("Création de la valeur")}
      <h3>
        <i className="bi bi-pencil-square"></i> Empreinte sociale
      </h3>
      {renderIndicators("Empreinte sociale")}
      <h3>
        <i className="bi bi-pencil-square"></i> Empreinte environnementale
      </h3>
      {renderIndicators("Empreinte environnementale")}

      {indicatorModal && (
        <IndicatorDetailsModal
          show={showModal}
          handleClose={handleModalClose}
          indicator={indicatorModal}
        />
      )}
    </>
  );
};

const verifySelectedIndicators = (selectedIndicators, impactsData) => {

  const propertiesToCheck = {
    eco: ["isAllActivitiesInFrance", "domesticProduction"],
    art: ["isValueAddedCrafted", "craftedProduction"],
    soc: ["hasSocialPurpose"],
    idr: ["hasEmployees", "interdecileRange"],
    geq: ["hasEmployees", "wageGap"],
    knw: ["researchAndTrainingContribution"],
    ghg: ["greenhousesGazEmissions", "greenhousesGazEmissionsUncertainty"],
    haz: [
      "hazardousSubstancesConsumption",
      "hazardousSubstancesConsumptionUncertainty",
    ],
    mat: [
      "isExtractiveActivities",
      "materialsExtraction",
      "materialsExtractionUncertainty",
    ],
    nrg: ["energyConsumption", "energyConsumptionUncertainty"],
    was: ["wasteProduction", "wasteProductionUncertainty"],
    wat: ["waterConsumption", "waterConsumptionUncertainty"],
  };

  const missingIndicators = [];
  for (const indicator of selectedIndicators) {
    if(indicator == 'knw') {
      console.log(impactsData)
    }
    const properties = propertiesToCheck[indicator];
    if (properties) {
      const isIndicatorMissing = properties.some(
        (property) =>
          impactsData[property] === null ||
          impactsData[property] === undefined
      );
      if (isIndicatorMissing) {
        missingIndicators.push(indicator);
      }
    }
  }

  return missingIndicators;
};

export default StatementForms;
