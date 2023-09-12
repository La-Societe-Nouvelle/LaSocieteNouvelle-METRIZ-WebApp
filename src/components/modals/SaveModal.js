import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import { downloadSession } from "/src/utils/Utils";

const SaveModal = ({ session, showModal, handleClose, onSessionSaved }) => {
  const handleSaveSession = () => {
    downloadSession(session);
    onSessionSaved();
    handleClose();
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title as={"h6"}>Sauvegarder votre session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image
          src="/resources/up.png"
          alt=""
          className="d-block mx-auto"
        ></Image>
        <p className="small">
          Nous vous recommandons de sauvegarder votre analyse pour pouvoir{" "}
          <b>la réimporter </b> ultérieurement et <b>accéder à vos résultats</b>{" "}
          sans avoir à refaire l'analyse.
        </p>
        <p className="text-center">
          <Button variant="secondary" onClick={handleSaveSession}>
            <i className="bi bi-arrow-down"></i> Sauvegarder ma session
          </Button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default SaveModal;
