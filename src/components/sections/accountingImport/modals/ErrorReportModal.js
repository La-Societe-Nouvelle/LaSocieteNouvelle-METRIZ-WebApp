// La Société Nouvelle

// React
import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

// Utils
import { sendReportToSupport } from "/pages/api/mail-api";

/* ---------- ERROR REPORT MODAL  ---------- */

/** Modal for FEC reading errors
 * 
 */

export const ErrorReportModal = ({ 
  hasError, 
  onClose, 
  errorMessage, 
  errors 
}) => {

  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSend, setIsSend] = useState(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const sendErrorReport = async () => {
    const res = await sendReportToSupport(errors, email, comment);
    setIsSend(res.status < 300);
  };

  return (
    <Modal show={hasError} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Erreur lors du traitement du FEC</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <p className="fw-bold">{errorMessage}</p>
          {errors.length > 0 && (
            <>
            <Alert variant="danger">
              <ul className="small list-unstyled">
                {errors.map((error, index) => (
                  <li key={index}>&raquo; {error}</li>
                ))}
              </ul>
            </Alert>
            </>
          )}
        <hr />
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
           size="sm"
            type="text"
            value={email}
            onChange={handleEmailChange}
          />
        </Form.Group>
        <Form.Group className="my-3">
          <Form.Label>Commentaires</Form.Label>
          <Form.Control
           size="sm"
            as="textarea"
            value={comment}
            onChange={handleCommentChange}
          />
        </Form.Group>
        <p className="small">
          N'hésitez pas à indiquer votre adresse e-mail si vous souhaitez être
          recontacté ultérieurement et/ou ajouter un commentaire.
        </p>
        {isSend === true && (
          <p className="small alert alert-success mb-2">
            Le rapport d'erreur a bien été envoyé.
          </p>
        )}
        {isSend === false && (
          <p className="small alert alert-danger mb-2">
            Échec lors de l'envoi du rapport d'erreur. Si le problème persiste,
            veuillez contacter directement le support :
            support@lasocietenouvelle.org.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
        <Button variant="primary" onClick={sendErrorReport}>
          Envoyer un rapport d'erreur
        </Button>
      </Modal.Footer>
    </Modal>
  );
}