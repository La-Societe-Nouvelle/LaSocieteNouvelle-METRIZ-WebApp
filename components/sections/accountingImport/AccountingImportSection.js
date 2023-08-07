
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import FECImport from './FECImport';
import DepreciationAssetsMapping from './views/DepreciationAssetsMapping';
import { StockPurchasesMapping } from "./views/StockPurchasesMapping";
import {FinancialDatas} from './views/FinancialDatas';

// Readers
import { FECDataReader, FECFileReader } from "/src/readers/FECReader";

// Mail Report Error
import { sendReportToSupport } from "../../../pages/api/mail-api";

import { getFinancialPeriodFECData, getMonthPeriodsFECData } from "./utils";
import FinancialDataForm from './views/FinancialDataForm';


const AccountingImportSection = (props) => {
  const { session } = props;

  const [corporateName, setCorporateName] = useState(session.legalUnit.corporateName || "");
  const [siren, setSiren] = useState(session.legalUnit.siren || "");
  const [selectedDivision, setSelectedDivision] = useState(session.legalUnit.activityCode || "");
  const [file, setFile] = useState([]);
  const [importedData, setImportedData] = useState(null);
  const [view, setView] = useState(session.financialData.isFinancialDataLoaded ? 4 : 0);
  const [errorFile, setErrorFile] = useState(false);
  const [errorMail, setErrorMail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const handleCorporateName = (corporateName) => {
    session.legalUnit.corporateName = corporateName;
    setCorporateName(corporateName);
  };
  
  const handleSiren = async(siren) => {

    if (siren !== "" && /^[0-9]{9}$/.test(siren) && /^[^a-zA-Z]+$/.test(siren)) {
      await session.legalUnit.setSiren(siren);
      const divisionCode = session.legalUnit.activityCode.slice(0,2);
      session.comparativeData.activityCode = divisionCode;
      console.log(divisionCode)
      setSelectedDivision(divisionCode);
      setCorporateName(session.legalUnit.corporateName);
    }
    setSiren(siren);
  };
  const handleDivision = (division) => {
    session.legalUnit.activityCode = division;
    session.comparativeData.activityCode = division;
    setSelectedDivision(division);
  }
  const handleFile = (file) => {
    setErrorFile(false);
    setErrors([]);
    setFile(file);
  };
  
  const nextView = (currentView) => {
    if (currentView === 1) {
      let accountsToMap = Object.keys(importedData.meta.accounts).filter(
        (accountNum) => /^28/.test(accountNum) || /^29/.test(accountNum) || /^39/.test(accountNum)
      );
      if (accountsToMap.length > 0) {
        setView(2);
      } else {
        nextView(2);
      }
    } else if (currentView === 2) {
      let stocksAccounts = Object.keys(importedData.meta.accounts).filter(
        (accountNum) => /^3(1|2|7)/.test(accountNum)
      );
      if (stocksAccounts.length > 0) {
        setView(3);
      } else {
        loadFECData(importedData);
      }
    }
  };
  
  const importFECFile = async (file) => {
    let currentFile = file[0];
    let reader = new FileReader();
  
    reader.onload = async () => {
      try {
        let FECData = await FECFileReader(reader.result);
        console.log("--------------------------------------------------");
        console.log("Lecture du FEC");
        console.log(FECData.meta);
        console.log(FECData.books);
        setImportedData(FECData);
        setView(1);
      } catch (error) {
        console.log(error);
        setErrorFile(true);
        setErrorMessage(error);
      }
    };
  
    try {
      reader.readAsText(currentFile, "iso-8859-1");
    } catch (error) {
      setErrorFile(true);
      setErrorMessage(error);
    }
  };
  
  const loadFECData = async (importedData) => {
    let FECData = await FECDataReader(importedData);
    console.log("--------------------------------------------------");
    console.log("Lecture des écritures comptables");
    console.log(FECData);
    if (FECData.errors.length > 0) {
      FECData.errors.forEach((error) => console.log(error));
      setView(0);
      setErrorFile(true);
      setErrorMessage("Erreur(s) relevée(s) : ");
      setErrors(FECData.errors);
      setImportedData(null);
    } else {
      let financialPeriod = getFinancialPeriodFECData(FECData);
      let monthPeriods = getMonthPeriodsFECData(FECData);
      let periods = [financialPeriod, ...monthPeriods];
  
      session.addPeriods(periods);
      session.financialPeriod = financialPeriod;
      await session.financialData.loadFECData(FECData, financialPeriod, periods);
  
      session.impactsData[financialPeriod.periodKey].knwDetails.apprenticeshipTax =
        FECData.KNWData.apprenticeshipTax;
      session.impactsData[financialPeriod.periodKey].knwDetails.vocationalTrainingTax =
        FECData.KNWData.vocationalTrainingTax;
  
      session.progression = 1;
  
      setView(4);
    }
  };
  
  const sendErrorReport = async (errors) => {
    const res = await sendReportToSupport(errors);
  
    res.status < 300
      ? setErrorMail("✔ Le rapport d'erreur a bien été envoyé.")
      : setErrorMail(
          "✖ Echec lors de l'envoi du rapport d'erreur. Si le problème persiste, veuillez contacter le support."
        );
  };
  

  return (
    <Container fluid>
      <section className="step">
        <h2 className="mb-2">Etape 1 - Importez vos flux comptables</h2>
        {view === 0 && (
          <FinancialDataForm
            onChangeCorporateName={handleCorporateName}
            onChangeSiren={handleSiren}
            onChangeDivision={handleDivision}
            uploadFile={handleFile}
            corporateName={corporateName}
            siren={siren}
            selectedDivision={selectedDivision}
            onClick={() => importFECFile(file)}
            nextStep={() => setView(2)}
          />
        )}
        <Row className="my-3">
          {errorFile && (
            <Col lg={{ span: 7, offset: 5 }}>
              <hr></hr>
              <div className={"alert alert-danger"}>
                <div>
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
                      <p className="small alert alert-info mb-2">{errorMail}</p>
                    )}
                  </>
                )}
              </div>
            </Col>
          )}
        </Row>

        {view === 1 && (
          <FECImport
            return={() => setView(0)}
            FECData={importedData}
            onClick={() => nextView(1)}
          />
        )}

        {view === 2 && (
          <DepreciationAssetsMapping
            return={() => setView(1)}
            onClick={() => nextView(2)}
            meta={importedData.meta}
          />
        )}

        {view === 3 && (
          <StockPurchasesMapping
            return={() => setView(2)}
            onClick={() => loadFECData(importedData)}
            meta={importedData.meta}
          />
        )}

        {view === 4 && (
          <FinancialDatas
            {...props}
            return={() => setView(1)}
            reset={() => setView(0)}
          />
        )}
      </section>
    </Container>
  );
}

export default AccountingImportSection;

