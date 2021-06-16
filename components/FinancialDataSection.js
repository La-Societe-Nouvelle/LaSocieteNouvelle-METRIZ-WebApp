import React from 'react';
import {TableExpenses} from './financialTables/TableExpenses';
import {TableDepreciations} from './financialTables/TableDepreciations';

/* ------------------------------------------------- */
/* -------------------- SECTION -------------------- */
/* ------------------------------------------------- */

export class FinancialDataSection extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        session: props.session,
        selectedTab: "main"
    }
  }
    
  render() {
    const {selectedTab} = this.state;
    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Données financières</h1>
        </div>
        <SectionMenu selected={selectedTab} parent={this}/>
        <div className="tab-view">{this.buildTabView()}</div>
      </div>
    )
  }

  // Build selected tab
  buildTabView() {
    switch(this.state.selectedTab)
    {
      case "main" : return(this.buildMain())
      case "expenses" : return(this.buildTabExpenses())
      case "depreciations" : return(this.buildTabDepreciations())
    }
  }

  // Save changes
  updateFinancialData(financialData) {
    this.state.session.financialData = financialData;
  }

  /* --- MAIN TAB --- */
  buildMain() {
    const session = this.state.session;
    return (
      <div className="financial_data_main_view">
        <div className="coporate-social-footprint">
          <h3>Soldes intermédiaires de gestion</h3>
          <TableMain onUpdate={this.updateFinancialData.bind(this)} financialData={session.getFinancialData()}/>
        </div>
      </div>
    )
  }

  /* --- EXPENSES TAB --- */
  buildTabExpenses() {
    const session = this.state.session;
    return (
      <div className="financial_data_expenses_view">
        <h3>Liste des dépenses par entreprise</h3>
        <TableExpenses onUpdate={this.updateFinancialData.bind(this)} financialData={session.getFinancialData()}/>
      </div>
    )
  }

  /* --- DEPRECIATIONS TAB --- */
  buildTabDepreciations() {
    const session = this.state.session;
    return (
      <div className="financial_data_depreciations_view">
        <h3>Liste des amortissements sur immobilisations par entreprise</h3>
        <TableDepreciations onUpdate={this.updateFinancialData.bind(this)} financialData={session.getFinancialData()}/>
      </div>
    )
  }
}


/* ---------- SECTION MENU ---------- */ // Controls the displayed tab
function SectionMenu({selected, parent}){
  return (
    <div className="menu-section">
      <div className="menu-section-items">
        <button onClick = {() => parent.setState({selectedTab: "main"})}>
          Soldes intermédiaires
        </button>
        <button onClick = {() => parent.setState({selectedTab: "expenses"})}>
          Charges externes
        </button>
        <button onClick = {() => parent.setState({selectedTab: "depreciations"})}>
          Amortissements sur immobilisations
        </button>
      </div>
    </div>
  );
}


/* -------------------------------------------------- */
/* -------------------- MAIN TAB -------------------- */
/* -------------------------------------------------- */


class TableMain extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // financialData object
      financialData: props.financialData,
      // Input variables
      production: props.financialData.getProduction()!=null ? props.financialData.getProduction() : "",
        revenue: props.financialData.getRevenue()!=null ? props.financialData.getRevenue() : "",
        storedProduction: props.financialData.getStoredProduction()!=null ? props.financialData.getStoredProduction() : "",
        immobilisedProduction: props.financialData.getImmobilisedProduction()!=null ? props.financialData.getImmobilisedProduction() : "",
      unstoredProduction: props.financialData.getUnstoredProduction()!=null ? props.financialData.getUnstoredProduction() : "",
      amountExpenses: props.financialData.getAmountExpenses()!=null ? props.financialData.getAmountExpenses() : "",
      amountDepreciations: props.financialData.getAmountDepreciations()!=null ? props.financialData.getAmountDepreciations() : "",
    }
  }

  render() {
    const financialData = this.state.financialData;
    const {production,
           revenue,
           storedProduction,
           immobilisedProduction,
           unstoredProduction,
           amountExpenses,
           amountDepreciations} = this.state;
    
    return (
      <table>
        <thead>
          <tr><td>Agrégat</td><td>Montant (en €)</td><td>Fixe</td></tr>
        </thead>
        <tbody>
          {/* --- Production items --- */}
          <tr className="with-bottom-line">
              <td>Chiffres d'affaires</td>
              <td className="column_amount"><input value={revenue} onChange={this.onRevenueChange} onBlur={this.onRevenueBlur} onKeyPress={this.onEnterPress}/></td></tr>
          <tr>
              <td>Production</td>
              <td className="column_amount"><input value={production} onChange={this.onProductionChange} onBlur={this.onProductionBlur} onKeyPress={this.onEnterPress}/></td></tr>
          <tr>
              <td>&emsp;dont production stockée</td>
              <td className="column_amount"><input value={storedProduction} onChange={this.onStoredProductionChange} onBlur={this.onStoredProductionBlur} onKeyPress={this.onEnterPress}/></td></tr>
          <tr className="with-bottom-line">
              <td>&emsp;dont production immobilisée</td>
              <td className="column_amount"><input value={immobilisedProduction} onChange={this.onImmobilisedProductionChange} onBlur={this.onImmobilisedProductionBlur} onKeyPress={this.onEnterPress}/></td></tr>
          <tr className="with-bottom-line">
              <td>Production déstockée</td>
              <td className="column_amount"><input value={unstoredProduction} onChange={this.onUnstoredProductionChange} onBlur={this.onUnstoredProductionBlur} onKeyPress={this.onEnterPress}/></td></tr>
          {/* --- Expenses & Gross Value Added --- */}
          <tr>
              <td>Charges externes</td>
              <td className="column_amount"><input value={amountExpenses} onChange={this.onAmountExpensesChange} onBlur={this.onAmountExpensesBlur} onKeyPress={this.onEnterPress}/></td>
              <td><input type="checkbox" checked={financialData.isAmountExpensesFixed()} onChange={this.setAmountExpensesFixed}/></td></tr>
          <tr className="with-bottom-line">
              <td>&emsp;dont charges détaillées (cf. Onglet Charges externes)</td>
              <td className="column_amount"><input value={financialData.printAmountDetailedExpenses()} disabled={true}/></td></tr>
          <tr className="with-bottom-line">
              <td>Valeur ajoutée brute</td>
              <td className="column_amount"><input value={financialData.printGrossValueAdded()} disabled={true}/></td></tr>
          {/* --- Depreciations & Net Value Added --- */}
          <tr>
              <td>Dotations aux amortissements</td>
              <td className="column_amount"><input value={amountDepreciations} onChange={this.onAmountDepreciationsChange} onBlur={this.onAmountDepreciationsBlur} onKeyPress={this.onEnterPress}/></td>
              <td><input type="checkbox" checked={financialData.isAmountDepreciationsFixed()} onChange={this.setAmountDepreciationsFixed}/></td></tr>
          <tr className="with-bottom-line">
              <td>&emsp;dont dotations détaillées (cf. Onglet Amortissements sur immobilisations)</td>
              <td className="column_amount"><input value={financialData.printAmountDetailedDepreciations()} disabled={true}/></td></tr>
          <tr>
              <td>Valeur ajoutée nette</td>
              <td className="column_amount"><input value={financialData.printNetValueAdded()} disabled={true}/></td></tr>
        </tbody>
      </table>
    )
  }

  onEnterPress = (event) => {
    if (event.which==13) {event.target.blur();}
  }

  /* ---------- STATE ---------- */

  /* --- Production items --- */

  // Revenue
  onRevenueChange = (event) => {
    if (!isNaN(event.target.value)) {
      this.setState({revenue: event.target.value});
    }
  }
  onRevenueBlur = (event) => {
    let revenue = !isNaN(parseFloat(event.target.value)) ? parseFloat(event.target.value) : null;
    this.state.financialData.setRevenue(revenue);
    this.props.onUpdate(this.state.financialData);
    this.setState({production: this.state.financialData.getProduction()!=null ? this.state.financialData.getProduction() : ""})
  }

  // Production
  onProductionChange = (event) => {
    if (!isNaN(event.target.value)) {
      this.setState({production: event.target.value});
    }
  }
  onProductionBlur = (event) => {
    let production = !isNaN(parseFloat(event.target.value)) ? parseFloat(event.target.value) : null;
    this.state.financialData.setProduction(production);
    this.props.onUpdate(this.state.financialData);
    this.setState({
      revenue: this.state.financialData.getRevenue()!=null ? this.state.financialData.getRevenue() : "",
      storedProduction: this.state.financialData.getStoredProduction()!=null ? this.state.financialData.getStoredProduction() : "",
      immobilisedProduction: this.state.financialData.getImmobilisedProduction()!=null ? this.state.financialData.getImmobilisedProduction() : "",
      unstoredProduction: this.state.financialData.getUnstoredProduction()!=null ? this.state.financialData.getUnstoredProduction() : "",
    });
  }

  // Stored production
  onStoredProductionChange = (event) => {
    if (!isNaN(event.target.value)) {
      this.setState({storedProduction: event.target.value});
    }
  }
  onStoredProductionBlur = (event) => {
    let storedProduction = !isNaN(parseFloat(event.target.value)) ? parseFloat(event.target.value) : null;
    this.state.financialData.setStoredProduction(storedProduction);
    this.props.onUpdate(this.state.financialData);
    this.setState({production: this.state.financialData.getProduction()})
  }

  // Immobilised production
  onImmobilisedProductionChange = (event) => {
    if (!isNaN(event.target.value)) {
      this.setState({immobilisedProduction: event.target.value});
    }
  }
  onImmobilisedProductionBlur = (event) => {
    let immobilisedProduction = !isNaN(parseFloat(event.target.value)) ? parseFloat(event.target.value) : null;
    this.state.financialData.setImmobilisedProduction(immobilisedProduction);
    this.props.onUpdate(this.state.financialData);
    this.setState({production: this.state.financialData.getProduction()!=null ? this.state.financialData.getProduction() : ""})
  }

  // Unstored production
  onUnstoredProductionChange = (event) => {
    if (!isNaN(event.target.value)) {
      this.setState({unstoredProduction: event.target.value});
    }
  }
  onUnstoredProductionBlur = (event) => {
    let unstoredProduction = !isNaN(parseFloat(event.target.value)) ? parseFloat(event.target.value) : null;
    this.state.financialData.setUnstoredProduction(unstoredProduction);
    this.props.onUpdate(this.state.financialData);
    this.setState({production: this.state.financialData.getProduction()!=null ? this.state.financialData.getProduction() : ""})
  }

  /* --- Expenses --- */

  // Expenses
  onAmountExpensesChange = (event) => {
    if (!isNaN(event.target.value)) {
      this.setState({amountExpenses: event.target.value});
    }
  }
  onAmountExpensesBlur = (event) => {
    let amountExpenses = !isNaN(parseFloat(event.target.value)) ? parseFloat(event.target.value) : null;
    this.state.financialData.setAmountExpenses(amountExpenses);
    this.props.onUpdate(this.state.financialData);
    this.setState({amountExpenses: this.state.financialData.getAmountExpenses()!=null ? this.state.financialData.getAmountExpenses() : "" });
  }
  setAmountExpensesFixed = (event) => {
    this.state.financialData.setAmountExpensesFixed(event.target.checked);
    this.props.onUpdate(this.state.financialData);
    this.setState({amountExpenses: this.state.financialData.getAmountExpenses()!=null ? this.state.financialData.getAmountExpenses() : "" });
  }

  // Depreciations
  onAmountDepreciationsChange = (event) => {
    if (!isNaN(event.target.value)) {
      this.setState({amountDepreciations: event.target.value});
    }
  }
  onAmountDepreciationsBlur = (event) => {
    let amountDepreciations = !isNaN(event.target.value) ? parseFloat(event.target.value) : null;
    this.state.financialData.setAmountDepreciations(amountDepreciations);
    this.props.onUpdate(this.state.financialData);
    this.setState({amountDepreciations: this.state.financialData.getAmountDepreciations()!=null ? this.state.financialData.getAmountDepreciations() : "" });
  }
  setAmountDepreciationsFixed = (event) => {
    this.state.financialData.setAmountDepreciationsFixed(event.target.checked);
    this.props.onUpdate(this.state.financialData);
    this.setState({amountDepreciations: this.state.financialData.getAmountDepreciations()!=null ? this.state.financialData.getAmountDepreciations() : "" });
  }

  /* ---------- PROPS ---------- */
  
  updateFinancialData = (event) => {
    let production = isNaN(parseFloat(this.state.production)) ? null : parseFloat(this.state.production);
    let amountExpenses = isNaN(parseFloat(this.state.amountExpenses)) ? null : parseFloat(this.state.amountExpenses);
    let amountDepreciations = isNaN(parseFloat(this.state.amountDepreciations)) ? null : parseFloat(this.state.amountDepreciations);
    let netValueAdded = this.getNetValueAdded();
    this.props.onUpdate({production,amountExpenses,amountDepreciations});
    this.setState({netValueAdded: netValueAdded});
  }
  
  getNetValueAdded() {
    if (!isNaN(parseFloat(this.state.production)) & !isNaN(parseFloat(this.state.amountExpenses)) & !isNaN(parseFloat(this.state.amountDepreciations))) {
      let netValueAdded = parseFloat(this.state.production) - parseFloat(this.state.amountExpenses) - parseFloat(this.state.amountDepreciations);
      if (netValueAdded >= 0) {return netValueAdded}
      else {return 0}
    } else {return null}
  }

}