import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { generateCompleteFile } from "../../../../src/writers/deliverables/generateCompleteFile";
import ZipGenerator from "../../../../src/writers/deliverables/ZIPGenerator";

import { exportFootprintPDF } from "../../../../src/writers/Export";
import ChangeDivision from "../../../popups/ChangeDivision";

const ExportResults = (props) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [popUp, setPopUp] = useState(false);
  const [period] = useState(props.session.financialPeriod);

  const handleDownloadPDF = async () => {
    await exportFootprintPDF(props.session);
  };

  const updateIsGenerating = (value) => {
    setIsGenerating(value);
  };

  // CLOSE POP-UP
  const handleClose = () => {
    setPopUp();
  };

  const handleDownloadCompleteFile = async () => {
    if (props.session.comparativeData.activityCode == "00") {
      setPopUp("pdf");
    } else {
      setPopUp();
      setIsGenerating(true);
      props.updateVisibleGraphs(true);

      // Wait for visibleGraphs to be updated
      await new Promise((resolve) => setTimeout(resolve, 0));

      await generateCompleteFile(
        props.session.legalUnit.corporateName,
        props.session.validations[period.periodKey],
        props.session.financialData,
        props.session.impactsData,
        props.session.comparativeData,
        () => updateIsGenerating(false),
        period,
      );

      props.updateVisibleGraphs(false);
    }
  };

  return (
    <>
      <h3>Télécharger les livrables</h3>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <p className="mb-0">
          <i className="bi bi-file-earmark-pdf-fill"></i> Empreinte
          Sociétale des Soldes Intermédiaires de Gestion
        </p>
        <div>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <i className="bi bi-download"></i>
            Télécharger
          </Button>
        </div>
      </div>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <p className="mb-0">
          <i className="bi bi-file-earmark-pdf-fill"></i> Rapport complet -
          Empreinte Sociétale de l'entreprise
        </p>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCompleteFile}
          >
            <i className="bi bi-download"></i>
            Télécharger
          </Button>
        </div>
      </div>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <div>
          <p className="mb-0">
            <i className="bi bi-file-zip-fill"></i> Dossier complet - Ensemble
            des livrables et fichier de sauvegarde
          </p>
        </div>
        <ZipGenerator
          period={period}
          legalUnit={props.session.legalUnit.corporateName}
          validations={props.validations}
          financialData={props.session.financialData}
          impactsData={props.session.impactsData}
          comparativeData={props.session.comparativeData}
          session={props.session}
          updateVisibleGraphs={props.updateVisibleGraphs}
          handleDivision={props.handleDivision}
        />
      </div>
      <Modal show={isGenerating}>
        <Modal.Header>Génération du dossier en cours ... </Modal.Header>
        <Modal.Body>
          <div className="loader-container my-4">
            <div className="dot-pulse m-auto"></div>
          </div>
        </Modal.Body>
      </Modal>

      {popUp == "pdf" && (
        <ChangeDivision
          indic={null}
          session={props.session}
          handleDivision={props.handleDivision}
          onGoBack={handleClose}
          handleClose={handleClose}
          handleDownload={handleDownloadCompleteFile}
        ></ChangeDivision>
      )}


    </>
  );
};

export default ExportResults;
