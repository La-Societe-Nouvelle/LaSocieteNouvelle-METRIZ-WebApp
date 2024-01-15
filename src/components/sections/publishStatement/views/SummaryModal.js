import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { printValue } from "/src/utils/formatters";

// Lib
import metaIndics from "/lib/indics";

// Api
import {
  sendStatementToAdmin,
  sendStatementToDeclarant,
} from "/pages/api/mail-api";

// Utils
import { getShortCurrentDateString } from "../../../../utils/periodsUtils";
import { mailToAdminWriter, mailToDeclarantWriter } from "../utils";

// Writers
import { getStatementPDF } from "/src/writers/StatementPDFBuilder";
import { sendPublications } from "../../../../services/PublicationService";

// Services

const SummaryModal = ({ formData, showModal, handleClose }) => {
  const [isSend, setIsSend] = useState(false);
  const [error, setError] = useState(false);

  const publishableFootprint = buildPublication(formData.footprint);

  const exportStatement = () => {
    // build pdf
    const statementPDF = getStatementPDF(
      formData.siren,
      formData.corporateName,
      formData.year,
      formData.declarant,
      formData.declarantOrganisation,
      formData.price,
      publishableFootprint
    );

    let today = new Date();

    statementPDF.download(
      "declaration_" +
        formData.siren +
        "-" +
        String(today.getDate()).padStart(2, "0") +
        String(today.getMonth() + 1).padStart(2, "0") +
        today.getFullYear() +
        ".pdf"
    );
  };
  const handlePublish = async () => {
    try {
      const publications = {
        siren: formData.siren,
        footprint: publishableFootprint,
        year: formData.year,
      };

      const response = await sendPublications(publications);
      //   // build PDF
      const statementPDF = getStatementPDF(
        formData.siren,
        formData.corporateName,
        formData.year,
        formData.declarant,
        formData.declarantOrganisation,
        formData.price,
        publishableFootprint
      );

      const statementFilePromise = new Promise((resolve, reject) => {
        statementPDF.getBase64((datauristring) => {
          resolve(datauristring);
        });
      });

      const statementFile = await statementFilePromise;

      const messageToAdmin = mailToAdminWriter(
        formData.siren,
        formData.corporateName,
        formData.year,
        publishableFootprint,
        formData.declarant,
        formData.declarantOrganisation,
        formData.email,
        formData.price
      );

      console.log(messageToAdmin);

      const resAdmin = await sendStatementToAdmin(
        messageToAdmin,
        statementFile
      );

      const messageToDeclarant = mailToDeclarantWriter(formData.declarant);

      const resDeclarant = await sendStatementToDeclarant(
        formData.email,
        messageToDeclarant,
        statementFile
      );

      if (
        response.status == 200 &&
        resAdmin.status == 200 &&
        resDeclarant.status == 200
      ) {
        setIsSend(true);
        setError(false);
      } else {
        setIsSend(false);
        setError(true);
      }
    } catch (error) {
      setIsSend(false);
      setError(true);
      console.error("Erreur lors de la soumission de la déclaration :", error);
    }

    //handleClose();
  };

  return (
    <Modal show={showModal} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Publier mon empreinte</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="mb-3 text-secondary">
          <i className="bi bi-list-check"></i> Récapitulatif
        </h5>

        <div>
          <p>
            <b>Siren : </b> {formData.siren} | <b>Année de l'exercice : </b>
            {formData.year}
          </p>
          <p>
            <b>Indicateurs à publier : </b>
          </p>
          <ul className="list-unstyled small">
            {Object.entries(publishableFootprint).map(
              ([indicator, details]) => (
                <li key={indicator} className="mb-2">
                  ▪ {details.libelle} : {details.value} {details.unit}
                </li>
              )
            )}
          </ul>{" "}
          <hr className="w-25"></hr>
          <p>
            <b>Fait le : </b>
            {getShortCurrentDateString()}
          </p>
          <p>
            <b>Déclarant : </b>
            {formData.declarant}
          </p>
          {formData.declarantOrganisation && (
            <p>
              <b>Structure déclarante :</b> {formData.declarantOrganisation}
            </p>
          )}
          <p>
            <b>Coût de la formalité : </b>
            {formData.price} €
          </p>
        </div>

        {isSend && (
          <div className="alert alert-success">
            <p>
              Votre demande de publication a bien été prise en compte. Un
              récapitulatif vient d'être envoyé à votre adresse e-mail. Nous
              vous remercions pour votre contribution !
            </p>
          </div>
        )}
        {error && (
          <div className="alert alert-danger">
            <p>
              Erreur lors de l'envoi de la publication. Si l'erreur persiste,
              contactez le support.
            </p>
          </div>
        )}

        <div className="text-end">
          <Button className={"me-2"} onClick={exportStatement}>
            <i className="bi bi-download"></i> Télécharger le récapitulatif
          </Button>

          <Button variant="secondary" onClick={handlePublish}>
            <i className="bi bi-arrow-up"></i> Envoyer pour publication
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const buildPublication = (legalUnitFootprint) => {
  return Object.entries(legalUnitFootprint)
    .filter(([_, footprint]) => footprint.toPublish === true) 
    .reduce((acc, [indicator, footprint]) => {
      acc[indicator] = {
        libelle: metaIndics[indicator].libelle,
        value: footprint.value,
        unit: metaIndics[indicator].unit,
        uncertainty: footprint.uncertainty,
        comment: footprint.comment || null,
        source : "La Société Nouvelle (via l'outil Metriz : https://metriz.lasocietenouvelle.org ) ",

      };
      return acc;
    }, {});
}

export default SummaryModal;
