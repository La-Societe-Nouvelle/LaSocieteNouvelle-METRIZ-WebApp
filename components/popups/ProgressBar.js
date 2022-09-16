// La Société Nouvelle

// React
import React from "react";
import { Modal } from "react-bootstrap";

/* ---------- FEC IMPORT POP-UP ---------- */

export const ProgressBar = ({ message, progression }) => {
  return (
    <Modal show="true" size="md" centered>
      <Modal.Header>
        <Modal.Title>{message}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="progressbar">
          <div
            className="progression"
            style={{ width: `${progression}%` }}
          ></div>
        </div>
      </Modal.Body>
    </Modal>
  );
  // return (
  // <div className="popup-container">
  //   <div className="popup-inner">
  //     <h3>{message}</h3>
  //     <div className="progressbar">
  //       <svg className="progressbar_shape">
  //         <rect width={progression+'%'}/>
  //       </svg>
  //     </div>
  //   </div>
  // </div>)
};
