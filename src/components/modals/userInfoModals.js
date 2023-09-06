// La Société Nouvelle

// React
import React from "react";

// Icon
import { Button, Modal, Image } from "react-bootstrap";

/* ---------- USER INFORMATION MODALS ---------- */

export const SuccessFileModal = ({ showModal,message, title, closePopup }) => {
  return (
    <Modal show={showModal} onHide={closePopup} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h5"}>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Image
          src="illus/upload-success.svg"
          alt=""
          height={140}
          className="mx-auto d-block"
        />
        <p className="text-center fw-bold my-1">
          Le fichier a bien été importé !
        </p>
        <p className="small text-center">{message}</p>

        <p className="text-center mt-4">
          <button className="btn btn-primary " onClick={closePopup}>
            Fermer 
          </button>
        </p>
      </Modal.Body>
    </Modal>
  );
};
export const ErrorFileModal = ({ showModal, title, errorMessage, onClose }) => {
  return (
    <Modal show={showModal} onHide={onClose} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image
          src="illus/error-file.svg"
          alt="error image"
          height={60}
          className="mx-auto mb-3 d-block"
        />
        <h6 className="text-center">{title}</h6>
        <p className="text-center small">{errorMessage}</p>
        <div className="text-center">
          <Button variant="primary" size="md" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const InfoModal = ({ showModal, title, message, onClose }) => {
  return (
    <Modal show={showModal} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="small">{message}</p>
      </Modal.Body>
    </Modal>
  );
};

export const ErrorAPIModal = ({ hasError, onClose }) => {
  return (
    <Modal show={hasError} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>Service temporairement indisponible</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image
          src="illus/503.svg"
          alt="error image"
          height={200}
          className="mx-auto my-1 d-block"
        />
        <p className="small ">
          Nous rencontrons actuellement des problèmes avec notre service.
          Veuillez réessayer plus tard. Si le problème persiste, n'hésitez pas à{" "}
          <a
            href="mailto:support@lasocietenouvelle.org"
            className="fw-bold text-decoration-underline"
          >
            nous contacter
          </a>{" "}
          pour obtenir de l'assistance.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="md" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
