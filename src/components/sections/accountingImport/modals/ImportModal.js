// La Société Nouvelle

// React
import React from 'react';
import { Modal } from 'react-bootstrap';

export const ImportModal = ({ 
  show, 
  onHide,
  title,
  fileName,
  children 
}) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
          <Modal.Title className="flex-grow-1 ">
            {title} 
          </Modal.Title>
          <p className="m-0 pe-3 text-end">
            <i className="bi bi-file-earmark-spreadsheet"></i> {fileName}
          </p>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}