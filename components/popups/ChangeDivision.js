import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Select from "react-select";

import divisions from "/lib/divisions";

const ChangeDivision = (props) => {
  const [comparativeDivision, setComparativeDivision] = useState("00");

  const handleOnClick = () => {
    props.handleDownload(props.indic, comparativeDivision);
  };
  const changeComparativeDivision = async (event) => {
    let division = event.value;
    setComparativeDivision(division);
    await props.handleDivision(division);
  };

  const divisionsOptions = [];

  //Divisions select options
  Object.entries(divisions)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(([value, label]) =>
      divisionsOptions.push({ value: value, label: value + " - " + label })
    );

  return (
    <Modal show="true" onHide={props.handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Sélectionnez un secteur d'activité pour ajouter des valeurs
          comparatives
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Select
          className="mb-3 small"
          placeholder={"Choisissez un secteur d'activité"}
          options={divisionsOptions}
          onChange={changeComparativeDivision}
        />

        <Button variant="secondary" size="sm" onClick={handleOnClick}>
          Télécharger le rapport <i className="bi bi-download"></i>
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeDivision;
