import React from 'react';
import { Modal } from 'react-bootstrap';

const ImportModal = ({ show, onHide, title, children }) => {
  return (
    <Modal show={show} onHide={onHide} size='xl' centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="bi bi-file-earmark-spreadsheet"></i> {title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ImportModal;

