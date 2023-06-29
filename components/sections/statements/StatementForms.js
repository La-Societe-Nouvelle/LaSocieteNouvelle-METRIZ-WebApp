import React, { useState } from "react";
import Select from "react-select";

import { Row, Col, Image, Form, Button } from "react-bootstrap";
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
import { useEffect } from "react";

const StatementForms = ({
  session,
  period,
  initialSelectedIndicators,
  onValidation,
}) => {
  const [indicatorsToShow, setIndicatorsToShow] = useState([]);
  const [indicatorsOptions, setIndicatorsOptions] = useState([]);
  const [selectedIndicators, setSelectedIndicators] = useState(
    initialSelectedIndicators
  );

  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );
  useEffect(() => {
    const updatedIndicatorsToShow = selectedIndicators.map((key) => {
      const indicator = indicators[key];
      return [key, indicator];
    });
    initialSelectedIndicators = updatedIndicatorsOptions;
    setIndicatorsToShow(updatedIndicatorsToShow);

    const updatedIndicatorsOptions = Object.entries(indicators)
      .filter(([indic]) => !selectedIndicators.includes(indic))
      .map(([code, indic]) => {
        return { value: code, label: indic.libelle };
      });

    setIndicatorsOptions(updatedIndicatorsOptions);
  }, [selectedIndicators]);

  // check if net value indicator will change with new value & cancel value if necessary
  const handleNetValueChange = async (indic) => {
    let nextIndicator = session.getNetValueAddedIndicator(
      indic,
      period.periodKey
    );

    if (
      nextIndicator !==
      session.financialData.mainAggregates.netValueAdded.periodsData[
        period.periodKey
      ].footprint.indicators[indic]
    ) {
      // remove validation
      session.validations[period.periodKey] = session.validations[
        period.periodKey
      ].filter((item) => item != indic);
      setValidations(validations.filter((item) => item != indic));

      // update footprint
      await session.updateFootprints(period);
    }
  };

  const handleValidation = (indic) => {
    setValidations((validations) => [...validations, indic]);
    onValidation(indic);
  };

  const handleIndicatorChange = (selected) => {
    const updatedSelectedIndicators = [...selectedIndicators, selected.value];

    setSelectedIndicators(updatedSelectedIndicators);
  };

  const renderStatementForm = (key) => {
    const componentProps = {
      impactsData: session.impactsData[period.periodKey],
      onUpdate: handleNetValueChange,
      onValidate: handleValidation,
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
            <Form.Check type="checkbox" value={key} />
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
        <div className="px-2 pb-3">{renderStatementForm(key)}</div>
      </div>
    ));
  };

  return (
    <>
      <h3 className="h4 text-secondary mb-4 border-bottom border-light-secondary pb-3">
        <i class="bi bi-pencil-square"></i> Création de la valeur
      </h3>
      {renderIndicators("Création de la valeur")}
      <h3 className="h4 text-secondary my-4 ">
        <i class="bi bi-pencil-square"></i> Empreinte sociale
      </h3>
      {renderIndicators("Empreinte sociale")}
      <h3 className="h4  text-secondary my-4 ">
        <i class="bi bi-pencil-square"></i> Empreinte environnementale
      </h3>
      {renderIndicators("Empreinte environnementale")}
    </>
  );
};

export default StatementForms;
