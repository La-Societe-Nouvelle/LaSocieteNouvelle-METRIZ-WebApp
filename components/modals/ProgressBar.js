// La Société Nouvelle

// React
import React from "react";
import { Image, Modal } from "react-bootstrap";

/* ---------- FEC IMPORT POP-UP ---------- */

export const ProgressBar = ({ message, progression }) => {
  return (
    <Modal show="true" size="md" centered>
      <Modal.Header>
        <Modal.Title>{message}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
      <Image
          src="illus/sync.svg"
          alt=""
          height={140}
          className="mx-auto d-block mb-4"
        />
        <div className="progressbar">
          <div
            className="progression"
            style={{ width: `${progression}%` }}
          ></div>
        </div>
      </Modal.Body>
    </Modal>
  );

};
