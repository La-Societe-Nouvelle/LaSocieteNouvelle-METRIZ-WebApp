import React, { useState, useEffect } from "react";
import jsZip from "jszip";
import { Button, Modal, ProgressBar } from "react-bootstrap";
import { basicPDFReport } from "./PDFGenerator";
// Meta
import metaIndics from "/lib/indics";
import jsPDF from "jspdf";
import { generateFootprintPDF } from "../Export";

const ZipGenerator = ({
  year,
  legalUnit,
  validations,
  financialData,
  impactsData,
  comparativeData,
  session,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPDFs, setGeneratedPDFs] = useState([]);
  const [zip, setZip] = useState(null);

  useEffect(() => {
    if (isGenerating) {
      setZip(new jsZip());
    }
  }, [isGenerating]);

  useEffect(() => {
    if (zip) {
      generatePDFs();
    }
  }, [zip]);

  function handleGeneratePDFs() {
    setGeneratedPDFs([]);
    setIsGenerating(true);
  }

  function generatePDFs() {
    // Initialiser l'objet jsZip
    // Générer les PDFs et les ajouter au zip
    Promise.all(
      validations.map((indic) =>
        basicPDFReport(
          year,
          legalUnit,
          indic,
          metaIndics[indic].libelle,
          metaIndics[indic].unit,
          financialData,
          impactsData,
          comparativeData,
          false
        )
      )
    )
      .then((pdfs) => {
        pdfs.forEach((pdf, index) => {
          let title =
            "Rapport_" +
            year +
            "_" +
            legalUnit.replaceAll(" ", "") +
            "-" +
            validations[index].toUpperCase();

          zip.file(`${title}.pdf`, pdf, {
            binary: true,
          });
          setGeneratedPDFs((prevPDFs) => [...prevPDFs, pdf]);
        });

        const envIndic = ["ghg", "nrg", "wat", "mat", "was", "haz"];
        const seIndic = ["eco", "art", "soc", "idr", "geq", "knw"];

        const seOdds = ["5", "8", "9", "10", "12"];
        const envOdds = ["6", "7", "12", "13", "14", "15"];

        //   // RAPPORT - EMPREINTE SOCIETALE

        const docEES = new jsPDF("landscape", "mm", "a4", true);

        // RAPPORT - EMPREINTE ENVIRONNEMENTALE

        generateFootprintPDF(
          docEES,
          envIndic,
          financialData,
          legalUnit,
          year,
          "Empreinte environnementale",
          envOdds
        );

        docEES.addPage();

        // RAPPORT - EMPREINTE ÉCONOMIQUE ET SOCIALE

        generateFootprintPDF(
          docEES,
          seIndic,
          financialData,
          legalUnit,
          year,
          "Empreinte économique et sociale",
          seOdds
        );
        setGeneratedPDFs((prevPDFs) => [...prevPDFs, docEES]);
        zip.file(
          "rapport_empreinte_societale_" +
            legalUnit.replaceAll(" ", "") +
            ".pdf",
          docEES.output("blob")
        );

        // add .json file save
        const sessionFile = "session-metriz-" + legalUnit.replaceAll(" ", "-");
        const json = JSON.stringify(session);
        // build download link & activate
        const blob = new Blob([json], { type: "application/json" });

        setGeneratedPDFs((prevPDFs) => [...prevPDFs, sessionFile]);

        zip.file(sessionFile + ".json", blob);
      })
      .then(() => {
        // Télécharger le zip une fois que tous les PDFs ont été ajoutés
        zip
          .generateAsync({ type: "blob" })
          .then((content) => {
            // Télécharger le zip
            saveAs(
              content,
              "Rapports_Empreinte_sociétale_" + legalUnit + "_" + year + ".zip"
            );
          })
          .finally(() => {
            // Masquer le modal et réinitialiser l'état
            setIsGenerating(false);
            setZip(null);
            setGeneratedPDFs([]);
          });
      });
  }

  const totalFiles = validations.length + 2;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleGeneratePDFs}>
        <i className="bi bi-download"></i>
        Télécharger
      </Button>
      {console.log((generatedPDFs.length / (validations.length + 2)) * 100)}
      <Modal show={isGenerating}>
        <Modal.Header>Génération du dossier en cours ... </Modal.Header>
        <Modal.Body>
          {generatedPDFs.length == 0  ? (
            <>
              <div className="loader-container my-4">
                <div className="dot-pulse m-auto"></div>
              </div>
            </>
          ) :
          <ProgressBar
            animated
            variant="secondary"
            min={0}
            max={100}
            now={Math.round(generatedPDFs.length / totalFiles) * 100}
          />  
        }
          
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ZipGenerator;
