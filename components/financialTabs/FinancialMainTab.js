import React from 'react';

import { printValue, printValueInput, valueOrDefault } from '../../src/utils/Utils';

// Readers
import { FECFileReader, processFECData } from '../../src/readers/FECReader';

/* -------------------------------------------------- */
/* -------------------- MAIN TAB -------------------- */
/* -------------------------------------------------- */

export function FinancialMainTab(props) 
{
  const {financialData} = props;

  const refTableMain = React.createRef();

  const importFECFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      FECFileReader(reader.result)
        .then((FECData) => processFECData(FECData))
        .then((nextFinancialData) => financialData.setFECData(nextFinancialData))
        .then(() => refTableMain.current.updateInputs())
    };
    reader.readAsText(event.target.files[0]);
  }

  const {amountExpensesFixed,amountDepreciationsFixed} = financialData;

  return (
    <div className="financial_data_main_view">
      <div className="group">
        <h3>Soldes intermédiaires de gestion</h3>
        <div className="actions">
          <button onClick={() => {document.getElementById('import-fec').click()}}>Importer un fichier FEC</button>
          <input className="hidden" id="import-fec" type="file" accept=".csv" onChange={importFECFile} visibility="collapse"/>
        </div>
        <TableMain
          ref={refTableMain}
          onUpdate={props.onUpdate} 
          financialData={props.financialData}/>
        <div className="notes">
          {(amountExpensesFixed || amountDepreciationsFixed) &&
            <div>
              <p>&nbsp;<img className="img locker" src="/resources/icon_locked.jpg" alt="locked"/>
                 &nbsp;Saisie supérieure à la somme des écritures renseignées. Cliquez sur le cadenas pour recalculer la somme totale.
              </p>
            </div>}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------- */
/* -------------------- MAIN TABLE -------------------- */
/* ---------------------------------------------------- */

class TableMain extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Input variables
      productionInput: valueOrDefault(props.financialData.getProduction(),""),
      revenueInput: valueOrDefault(props.financialData.revenue,""),
      storedProductionInput: valueOrDefault(props.financialData.getStoredProduction(),""),
      immobilisedProductionInput: valueOrDefault(props.financialData.getImmobilisedProduction(),""),
      unstoredProductionInput: valueOrDefault(props.financialData.getUnstoredProduction(),""),
      amountExpensesInput: valueOrDefault(props.financialData.getAmountExpenses(),""),
      amountDepreciationsInput: valueOrDefault(props.financialData.getAmountDepreciations(),""),
    }
  }

  updateInputs() {
    this.state.productionInput = valueOrDefault(this.props.financialData.getProduction(),"");
    this.state.revenueInput = valueOrDefault(this.props.financialData.getRevenue(),"");
    this.state.storedProductionInput = valueOrDefault(this.props.financialData.getStoredProduction(),"");
    this.state.immobilisedProductionInput = valueOrDefault(this.props.financialData.getImmobilisedProduction(),"");
    this.state.unstoredProductionInput = valueOrDefault(this.props.financialData.getUnstoredProduction(),"");
    this.state.amountExpensesInput = valueOrDefault(this.props.financialData.getAmountExpenses(),"");
    this.state.amountDepreciationsInput = valueOrDefault(this.props.financialData.getAmountDepreciations(),"");
    this.forceUpdate();
  }

  render() {
    const financialData = this.props.financialData;
    const {revenueInput,
           productionInput,
           storedProductionInput,
           immobilisedProductionInput,
           unstoredProductionInput,
           amountExpensesInput,
           amountDepreciationsInput} = this.state;
    const {amountExpensesFixed,amountDepreciationsFixed} = financialData;
    return (
      <table>
        <thead>
          <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
        </thead>
        <tbody>
          {/* --- Production items --- */}
          <tr className="with-bottom-line">
              <td>Chiffres d'affaires</td>
              <td className="column_amount"><input value={printValueInput(revenueInput,0)} onChange={this.onRevenueChange} onBlur={this.onRevenueBlur} onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>Production</td>
              <td className="column_amount"><input value={printValueInput(productionInput,0)} onChange={this.onProductionChange} onBlur={this.onProductionBlur} onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>&emsp;dont production stockée</td>
              <td className="column_amount"><input value={printValueInput(storedProductionInput,0)} onChange={this.onStoredProductionChange} onBlur={this.onStoredProductionBlur} onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>&emsp;dont production immobilisée</td>
              <td className="column_amount"><input value={printValueInput(immobilisedProductionInput,0)} onChange={this.onImmobilisedProductionChange} onBlur={this.onImmobilisedProductionBlur} onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line">
              <td>Production déstockée sur l'exercice précédent</td>
              <td className="column_amount"><input value={printValueInput(unstoredProductionInput,0)} onChange={this.onUnstoredProductionChange} onBlur={this.onUnstoredProductionBlur} onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;€</td></tr>

          <tr>
            <td>Stockage achats</td>
            <td className="column_amount"><input value={(financialData.getStoredProduction() > 0 ? "(" : "")+printValueInput(financialData.getStoredPurchases(),0)+(financialData.getStoredProduction() > 0 ? ")" : "")} disabled={true}/></td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>Déstockage achats</td>
            <td className="column_amount"><input value={printValueInput(financialData.getUnstoredPurchases(),0)} disabled={true}/></td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>Charges externes&nbsp;&nbsp;
              {amountExpensesFixed && 
                  <img className="img locker" src="/resources/icon_locked.jpg" alt="locked" 
                        onClick={this.resyncAmountExpenses}/>}</td>
              <td className="column_amount">
                <input value={printValueInput(amountExpensesInput,0)} 
                       onChange={this.onAmountExpensesChange} 
                       onBlur={this.onAmountExpensesBlur} 
                       onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;€</td></tr>
          {
            Object.entries(financialData.getExpensesAccounts()).map(([num,account]) => {
              return(
              <tr key={num}>
                <td>&emsp;{account.label}</td>
                <td className="column_amount"><input value={printValueInput(account.amount,0)} disabled={true}/></td>
                <td className="column_unit">&nbsp;€</td>
              </tr>
            )})
          }
          <tr className="with-bottom-line with-top-line">
              <td>Valeur ajoutée brute</td>
              <td className="column_amount"><input value={printValueInput(financialData.getGrossValueAdded(),0)} disabled={true}/></td>
              <td className="column_unit">&nbsp;€</td></tr>

          <tr>
              <td>Dotations aux amortissements&nbsp;&nbsp;
              {amountDepreciationsFixed && 
                  <img className="img locker" src="/resources/icon_locked.jpg" alt="locked" 
                        onClick={this.resyncAmountDepreciations}/>}</td>
              <td className="column_amount"><input value={printValueInput(amountDepreciationsInput,0)} onChange={this.onAmountDepreciationsChange} onBlur={this.onAmountDepreciationsBlur} onKeyPress={this.onEnterPress}/></td>
              <td className="column_unit">&nbsp;€</td></tr>
          {
            Object.entries(financialData.getDepreciationsAccounts()).map(([num,account]) => {
              return(
              <tr key={num}>
                <td>&emsp;{account.label}</td>
                <td className="column_amount"><input value={printValueInput(account.amount,0)} disabled={true}/></td>
                <td className="column_unit">&nbsp;€</td>
              </tr>
            )})
          }
          <tr className="with-top-line with-bottom-line">
              <td>Valeur ajoutée nette</td>
              <td className="column_amount"><input value={printValueInput(financialData.getNetValueAdded(),0)} disabled={true}/></td>
              <td className="column_unit">&nbsp;€</td></tr>
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
    if (!isNaN(parseFloat(event.target.value.replaceAll(" ","")))) {
      this.setState({revenueInput: parseFloat(event.target.value.replaceAll(" ",""))});
    } else if (event.target.value=="") {
      this.setState({revenueInput: null})
    }
  }
  onRevenueBlur = (event) => {
    let revenue = !isNaN(parseFloat(event.target.value.replaceAll(" ",""))) ? parseFloat(event.target.value.replaceAll(" ","")) : null;
    this.props.financialData.setRevenue(revenue);
    this.props.onUpdate(this.props.financialData);
    this.updateInputs();
  }

  // Production
  onProductionChange = (event) => {
    if (!isNaN(parseFloat(event.target.value.replaceAll(" ","")))) {
      this.setState({productionInput: parseFloat(event.target.value.replaceAll(" ",""))});
    } else if (event.target.value=="") {
      this.setState({productionInput: null})
    }
  }
  onProductionBlur = (event) => {
    let production = !isNaN(parseFloat(event.target.value.replaceAll(" ",""))) ? parseFloat(event.target.value.replaceAll(" ","")) : null;
    this.props.financialData.setProduction(production);
    this.props.onUpdate(this.props.financialData);
    this.updateInputs();
  }

  // Stored production
  onStoredProductionChange = (event) => {
    if (!isNaN(parseFloat(event.target.value.replaceAll(" ","")))) {
      this.setState({storedProductionInput: parseFloat(event.target.value.replaceAll(" ",""))});
    } else if (event.target.value=="") {
      this.setState({storedProductionInput: null})
    }
  }
  onStoredProductionBlur = (event) => {
    let storedProduction = !isNaN(parseFloat(event.target.value.replaceAll(" ",""))) ? parseFloat(event.target.value.replaceAll(" ","")) : null;
    this.props.financialData.setStoredProduction(storedProduction);
    this.props.onUpdate(this.props.financialData);
    this.updateInputs();
  }

  // Immobilised production
  onImmobilisedProductionChange = (event) => {
    if (!isNaN(parseFloat(event.target.value.replaceAll(" ","")))) {
      this.setState({immobilisedProductionInput: event.target.value.replaceAll(" ","")});
    } else if (event.target.value=="") {
      this.setState({immobilisedProductionInput: null})
    }
  }
  onImmobilisedProductionBlur = (event) => {
    let immobilisedProduction = !isNaN(parseFloat(event.target.value.replaceAll(" ",""))) ? parseFloat(event.target.value.replaceAll(" ","")) : null;
    this.props.financialData.setImmobilisedProduction(immobilisedProduction);
    this.props.onUpdate(this.props.financialData);
    this.updateInputs();
  }

  // Unstored production
  onUnstoredProductionChange = (event) => {
    if (!isNaN(parseFloat(event.target.value.replaceAll(" ","")))) {
      this.setState({unstoredProductionInput: parseFloat(event.target.value.replaceAll(" ",""))});
    } else if (event.target.value=="") {
      this.setState({unstoredProductionInput: null})
    }
  }
  onUnstoredProductionBlur = (event) => {
    let unstoredProduction = !isNaN(parseFloat(event.target.value.replaceAll(" ",""))) ? parseFloat(event.target.value.replaceAll(" ","")) : null;
    this.props.financialData.setUnstoredProduction(unstoredProduction);
    this.props.onUpdate(this.props.financialData);
    this.updateInputs();
  }

  /* --- Expenses --- */

  // Expenses
  onAmountExpensesChange = (event) => {
    if (!isNaN(parseFloat(event.target.value.replaceAll(" ","")))) {
      this.setState({amountExpensesInput: parseFloat(event.target.value.replaceAll(" ",""))});
    }  else if (event.target.value=="") {
      this.setState({amountExpensesInput: null})
    }
  }
  onAmountExpensesBlur = (event) => {
    let amountExpenses = !isNaN(parseFloat(event.target.value.replaceAll(" ",""))) ? parseFloat(event.target.value.replaceAll(" ","")) : null;
    this.props.financialData.setAmountExpenses(amountExpenses);
    this.props.onUpdate(this.props.financialData);
    this.updateInputs();
  }

  resyncAmountExpenses = (event) => {
    this.props.financialData.setAmountExpensesFixed(false);
    this.props.onUpdate(this.props.financialData);
    this.setState({amountExpensesInput: this.props.financialData.getAmountExpenses()});
  }

  // Depreciations
  onAmountDepreciationsChange = (event) => {
    if (!isNaN(parseFloat(event.target.value.replaceAll(" ","")))) {
      this.setState({amountDepreciationsInput: parseFloat(event.target.value.replaceAll(" ",""))});
    } else if (event.target.value=="") {
      this.setState({amountDepreciationsInput: null})
    }
  }
  onAmountDepreciationsBlur = (event) => {
    let amountDepreciations = !isNaN(parseFloat(event.target.value.replaceAll(" ",""))) ? parseFloat(event.target.value.replaceAll(" ","")) : null;
    this.props.financialData.setAmountDepreciations(amountDepreciations);
    this.props.onUpdate(this.props.financialData);
    this.updateInputs();
  }

  resyncAmountDepreciations = (event) => {
    this.props.financialData.setAmountDepreciationsFixed(false);
    this.props.onUpdate(this.props.financialData);
    this.setState({amountDepreciationsInput: this.props.financialData.getAmountDepreciations()});
  }

}