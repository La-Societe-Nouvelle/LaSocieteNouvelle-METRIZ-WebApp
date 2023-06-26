import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";

import ImportForm from "./ImportForm";
import DepreciationAssetsMapping from "./DepreciationAssetsMapping";
import { FinancialDatas } from "./FinancialDatas";
import { StockPurchasesMapping } from "./StockPurchasesMapping";

// MODAL
import ErrorReportModal from "../../popups/ErrorReportModal";
import { ErrorModal } from "../../popups/MessagePopup";
import { FECImport } from "./FECImport";

// UTILS
import { buildRegexFinancialPeriod } from "/src/Session";
import { FECDataReader, FECFileReader } from "/src/readers/FECReader";

const ImportSection = (props) => {
  const [corporateName, setCorporateName] = useState(
    props.session.legalUnit.corporateName || ""
  );
  const [file, setFile] = useState(null);
  const [importedData, setImportedData] = useState(null);
  const [view, setView] = useState(
    props.session.financialData.isFinancialDataLoaded ? 4 : 0
  );
  const [errorFile, setErrorFile] = useState(false);
  const [errorFEC, setErrorFEC] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [isImported, setIsImported] = useState(false);

  const handeCorporateName = (corporateName) => {
    props.session.legalUnit.corporateName = corporateName;
    setCorporateName(corporateName);
  };

  const handleFile = (file) => {
    setErrorFEC(false);
    setErrors([]);
    setFile(file);
  };

  useEffect(() => {
    setIsImported(importedData !== null);
  }, [importedData]);

  // Function to go to the next view based on the current view
  const nextView = (currentView) => {
    if (currentView === 1) {
      const accountsToMap = Object.keys(importedData.meta.accounts).filter(
        (accountNum) =>
          /^28/.test(accountNum) ||
          /^29/.test(accountNum) ||
          /^39/.test(accountNum)
      );
      setView(accountsToMap.length > 0 ? 2 : 3);
    } else if (currentView === 2) {
      const stocksAccounts = Object.keys(importedData.meta.accounts).filter(
        (accountNum) => /^3(1|2|7)/.test(accountNum)
      );
      setView(stocksAccounts.length > 0 ? 3 : 0);
    }
  };

  // Function to import FEC file
  const importFECFile = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const FECData = await FECFileReader(reader.result);
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
      reader.readAsText(file, "iso-8859-1");
    } catch (error) {
      setErrorFEC(true);
      setErrorMessage(error);
    }
  };

  const loadFECData = async (importedData) => {
    const FECData = await FECDataReader(importedData);
    console.log("--------------------------------------------------");
    console.log("Lecture des écritures comptables");
    console.log(FECData);
    if (FECData.errors.length > 0) {
      FECData.errors.forEach((error) => console.log(error));
      setView(0);
      setErrorFEC(true);
      setErrorMessage("Erreur(s) relevée(s) :");
      setErrors(FECData.errors);
      setImportedData(null);
    } else {
      const financialPeriod = getFinancialPeriodFECData(FECData);
      const monthPeriods = getMonthPeriodsFECData(FECData);
      const periods = [financialPeriod, ...monthPeriods];

      props.session.addPeriods(periods);
      props.session.financialPeriod = financialPeriod;
      await props.session.financialData.loadFECData(
        FECData,
        financialPeriod,
        periods
      );

      props.session.impactsData[
        financialPeriod.periodKey
      ].knwDetails.apprenticeshipTax = FECData.KNWData.apprenticeshipTax;
      props.session.impactsData[
        financialPeriod.periodKey
      ].knwDetails.vocationalTrainingTax =
        FECData.KNWData.vocationalTrainingTax;

      props.session.progression = 1;
      setView(4);
    }
  };

  const getFinancialPeriodFECData = (FECData) => {
    const financialPeriod = {
      dateStart: FECData.firstDate,
      dateEnd: FECData.lastDate,
      periodKey: "FY" + FECData.lastDate.substring(0, 4),
      regex: buildRegexFinancialPeriod(FECData.firstDate, FECData.lastDate),
    };

    return financialPeriod;
  };

  const getMonthPeriodsFECData = (FECData) => {
    return [];
  };

  return (
    <Container fluid>
      <section className="step">
        <h2 className="mb-2">Etape 1 - Importez vos flux comptables</h2>
        {view === 0 && (
          <ImportForm
            onChangeCorporateName={handeCorporateName}
            uploadFile={handleFile}
            corporateName={corporateName}
            onClick={() => importFECFile(file)}
            isDataImported={isImported}
            nextStep={() => setView(2)}
          />
        )}

        {errorFEC && (
          <ErrorReportModal
            errorFEC={errorFEC}
            onClose={() => setErrorFEC(false)}
            errorMessage={errorMessage}
            errors={errors}
          />
        )}

        {errorFile && (
          <ErrorModal
            errorFile={errorFile}
            onClose={() => setErrorFile(false)}
            errorMessage={
              "Une erreur est survenue lors de l'analyse du fichier :"
            }
            error={errorMessage}
            title={"Fichier non conforme"}
          />
        )}

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
};

export default ImportSection;
