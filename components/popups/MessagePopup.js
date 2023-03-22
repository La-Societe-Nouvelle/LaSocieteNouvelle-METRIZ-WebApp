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
