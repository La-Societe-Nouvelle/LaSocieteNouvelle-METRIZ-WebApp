import { Modal } from "bootstrap";
import { AssessmentDIS } from "/components/assessments/AssessmentDIS";
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentGHG } from "/components/assessments/AssessmentGHG"; 

import React from 'react'



// Display the correct assessment view according to the indicator
 function ModalAssesment(props) {
  return (
    <Modal
      show={props.popUp == props.indic}
      onHide={props.handleClose}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(() => {
          switch (props.indic) {
            case "dis":
              return <AssessmentDIS {...props} />;
            case "geq":
              return <AssessmentDIS {...props} />;
            case "knw":
              return <AssessmentKNW {...props} />;
            case "ghg":
              return <AssessmentGHG {...props} />;
            case "nrg":
              return <AssessmentNRG {...props} />;
            default:
              return <div></div>;
          }
        })()}
      </Modal.Body>
    </Modal>
  );
}

export default ModalAssesment
