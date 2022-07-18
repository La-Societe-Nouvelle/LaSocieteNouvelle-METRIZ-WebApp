import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  Button,
  Col,
  Form,
  FormGroup,
  FormLabel,
  Image,
  Row,
} from "react-bootstrap";

const ImportForm = (props) => {
  const [errorFile, setErrorFile] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (fileRejections.length > 0) {
      setErrorFile(true);
    }

    if (
      props.corporateName != "" &&
      errorFile == false &&
      acceptedFileItems.length > 0 
      ||
      props.isDataImported
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  });

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
    <ul>
      {errors.map((e) => (
        <li key={e.code}>
         <i className="bi bi-exclamation-triangle"></i> L'extention du
          fichier doit être en .txt ou .csv
        </li>
      ))}
    </ul>
  ));

  function handleChange(event) {
    props.onChangeCorporateName(event.target.value);
  }

  return (
    <Row>
      <Col>
        <h3 className="subtitle ">C'est parti !</h3>

        <Image
          fluid
          src="/resources/illu_financialData.svg"
          alt="Financial Data Illustration"
        ></Image>
      </Col>
      <Col>
        <FormGroup>
          <FormLabel>
            <label>Dénomination / Nom du projet *</label>
          </FormLabel>
          <Form.Control
            type="text"
            value={props.corporateName}
            onChange={handleChange}
          ></Form.Control>
        </FormGroup>
        <FormGroup className="my-3">
          <FormLabel>
            <label>Fichier comptable FEC*</label>
          </FormLabel>
          <div className="form-text">
            <p>
              L’importation des écritures comptables s’effectue via un Fichier
              d’Ecritures Comptables (FEC). Générez ce fichiers <b> à partir de votre logiciel comptable, ou demandez-le auprès de
                votre service comptable.
              </b>
            </p>
          </div>

          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p>
            <i className="bi bi-file-arrow-up-fill"></i> Glisser votre fichier ici
            </p>

            <p className="small-text">OU</p>
            <p className="btn btn-primary">Selectionner votre fichier</p>
          </div>

          {fileRejectionItems.length > 0 && (
            <div className="alert alert-error">
              <ul>{fileRejectionItems}</ul>
            </div>
          )}
          {acceptedFileItems.length > 0 && (
            <div className={"alert alert-info"}>
              <h4 className="h5">Fichier à analyser : </h4>
              {acceptedFileItems}
            </div>
          )}
          <p className="legend">
          Le fichier doit respecter les normes relatives à la structure du
            fichier (libellés des colonnes, séparateur tabulation ou barre
            verticale, encodage ISO 8859-15, etc.).
          </p>
        </FormGroup>
 
        <div className="text-end">
  
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => props.onClick()}
          >
            Suivant 
            <i className="bi bi-chevron-right"></i>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default ImportForm;
