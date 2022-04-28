import React, {useState } from "react";

// Icons
import {
  faArrowTrendUp,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Components
import { Container } from "react-bootstrap";

// Views
import ImportForm from "./ImportForm";
import MappedAccounts from "./MappedAccounts";

import { FinancialDatas } from "./FinancialDatas";
// Readers
import { FECFileReader, FECDataReader } from "/src/readers/FECReader";
import { FECImport } from "./ANouveaux";

// Objects
import { FinancialData } from "/src/FinancialData";

function ImportSection(props) {
  //STATE
  const [corporateName, setCorporateName] = useState(
    props.session.legalUnit.corporateName || ""
  );
  const [file, setFile] = useState([]);
  const [importedData, setImportedData] = useState(null);
  const [view, setView] = useState(0);
  const [errorFile, setErrorFile] = useState(false);
  const [errorMail, setErrorMail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState([]);

  function handeCorporateName(corporateName) {
    setCorporateName(corporateName);
  }

  function handleFile(file) {
    setErrorFile(false);
    setErrors([]);
    setFile(file);
  }

  return (
    <Container fluid>
      <section className="step">
        <h2>
          <FontAwesomeIcon icon={faArrowTrendUp} /> &Eacute;tape 1 - Importez
          vos flux comptable
        </h2>

        {view == 0 && (
          <ImportForm
            onChangeCorporateName={handeCorporateName}
            uploadFile={handleFile}
            corporateName={corporateName}
            onClick={() => importFECFile(file)}
          ></ImportForm>
        )}

        {view == 1 && ( 
          <FECImport
            FECData={importedData}
            onClick={() => loadFECData(importedData)}
          />
        )}

        {view == 2 && <MappedAccounts meta={importedData.meta} />}
        {view == 3 && <FinancialDatas {...props} />}

        {errorFile && (
          <>
            <div className={"alert alert-error"}>
              <div>
                <h4>Erreur</h4>
                <p>{errorMessage}</p>
                {errors.map((error, index) => (
                  <p key={index}> - {error}</p>
                ))}
              </div>
            </div>
            <div>
              {errors.length > 0 && (
                <>
                  <button
                    className="btn btn-primary"
                    //onClick={() => this.sendErrorReport(errors)}
                  >
                    <FontAwesomeIcon icon={faExclamation} /> Envoyer un rapport
                    d'erreur
                  </button>

                  {errorMail && <p className="small-text">{errorMail}</p>}
                </>
              )}
            </div>
          </>
        )}
      </section>
    </Container>
  );

  /* ---------- FEC IMPORT ---------- */

  // Import FEC File

  function importFECFile(file) {
    let currentFile = file[0];
    let reader = new FileReader();

    reader.onload = async () =>
      // Action after file loaded
      {
        try {
          let FECData = await FECFileReader(reader.result); // read file (file -> JSON)
          setImportedData(FECData);
          setView(1);
        } catch (error) {
          setErrorMessage(error);
        } // show error(s) (file structure)
      };

    try {
      reader.readAsText(currentFile, "iso-8859-1"); // Read file
    } catch (error) {
      setErrorMessage(error);
    } // show error (file)
  }

  async function loadFECData(importedData) {
    let nextFinancialData = await FECDataReader(importedData); // read data from JSON (JSON -> financialData JSON)

    if (nextFinancialData.errors.length > 0) {
      // show error(s) (content)
      nextFinancialData.errors.forEach((error) => console.log(error));
      setView(0);
      setErrorFile(true);
      setErrorMessage("Erreur(s) relevée(s) : ");
      setErrors(nextFinancialData.errors);
      setImportedData(null);
    } else {
      // load year
      props.session.year = /^[0-9]{8}/.test(importedData.meta.lastDate)
        ? importedData.meta.lastDate.substring(0, 4)
        : "";

      // load financial data
      props.session.financialData = new FinancialData(nextFinancialData);
      props.session.financialData.companiesInitializer();
      props.session.financialData.initialStatesInitializer();

      // load impacts data
      props.session.impactsData.netValueAdded =
        props.session.financialData.getNetValueAdded();
      props.session.impactsData.knwDetails.apprenticeshipTax =
        nextFinancialData.KNWData.apprenticeshipTax;
      props.session.impactsData.knwDetails.vocationalTrainingTax =
        nextFinancialData.KNWData.vocationalTrainingTax;

      // update footprints
      props.session.updateFootprints();

      // update validations
      props.session.checkValidations();

      // update progression
      // props.session.progression = 2;

      setView(2);
      // update state
      //this.setState({ importedData: null });

      //props.submit();
    }
  }
}

export default ImportSection;
