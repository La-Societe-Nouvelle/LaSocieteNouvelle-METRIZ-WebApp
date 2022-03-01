// La Société Nouvelle

// React
import React from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faFileImport } from "@fortawesome/free-solid-svg-icons";



// Tables
import { MainAggregatesTable } from '../tables/MainAggregatesTable';
import { ImmobilisationsTable } from '../tables/ImmobilisationsTable';
import { IncomeStatementTable } from '../tables/IncomeStatementTable';
import { ExpensesTable } from '../tables/ExpensesTable';
import { StocksTable } from '../tables/StocksTable';

// Components
import { MessagePopup, MessagePopupErrors } from '../popups/MessagePopup';

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDataSection extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedTable: "incomeStatement",
      errorFile: false,
      errorMessage: "",
      errors: [],
    };
  }

  render() {

    const {
      selectedTable,
      errorFile,
      errorMessage,
      errors,
    } = this.state;


    return (
      <>
        <section className="container">
          <div className={"section-title"}>
            <h2><FontAwesomeIcon icon={faFileImport} />
              &Eacute;tape 2 - Validez votre import</h2>
          </div>
          <div className={"alert alert-success"} role="alert">
            <strong>Bravo !</strong> Votre import a été réalisé avec succès!
          </div>
          <div>
            <p>
              Par mesure de précaution, vérifiez l’exactitude des agrégats
              financiers. Des erreurs de lecture peuvent intervenir
              en cas d'écriture unique regroupant plusieurs opérations.
            </p>
          </div>
          <div className="table-container">
            <div className="table-menu">
              <button
                key={1}
                value="incomeStatement"
                onClick={this.changeFinancialTable}
                className={
                  selectedTable == "incomeStatement" || "" ? "active" : ""
                }
              >
                Comptes de résultat
              </button>
              <button
                key={2}
                value="mainAggregates"
                onClick={this.changeFinancialTable}
                className={
                  selectedTable == "mainAggregates" || "" ? "active" : ""
                }
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
     
            <div className="table-container">
         

              <div className="table-data">
                {this.buildtable(selectedTable)}

                {errorFile && (
                  <MessagePopupErrors
                    title="Erreur - Fichier"
                    message={errorMessage}
                    errors={errors}
                    closePopup={() => this.setState({ errorFile: false })}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        <section className={"action"}>
          <div className="container-fluid">

            <button className={"btn btn-secondary"} onClick={this.props.submit}>
              Valider l'import
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </section>
      </>

    )
  }


  /* ---------- TABLE ---------- */

  buildtable = (selectedTable) => {
    switch (selectedTable) {
      case "mainAggregates": return (<MainAggregatesTable financialData={this.props.session.financialData} />)       // Soldes intermediaires de gestion
      case "incomeStatement": return (<IncomeStatementTable financialData={this.props.session.financialData} />)      // Compte de résultat
      case "immobilisations": return (<ImmobilisationsTable financialData={this.props.session.financialData} />)      // Table des immobilisations
      case "stocks": return (<StocksTable financialData={this.props.session.financialData} />)               // Table des stocks
      case "expenses": return (<ExpensesTable financialData={this.props.session.financialData} />)             // Dépenses par compte de charges externes
    }
  }

  /* ---------- SELECTED TABLE ---------- */

  changeFinancialTable = (event) => this.setState({ selectedTable: event.target.value })

}
