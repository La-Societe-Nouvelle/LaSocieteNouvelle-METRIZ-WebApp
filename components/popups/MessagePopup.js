// La Société Nouvelle

// React
import React from "react";

// Icon
import { Modal } from "react-bootstrap";

/* ---------- MESSAGE POP-UP ---------- */

export const MessagePopup = ({ title, message, closePopup, type }) => {
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p
          className={
            type == "success" && "alert alert-success justify-content-start"
          }
        >
          {type == "success" && (
            <i className="bi bi-check-circle-fill me-1"></i>
          )}{" "}
          {message}
        </p>
      </Modal.Body>
    </Modal>
  );
};

export const MessagePopupErrors = ({ title, message, errors, closePopup }) => {
  console.log('test')
  return (
    <Modal show="true" onHide={closePopup} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="message">
          <p>{message}</p>
          {errors && errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};
