// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDropzone } from "react-dropzone";

// Bootstrap
import { Button, Col, Form, FormGroup, Image, Row } from "react-bootstrap";
import { customSelectStyles } from "../../../../config/customStyles";

// Lib
import divisions from "/lib/divisions";

// Readers
import { FECFileReader } from "/src/readers/FECReader";
import { ErrorFileModal } from "../../../modals/userInfoModals";

/* ---------- FEC IMPORT FORM ---------- */

/** View to import financial data (accounting data file)
 *
 *  Props :
 *    - onClick()
 *
 *  Read accounting data file
 *  Get informations :
 *    - company id (SIREN)
 *    - name
 *    - economic division
 */

// Division options
const divisionsOptions = Object.entries(divisions)
  .sort((a, b) => parseInt(a) - parseInt(b))
  .filter(([value]) => value !== "00")
  .map(([value, label]) => ({
    value: value,
    label: `${value} - ${label}`,
  }));

export function FinancialDataForm(props) {
  const [siren, setSiren] = useState(props.siren);
  const [corporateName, setCorporateName] = useState(props.corporateName || "");
  const [division, setDivision] = useState(props.division);

  const [files, setFiles] = useState([]);
  const [errorFile, setErrorFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setCorporateName(props.corporateName || "");
  }, [props.corporateName]);
  useEffect(() => {
    setDivision(props.division);
  }, [props.division]);

  // useEffect(() => {
  //   const isCorporateNameValid = props.corporateName && props.corporateName.trim() !== "";
  //   const isDivisionSelected = props.selectedDivision !== null;
  //   let isSirenValid = props.siren==="" || /^[0-9]{9}$/.test(props.siren); // not defined or valid pattern (9 figures)

  //   setFormValid(files.length>0 && isCorporateNameValid && isDivisionSelected && isSirenValid);
  // }, [props.corporateName, props.division, props.siren]);

  const isFormValid = () => {
    return (
      files.length > 0 &&
      corporateName &&
      division &&
      (siren === "" || /^[0-9]{9}$/.test(siren))
    );
  };

  // dropzone
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: ".txt, .csv",
      multiple: false,
      onDrop: (files) => {
        setErrorFile(false);
        setFiles(files);
      },
    });

  // on change - siren
  const handleSirenChange = async (event) => {
    setSiren(event.target.value);
    props.onChangeSiren(event.target.value);
  };

  // on change - corporate name
  const handleCorporateNameChange = (event) => {
    setCorporateName(event.target.value);
    props.onChangeCorporateName(event.target.value);
  };

  const handleDivisionChange = (selectedOption) => {
    const division = selectedOption.value;
    props.onChangeDivision(division);
  };

  //

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isFormValid()) {
      let FECData = await readFECFile(files[0]);
      if (FECData.valid) {
        props.setImportedData(FECData.data);
      } else {
        setErrorFile(true);
        setErrorMessage(FECData.error);
      }
    }
  };

  return (
    <Row>
      <Col lg={5}>
        <h3 className="subtitle">C'est parti !</h3>
        <Image
     
          fluid
          src="/illus/accountingImport.svg"
          alt="Financial Data Illustration"
        />
      </Col>
      <Col>
        <Form className="border-left">
          <Form.Group as={Row} className="my-3">
            <Form.Label column sm={4} className="fw-normal fst-italic">
              Numéro SIREN <i>(optionnel)</i> :
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                value={siren}
                onChange={handleSirenChange}
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
                value={corporateName}
                onChange={handleCorporateNameChange}
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
                value={
                  division
                    ? {
                        label: division + " - " + divisions[division],
                        value: division,
                      }
                    : null
                }
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
                <b>
                  à partir de votre logiciel comptable, ou demandez-le auprès de
                  votre service comptable.
                </b>
              </p>
            </div>
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <p>
                <i className="bi bi-file-arrow-up-fill"></i> Glisser votre
                fichier ici
              </p>
              <p className="small">OU</p>
              <p className="btn btn-primary">Selectionner votre fichier</p>
            </div>
            {/* Rejections */}
            {fileRejections.length > 0 && (
              <div className="alert alert-danger">
                <ul className="list-group list-unstyled">
                  {fileRejections.map(({ errors }) => (
                    <>
                      {errors.map((e) => (
                        <li key={e.code} className="">
                          <i className="bi bi-exclamation-triangle" />{" "}
                          L'extension du fichier doit être en .txt ou .csv
                        </li>
                      ))}
                    </>
                  ))}
                </ul>
              </div>
            )}
            {/* Files */}
            {acceptedFiles.length > 0 && (
              <div className="alert alert-info">
                <p className="font-weight-bold">Fichier à analyser :</p>
                {acceptedFiles.map((file) => (
                  <p key={file.path}>
                    <i className="bi bi-upload" /> {file.path}
                  </p>
                ))}
              </div>
            )}
            <p className="small fst-italic mb-0">*Champs obligatoires</p>
            <p className="small fst-italic">
              ¹ Le fichier doit respecter les normes relatives à la structure du
              fichier (libellés des colonnes, séparateur tabulation ou barre
              verticale, encodage ISO 8859-15, etc.).
            </p>
          </FormGroup>

          {errorFile && (
            <ErrorFileModal
              title={"Erreur lors de la lecture du FEC"}
              errorFile={errorFile}
              errorMessage={errorMessage}
              onClose={() => setErrorFile(false)}
            />
          )}

          <div className="text-end">
            <Button
              variant="secondary"
              disabled={!isFormValid()}
              onClick={handleSubmit}
            >
              Suivant
              <i className="bi bi-chevron-right" />
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
}

const readFECFile = async (file) => {
  let reader = new FileReader();
  try {
    reader.readAsText(file, "iso-8859-1");

    // Wait for the reader to finish loading the file
    await new Promise((resolve) => {
      reader.onload = resolve;
    });

    // Parse the file content
    let FECData = await FECFileReader(reader.result);

    console.log("--------------------------------------------------");
    console.log("Lecture du FEC");
    console.log(FECData.meta);
    console.log(FECData.books);

    return {
      valid: true,
      data: FECData,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      data: {},
      error,
    };
  }
};
