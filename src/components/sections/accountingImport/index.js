// La Société Nouvelle

// React
import React, { useState } from "react";
import { Container } from "react-bootstrap";

// Views
import { FinancialDataForm } from "./views/FinancialDataForm";
import { BalanceForwardBookSelection } from "./views/BalanceForwardBookSelection";
import { DepreciationAssetsMapping } from "./views/DepreciationAssetsMapping";
import { StockPurchasesMapping } from "./views/StockPurchasesMapping";
import { FinancialDatas } from "./views/FinancialDatas";

// Utils
import { FECDataReader } from "./utils/FECReader";
import { getFinancialPeriodFECData, getMonthPeriodsFECData } from "./utils";

// Modals
import ErrorReportModal from "../../modals/ErrorReportModal";
import { ErrorAPIModal } from "../../modals/userInfoModals";
import ImportModal from "./ImportModal";

/* ------------------------------------------------------------------ */
/* -------------------- ACCOUTING IMPORT SECTION -------------------- */
/* ------------------------------------------------------------------ */

export const AccountingImportSection = (props) => {
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

  const handleSiren = async (siren) => {
    session.legalUnit.siren = siren;
    try {
      await session.legalUnit.fetchLegalUnitData();
      if (/^[0-9]{2}/.test(session.legalUnit.activityCode)) {
        session.comparativeData.activityCode =
          session.legalUnit.activityCode.slice(0, 2);
        setView(view);
        setDivision(session.legalUnit.activityCode.slice(0, 2));
      }
    } catch (error) {
      setErrorAPI(true);
    }
  };

  const handleDivision = (division) => {
    session.legalUnit.activityCode = division;
    session.comparativeData.activityCode = division;
    setDivision(division);
  };

  const handleFECData = (FECData) => {
    setImportedData(FECData);
    nextView(0);
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

      // FEC id
      session.id = importedData.id;

      session.progression = 1;

      setView(4);
    }
  };
  const nextView = (currentView) => {
    switch (currentView) {
      case 0:
        setView(1);
        break;
      case 1:
        // Check if there are amortisation accounts
        if (
          Object.keys(importedData.meta.accounts).some((accountNum) =>
            /^(28|29|39)/.test(accountNum)
          )
        ) {
          setView(2);
        } else {
          nextView(2);
        }
        break;
      case 2:
        // Check if there are stock accounts
        if (
          Object.keys(importedData.meta.accounts).some((accountNum) =>
            /^3(1|2|7)/.test(accountNum)
          )
        ) {
          setView(3);
        } else {
          // If not, load FEC data and move to view 4
          loadFECData(importedData);
        }
        break;
      case 3:
        setView(4);
        break;
      default:
        setView(0);
    }
  };
  const renderBalanceForwardBookModal = () => (
    <ImportModal
      show={view === 1}
      onHide={() => setView(0)}
      title="Identifiez les A-Nouveaux"
    >
      <BalanceForwardBookSelection
        return={() => setView(0)}
        FECData={importedData}
        onClick={() => nextView(1)}
      />
    </ImportModal>
  );

  const renderDepreciationAssetsModal = () => (
    <ImportModal
      show={view === 2}
      onHide={() => setView(0)}
      title="Associez les comptes d'amortissements et de dépréciations"
    >
      <DepreciationAssetsMapping
        return={() => setView(1)}
        onClick={() => nextView(2)}
        meta={importedData.meta}
      />
    </ImportModal>
  );

  const renderStockPurchasesModal = () => (
    <ImportModal
      show={view === 3}
      onHide={() => setView(0)}
      title="Associez les comptes de stocks et les comptes de charges"
    >
      <StockPurchasesMapping
        return={() => setView(2)}
        onClick={() => loadFECData(importedData)}
        meta={importedData.meta}
      />
    </ImportModal>
  );

  return (
    <Container fluid>
      <section className="step">
        <h2 className="mb-2">Etape 1 - Importez vos flux comptables</h2>

        {view < 4 && (
          <FinancialDataForm
            onChangeCorporateName={handleCorporateName}
            onChangeSiren={handleSiren}
            onChangeDivision={handleDivision}
            setImportedData={handleFECData}
            corporateName={session.legalUnit.corporateName}
            siren={session.legalUnit.siren}
            division={division}
            onClick={() => importFECFile(file)}
          />
        )}

        {importedData && (
          <>
            {renderBalanceForwardBookModal()}
            {renderDepreciationAssetsModal()}
            {renderStockPurchasesModal()}
          </>
        )}

        {/* Final view - Financial Datas */}
        {view === 4 && (
          <FinancialDatas
            {...props}
            return={() => setView(1)}
            reset={() => setView(0)}
          />
        )}
        {/* Error Modal for FEC Errors */}
        {errorFEC && (
          <ErrorReportModal
            hasError={errorFEC}
            onClose={() => setErrorFEC(false)}
            errorMessage={errorMessage}
            errors={errors}
          />
        )}
        {/* Error Modal for API Errors */}
        <ErrorAPIModal hasError={errorAPI} onClose={() => setErrorAPI(false)} />
      </section>
    </Container>
  );
}