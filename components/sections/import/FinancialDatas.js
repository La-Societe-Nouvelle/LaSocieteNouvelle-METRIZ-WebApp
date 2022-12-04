// La Société Nouvelle

// React
import React from "react";

// Tables
import { MainAggregatesTable } from "../../tables/MainAggregatesTable";
import { ImmobilisationsTable } from "../../tables/ImmobilisationsTable";
import { AmortisationsTable } from "../../tables/AmortisationsTable";
import { DepreciationsTable } from "../../tables/DepreciationsTable";
import { IncomeStatementTable } from "../../tables/IncomeStatementTable";
import { ExpensesTable } from "../../tables/ExpensesTable";
import { StocksTable } from "../../tables/StocksTable";

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDatas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTable: "incomeStatement",
      errorFile: false,
      errorMessage: "",
      errors: [],
    };
  }
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { selectedTable } = this.state;

    return (
      <>
        <h3 className="subtitle ">Vérifiez les agrégats financiers</h3>
        <p className="form-text">
          Par mesure de précaution, vérifiez l’exactitude des agrégats
          financiers. Des erreurs de lecture peuvent intervenir en cas
          d'écriture unique regroupant plusieurs opérations.
        </p>
        <div className="table-menu">
          <button
            key={1}
            value="incomeStatement"
            onClick={this.changeFinancialTable}
            className={selectedTable == "incomeStatement" || "" ? "active" : ""}
          >
            Compte de résultat
          </button>
          <button
            key={2}
            value="mainAggregates"
            onClick={this.changeFinancialTable}
            className={selectedTable == "mainAggregates" || "" ? "active" : ""}
          >
            Soldes intermédiaires de gestion
          </button>
          <button
            key={3}
            value="immobilisations"
            onClick={this.changeFinancialTable}
            className={selectedTable == "immobilisations" ? "active" : ""}
          >
            Immobilisations
          </button>
          <button
            key={4}
            value="expenses"
            onClick={this.changeFinancialTable}
            className={selectedTable == "expenses" ? "active" : ""}
          >
            Charges externes
          </button>
          <button
            key={5}
            value="stocks"
            onClick={this.changeFinancialTable}
            className={selectedTable == "stocks" ? "active" : ""}
          >
            Stocks
          </button>
        </div>

        <div className="table-data">{this.buildtable(selectedTable)}</div>
        <div className="text-end">
          <button
            className="btn btn-primary me-2"
            onClick={() => this.props.return()}
          >
            <i className="bi bi-chevron-left"></i> Retour aux comptes
            d'amortissements
          </button>
          <button className={"btn btn-secondary"} onClick={this.props.submit}>
            Valider l'import
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </>
    );
  }

  /* ---------- TABLE ---------- */

  buildtable = (selectedTable) => {
    switch (selectedTable) {
      case "mainAggregates":
        return (
          <MainAggregatesTable
            financialData={this.props.session.financialData}
          />
        ); // Soldes intermediaires de gestion
      case "incomeStatement":
        return (
          <IncomeStatementTable
            financialData={this.props.session.financialData}
          />
        ); // Compte de résultat
      case "immobilisations":
        return (
          <>
            <ImmobilisationsTable
              financialData={this.props.session.financialData}
            />
            <hr></hr>
            <AmortisationsTable
              financialData={this.props.session.financialData}
            />
            <hr></hr>
            <DepreciationsTable
              financialData={this.props.session.financialData}
            />
          </>
        ); // Table des immobilisations
      case "stocks":
        return <StocksTable financialData={this.props.session.financialData} />; // Table des stocks
      case "expenses":
        return (
          <ExpensesTable financialData={this.props.session.financialData} />
        ); // Dépenses par compte de charges externes
    }
  };

  /* ---------- SELECTED TABLE ---------- */

  changeFinancialTable = (event) =>
    this.setState({ selectedTable: event.target.value });
}
