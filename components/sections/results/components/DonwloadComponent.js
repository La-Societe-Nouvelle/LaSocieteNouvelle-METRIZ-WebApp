import React from "react";
import { Button } from "react-bootstrap";

const DonwloadComponent = () => {
  return (
    <div className="box">
      <h4>Exporter les résultats</h4>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <p className="mb-0">
          <i className="bi bi-file-earmark-pdf-fill"></i> Empreinte Sociétale
          des Soldes Intermédiaires de Gestion
        </p>
        <div>
          <Button variant="secondary" size="sm">
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
          <Button variant="secondary" size="sm">
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
        {/* <ZipGenerator
          period={period}
          legalUnit={props.session.legalUnit.corporateName}
          validations={props.validations}
          financialData={props.session.financialData}
          impactsData={props.session.impactsData}
          comparativeData={props.session.comparativeData}
          session={props.session}
          updateVisibleGraphs={props.updateVisibleGraphs}
          handleDivision={props.handleDivision}
        /> */}
      </div>
    </div>
  );
};

export default DonwloadComponent;
