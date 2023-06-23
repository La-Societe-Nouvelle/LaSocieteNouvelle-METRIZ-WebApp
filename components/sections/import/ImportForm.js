import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Alert,
  Button,
  Col,
  Form,
  FormGroup,
  FormLabel,
  Image,
  Row,
} from "react-bootstrap";
import { ErrorModal, SuccessModal } from "../../popups/MessagePopup";

const ImportForm = (props) => {
  const [errorFile, setErrorFile] = useState(false);

  const [disabled, setDisabled] = useState(true);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: ".txt, .csv",
      acceptMessage: "Le fichier doit être au format .txt ou .csv.",
      multiple: false,
      onDrop: (acceptedFiles) => {
        props.uploadFile(acceptedFiles[0]);
      },
    });

  useEffect(() => {
    const hasAcceptedFiles = acceptedFiles.length > 0;
    const hasFileRejections = fileRejections.length > 0;
    const hasValidCorporateName = props.corporateName !== "";

    setErrorFile(hasFileRejections);
    setDisabled(
      !(hasAcceptedFiles && hasValidCorporateName && !hasFileRejections)
    );

  }, [acceptedFiles, fileRejections, props.corporateName]);

  const acceptedFileItems = acceptedFiles.map((file) => (
    <p key={file.path} className="small">
      {file.path} 
    </p>
  ));

  const fileRejectionItems = fileRejections.map(({ file }) => (
    <>
      <p key={file.path} className="">
        Le fichier doit être au format .txt ou .csv uniquement.
      </p>
    </>
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
        />
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
          />
        </FormGroup>
        <FormGroup className="my-3">
          <FormLabel>
            <label>Fichier comptable FEC*</label>
          </FormLabel>
          <div className="form-text">
            <p>
              L'importation des écritures comptables s'effectue via un Fichier
              d'Ecritures Comptables (FEC¹). Générez ce fichier
              <b>
                à partir de votre logiciel comptable, ou demandez-le auprès de
                votre service comptable.
              </b>
            </p>
          </div>

          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p>
              <i className="bi bi-file-arrow-up-fill"></i> Glisser votre fichier
              ici
            </p>
            <p className="small">OU</p>
            <p className="btn btn-primary">Sélectionner votre fichier</p>
          </div>
   
          {errorFile && (
            <ErrorModal
              errorFile={errorFile}
              onClose={() => setErrorFile(false)}
              errorMessage={"Le fichier que vous avez importé ne respecte pas les critères requis :"}
              error={fileRejectionItems[0]}
              title={"Format de fichier incorrect"}
            />
          )}

          {acceptedFileItems.length > 0 && (
            <div className="border small rounded border-1 border-light p-4 mb-3">
               <p className="fw-bold"> Le Fichier d'Ecritures Comptables suivant va être analysé :{" "}</p>
              <Alert variant="info">
            
                {acceptedFileItems}</Alert>

            </div>
          )}

          <p className="small fst-italic mb-2">*Champs obligatoires</p>
          <p className="small fst-italic">
            ¹ Le fichier doit respecter les normes relatives à la structure du
            fichier (libellés des colonnes, séparateur tabulation ou barre
            verticale, encodage ISO 8859-15, etc.).
          </p>
        </FormGroup>

        <div className="text-end">
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={props.onClick}
          >
            Suivant <i className="bi bi-chevron-right"></i>
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default ImportForm;
