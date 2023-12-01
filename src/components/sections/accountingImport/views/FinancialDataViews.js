// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Image } from "react-bootstrap";

// Tables
import { ImmobilisationsTable } from "../tables/ImmobilisationsTable";
import { AmortisationsTable } from "../tables/AmortisationsTable";
import { IncomeStatementTable } from "../tables/IncomeStatementTable";
import { ExpensesTable } from "../tables/ExpensesTable";
import { StocksTable } from "../tables/StocksTable";
import { MainAggregatesTable } from "../tables/MainAggregatesTable";

/* -------------------- FINANCIAL DATA VIEWS -------------------- */

/** Financial views (5) :
 *    - income statement
 *    - main aggregates
 *    - external expenses
 *    - immobilisations
 *    - stocks
 *
 */

export const FinancialDataViews = ({ session, period, onSubmit, onGoBack }) => {
  const [selectedTab, setSelectedTab] = useState("incomeStatement");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ----------------------------------------------------------------------------------------------------

  const switchTab = (event) => {
    const table = event.target.value;
    setSelectedTab(table);
  };

  // ----------------------------------------------------------------------------------------------------

  const validFinancialData = () => {
    // valid period in financial data
    session.financialData.status[period.periodKey].isValidated = true;
    onSubmit();
  };

  // ----------------------------------------------------------------------------------------------------

  return (
    <>
      <h3 className=" ">Vérifiez les agrégats financiers</h3>
      <div className="alert-info">
        <div className="info-icon">
          <Image src="/info-circle.svg" alt="icon info" />
        </div>
        <p>
          Par mesure de précaution, vérifiez l'exactitude des agrégats
          financiers. Des erreurs de lecture peuvent intervenir en cas
          d'écriture unique regroupant plusieurs opérations.
        </p>
      </div>

      <div className="table-menu">
        <button
          key={1}
          value="incomeStatement"
          onClick={switchTab}
          className={selectedTab == "incomeStatement" || "" ? "active" : ""}
        >
          Compte de résultat
        </button>
        <button
          key={2}
          value="mainAggregates"
          onClick={switchTab}
          className={selectedTab == "mainAggregates" || "" ? "active" : ""}
        >
          Soldes intermédiaires de gestion
        </button>
        <button
          key={3}
          value="immobilisations"
          onClick={switchTab}
          className={selectedTab == "immobilisations" ? "active" : ""}
        >
          Immobilisations
        </button>
        <button
          key={4}
          value="expenses"
          onClick={switchTab}
          className={selectedTab == "expenses" ? "active" : ""}
        >
          Charges externes
        </button>
        <button
          key={5}
          value="stocks"
          onClick={switchTab}
          className={selectedTab == "stocks" ? "active" : ""}
        >
          Stocks
        </button>
      </div>

      <div className="table-data">
        {buildTab(session.financialData, selectedTab, period)}
      </div>

      <div className="text-end">
        <button className="btn btn-primary me-2" onClick={() => onGoBack()}>
          <i className="bi bi-chevron-left"></i> Retour
        </button>
        <button className={"btn btn-secondary"} onClick={validFinancialData}>
          {session.financialData.status[period.periodKey].isValidated
            ? "Reprendre mon analyse"
            : "Valider l'import"}
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </>
  );
};

/* ---------- TABLES ---------- */

const buildTab = (financialData, tab, period) => {
  switch (tab) {
    // Soldes intermediaires de gestion
    case "mainAggregates":
      return (
        <MainAggregatesTable financialData={financialData} period={period} />
      );
    // Compte de résultats
    case "incomeStatement":
      return (
        <IncomeStatementTable financialData={financialData} period={period} />
      );
    // Immobilisations
    case "immobilisations":
      return (
        <>
          <ImmobilisationsTable financialData={financialData} period={period} />
          <AmortisationsTable financialData={financialData} period={period} />
        </>
      );
    // Stocks
    case "stocks":
      return <StocksTable financialData={financialData} period={period} />;
    // Charges externes
    case "expenses":
      return <ExpensesTable financialData={financialData} period={period} />;
  }
};
