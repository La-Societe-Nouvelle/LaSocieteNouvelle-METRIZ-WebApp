import React, { useState } from "react";
import { Image, Form, Button } from "react-bootstrap";

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

const StatementForms = ({
  session,
  period,
  initialSelectedIndicators,
  updateValidations,
}) => {
  const [selectedIndicators, setSelectedIndicators] = useState(
    initialSelectedIndicators
  );

  // check if net value indicator will change with new value & cancel value if necessary
  const handleNetValueChange = async (indic) => {
    session.getNetValueAddedIndicator(indic, period.periodKey);
    updateValidations(selectedIndicators);
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
    }
  };

  const renderStatementForm = (key) => {
    const componentProps = {
      impactsData: session.impactsData[period.periodKey],
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

  const renderIndicators = (category) => {
    const filteredIndicators = Object.entries(indicators).filter(
      ([key, value]) => value.isAvailable && value.category === category
    );

    return filteredIndicators.map(([key, value]) => (
      <div key={key} className="border rounded mb-3 indic-statement bg-light">
        <div className="d-flex align-items-center px-2 py-3">
          <Form className="indic-form me-3">
            <Form.Check
              type="checkbox"
              value={key}
              checked={selectedIndicators.includes(key)}
              onChange={handleCheckboxChange}
            />
          </Form>
          <div className="d-flex align-items-center flex-grow-1 ">
            <Image
              className="me-2"
              src={`icons-ese/logo_ese_${key}_bleu.svg`}
              alt={key}
              height={20}
            />
            <h4>
              {value.libelle}
              {value.isBeta && <span className="beta ms-1">BETA</span>}
            </h4>
            <div className="text-end flex-grow-1 ">
              <Button variant="light" size="sm">
                Informations
              </Button>
            </div>
          </div>
        </div>

        {selectedIndicators.includes(key) && (
          <div className="px-2 py-3">{renderStatementForm(key)}</div>
        )}
      </div>
    ));
  };

  return (
    <>
      <h3 className="h4 text-secondary mb-4 border-bottom border-light-secondary pb-3">
        <i className="bi bi-pencil-square"></i> Création de la valeur
      </h3>
      {renderIndicators("Création de la valeur")}
      <h3 className="h4 text-secondary my-4 ">
        <i className="bi bi-pencil-square"></i> Empreinte sociale
      </h3>
      {renderIndicators("Empreinte sociale")}
      <h3 className="h4  text-secondary my-4 ">
        <i className="bi bi-pencil-square"></i> Empreinte environnementale
      </h3>
      {renderIndicators("Empreinte environnementale")}
    </>
  );
};

export default StatementForms;
