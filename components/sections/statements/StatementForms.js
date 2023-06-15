import React, { useState } from "react";
import { Row, Col, Image } from "react-bootstrap";
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
  impactsData,
  period,
  selectedIndicators,
}) => {
  const [indicatorsToShow, setIndicatorsToShow] = useState([]);
  const [validations, setValidations] = useState(
    session.validations[period.periodKey]
  );
  useEffect(() => {
    console.log(selectedIndicators);
    window.scrollTo(0, 0); // Déplace la fenêtre vers le haut de la page au chargement du composant
    const updatedIndicatorsToShow = Object.entries(indicators).filter(([key]) =>
      selectedIndicators.includes(key)
    );
    setIndicatorsToShow(updatedIndicatorsToShow);
  }, [selectedIndicators]);

  // check if net value indicator will change with new value & cancel value if necessary
  const handleNetValueChange = async (indic) => {
    console.log("handleNetValueChange")
    console.log(indic);
    // get new value
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

  const handleValidation = async (indic) => {
    setValidations((validations) => [...validations, indic]);

    // add validation
    if (!session.validations[period.periodKey].includes(indic)) {
      session.validations[period.periodKey].push(indic);
    }
    // update footprint
    await session.updateFootprints(period);
  };

  const renderStatementForm = (key) => {
    const componentProps = {
      impactsData: impactsData[period.periodKey],
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

  return (
    <Row>
      {indicatorsToShow.map(([key, value]) => (
        <Col key={key} sm={12}>
          <div className="border border-1 rounded p-3 mb-3 shadow-sm">
            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
              <div className="d-flex align-items-center">
                <Image
                  className="me-2"
                  src={`icons-ese/logo_ese_${key}_bleu.svg`}
                  alt={key}
                  height={40}
                />

                <h4 className="fw-light-bold">
                  {value.libelle}
                  {value.isBeta && <span className="beta ms-1">BETA</span>}
                </h4>
              </div>

              <div className="text-end">
                {validations.includes(key) && (
                  <span className="display-6">
                    <i className="text-success ms-3 bi bi-patch-check"></i>
                  </span>
                )}
              </div>
            </div>
            <div>{renderStatementForm(key)}</div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default StatementForms;
