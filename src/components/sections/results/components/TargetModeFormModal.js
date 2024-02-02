import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import Select from "react-select";

// Lib
import metaIndics from "/lib/indics";

// Styles
import { customSelectStyles } from "../../../../../config/customStyles";

const TargetModeFormModal = ({
  showModal,
  showIndustryMode,
  showExtendTargetMode,
  legalUnitTarget,
  indic,
  currentPeriod,
  onClose,
  onSubmit,
}) => {

  const [targetMode, setTargetMode] = useState(() => showIndustryMode ? "industryTarget" : "personalTarget");
  const [targetValue, setTargetValue] = useState("");
  const [targetYear, setTargetYear] = useState(2030);
  const [targetError, setTargetError] = useState("");

  useEffect(() => {
    setTargetValue("");
    setTargetYear(2030);
    setTargetMode(showIndustryMode ? "industryTarget" : "personalTarget");

    const lastTarget = legalUnitTarget[legalUnitTarget.length - 1];
    
    if (lastTarget) {
      setTargetMode(lastTarget.target);
      if(lastTarget.target == "personalTarget"){
        setTargetValue(lastTarget.value);
      }
      if(lastTarget.target == "personalTarget" || lastTarget.target == "extendTarget") {
        setTargetYear(parseInt(lastTarget.year));
      }
    }
  
  }, [legalUnitTarget]);

// ------------------------------------------------------------------------------------

// Target Mode Select options ---------------------------------------------------------

  const targetOptions = [
      {
        label: "Objectif de la branche",
        value: "industryTarget",
        showOption: showIndustryMode,
      },
      {
        label: "Objectif aligné sur la branche",
        value: "alignedIndustryTarget",
        showOption: showIndustryMode,
      },
      {
        label: "Objectif personnalisé",
        value: "personalTarget",
        showOption: true,
      },
      {
        label: "Réduction annuelle similaire",
        value: "extendTarget",
        showOption: showExtendTargetMode,
      },
    ];

  const visibleOptions = targetOptions.filter((option) => option.showOption);

// Years Select options ---------------------------------------------------------------

  const generateYearOptions = (startYear) => {
    const endYear = 2030;
    const years = Array.from(
      { length: endYear - parseInt(startYear) + 1 },
      (_, index) => parseInt(startYear) + index
    );
    return years.map((year) => ({ value: year, label: year }));
  };

  const yearOptions = generateYearOptions(currentPeriod);


// ------------------------------------------------------------------------------------

// Handle Form Changes ----------------------------------------------------------------

const handleTargetModeChange = ({ value }) => {
  setTargetMode(value);
};
const handleYearChange = ({ value }) => {
  setTargetYear(value);
};

const handleTargetValueChange = (e) => {
  setTargetError("");
  setTargetValue(e.target.value);

  if (isNaN(e.target.value)) {
    setTargetError("Veuillez entrer une valeur numérique.");
    return;
  }
};


// Form -------------------------------------------------------------------------------

  const renderForm = () => {
    return (
      <>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={6}>
            Quel objectif souhaitez-vous atteindre ?
          </Form.Label>
          <Col sm={6}>
            <Select
              placeholder="Sélectionner "
              styles={customSelectStyles()}
              defaultValue={visibleOptions.find(
                (option) => option.value === targetMode
              )}
              options={visibleOptions}
              onChange={handleTargetModeChange}
            />
          </Col>
        </Form.Group>
        {targetMode === "personalTarget" && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={6}>
                Valeur cible
              </Form.Label>
              <Col sm={6}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={targetValue}
                    onChange={handleTargetValueChange}
                    isInvalid={targetError !== ""}
                  />
                  <InputGroup.Text>{metaIndics[indic].unit}</InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    {targetError}
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Form.Group>
        )}

        {(targetMode === "personalTarget" || targetMode === "extendTarget") && (
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={6}>
                Année cible
              </Form.Label>
              <Col sm={6}>

              <Select
                options={yearOptions}
                styles={customSelectStyles()}
                placeholder="Sélectionner une année"
                onChange={handleYearChange}
                value={{
                  label: targetYear,
                  value: targetYear,
                }}
              />
              </Col>
            </Form.Group>
        )}
      </>
    );
  };
// ------------------------------------------------------------------------------------

// Submit Form ------------------------------------------------------------------------

  const updateCustomTargetMode = async () => {
    if (targetMode === "personalTarget") {
      if (!targetValue || isNaN(targetValue)) {
        setTargetError("Veuillez entrer une valeur.");
        return;
      }
    }
    setTargetError("");
    onSubmit(targetMode, targetYear, targetValue);
  };

// ------------------------------------------------------------------------------------

  return (
    <Modal show={showModal} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h4"}>
          Définir l'objectif pour l'indicateur "{metaIndics[indic].libelle}"
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <Form className="p-4 border rounded border-2 mb-3">
              {renderForm()}
            </Form>
          </Col>
        </Row>
        <div className="text-end">
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="me-2"
          >
            Fermer
          </Button>
          <Button onClick={updateCustomTargetMode} variant="secondary" disabled={targetError}>
            Définir l'objectif
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TargetModeFormModal;
