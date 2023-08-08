// La Société Nouvelle

// React
import React from "react";

// Icon
import { Button, Modal, Image } from "react-bootstrap";

/* ---------- MESSAGE POP-UP ---------- */

export const SuccessFileModal = ({ message, title,closePopup }) => {
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
      <Modal.Header closeButton>
      <Modal.Title as={"h5"}>
       {title}
        </Modal.Title>

      </Modal.Header>

      <Modal.Body>
        <Image
          src="illus/upload.svg"
          alt=""
          height={140}
          className="mx-auto d-block"
        />
        <p className="text-center fw-bold my-1">
          Le fichier a bien été importé !
        </p>
        <p className="small text-center">
        {message}
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
