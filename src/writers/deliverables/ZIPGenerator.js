import React, { useState, useEffect } from "react";
import jsZip from "jszip";
import { Button, Modal, ProgressBar } from "react-bootstrap";
import { createIndicReport } from "./indicReportPDF";
// Meta
import metaIndics from "/lib/indics";
import jsPDF from "jspdf";
import { generateFootprintPDF } from "../Export";
import { PDFDocument } from "pdf-lib";
import { createIntensIndicatorPDF } from "./intensIndicPDF";
import { createContribIndicatorPDF } from "./contribIndicPDF";
import { createCoverPage } from "./coverPage";
import { createIndiceIndicatorPDF } from "./indiceIndicPDF";

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

  async function generatePDFs() {
    const documentTitle =
      "Empreinte-Societale_" +
      session.legalUnit.corporateName.replaceAll(" ", "") +
      "_" +
      session.year;

    // Initialiser l'objet jsZip
    // Générer les PDFs et les ajouter au zip

    const coverPage = createCoverPage(
      session.year,
      session.legalUnit.corporateName
    );
    const basicPDFpromises = [];
    const reportPDFpromises = [];

    validations.map((indic) => {
      let type = metaIndics[indic].type;

      basicPDFpromises.push(
        createIndicReport(
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
      );

      switch (type) {
        case "proportion":
          reportPDFpromises.push(
            createContribIndicatorPDF(
              metaIndics[indic].libelle,
              year,
              legalUnit,
              indic,
              financialData,
              comparativeData,
              false
            )
          );
          break;
        case "intensité":
          reportPDFpromises.push(
            createIntensIndicatorPDF(
              year,
              legalUnit,
              indic,
              metaIndics[indic].libelle,
              metaIndics[indic].unit,
              financialData,
              comparativeData,
              comparativeData.netValueAdded.trendsFootprint.indicators[indic]
                .meta.label,
              false
            )
          );
          break;
        case "indice":
          reportPDFpromises.push(
            createIndiceIndicatorPDF(
              metaIndics[indic].libelle,
              metaIndics[indic].libelleGrandeur,
              year,
              legalUnit,
              indic,
              metaIndics[indic].unit,
              financialData,
              comparativeData,
              comparativeData.netValueAdded.trendsFootprint.indicators[indic]
                .meta.label,
              false
            )
          );
        default:
          break;
      }
    });

    const mergedPromises = [
      coverPage,
      ...reportPDFpromises,
      ...basicPDFpromises,
    ];
    setGeneratedPDFs((prevPDFs) => [...prevPDFs, mergedPromises]);

    Promise.all(mergedPromises)
      .then(async (pdfs) => {
        // Create a new empty PDF document to merge PDFs together
        let mergedPdfDoc = await PDFDocument.create();

        // Add each PDF to the final PDF document
        for (const pdf of pdfs) {
          const pdfBytes = await pdf.arrayBuffer();

          const pdfDoc = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdfDoc.copyPages(
            pdfDoc,
            pdfDoc.getPageIndices()
          );
          copiedPages.forEach((page) => mergedPdfDoc.addPage(page));

          setGeneratedPDFs((prevPDFs) => [...prevPDFs, pdf]);
        }
        const mergedPdfBytes = await mergedPdfDoc.save();

        zip.file(documentTitle + ".pdf", mergedPdfBytes, { binary: true });

        const envIndic = ["ghg", "nrg", "wat", "mat", "was", "haz"];
        const seIndic = ["eco", "art", "soc", "idr", "geq", "knw"];

        const seOdds = ["5", "8", "9", "10", "12"];
        const envOdds = ["6", "7", "12", "13", "14", "15"];

        // Create Social FootPrint Report PDF

        const docEES = new jsPDF("landscape", "mm", "a4", true);

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
          "Rapport_Empreinte-Societale_SIG_" +
            legalUnit.replaceAll(" ", "") +
            ".pdf",
          docEES.output("blob")
        );

        // add .json file save
        const sessionFile = "session-metriz-" + legalUnit.replaceAll(" ", "-");
        const json = JSON.stringify(session);

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
              "Empreinte-Societale_" + legalUnit + "_" + year + ".zip"
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
      <Modal show={isGenerating}>
        <Modal.Header>Génération du dossier en cours ... </Modal.Header>
        <Modal.Body>
          {console.log(generatedPDFs)}
          {generatedPDFs.length == 0 ? (
            <>
              <div className="loader-container my-4">
                <div className="dot-pulse m-auto"></div>
              </div>
            </>
          ) : (
            <ProgressBar
              animated
              variant="secondary"
              min={0}
              max={100}
              now={Math.round(generatedPDFs.length / totalFiles) * 100}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ZipGenerator;
