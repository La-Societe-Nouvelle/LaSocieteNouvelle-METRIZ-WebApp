import { Button, Modal } from "react-bootstrap";

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

const SummaryModal = ({ formData, showModal, handleClose }) => {


    const [isSend, setIsSend] = useState(false);
    const [error, setError] = useState(false);


  const indicatorsToPublish = Object.entries(formData.footprint)
    .filter(([_, indicator]) => indicator.toPublish === true)
    .map(([indicator, values]) => ({ indicator, values }));

  const exportStatement = () => {
    // build pdf
    const statementPDF = getStatementPDF(
      formData.siren,
      formData.corporateName,
      formData.year,
      formData.declarant,
      formData.declarantOrganisation,
      formData.price,
      indicatorsToPublish
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
      // build PDF
      const statementPDF = getStatementPDF(
        formData.siren,
        formData.corporateName,
        formData.year,
        formData.declarant,
        formData.declarantOrganisation,
        formData.price,
        indicatorsToPublish
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
        indicatorsToPublish,
        formData.declarant,
        formData.declarantOrganisation,
        formData.email,
        formData.price
      );

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

      if (resAdmin.status == 200 && resDeclarant.status == 200) {
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
            <b>Indicateurs: </b>
          </p>
          <ul className="list-unstyled small">
            {indicatorsToPublish.map(({ indicator, values }) => (
              <li key={indicator} className="mb-2">
                ▪ {metaIndics[indicator].libelle}
              </li>
            ))}
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
            <p>Demande de publication envoyée ! Merci.</p>
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

export default SummaryModal;
