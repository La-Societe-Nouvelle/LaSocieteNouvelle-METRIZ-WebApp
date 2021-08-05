import React from 'react';

/* -------------------------------------------------------- */
/* -------------------- EXPENSES TABLE -------------------- */
/* -------------------------------------------------------- */

import { printValue } from "../../src/utils/Utils";
import { InputNumber } from '../InputNumber';
import { InputText } from '../InputText';

/* ---------- TABLE EXPENSES ---------- */

export class TableDiscounts extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      showEditor: false,
      discountToEdit: null,
    }
  }

  render() 
  {
    const {purchasesDiscounts} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,discountToEdit} = this.state;

    this.sortItems(purchasesDiscounts,columnSorted);

    return (
      <div className="group">
        <h3>Rabais, remises, ristournes</h3>
        <div className="actions">
          <button onClick={() => this.triggerEditor()}>Ajouter une remise</button>
          {purchasesDiscounts.length > 0 &&
            <button onClick={() => this.removeAll()}>Supprimer tout</button>}
        </div>

        {purchasesDiscounts.length > 0 &&
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
                {purchasesDiscounts.slice(page*nbItems,(page+1)*nbItems).map((discount) => {
                    return(<DiscountRow key={"discount_"+discount.id} 
                                        {...discount}
                                        onEdit={this.editDiscount.bind(this)}
                                        onDelete={this.deleteDiscount.bind(this)}/>)
                })}
              </tbody>
            </table>
            {purchasesDiscounts.length > nbItems &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*nbItems < purchasesDiscounts.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
          </div>
        }

        {showEditor &&
          <Popup {...discountToEdit}
                 companies={this.props.financialData.getCompaniesExpenses()}
                 onAdd={this.addDiscount.bind(this)}
                 onUpdate={this.updateDiscount.bind(this)}
                 onClose={this.closeEditor.bind(this)}/>}
      </div>
    )
  }

  /* ----- ACTIONS ----- */

  // Manage editor
  triggerEditor = () => this.setState({showEditor: true, discountToEdit: null}) // New Stock
  closeEditor = () => this.setState({showEditor: false})
  
  // Remove all discounts
  removeAll = () => {this.props.financialData.removePurchasesDiscounts();this.forceUpdate()}

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortItems(items,columSorted) {
    switch(columSorted) {
      case "label": items.sort((a,b) => a.label.localeCompare(b.label)); break;
      case "company": items.sort((a,b) => a.companyName.localeCompare(b.companyName)); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
      case "amount": items.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.purchasesDiscounts.length) this.setState({page: this.state.page+1})}

  /* ----- OPERATIONS ON DISCOUNT ----- */

  editDiscount = (id) => {this.setState({showEditor: true, discountToEdit: this.props.financialData.getDiscount(id)})}
  addDiscount =  async (props) => {await this.props.financialData.addDiscount(props);this.props.onUpdate()}
  updateDiscount =  async (nextProps) => {await this.props.financialData.updateDiscount(nextProps);this.props.onUpdate()}
  deleteDiscount = async (id) => {await this.props.financialData.removeDiscount(id);this.props.onUpdate();this.forceUpdate()}

}

/* ---------- ROW DISCOUNT ---------- */

function DiscountRow(props) 
{
  const {id,label,companyName,amount,accountProvider} = props
  
  return (
    <tr>
      <td className="auto">{label}</td>
      <td className="auto">{companyName}</td>
      <td className="short center">{accountProvider}</td>
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

/* --------------------------------------------------------- */
/* -------------------- DISCOUNT POP-UP -------------------- */
/* --------------------------------------------------------- */

/* ---------- NEW / CHANGE DISCOUNT POP-UP ---------- */

class Popup extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      label: props.label || "",
      companyName: props.companyName || "",
      amount: props.amount || 0,
    }
  }

  render() 
  {
    const {companies} = this.props;
    const {label,companyName,amount} = this.state;

    return (
      <div className="popup">
        <div className="popup-inner">
          <h3>{this.props.id == undefined ? "Ajout d'une remise" : "Modification"}</h3>
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
            <div className="inline-input">
                <label>Fournisseur* </label>
                <select onChange={this.onCompanyNameChange} value={companyName}>{
                  companies.sort((a,b) => a.corporateName.localeCompare(b.corporateName))
                    .map(company => <option key={company.id} value={company.corporateName}>{company.corporateName}</option>)}
                  {companyName=="" && <option key={"else"} value={""}>{" ---"}</option>}
                </select>
            </div>
          </div>
          <div className="footer">
            <button onClick={() => this.props.onClose()}>Fermer</button>
            <button disabled={label=="" || amount==""} onClick={() => this.updateDiscount()}>Enregistrer</button>
          </div>
        </div>
      </div>
    )
  }

  onEnterPress = (event) => {if (event.which==13) event.target.blur()}

  updateLabel = (nextLabel) => this.setState({label: nextLabel})
  updateAmount = (nextAmount) => {if (nextAmount!=null) this.setState({amount: nextAmount})}
  onCompanyNameChange = (event) => this.setState({companyName: event.target.value})

  /* ----- PROPS METHODS ----- */

  updateDiscount() {
    if (this.props.id!=undefined) {this.props.onUpdate({id: this.props.id, ...this.state})}
    else                          {this.props.onAdd({...this.state})}
    this.props.onClose();
  }

}