import React, { useEffect, useState } from "react";
import { Button, Form, Image, Modal } from "react-bootstrap";

import metaIndics from "/lib/indics";

const ReportGeneratorModal = ({
  showModal,
  onClose,
  onDownload,
  indicators,
}) => {
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);


  useEffect(() => {
    // Reset checkboxes when the modal view changes
    setSelectedIndicators([]);
    setSelectedFiles([]);
  }, [showModal]);

  useEffect(() => {



  }, []);

  // Handle

  const handleCheckboxAll = (event) => {
    setSelectedIndicators(() => (event.target.checked ? [...indicators] : []));

    if (!event.target.checked) {
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
    const isChecked = event.target.checked;

    setSelectedFiles((prevSelected) => {
      let newSelected = isChecked
        ? [...prevSelected, file]
        : prevSelected.filter((id) => id !== file);

      // check if only "with-analyses" checkbox left
      if (newSelected.length == 1 && newSelected.includes("with-analyses")) {
        newSelected = [];
      }

      return newSelected;
    });
  };

  const handleDownload = () => {
    onDownload({ selectedIndicators, selectedFiles });
  };

  return (
    <Modal show={showModal} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title as={"h4"}>Composition du rapport</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert-info mt-0">
          <div className="info-icon">
            <Image src="/info-circle.svg" alt="icon info" />
          </div>
          <div>
            <p>
              Sélectionnez les <b>plaquettes que vous souhaitez inclure</b> dans le document.
              Chaque plaquette est liée à un indicateur.
            </p>
            <p className="mt-1">
              Vous pouvez également choisir d'intégrer les annexes (détails des résultats).
            </p>
          </div>
        </div>
        <h6>Plaquettes à inclure</h6>
        <Form>

          {indicators.map((indicator) => (
            <Form.Check
              key={indicator}
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
            <h6>Autres</h6>
            <Form.Check
              type="checkbox"
              id={`eseReport`}
              label={<label htmlFor={`eseReport`}> Rapport sur l'empreinte sociétale  </label>}
              checked={selectedFiles.includes("eseReport")}
              onChange={(event) => handleOtherCheckboxes(event, "eseReport")}
            />

          </div>

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
          <Button onClick={onClose} className="me-2">
            Fermer
          </Button>
          <Button variant="secondary" onClick={handleDownload} disabled={selectedFiles.length === 0 && selectedIndicators.length === 0}>
            Télécharger
          </Button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default ReportGeneratorModal;
