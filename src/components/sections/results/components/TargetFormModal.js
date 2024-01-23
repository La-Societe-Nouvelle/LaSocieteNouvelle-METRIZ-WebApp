import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Image,
  InputGroup,
  Modal,
  Row,
} from "react-bootstrap";
import Select from "react-select";

// Lib
import metaIndics from "/lib/indics";

import { customSelectStyles } from "../../../../../config/customStyles";


const TargetFormModal = ({ showModal, showBranchTargetMode,indic, year, onClose, onSubmit }) => {
  const [targetMode, setTargetMode] = useState(() =>
  showBranchTargetMode ? "industry" : "custom"
);



  const changeTargetMode = ({ value }) => {
    setTargetMode(value);
  };

  const [targetValue, setTargetValue] = useState("");
  const [targetYear, setTargetYear] = useState(2030);

  const handlecustom = async () => {


    if (
      targetMode == "custom" &&
      (!targetValue || !targetYear)
    ) {
      return;
    }

    onSubmit(targetMode, targetYear, targetValue);
  };

  const generateYearOptions = (startYear) => {
    const endYear = 2030;
    const years = Array.from({ length: endYear - parseInt(startYear) + 1 }, (_, index) => parseInt(startYear) + index);
    return years.map((year) => ({ value: year, label: year }));
  };

  const YearSelector = ({ startYear }) => {
    const yearOptions = generateYearOptions(startYear);

    const handleYearChange = ({ value }) => {
      setTargetYear(value);
    };

    return (
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
    );
  };


  
const targetOptions = [
  { label: "Objectif de la branche", value: "industry"  },
  {
    label: "Objectif aligné sur la branche",
    value: "aligned",
     
  },
  { label: "Objectif personnalisé ", value: "custom" },
  { label: "Poursuivre avec une réduction annuelle similaire", value: "extend" },
];


const renderFormElements = () => {
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
            value={targetOptions.find((option) => option.value === targetMode)}
            options={targetOptions.map(({ isDisabled, ...rest }) => ({
              ...rest,
              isDisabled: isDisabled && !showBranchTargetMode,
            }))}
            onChange={changeTargetMode}
          />
        </Col>
      </Form.Group>
    
      {targetMode === "custom" && (
        <>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={6}>
              Valeur cible
            </Form.Label>
            <Col sm={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
                <InputGroup.Text>
                  {metaIndics[indic].unit}
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>

        </>
      )}

{(targetMode === "custom" || targetMode === "extend")&&(
        <>
                <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={6}>
              Année cible
            </Form.Label>
            <Col sm={6}>
              <YearSelector startYear={year} />
            </Col>
          </Form.Group>
        </>
      )}
    </>
  );
};

  return (
    <Modal show={showModal} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>
          Définir l'objectif pour l'indicateur "{metaIndics[indic].libelle}"
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <Form className="p-4 border rounded border-2 mb-3">
            {renderFormElements()}
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
          <Button onClick={handlecustom} variant="secondary">
            Définir l'objectif
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TargetFormModal;
