import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { generateCompleteFile } from "../../../../src/writers/deliverables/generateCompleteFile";
import ZipGenerator from "../../../../src/writers/deliverables/ZIPGenerator";

import { exportFootprintPDF } from "../../../../src/writers/Export";

const ExportResults = (props) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    await exportFootprintPDF(props.session);
  };

  const updateIsGenerating = (value) => {
    setIsGenerating(value);
  };

  const handleDownloadCompleteFile = async () => {
    setIsGenerating(true);
    props.updateVisibleGraphs(true);

    // Wait for visibleGraphs to be updated
    await new Promise((resolve) => setTimeout(resolve, 0));

    await generateCompleteFile(
      props.session.year,
      props.session.legalUnit.corporateName,
      props.validations,
      props.session.financialData,
      props.session.impactsData,
      props.session.comparativeData,
      () => updateIsGenerating(false)
    );

    props.updateVisibleGraphs(false);
  };

  return (
    <>
      <h3>Télécharger les livrables</h3>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <p className="mb-0">
          <i className="bi bi-file-earmark-pdf-fill"></i> Rapport - Empreinte
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
          year={props.session.year}
          legalUnit={props.session.legalUnit.corporateName}
          validations={props.validations}
          financialData={props.session.financialData}
          impactsData={props.session.impactsData}
          comparativeData={props.session.comparativeData}
          session={props.session}
          updateVisibleGraphs={props.updateVisibleGraphs}
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
    </>
  );
};

export default ExportResults;
