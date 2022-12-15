import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { Button } from "react-bootstrap";
import LoadingSpinner from "../../../parts/LoadingSpinner";
import {
  exportFootprintPDF,
  generateFootprintPDF,
  generatePDF,
} from "../../../../src/writers/Export";

const ExportResults = props => {
  const [isBuildingPDF, setisBuildingPDF] = useState(false);
  const [isBuildingZIP] = useState(false);
  const [printGrossImpact] = useState(["ghg","haz", "mat","nrg","was","wat",]);


  const handleDownloadZip = () => {

    if(!props.session.comparativeDivision) {
      props.session.comparativeDivision = "00";
    }
    buildZip(props.session.validations, props.session, props.session.comparativeDivision);

  };

  const buildZip = async(validations, session, comparativeDivision) => {
    await downloadReport(validations, session, comparativeDivision);

  }


  const downloadReport = async (indics, session, comparativeDivision) => {
    // TO DO : Optimisation PDF 
    const { legalUnit, year } = session;
    // Zip Export
    let zip = new JSZip();

    indics.map((indic) => {
      let doc = generatePDF(
        indic,
        session,
        comparativeDivision,
        "#print-Production-" + indic,
        "#print-Consumption-" + indic,
        "#print-Value-" + indic,
        "#print-CapitalConsumption-" + indic,
        printGrossImpact.includes(indic) ? "#piechart-" + indic : "" 
        
      );
      zip.file(
        "rapport_" +
          legalUnit.corporateName.replaceAll(" ", "") +
          "-" +
          indic.toUpperCase() +
          ".pdf",
        doc.output("blob")
      );
    });

    // add

    const envIndic = ["ghg", "nrg", "wat", "mat", "was", "haz"];
    const seIndic = ["eco", "art", "soc", "idr", "geq", "knw"];

    const seOdds = ["5", "8", "9", "10", "12"];
    const envOdds = ["6", "7", "12", "13", "14", "15"];

    // RAPPORT - EMPREINTE ENVIRONNEMENTALE
    const docEnv = new jsPDF("landscape");
    await generateFootprintPDF(
      docEnv,
      envIndic,
      session,
      "Empreinte environnementale",
      envOdds
    );

    // RAPPORT - EMPREINTE ECONOMIQUE ET SOCIALE
    const docES = new jsPDF("landscape");
    await generateFootprintPDF(
      docES,
      seIndic,
      session,
      "Empreinte économique et sociale",
      seOdds
    );

    // RAPPORT - EMPREINTE SOCIETALE

    const docEES = new jsPDF("landscape", "mm", "a4", true);

    // RAPPORT - EMPREINTE ENVIRONNEMENTALE

    await generateFootprintPDF(
      docEES,
      envIndic,
      session,
      "Empreinte environnementale",
      envOdds
    );

    docEES.addPage();

    // RAPPORT - EMPREINTE ÉCONOMIQUE ET SOCIALE

    await generateFootprintPDF(
      docEES,
      seIndic,
      session,
      "Empreinte économique et sociale",
      seOdds
    );

    const fileName = "enregistrement-ese-" + legalUnit.corporateName.replaceAll(" ", "-");
    const json = JSON.stringify(session);

    zip.file(
      "rapport_empreinte_environnementale_" +
        legalUnit.corporateName.replaceAll(" ", "") +
        ".pdf",
      docEnv.output("blob")
    );

    zip.file(
      "rapport_empreinte_es_" +
        legalUnit.corporateName.replaceAll(" ", "") +
        ".pdf",
      docES.output("blob")
    );

    zip.file(
      "rapport_empreinte_societale_" +
        legalUnit.corporateName.replaceAll(" ", "") +
        ".pdf",
      docEES.output("blob")
    );

    // add .json file save
    const blob = new Blob([json], { type: "application/json" });

    zip.file(fileName + ".json", blob);

    zip
      .generateAsync({ type: "blob" })
      .then(function (content) {
        saveAs(
          content,
          "livrables_" +
            legalUnit.corporateName.replaceAll(" ", "") +
            "_" +
            year +
            ".zip"
        );
      });
  };

  const handleDownloadPDF = async() => {
    setisBuildingPDF(true);

     await exportFootprintPDF(props.session);
     setisBuildingPDF(false);

    };

  return (
    <>
    <h3>Télécharger les livrables</h3>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <p className="mb-0">Rapport sur l'empreinte sociétale</p>
        <div>
 
        <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
        {isBuildingPDF ?
           <LoadingSpinner />
           : 
           <i className="bi bi-download"></i>
       }  Télécharger
        </Button>
        </div>
      </div>
      <div className="dwn-group d-flex align-items-center justify-content-between">
        <div>
        <p className="mb-0">Dossier Complet : Ensemble des livrables et fichier de sauvegarde</p>
      
        </div>
 
          <Button variant="secondary" size="sm" onClick={handleDownloadZip}>
          {isBuildingZIP ?
           <LoadingSpinner />
           : 
           <i className="bi bi-download"></i>
       } Télécharger
          </Button>
     
      </div>
   
    </>
  );
};

export default ExportResults;
