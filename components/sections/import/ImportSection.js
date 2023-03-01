import React, { useEffect, useState } from "react";
// Components
import { Col, Container, Row } from "react-bootstrap";

// Views
import ImportForm from "./ImportForm";
import MappedAccounts from "./MappedAccounts";

import { FinancialDatas } from "./FinancialDatas";
// Readers
import { FECDataReader, FECFileReader } from "/src/readers/FECReader";

// Objects
import { FinancialData } from "/src/FinancialData";

// Mail Report Error
import { sendReportToSupport } from "../../../pages/api/mail-api";
import { FECImport } from "./FECImport";

function ImportSection(props) {
  //STATE
  const [corporateName, setCorporateName] = useState(
    props.session.legalUnit.corporateName || ""
  );
  const [file, setFile] = useState([]);
  const [importedData, setImportedData] = useState(null);
  const [view, setView] = useState(  props.session.progression > 1  ? 3 : 0);
  const [errorFile, setErrorFile] = useState(false);
  const [errorMail, setErrorMail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [isImported, setIsImported] = useState(false);

  function handeCorporateName(corporateName) {
    props.session.legalUnit.corporateName = corporateName;
    setCorporateName(corporateName);
  }

  function handleFile(file) {
    setErrorFile(false);
    setErrors([]);
    setFile(file);
  }

  useEffect(() => {
    if (importedData) {
      setIsImported(true);
    } else {
      setIsImported(false);
    }
  });

  return (
    <Container fluid>
      <section className="step">
        <h2 className="mb-2">Etape 1 - Importez vos flux comptables</h2>
        {view == 0 && (
          <ImportForm
            onChangeCorporateName={handeCorporateName}
            uploadFile={handleFile}
            corporateName={corporateName}
            onClick={() => importFECFile(file)}
            isDataImported={isImported}
            nextStep={() => setView(2)}
          ></ImportForm>
        )}
        <Row className="my-3">
          {errorFile && (
            <Col lg={{ span: 6, offset: 6 }}>
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
                      className="btn btn-secondary mb-2"
                      onClick={() => sendErrorReport(errors)}
                    >
                     Envoyer un rapport d'erreur
                    </button>

                    {errorMail && (
                      <p className="small alert alert-info mb-2">
                        {errorMail}
                      </p>
                    )}
                  </>
                )}
              </div>
            </Col>
          )}
        </Row>

        {view == 1 && (
          <FECImport
            return={() => setView(0)}
            FECData={importedData}
            onClick={() => setView(2)}
          />
        )}

        {view == 2 && (
          <MappedAccounts
            return={() => setView(1)}
            onClick={() => loadFECData(importedData)}
            meta={importedData.meta}
          />
        )}
        {view == 3 && <FinancialDatas {...props} return={() => setView(2)} reset={() => setView(0)} />}
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
          console.log(FECData);
          setImportedData(FECData);
          setView(1);
        } catch (error) {
          setErrorFile(true);
          setErrorMessage(error);
        } // show error(s) (file structure)
      };

    try {
      reader.readAsText(currentFile, "iso-8859-1"); // Read file
    } catch (error) {
      setErrorFile(true);
      setErrorMessage(error);
    } // show error (file)
  }

  async function loadFECData(importedData) 
  {
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
      props.session.financialPeriod = {
        dateStart: importedData.meta.firstDate,
        dateEnd: importedData.meta.lastDate
      }

      // load financial data
      props.session.financialData = new FinancialData(nextFinancialData);
      props.session.financialData.amortisableImmobilisationSetter();
      props.session.financialData.expensesAccountsBuilder(nextFinancialData.accounts);
      props.session.financialData.companiesInitializer();
      props.session.financialData.initialStatesInitializer();
      props.session.financialData.immobilisationsPhasesBuilder(props.session.financialPeriod);
      console.log("Here");
      props.session.financialData.adjustedAmortisationDataBuilder(props.session.financialPeriod);

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
      props.session.progression = 1;

      setView(3);
    }
  }

  // Send Errors

  async function sendErrorReport(errors) {
    const res = await sendReportToSupport(errors);

    res.status < 300
      ? setErrorMail("✔ Le rapport d'erreur a bien été envoyé.")
      : setErrorMail(
          "✖ Echec lors de l'envoi du rapport d'erreur. Si le problème persiste, veuillez contacter le support."
        );
  }
}

export default ImportSection;
