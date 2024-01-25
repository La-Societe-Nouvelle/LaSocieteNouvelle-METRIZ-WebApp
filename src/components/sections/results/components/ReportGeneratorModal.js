import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

import metaIndics from "/lib/indics";

const ReportGeneratorModal = ({
  showModal,
  onClose,
  onDownload,
  indicators,
}) => {
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleCheckboxAll = (event) => {
    setSelectedIndicators(() => (event.target.checked ? [...indicators] : []));

    if(!event.target.checked) {
      setSelectedFiles([]);
    }
  };

  const handleIndicatorsCheckboxes = (event, indicator) => {
    setSelectedIndicators((prevSelected) => {
      const newSelected = event.target.checked
        ? [...prevSelected, indicator]
        : prevSelected.filter((id) => id !== indicator);
  
      if (newSelected.length === 0) {
        setSelectedFiles([]);
      }
  
      return newSelected;
    });
  };
  
  
  const handleOtherCheckboxes = (event, file) => {
    setSelectedFiles((prevSelected) => {
      const newSelected = event.target.checked
        ? [...prevSelected, file]
        : prevSelected.filter((id) => id !== file);
  
      return newSelected;
    });
  };


  const handleDownload = () => {
    onDownload({selectedIndicators, selectedFiles});
  };

  return (
    <Modal show={showModal} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title as={"h4"}>Générer un rapport</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Indicateurs à inclure</h6>
        <Form>

        {indicators.map((indicator) => (
          <Form.Check
            type="checkbox"
            className="pb-1"
            id={`checkbox-${indicator}`}
            label={
              <label htmlFor={`checkbox-${indicator}`}>
                {metaIndics[indicator].libelle}
              </label>
            }
            checked={selectedIndicators.includes(indicator)}
            onChange={(event) => handleIndicatorsCheckboxes(event, indicator)}
          />
        ))}
      <hr className="p-0 m-2 border-1"></hr>
          <Form.Check
            type="checkbox"
            className="pb-1"
            id={`checkbox-all`}
            label={
              <label htmlFor={`checkbox-all`}>
                 Tout sélectionner
              </label>
            }
            checked={selectedIndicators.length == indicators.length}
            onChange={(event) => handleCheckboxAll(event, "checkbox-all")}
          />

        <div className="mt-4">
          <h6>Annexes</h6>
          <Form.Check
            type="checkbox"
            id={`standardReports`}
            disabled={selectedIndicators.length == 0}
            label={<label htmlFor={`standardReports`}> Inclure les annexes </label>}
            checked={selectedFiles.includes("standardReports")}
            onChange={(event) => handleOtherCheckboxes(event, "standardReports")}
          />
          <Form.Check
            type="checkbox"
            id={`with-analyses`}
            className="ms-4"
            disabled={!selectedFiles.includes("standardReports")}
            label={
              <label htmlFor={`with-analyses`}>
                Inclure les notes d'analyse dans les annexes
              </label>
            }
            checked={selectedFiles.includes("with-analyses")}
            onChange={(event) => handleOtherCheckboxes(event, "with-analyses")}
          />
        </div>
        </Form>

        <p className="text-end">
        <Button  onClick={onClose} className="me-2">
           Fermer
          </Button>
          <Button variant="secondary" onClick={handleDownload} disabled={ selectedIndicators.length === 0 }>
           Télécharger
          </Button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default ReportGeneratorModal;
