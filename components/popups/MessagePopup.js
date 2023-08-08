// La Société Nouvelle

// React
import React from "react";

// Icon
import { Alert, Button, Modal, Image } from "react-bootstrap";

/* ---------- MESSAGE POP-UP ---------- */

export const FileImportSuccessPopup = ({ message, closePopup }) => {
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
      <Modal.Header closeButton></Modal.Header>

      <Modal.Body>
        <Image
          src="illus/upload.svg"
          alt=""
          height={140}
          className="mx-auto d-block"
        />
        <p className="fw-bold text-center my-1">
          Le fichier a bien été importé. {message}
        </p>

        <p className="text-center mt-4">
          <button className="btn btn-primary " onClick={closePopup}>
            Fermer la fenêtre
          </button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export const MessagePopupSuccess = ({ title, message, closePopup }) => {
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-success d-flex align-items-center">
          <i className="display-6 success bi bi-check-circle me-3"></i> {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="message">
          <p>{message}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const MessagePopupErrors = ({ title, message, closePopup }) => {
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger d-flex align-items-center">
          <i className="display-6 danger bi bi-x-circle-fill me-3"></i> {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="message">
          <p>{message}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const ErrorFileModal = ({ errorFile, title, errorMessage, onClose }) => {
  return (
    <Modal show={errorFile} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image
          src="illus/error.svg"
          alt="error image"
          height={120}
          className="mx-auto my-3 d-block"
        />
        <p className="  text-center ">{errorMessage}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="md" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const SuccessModal = ({
  success,
  title,
  message,
  alertMessage,
  onClose,
}) => {
  return (
    <Modal show={success} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="">{message}</p>
        <Alert variant="info">{alertMessage}</Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
