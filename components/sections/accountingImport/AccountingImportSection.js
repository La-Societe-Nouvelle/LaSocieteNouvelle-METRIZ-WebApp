// La Société Nouvelle

// React
import React, { useState } from "react";

// Bootstrap
import { Container } from "react-bootstrap";

// Views
import { FinancialDataForm } from "./views/FinancialDataForm";
import { BalanceForwardBookSelection } from "./views/BalanceForwardBookSelection";
import { DepreciationAssetsMapping } from "./views/DepreciationAssetsMapping";
import { StockPurchasesMapping } from "./views/StockPurchasesMapping";
import { FinancialDatas } from "./views/FinancialDatas";

// Readers
import { FECDataReader } from "/src/readers/FECReader";

// Utils
import { getFinancialPeriodFECData, getMonthPeriodsFECData } from "./utils";

// Modals
import ErrorReportModal from "../../popups/ErrorReportModal";
import { ErrorAPIModal } from "../../popups/MessagePopup";

const AccountingImportSection = (props) => 
{
  const { session } = props;

  const [view, setView] = useState(session.financialData.isFinancialDataLoaded ? 4 : 0);
  const [importedData, setImportedData] = useState(null);

  const [division, setDivision] = useState(session.comparativeData.activityCode);

  const [errorFEC, setErrorFEC] = useState(false);
  const [errors, setErrors] = useState([]);
  const [errorAPI, setErrorAPI] = useState(false);

  const handleCorporateName = (corporateName) => {
    session.legalUnit.corporateName = corporateName;
  };

  const handleSiren = async (siren) => 
  { 
    session.legalUnit.siren = siren;
    try {
      await session.legalUnit.fetchLegalUnitData();
      if (/^[0-9]{2}/.test(session.legalUnit.activityCode)) {
        session.comparativeData.activityCode = session.legalUnit.activityCode.slice(0,2);
        setView(view);
        setDivision(session.legalUnit.activityCode.slice(0,2));
      }
    } catch (error) {
      setErrorAPI(true);
    }
  };
  
  const handleDivision = (division) => {
    session.legalUnit.activityCode = division;
    session.comparativeData.activityCode = division;
  };
  const handleFECData = (FECData) => {
    console.log(FECData);
    setImportedData(FECData);
    nextView(0);
  };

  const nextView = (currentView) => 
  {
    switch(currentView) 
    {
      case 0 : {
        setView(1);
        break;
      }; break;
      case 1 : {
        let haveAmortisationAccounts = Object.keys(importedData.meta.accounts)
          .filter((accountNum) =>/^(28|29|39)/.test(accountNum));
        if (haveAmortisationAccounts) {
          setView(2);
        } else {
          nextView(2);
        }
      }; break;
      case 2 : {
        let haveStockAccounts = Object.keys(importedData.meta.accounts)
          .some((accountNum) => /^3(1|2|7)/.test(accountNum));
        if (haveStockAccounts) {
          setView(3);
        } else {
          loadFECData(importedData);
        }
      }; break;
      case 3 : {
        setView(4)
      }; break;
      default : setView(0);
    }
  };

  const loadFECData = async (importedData) => 
  {
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

      // FEC id
      session.id = importedData.id;

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
            setImportedData={handleFECData}
            corporateName={session.legalUnit.corporateName}
            siren={session.legalUnit.siren}
            division={division}
            onClick={() => importFECFile(file)}
            nextStep={() => setView(2)}
          />
        )}

        {view === 1 && (
          <BalanceForwardBookSelection
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

        {errorFEC && (
          <ErrorReportModal
            hasError={errorFEC}
            onClose={() => setErrorFEC(false)}
            errorMessage={errorMessage}
            errors={errors}
          />
        )}

        <ErrorAPIModal
          hasError = {errorAPI}
          onClose={() => setErrorAPI(false)}/>
        
      </section>
    </Container>
  );
};

export default AccountingImportSection;
