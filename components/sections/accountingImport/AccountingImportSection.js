import React, { useState } from "react";
import { Container } from "react-bootstrap";


// Views
import FinancialDataForm from "./views/FinancialDataForm";
import FECImport from "./views/FECImport";
import DepreciationAssetsMapping from "./views/DepreciationAssetsMapping";
import { StockPurchasesMapping } from "./views/StockPurchasesMapping";
import { FinancialDatas } from "./views/FinancialDatas";

// Readers
import { FECDataReader, FECFileReader } from "/src/readers/FECReader";

// Utils
import { getFinancialPeriodFECData, getMonthPeriodsFECData } from "./utils";

// Modals
import ErrorReportModal from "../../popups/ErrorReportModal";
import { ErrorFileModal } from "../../popups/MessagePopup";

const AccountingImportSection = (props) => {
  const { session } = props;

  const [corporateName, setCorporateName] = useState(
    session.legalUnit.corporateName || ""
  );
  const [siren, setSiren] = useState(session.legalUnit.siren || "");
  const [selectedDivision, setSelectedDivision] = useState(
    session.legalUnit.activityCode || ""
  );
  const [file, setFile] = useState([]);
  const [importedData, setImportedData] = useState(null);
  const [view, setView] = useState(
    session.financialData.isFinancialDataLoaded ? 4 : 0
  );
  const [errorFEC, setErrorFEC] = useState(false);
  const [errorFile, setErrorFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const handleCorporateName = (corporateName) => {
    session.legalUnit.corporateName = corporateName;
    setCorporateName(corporateName);
  };

  const handleSiren = async (siren) => {
    if (
      siren !== "" &&
      /^[0-9]{9}$/.test(siren) &&
      /^[^a-zA-Z]+$/.test(siren)
    ) {
      await session.legalUnit.setSiren(siren);
      const divisionCode = session.legalUnit.activityCode.slice(0, 2);
      session.comparativeData.activityCode = divisionCode;
      console.log(divisionCode);
      setSelectedDivision(divisionCode);
      setCorporateName(session.legalUnit.corporateName);
    }
    setSiren(siren);
  };
  const handleDivision = (division) => {
    session.legalUnit.activityCode = division;
    session.comparativeData.activityCode = division;
    setSelectedDivision(division);
  };
  const handleFile = (file) => {
    setErrorFEC(false);
    setErrorFile(false);
    setErrors([]);
    setFile(file);
  };

  const nextView = (currentView) => {
    if (currentView === 1) {
      let accountsToMap = Object.keys(importedData.meta.accounts).filter(
        (accountNum) =>
          /^28/.test(accountNum) ||
          /^29/.test(accountNum) ||
          /^39/.test(accountNum)
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

    try {
      reader.readAsText(currentFile, "iso-8859-1");

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

      setImportedData(FECData);
      setView(1);
    } catch (error) {
      console.log(error);
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
      setErrorFEC(true);
      setErrorMessage("Erreur(s) relevée(s) : ");
      setErrors(FECData.errors);
      setImportedData(null);
    } else {
      let financialPeriod = getFinancialPeriodFECData(FECData);
      let monthPeriods = getMonthPeriodsFECData(FECData);
      let periods = [financialPeriod, ...monthPeriods];

      session.addPeriods(periods);
      session.financialPeriod = financialPeriod;
      await session.financialData.loadFECData(
        FECData,
        financialPeriod,
        periods
      );

      session.impactsData[
        financialPeriod.periodKey
      ].knwDetails.apprenticeshipTax = FECData.KNWData.apprenticeshipTax;
      session.impactsData[
        financialPeriod.periodKey
      ].knwDetails.vocationalTrainingTax =
        FECData.KNWData.vocationalTrainingTax;

      session.progression = 1;

      setView(4);
    }
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

        {errorFEC && (
          <ErrorReportModal
            hasError={errorFEC}
            onClose={() => setErrorFEC(false)}
            errorMessage={errorMessage}
            errors={errors}
          />
        )}
        {
          errorFile && (
            <ErrorFileModal
            title={"Erreur lors de la lecture du FEC"}
            errorFile={errorFile}
            errorMessage={errorMessage}
            onClose={() => setErrorFile(false)}
            />
          )
        }
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

export default AccountingImportSection;
