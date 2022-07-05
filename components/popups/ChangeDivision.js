import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { exportIndicPDF } from "../../src/writers/Export";
import divisions from "/lib/divisions";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const ChangeDivision = (props) => {
  const [comparativeDivision, setComparativeDivision] = useState("00");

  const handleOnClick = () => {

    props.handleDownload(props.indic,comparativeDivision);

  }
  const changeComparativeDivision = async (event) => {

    let division = event.target.value;
    setComparativeDivision(division);
    console.log(division)
    props.handleDivision(division);
    props.handleClose
  };

  return (
    <Modal show="true" onHide={props.handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Sélectionnez une division pour ajouter des valeurs comparative</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Select size="sm" className="mb-4"
          value={comparativeDivision}
          onChange={changeComparativeDivision}
        >
          {Object.entries(divisions)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(([code, libelle]) => (
              <option key={code} value={code}>
                {code + " - " + libelle}
              </option>
            ))}
        </Form.Select>
        <Button
            variant="secondary"
            size="sm"
            onClick={handleOnClick}
          >
            Télécharger le rapport <i className="bi bi-download"></i>
          </Button>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeDivision;
