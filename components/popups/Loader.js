import React from "react";
import { Modal } from "react-bootstrap";

export const Loader = ({title}) => {
  return (
    <Modal show="true" size="md" centered>
      <Modal.Body>
        <p  className="text-center mt-4">Chargement en cours...</p>
        <div className="loader-container my-4">
          <div className="dot-pulse m-auto"></div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
