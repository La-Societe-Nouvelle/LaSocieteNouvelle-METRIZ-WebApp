import React from 'react';

/* -------------------------------------------------------- */
/* -------------------- EXPENSES TABLE -------------------- */
/* -------------------------------------------------------- */

import { printValue } from "../../src/utils/Utils";
import { InputNumber } from '../InputNumber';
import { InputText } from '../InputText';

/* ---------- TABLE EXPENSES ---------- */

export class TableFinalStocks extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      showEditor: false,
      stockToEdit: null,
    }
  }

  render() 
  {
    const {finalStocks} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,stockToEdit} = this.state;

    this.sortItems(finalStocks,columnSorted);

    return (
      <div className="group">
        <h3>Etat des stocks (fin d'exercice)</h3>
        <div className="actions">
          <button onClick={() => this.triggerEditor()}>Ajouter un stock</button>
          {finalStocks.length > 0 &&
            <button onClick={() => this.removeAll()}>Supprimer tout</button>}
        </div>

        {finalStocks.length > 0 &&
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
                  <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
                  <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
                  <td colSpan="2"></td></tr>
              </thead>
              <tbody>
                {finalStocks.slice(page*nbItems,(page+1)*nbItems).map((stock) => {
                    return(<StockRow key={"stock_"+stock.id} 
                                       {...stock}
                                       onEdit={this.editStock.bind(this)}
                                       onDelete={this.deleteStock.bind(this)}/>)
                })}
              </tbody>
            </table>
            {finalStocks.length > nbItems &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*nbItems < finalStocks.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
          </div>
        }

        {showEditor &&
          <Popup {...stockToEdit}
                 onAdd={this.addStock.bind(this)}
                 onUpdate={this.updateStock.bind(this)}
                 onClose={this.closeEditor.bind(this)}/>}
      </div>
    )
  }

  /* ----- ACTIONS ----- */

  // Manage editor
  triggerEditor = () => this.setState({showEditor: true, stockToEdit: null}) // New Stock
  closeEditor = () => this.setState({showEditor: false})
  
  // Remove all expenses
  removeAll = () => {this.props.financialData.removeFinalStocks();this.forceUpdate()}

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortItems(items,columSorted) {
    switch(columSorted) {
      case "label": items.sort((a,b) => a.label.localeCompare(b.label)); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
      case "amount": items.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.finalStocks.length) this.setState({page: this.state.page+1})}

  /* ----- OPERATIONS ON EXPENSE ----- */

  editStock = (id) => {this.setState({showEditor: true, stockToEdit: this.props.financialData.getFinalStock(id)})}
  addStock =  async (props) => {await this.props.financialData.addFinalStock(props);this.props.onUpdate()}
  updateStock =  async (nextProps) => {await this.props.financialData.updateFinalStock(nextProps);this.props.onUpdate()}
  deleteStock = async (id) => {await this.props.financialData.removeFinalStock(id);this.props.onUpdate();this.forceUpdate()}

}

/* ---------- ROW EXPENSE ---------- */

function StockRow(props) 
{
  const {id,label,amount,account} = props
  
  return (
    <tr>
      <td className="auto">{label}</td>
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
/* -------------------- STOCK POP-UP -------------------- */
/* -------------------------------------------------------- */

/* ---------- NEW / CHANGE STOCK POP-UP ---------- */

class Popup extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      label: props.label || "",
      amount: props.amount || 0,
      account: props.account || "",
    }
  }

  render() 
  {
    const {label,account,amount} = this.state;

    return (
      <div className="popup">
        <div className="popup-inner">
          <h3>{this.props.id == undefined ? "Ajout d'un stock" : "Modification"}</h3>
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
          </div>
          <div className="footer">
            <button onClick={() => this.props.onClose()}>Fermer</button>
            <button disabled={label=="" || amount==""} onClick={() => this.updateExpense()}>Enregistrer</button>
          </div>
        </div>
      </div>
    )
  }

  updateLabel = (nextLabel) => this.setState({label: nextLabel})
  updateAccount = (nextAccount) => this.setState({account: nextAccount})
  updateAmount = (nextAmount) => {if (nextAmount!=null) this.setState({amount: nextAmount})}

  /* ----- PROPS METHODS ----- */

  updateExpense() {
    if (this.props.id!=undefined) {this.props.onUpdate({id: this.props.id, ...this.state})}
    else                          {this.props.onAdd({...this.state})}
    this.props.onClose();
  }

}