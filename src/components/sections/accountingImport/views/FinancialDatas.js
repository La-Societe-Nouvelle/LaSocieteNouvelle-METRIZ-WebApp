// La Société Nouvelle

// React
import React from "react";

// Tables
import { ImmobilisationsTable } from "../tables/ImmobilisationsTable";
import { AmortisationsTable } from "../tables/AmortisationsTable";
import { IncomeStatementTable } from "../tables/IncomeStatementTable";
import { ExpensesTable } from "../tables/ExpensesTable";
import { StocksTable } from "../tables/StocksTable";
import { MainAggregatesTable } from "../tables/MainAggregatesTable";

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDatas extends React.Component 
{

  constructor(props) 
  {
    super(props);
    this.state = {
      selectedTable: "incomeStatement",
      period: props.session.financialPeriod,
      errorFile: false,
      errorMessage: "",
      errors: [],
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  validFinancialData = () => {
    this.props.session.financialData.status[this.state.period.periodKey].isValidated = true;
    this.props.submit();
  }

  render() {
    const { selectedTable, period } = this.state;

    return (
      <>
        <h3 className=" ">Vérifiez les agrégats financiers</h3>
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

        <div className="table-data">{this.buildtable(selectedTable,period)}</div>
        <div className="text-end">

          {
            this.props.session.progression > 1 ? 
            <button
            className="btn btn-primary me-2"
            onClick={() => this.props.reset()}
          >
            <i className="bi bi-chevron-left"></i> Importer un nouveau FEC
          </button>
            :
            <button
            className="btn btn-primary me-2"
            onClick={() => this.props.return()}
          >
            <i className="bi bi-chevron-left"></i> Retour
          </button>
          }
      
          <button className={"btn btn-secondary"} onClick={this.validFinancialData}>
          { this.props.session.progression > 1 ?  "Reprendre mon analyse" : "Valider l'import" }
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </>
    );
  }

  /* ---------- TABLE ---------- */

  buildtable = (selectedTable,period) => 
  {
    switch (selectedTable) {
      case "mainAggregates":
        return (
          <MainAggregatesTable
            financialData={this.props.session.financialData}
            period={period}
          />
        ); // Soldes intermediaires de gestion
      case "incomeStatement":
        return (
          <IncomeStatementTable
            financialData={this.props.session.financialData}
            period={period}
          />
        ); // Compte de résultat
      case "immobilisations":
        return (
          <>
            <ImmobilisationsTable
              financialData={this.props.session.financialData}
              period={period}
            />
            <AmortisationsTable
              financialData={this.props.session.financialData}
              period={period}
            />

          </>
        ); // Table des immobilisations
      case "stocks":
        return <StocksTable financialData={this.props.session.financialData} period={period}/>; // Table des stocks
      case "expenses":
        return (
          <ExpensesTable financialData={this.props.session.financialData} period={period}/>
        ); // Dépenses par compte de charges externes
    }
  };

  /* ---------- SELECTED TABLE ---------- */

  changeFinancialTable = (event) =>
    this.setState({ selectedTable: event.target.value });
}
