import React from 'react';

/* -------------------------------------------------------- */
/* -------------------- EXPENSES TABLE -------------------- */
/* -------------------------------------------------------- */

import { printValue } from "../../src/utils/Utils";
import { InputNumber } from '../InputNumber';
import { InputText } from '../InputText';

/* ---------- TABLE EXPENSES ---------- */

export class TableExpenses extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      showEditor: false,
      expenseToEdit: null,
    }
  }

  render() 
  {
    const {expenses,companies} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,expenseToEdit} = this.state;

    this.sortExpenses(expenses,columnSorted);

    return (
      <div className="group">
        <h3>Liste des dépenses</h3>
        <div className="actions">
          <button onClick={() => this.triggerEditor()}>Ajouter une dépense</button>
          {expenses.length > 0 &&
            <button onClick={() => this.removeAll()}>Supprimer tout</button>}
        </div>

        {expenses.length > 0 &&
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
                  <td className="auto" onClick={() => this.changeColumnSorted("company")}>Fournisseur</td>
                  <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
                  <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
                  <td colSpan="2"></td></tr>
              </thead>
              <tbody>
                {expenses.slice(page*nbItems,(page+1)*nbItems).map((expense) => {
                    return(<ExpenseRow key={"expense_"+expense.id} 
                                       {...expense}
                                       companies={companies}
                                       onEdit={this.editExpense.bind(this)}
                                       onDelete={this.deleteExpense.bind(this)}/>)
                })}
              </tbody>
            </table>
            {expenses.length > nbItems &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*nbItems < expenses.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
          </div>
        }

        {showEditor &&
          <ExpensePopup {...expenseToEdit}
                        companies={companies}
                        onAdd={this.addExpense.bind(this)}
                        onUpdate={this.updateExpense.bind(this)}
                        onClose={this.closeEditor.bind(this)}/>}
      </div>
    )
  }

  /* ----- ACTIONS ----- */

  // Manage editor
  triggerEditor = () => this.setState({showEditor: true, expenseToEdit: null}) // New Expense
  closeEditor = () => this.setState({showEditor: false})
  
  // Remove all expenses
  removeAll = () => {this.props.financialData.removeExpenses();this.forceUpdate()}

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortExpenses(expenses,columSorted) {
    switch(columSorted) {
      case "label": expenses.sort((a,b) => a.label.localeCompare(b.label)); break;
      case "company": expenses.sort((a,b) => a.companyName.localeCompare(b.companyName)); break;
      case "account": expenses.sort((a,b) => a.account.localeCompare(b.account)); break;
      case "amount": expenses.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) expenses.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.expenses.length) this.setState({page: this.state.page+1})}

  /* ----- OPERATIONS ON EXPENSE ----- */

  editExpense = (id) => {this.setState({showEditor: true, expenseToEdit: this.props.financialData.getExpense(id)})}
  async addExpense(props) {await this.props.financialData.addExpense(props);this.props.onUpdate();this.forceUpdate()}
  async updateExpense(nextProps) {await this.props.financialData.updateExpense(nextProps);this.props.onUpdate()}
  deleteExpense = (id) => {this.props.financialData.removeExpense(id);this.props.onUpdate();this.forceUpdate()}

}

/* ---------- ROW EXPENSE ---------- */

function ExpenseRow(props) 
{
  const {id,label,amount,account} = props
  const {corporateName} = props.companies.filter(company => company.id==props.companyId)[0];
  
  return (
    <tr>
      <td className="auto">{label}</td>
      <td className="auto">{corporateName}</td>
      <td className="short center">{account}</td>
      <td className="short right">{printValue(amount,0)}</td>
      <td className="column_unit">&nbsp;€</td>
      <td className="column_icon">
        <img className="img" src="/resources/icon_change.jpg" alt="change" 
              onClick={() => props.onEdit(id)}/></td>
      <td className="column_icon">
        <img className="img" src="/resources/icon_delete.jpg" alt="delete" 
              onClick={() => props.onDelete(id)}/></td>
    </tr>
  )
}

/* -------------------------------------------------------- */
/* -------------------- EXPENSE POP-UP -------------------- */
/* -------------------------------------------------------- */

/* ---------- NEW / CHANGE EXPENSE POP-UP ---------- */

class ExpensePopup extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      label: props.label || "",
      amount: props.amount || 0,
      companyName: props.companyName || "",
      account: props.account || "",
    }
  }

  render() 
  {
    const {companies} = this.props;
    const {label,companyName,account,amount} = this.state;

    return (
      <div className="popup">
        <div className="popup-inner">
          <h3>{this.props.id == undefined ? "Ajout d'une dépense" : "Modification"}</h3>
          <div className="inputs">
            <div className="inline-input">
                <label>Libellé* </label>
                <InputText value={label} onUpdate={this.updateLabel.bind(this)}/>
            </div>
            <div className="inline-input short">
                <label>Montant* </label>
                <InputNumber className="input-number" value={amount} onUpdate={this.updateAmount.bind(this)}/>
                <span>&nbsp;€</span>
            </div>
            <div className="inline-input short">
                <label>Compte </label>
                <InputText value={account} onUpdate={this.updateAccount.bind(this)}/>
            </div>
            <div className="inline-input">
                <label>Fournisseur* </label>
                <input value={companyName} 
                       list="companies"
                       onChange={this.onCompanyNameChange}
                       onKeyPress={this.onEnterPress}/>
              <datalist id="companies">
                { companies.map((company) => {return <option key={company.id} value={company.corporateName}/>})}
              </datalist>
            </div>
          </div>
          <div className="footer">
            <button onClick={() => this.props.onClose()}>Fermer</button>
            <button disabled={label=="" || amount=="" || companyName==""} onClick={() => this.updateExpense()}>Enregistrer</button>
          </div>
        </div>
      </div>
    )
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  updateLabel = (nextLabel) => this.setState({label: nextLabel})
  updateAccount = (nextAccount) => this.setState({account: nextAccount})
  updateAmount = (nextAmount) => {if (nextAmount!=null) this.setState({amount: nextAmount})}
  onCompanyNameChange = (event) => this.setState({companyName: event.target.value})

  /* ----- PROPS METHODS ----- */

  updateExpense() {
    if (this.props.id!=undefined) {this.props.onUpdate({id: this.props.id, ...this.state})}
    else                          {this.props.onAdd({...this.state})}
    this.props.onClose();
  }

}