import React from 'react';

import { FECFileReader, processFECData } from '../../src/readers/FECReader';
import { CSVFileReader, processCSVExpensesData } from '../../src/readers/CSVReader';
import { InputText } from '../InputText';
import { InputNumber } from '../InputNumber.js';

/* ------------------------------------------------------ */
/* -------------------- EXPENSES TAB -------------------- */
/* ------------------------------------------------------ */

export class FinancialExpensesTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      triggerNewExpense: false
    }
  }

  render() {
    const {financialData} = this.props;
    const {triggerNewExpense} = this.state;
    return(
      <div className="financial-tab-view-inner">
        <div className="groups">
          <div className="group">
            <h3>Liste des dépenses</h3>
            
            <div className="actions">
              <button onClick={() => {document.getElementById('import-fec').click()}}>Importer un fichier FEC</button>
                <input id="import-fec" type="file" accept=".csv" onChange={this.importFECFile} visibility="collapse"/>
              <button onClick={() => document.getElementById('import-expenses').click()}>Importer un fichier CSV</button>
                <input id="import-expenses" type="file" accept=".csv" onChange={this.importCSVFile} visibility="collapse"/>
              <button onClick={() => this.triggerChange()}>Ajouter une dépense</button>
              {financialData.expenses.length > 0 && 
                <button onClick={() =>this.removeAll}>Supprimer tout</button>}
            </div>
            
            {financialData.expenses.length > 0 &&
              <TableExpenses 
                financialData={financialData} 
                onUpdate={this.updateFinancialData.bind(this)}/>}
          </div>
          
          {triggerNewExpense &&
            <ExpensePopup companies={financialData.companies}
                          onUpdate={this.addExpense.bind(this)}
                          onClose={this.closeChange.bind(this)}/>}
        </div>
      </div>
  )}

  /* ----- ACTIONS ----- */

  // Import FEC File
  importFECFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      FECFileReader(reader.result)
        .then((FECData) => processFECData(FECData))
        .then(async (nextFinancialData) => {
          this.props.financialData.removeExpenses();
          await Promise.all(nextFinancialData.expenses.map(async (expense) => {
            return this.props.financialData.addExpense(expense)
          }))
        })
        .then(() => this.forceUpdate())
      };
    reader.readAsText(event.target.files[0]);
  }

  // Import CSV File
  importCSVFile = (event) => {
    let reader = new FileReader();
    reader.onload = async () => {
      CSVFileReader(reader.result)
        .then((CSVData) => processCSVExpensesData(CSVData))
        .then(async (nextFinancialData) => {
          this.props.financialData.removeExpenses();
          await Promise.all(nextFinancialData.expenses.map(async (expense) => {
            return this.props.financialData.addExpense(expense)
          }))
        })
        .then(() => this.forceUpdate())
      };
    reader.readAsText(event.target.files[0]);
  }
  
  // Add nex expense
  triggerChange() {
    this.setState({triggerNewExpense: true})
  }

  closeChange() {
    this.setState({triggerNewExpense: false})
  }

  // Remove all expenses
  removeAll() {
    this.props.financialData.removeExpenses();
    this.props.onUpdate(this.props.financialData);
    this.forceUpdate();
  }

  /* ----- PROPS METHODS ----- */

  async addExpense(props) {
    let expense = await this.props.financialData.addExpense(props);
    this.updateFinancialData(this.props.financialData);
  }

  updateFinancialData(financialData) {
    this.props.onUpdate(financialData);
    this.forceUpdate();
  }

}

/* -------------------------------------------------------- */
/* -------------------- EXPENSES TABLE -------------------- */
/* -------------------------------------------------------- */

/* ---------- TABLE EXPENSES ---------- */

class TableExpenses extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      triggerChange: false,
      expenseChange: null,
    }
  }

  render() {
    const {expenses,companies} = this.props.financialData;
    const {columnSorted,nbItems,page,triggerChange,expenseChange} = this.state;
    this.sortExpenses(expenses,columnSorted);
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <td className="column_auto" 
                  onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="column_auto" 
                  onClick={() => this.changeColumnSorted("company")}>Fournisseur</td>
              <td className="column_short-input" 
                  onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="column_amount" colSpan="2" 
                  onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              <td colSpan="2"></td></tr>
          </thead>
          <tbody>
            {
              expenses.slice(page*nbItems,(page+1)*nbItems).map((expense) => {
                return(<RowTableExpenses 
                          key={"expense_"+expense.getId()} 
                          {...expense}
                          companies={companies}
                          onUpdate={this.updateExpense.bind(this)}
                          onChange={this.changeExpense.bind(this)}
                          onDelete={this.deleteExpense.bind(this)}/>)
              })
            }
          </tbody>
        </table>
        {expenses.length > nbItems &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*nbItems < expenses.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
        {triggerChange &&
          <ExpensePopup {...expenseChange}
                        companies={companies}
                        onUpdate={this.updateExpense.bind(this)}
                        onClose={this.closeChange.bind(this)}/>}
      </div>
    )
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted) {
      this.setState({columnSorted: columnSorted, reverseSort: false})
    } else {
      this.setState({reverseSort: !this.state.reverseSort});
    }
  }

  sortExpenses(expenses,columSorted) {
    switch(columSorted) {
      case "label": expenses.sort((a,b) => a.getLabel().localeCompare(b.getLabel())); break;
      case "company": expenses.sort((a,b) => a.getCorporateName().localeCompare(b.getCorporateName())); break;
      case "account": expenses.sort((a,b) => a.getAccount().localeCompare(b.getAccount())); break;
      case "amount": expenses.sort((a,b) => b.getAmount() - a.getAmount()); break;
    }
    if (this.state.reverseSort) expenses.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {
    let currentPage = this.state.page;
    if (currentPage > 0) this.setState({page: currentPage-1})
  }

  nextPage = () => {
    let currentPage = this.state.page;
    if ((currentPage+1)*this.state.nbItems < this.props.financialData.expenses.length) {
      this.setState({page: currentPage+1})
    }
  }

  /* ----- OPERATIONS ON EXPENSE ----- */

  async addExpense(props) {
    let expense = await this.props.financialData.addExpense(props)
    this.updateFinancialData();
  }

  updateExpense(props) {
    this.props.financialData.updateExpense(props)
    this.updateFinancialData();
  }

  deleteExpense(expenseId) {
    this.props.financialData.removeExpense(expenseId);
    this.updateFinancialData();
  }

  changeExpense(expenseId) {
    this.setState({
      triggerChange: true,
      expenseChange: this.props.financialData.getExpense(expenseId)
    })
  }

  closeChange() {
    this.setState({
      triggerChange: false
    })
  }

  /* ----- OPERATIONS ON DEPRECIATION ----- */
  
  updateFinancialData() {
    this.props.onUpdate(this.props.financialData);
    this.forceUpdate();
  }

}

/* ---------- ROW EXPENSE ---------- */

class RowTableExpenses extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      label: props.label,
      corporateName: props.corporateName,
      account: props.account,
      amount: props.amount
    }
  }

  componentDidUpdate(prevProps) { 
    if (this.props !== prevProps) {
      this.setState({
        label: this.props.label,
        corporateName: this.props.corporateName,
        account: this.props.account,
        amount: this.props.amount
      })
    }
  }

  render() {
    const {dataFetched} = this.props;
    const {label,corporateName,account,amount} = this.state;
    return (
      <tr>
        <td className="column_auto">
          <input value={label} 
                 onChange={this.onLabelChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className={"column_auto"+(dataFetched ? " valid" : "")}>
          <input value={corporateName} 
                 list="companies"
                 onChange={this.onCorporateNameChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/>
          <datalist id="companies">
            { this.props.companies.map((company) => {return <option key={company.id} value={company.corporateName}/>} )}
          </datalist></td>
        <td className="column_short-input">
          <input value={account} 
                 onChange={this.onAccountChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className="column_short-input">
          <input value={amount} 
                 onFocus={this.onAmountFocus}
                 onChange={this.onAmountChange}
                 onBlur={this.onBlur} 
                 onKeyPress={this.onEnterPress}/></td>
        <td className="column_unit">&nbsp;€</td>
        <td className="column_icon">
          <img className="img" src="/resources/icon_change.jpg" alt="change" 
               onClick={() => this.changeExpense()}/></td>
        <td className="column_icon">
          <img className="img" src="/resources/icon_delete.jpg" alt="delete" 
               onClick={() => this.deleteExpense()}/></td>
      </tr>
    )
  }
  
  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  onLabelChange = (event) => {
    this.setState({label: event.target.value})
  }
  onCorporateNameChange = (event) => {
    this.setState({corporateName: event.target.value})
  }
  onAccountChange = (event) => {
    this.setState({account: event.target.value})
  }
  onAmountChange = (event) => {
    this.setState({amount: event.target.value})
  }

  onAmountFocus = (event) => {
    this.setState({amount: event.target.value.replace(/^0$/,"")})
  }
  
  onBlur = () => {
    let nextProps = {id: this.props.id, ...this.state};
    nextProps.amount = !isNaN(parseFloat(nextProps.amount)) ? parseFloat(nextProps.amount) : undefined;
    this.props.onUpdate(nextProps);
  }

  /* ----- PROPS METHODS ----- */

  changeExpense() {
    this.props.onChange(this.props.id)
  }

  deleteExpense() {
    this.props.onDelete(this.props.id)
  }

}

/* ---------- NEW / CHANGE EXPENSE POP-UP ---------- */

class ExpensePopup extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      label: props.label || "",
      amount: props.amount || 0,
      corporateName: props.corporateName || "",
      account: props.account || "",
    }
  }

  render() {
    const {label,corporateName,account,amount} = this.state;
    return (
      <div className="popup">
        <div className="popup-inner">
          <h3>{this.props.id == undefined ? "Ajout d'une dépense" : "Modification"}</h3>
          <div className="inputs">
            <div className="inline-input">
                <label>Libellé </label>
                <InputText value={label} onUpdate={this.updateLabel.bind(this)}/>
            </div>
            <div className="inline-input short">
                <label>Montant </label>
                <InputNumber className="input-number" value={amount} onUpdate={this.updateAmount.bind(this)}/>
                <span>&nbsp;€</span>
            </div>
            <div className="inline-input short">
                <label>Compte </label>
                <InputText value={account} onUpdate={this.updateAccount.bind(this)}/>
            </div>
            <div className="inline-input">
                <label>Fournisseur </label>
                <input value={corporateName} 
                  list="companies"
                  onChange={this.onCorporateNameChange}
                  onKeyPress={this.onEnterPress}/>
              <datalist id="companies">
                { this.props.companies.map((company) => {return <option key={company.id} value={company.corporateName}/>})}
              </datalist>
            </div>
          </div>
          <div className="footer">
            <button onClick={() => this.props.onClose()}>Fermer</button>
            <button onClick={() => this.updateExpense()}>Enregistrer</button>
          </div>
        </div>
      </div>
    )
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  updateLabel(nextLabel) {
    this.setState({label: nextLabel})
  }

  onCorporateNameChange = (event) => {
    this.setState({corporateName: event.target.value})
  }

  updateAccount(nextAccount) {
    this.setState({account: nextAccount})
  }

  updateAmount(nextAmount) {
    if (nextAmount!=null) {
      this.setState({amount: nextAmount})  
    }
  }

  /* ----- PROPS METHODS ----- */

  updateExpense() {
    this.props.onUpdate({id: this.props.id, ...this.state});
    this.props.onClose();
  }

}