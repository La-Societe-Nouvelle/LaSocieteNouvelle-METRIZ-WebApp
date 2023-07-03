import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import divisions from "/lib/divisions";

import {
  Button,
  Col,
  Form,
  FormGroup,
  Image,
  Row,
} from "react-bootstrap";
import { customSelectStyles } from "/src/utils/customStyles";

const FinancialDataForm = (props) => {

  const [errorFile, setErrorFile] = useState(false);
  const [divisionsOptions, setDivisionsOptions] = useState([]);
  const [isFormValid, setFormValid] = useState(false);

  useEffect(() => {
    if (fileRejections.length > 0) {
      setErrorFile(true);
    } else {
      setErrorFile(false);
    }


    const divisionsOptions = Object.entries(divisions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .filter(([value]) => value !== "00")
      .map(([value, label]) => ({
        value: value,
        label: `${value} - ${label}`,
      }));
    setDivisionsOptions(divisionsOptions);
  }, []);

  useEffect(() => {
 
    const isCorporateNameValid = props.corporateName.trim() !== "";
    const isDivisionSelected = props.selectedDivision !== null;

    let isSirenValid;
    if(props.siren !== "") {
      isSirenValid = /^[0-9]{9}$/.test(props.siren) &&
      /^[^a-zA-Z]+$/.test(props.siren);
    } else {
      isSirenValid = true;
    }
  
    setFormValid(isCorporateNameValid && isDivisionSelected && isSirenValid);
  }, [props.corporateName, props.selectedDivision, props.siren]);


  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: ".txt, .csv",
      multiple: false,
      onDrop: (acceptedfile) => {
        props.uploadFile(acceptedfile);
      },
    });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <p key={file.path}>
      <i className="bi bi-upload"></i> {file.path}
    </p>
  ));

  const fileRejectionItems = fileRejections.map(({ errors }) => (
    <>
      {errors.map((e) => (
        <li key={e.code} className="">
          <i className="bi bi-exclamation-triangle"></i> L'extension du fichier doit être en .txt ou .csv
        </li>
      ))}
    </>
  ));

  const handleChange = (event) => {
    props.onChangeCorporateName(event.target.value);
  };

  const handleSiren = (event) => {
    const siren = event.target.value;
    props.onChangeSiren(siren);
  };

  
  const handleDivisionChange = (selectedOption) => {
    const division = selectedOption.value;
    props.onChangeDivision(division);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isFormValid) {
      props.onClick();
    }
  };

  return (
    <Row>
      <Col lg={5}>
        <h3 className="subtitle">C'est parti !</h3>
        <Image fluid src="/resources/illu_financialData.svg" alt="Financial Data Illustration" />
      </Col>
      <Col>
        <Form className="border-left">
          <Form.Group as={Row} className="my-3">
            <Form.Label column sm={4} className="fw-normal fst-italic">
              Numéro SIREN  :
            </Form.Label>
            <Col sm={8}>
            <Form.Control
                type="text"
                value={props.siren}
                onChange={handleSiren}
                pattern="[0-9]{9}"
                required
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Dénomination / Nom du projet * :
            </Form.Label>
            <Col sm={8}>
            <Form.Control
                type="text"
                value={props.corporateName}
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>
          
          <Form.Group as={Row} className="my-3">
            <Form.Label column sm={4}>
              Branche d'activité * :
            </Form.Label>
            <Col sm={8}>
              <Select
                styles={customSelectStyles}
                options={divisionsOptions}
                components={{
                  IndicatorSeparator: () => null,
                }}
                placeholder="Selectionner une branche d'activité"
                onChange={handleDivisionChange}
                value={props.selectedDivision ? { label: props.selectedDivision + " - " + divisions[props.selectedDivision], value: props.selectedDivision } : null}
                required
              />
            </Col>
          </Form.Group>
          <FormGroup className="my-3">
            <Form.Label>Fichier d'Ecritures Comptables (FEC) *</Form.Label>
            <div className="form-text">
              <p>
                L'importation des écritures comptables s'effectue via un Fichier
                d'Ecritures Comptables (FEC¹). Générez ce fichier{" "}
                <b>à partir de votre logiciel comptable, ou demandez-le auprès de votre service comptable.</b>
              </p>
            </div>
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <p>
                <i className="bi bi-file-arrow-up-fill"></i> Glisser votre fichier ici
              </p>
              <p className="small">OU</p>
              <p className="btn btn-primary">Selectionner votre fichier</p>
            </div>
            {fileRejectionItems.length > 0 && (
              <div className="alert alert-danger">
                <ul className="list-group list-unstyled">
                  {fileRejectionItems}
                </ul>
              </div>
            )}
            {acceptedFileItems.length > 0 && (
              <div className="alert alert-info">
                <p className="font-weight-bold">Fichier à analyser :</p>
                {acceptedFileItems}
              </div>
            )}
            <p className="small fst-italic mb-0">*Champs obligatoires</p>
            <p className="small fst-italic">
              ¹ Le fichier doit respecter les normes relatives à la structure du
              fichier (libellés des colonnes, séparateur tabulation ou barre
              verticale, encodage ISO 8859-15, etc.).
            </p>
          </FormGroup>
          <div className="text-end">
            <Button
              variant="secondary"
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              Suivant
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
};

export default FinancialDataForm;
