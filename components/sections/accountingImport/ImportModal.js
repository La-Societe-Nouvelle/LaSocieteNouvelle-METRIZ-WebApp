import React from 'react';
import { Modal } from 'react-bootstrap';

const ImportModal = ({ show, onHide, title, children }) => {
  return (
    <Modal show={show} onHide={onHide} size='xl'>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ImportModal;

