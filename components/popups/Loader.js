import React from "react";
import { Modal } from "react-bootstrap";

export const Loader = () => {
  return (
    <Modal show="true" size="md" centered>
      <Modal.Body>
        <h3  className="text-center mt-4">Récupération des données...</h3>
        <div className="loader-container my-4">
          <div className="dot-pulse m-auto"></div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
