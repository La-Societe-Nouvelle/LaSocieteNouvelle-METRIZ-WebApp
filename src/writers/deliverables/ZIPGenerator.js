import React, { useState, useEffect } from "react";
import jsZip from "jszip";
import { Button, Modal, ProgressBar } from "react-bootstrap";
import { basicPDFReport } from "./PDFGenerator";
// Meta
import metaIndics from "/lib/indics";

const ZipGenerator = ({
  validations,
  financialData,
  impactsData,
  comparativeData,
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
    setIsGenerating(true);
  }

  function generatePDFs() {
    // Initialiser l'objet jsZip
    // Générer les PDFs et les ajouter au zip
    Promise.all(
      validations.map((indic) =>
        basicPDFReport(
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
          zip.file(`${validations[index]}.pdf`, pdf, {
            binary: true,
          });

          setGeneratedPDFs((prevPDFs) => [...prevPDFs, pdf]);
        });
      })
      .then(() => {
        // Télécharger le zip une fois que tous les PDFs ont été ajoutés
        zip
          .generateAsync({ type: "blob" })
          .then((content) => {
            // Télécharger le zip
            saveAs(content, "pdfs.zip");
          })
          .finally(() => {
            // Masquer le modal et réinitialiser l'état
            setIsGenerating(false);
            setGeneratedPDFs([]);
            setZip(null);
          });
      });
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleGeneratePDFs}>
        <i className="bi bi-download"></i>
        Télécharger
      </Button>
      <Modal show={isGenerating}>
        {console.log((generatedPDFs.length / validations.length) * 100)}
        <Modal.Header>Génération en cours</Modal.Header>
        <Modal.Body>
          <ProgressBar
            animated
            variant="secondary"
            min={0}
            max={100}
            now={(generatedPDFs.length / validations.length) * 100}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ZipGenerator;
