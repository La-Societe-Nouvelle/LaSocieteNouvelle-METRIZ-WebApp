// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
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


// Modals
import IndicatorDetailsModal from "./modals/IndicatorDetailsModal";

// Libs
import indicators from "/lib/indics";

function StatementFormContainer ({
  session,
  period,
  indic,
  onUpdate
}) {

  const {
    libelle,
    isBeta
  } = indicators[indic]

  const [selected, setSelected] = useState(session.validations[period.periodKey].includes(indic));
  const [errorMessage, setErrorMessage] = useState(null);
  const [indicatorModal, setIndicatorModal] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
 
  const handleCheckboxChange = (event) => {
    const { checked } = event.target;
    setSelected(checked);
    if (!checked) {
      setErrorMessage(null);
      onUpdate(indic,{status:"unselect", errorMessage: null});
    }
  };

  // return unselect status if indic undefined/unselect when component did mount
  useEffect(() => {
    if (!selected) {
      onUpdate(indic,{status:"unselect", errorMessage: null});
    }
  }, [])

  const onStatementUpdate = (statementStatus) => {
    setErrorMessage(statementStatus.errorMessage);
    onUpdate(indic,statementStatus);
  }

  const renderStatementForm = (key) => {
    const componentProps = {
      impactsData: session.impactsData[period.periodKey],
      onUpdate: onStatementUpdate,
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

  const toggleCheckbox = () => {
    setSelected(!selected);
    if (selected) {
      setErrorMessage(null);
      onUpdate(indic,{status:"unselect", errorMessage: null});
    }
  };

  const handleModalOpen = (indicator) => {
    setIndicatorModal(indicator);
    setShowInfoModal(true);
  };

  return (
    <div key={indic} className="border rounded mb-2 indic-statement bg-light">
      <div className="d-flex align-items-center p-2  " id={indic}>
        <Form className="indic-form">
          <Form.Group key={indic}>
            <Form.Check
              type="checkbox"
              value={indic}
              checked={selected}
              onChange={handleCheckboxChange}
              label={
                <Form.Check.Label onClick={() => toggleCheckbox()}>
                  <div className="d-flex align-items-center">
                    <Image
                      className="mx-2"
                      src={`icons-ese/logo_ese_${indic}_bleu.svg`}
                      alt={indic}
                      height={20}
                    />
                    <h4 className="my-1">
                      {libelle}
                      {isBeta && <span className="beta ms-1">BETA</span>}
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
            onClick={() => handleModalOpen(indic)}
          >
            Informations
            <i className="ms-2 bi bi-info-circle-fill"></i>
          </Button>
        </div>
      </div>

      {selected && (
         renderStatementForm(indic) 
      )}

      {indicatorModal && (
        <IndicatorDetailsModal
          show={showInfoModal}
          handleClose={() => setShowInfoModal(false)}
          indicator={indicatorModal}
        />
      )}

      {errorMessage && (
        <div className="mx-2 my-2 alert alert-danger">{errorMessage}</div>
      )}
    </div>
  );
};

export default StatementFormContainer;