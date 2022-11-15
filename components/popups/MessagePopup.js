// La Société Nouvelle

// React
import React from "react";

// Icon
import { Modal } from "react-bootstrap";

/* ---------- MESSAGE POP-UP ---------- */

export const MessagePopup = ({ message, closePopup, type }) => {
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
   
      <Modal.Body>
        <p className="text-center">
          {type == "success" && (
            <i className="display-3 success bi bi-check-circle"></i>
          )}
        </p>
        <p className="h3 text-center my-1">{message}</p>
        <p className="text-center mt-4">
          <button className="btn btn-primary" onClick={closePopup}>
            Valider
          </button>
        </p>
      </Modal.Body>
    </Modal>
  );
};

export const MessagePopupErrors = ({ title, message, errors, closePopup }) => {
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
      <Modal.Header >
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="message">
          <p>{message}</p>
          {errors && errors.map((error, index) => <p key={index}>{error}</p>)}
        </div>
      </Modal.Body>
    </Modal>
  );
};
