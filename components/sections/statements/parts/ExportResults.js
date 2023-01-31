import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ZipGenerator from "../../../../src/writers/deliverables/ZIPGenerator";

import { exportFootprintPDF } from "../../../../src/writers/Export";

const ExportResults = (props) => {
 
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (props.session.validations.length > 0) {
      setIsDisabled(false);
    }
  }, [props]);


  const handleDownloadPDF = async () => {
    await exportFootprintPDF(props.session);
  };

  return (
    <>
    {console.log(props.validations)}
      <h3>Télécharger les livrables</h3>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <p className="mb-0">Rapport sur l'empreinte sociétale</p>
        <div>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <i className="bi bi-download"></i>
            Télécharger
          </Button>
        </div>
      </div>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <div>
          <p className="mb-0">
            Dossier Complet : Ensemble des livrables et fichier de sauvegarde
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
        />
      </div>
    </>
  );
};

export default ExportResults;
