import React from 'react';

import { InputText } from '../InputText';
import { InputNumber } from '../InputNumber.js';

import { printValue } from '../../src/utils/Utils';

import { divisions } from '../../lib/nace'; 
import { areas } from '../../lib/area'; 

/* ----------------------------------------------------------- */
/* -------------------- DEPRECIATIONS TAB -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDepreciationsTab extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const {financialData} = this.props;
    return(
      <div className="financial-tab-view-inner">
        <div className="groups">
          <TableImmobilisations financialData={financialData} onUpdate={this.updateFinancialData.bind(this)} didUpdate={this.props.didUpdate}/>
          <TableDepreciations financialData={financialData} onUpdate={this.updateFinancialData.bind(this)}/>
          <TableInvestments financialData={financialData} onUpdate={this.updateFinancialData.bind(this)}/>
        </div>
    </div>
  )}

  updateFinancialData() {
    this.props.onUpdate();
    this.forceUpdate();
  }
}

/* ------------------------------------------------------------- */
/* -------------------- DEPRECIATIONS TABLE -------------------- */
/* ------------------------------------------------------------- */

/* ---------- TABLE DEPRECIATIONS ---------- */

class TableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      showEditor: false,
      depreciationToEdit: null,
    }
  }

  render() 
  {
    const {depreciations,immobilisations} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,depreciationToEdit} = this.state;
    
    this.sortItems(depreciations,columnSorted);
    
    return (
      <div className="group">
        <h3>Liste des dotations aux amortissements</h3>
        <div className="actions">
          <button onClick={() => this.triggerEditor()}>Ajouter une dotation</button>
          {depreciations.length > 0 &&
            <button onClick={() => this.removeAll()}>Supprimer tout</button>}
        </div>

        {depreciations.length > 0 &&
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
                  <td className="short center" onClick={() => this.changeColumnSorted("accountImmobilisation")}>Immobilisation</td>
                  <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
                  <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
                  <td colSpan="2"></td></tr>
              </thead>
              <tbody>
                {depreciations.slice(page*nbItems,(page+1)*nbItems).map((depreciation) => {
                  return(<RowTableDepreciations key={"depreciation_"+depreciation.id} 
                                                {...depreciation}
                                                immobilisations={immobilisations}
                                                onEdit={this.editDepreciation.bind(this)}
                                                onDelete={this.deleteDepreciation.bind(this)}/>)
                })}
              </tbody>
            </table>
            {depreciations.length > nbItems &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*nbItems < depreciations.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
          </div>}
        
        {showEditor &&
        <DepreciationPopup {...depreciationToEdit}
                           immobilisations={immobilisations}
                           onAdd={this.addDepreciation.bind(this)}
                           onUpdate={this.updateDepreciation.bind(this)}
                           onClose={this.closeEditor.bind(this)}/>}
      </div>
    )
  }

  /* ---------- ACTIONS ---------- */

  // Manage editor
  triggerEditor = () => this.setState({showEditor: true, depreciationToEdit: null}) // New Depreciation
  closeEditor = () => this.setState({showEditor: false})
  
  // Remove all depreciations
  removeAll = () => {this.props.financialData.removeDepreciations();this.forceUpdate()}

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortItems(items,columSorted) {
    switch(columSorted) {
      case "label": items.sort((a,b) => a.label.localeCompare(b.label)); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
      case "accountImmobilisation": items.sort((a,b) => a.accountImmobilisation.localeCompare(b.accountImmobilisation)); break;
      case "amount": items.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.depreciations.length) this.setState({page: this.state.page+1})}
  
  /* ----- OPERATIONS ON DEPRECIATION ----- */

  editDepreciation = (id) => this.setState({showEditor: true, depreciationToEdit: this.props.financialData.getDepreciation(id)})
  async addDepreciation(props) {await this.props.financialData.addDepreciation(props)}
  async updateDepreciation(nextProps) {await this.props.financialData.updateDepreciation(nextProps)}
  deleteDepreciation = (id) => {this.props.financialData.removeDepreciation(id);this.forceUpdate()}
  
  /* ----- PROPS METHOD ----- */
  
  updateFinancialData() {
    this.props.onUpdate(this.props.financialData);
  }

}

/* ---------- ROW DEPRECIATION ---------- */

function RowTableDepreciations(props) {
  
  const {label,amount,account,accountImmobilisation} = props;

  return (
    <tr>
      <td className="auto">{label}</td>
      <td className="short center">{accountImmobilisation}</td>
      <td className="short center">{account}</td>
      <td className="short right">{printValue(amount,0)}</td>
      <td className="column_unit">&nbsp;€</td>
      <td className="column_icon">
        <img className="img" src="/resources/icon_change.jpg" alt="change" 
              onClick={() => props.onEdit(props.id)}/></td>
      <td className="column_icon">
        <img className="img" src="/resources/icon_delete.jpg" alt="delete" 
              onClick={() => props.onDelete(props.id)}/></td>
    </tr>
  )
}

/* ---------- NEW / CHANGE DEPRECIATION POP-UP ---------- */

class DepreciationPopup extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        label: props.label || "",
        amount: props.amount || 0,
        corporateName: props.corporateName || "",
        account: props.account || "",
        accountImmobilisation: props.accountImmobilisation || "",
      }
    }
  
    render() {
      const {immobilisations} = this.props;
      const {label,accountImmobilisation,account,amount} = this.state;
      return (
        <div className="popup">
          <div className="popup-inner">
            <h3>{this.props.id == undefined ? "Ajout d'une dotation aux amortissements" : "Modification"}</h3>
            <div className="inputs">
              <div className="inline-input long">
                  <label>Libellé </label>
                  <InputText value={label} onUpdate={this.updateLabel.bind(this)}/>
              </div>
              <div className="inline-input short right">
                  <label>Montant </label>
                  <InputNumber className="input-number" value={amount} onUpdate={this.updateAmount.bind(this)}/>
                  <span>&nbsp;€</span>
              </div>
              <div className="inline-input short">
                  <label>Compte </label>
                  <InputText value={account} onUpdate={this.updateAccount.bind(this)}/>
              </div>
              <div className="inline-input long">
                  <label>Compte d'immobilisation </label>
                  <select onChange={this.onAccountImmobilisationSelect} value={accountImmobilisation}>{
                    immobilisations.map(({label,account}) => { return(
                        <option key={account} value={account}>{account + " - " +label}</option>
                    )})}
                    {accountImmobilisation=="" && <option key={"else"} value={""}>{"---"}</option>}
                  </select>
              </div>
            </div>
            <div className="footer">
              <button onClick={() => this.props.onClose()}>Fermer</button>
              <button onClick={() => this.updateDepreciation()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )
    }
    
    updateLabel = (nextLabel) => this.setState({label: nextLabel})  
    updateAccount = (nextAccount) => this.setState({account: nextAccount})  
    updateAmount = (nextAmount) => {if (nextAmount!=null) this.setState({amount: nextAmount})}
    onAccountImmobilisationSelect = (event) => this.setState({accountImmobilisation: event.target.value})
  
    /* ----- PROPS METHODS ----- */
  
    updateDepreciation() {
      if (this.props.id!=undefined) {this.props.onUpdate({id: this.props.id, ...this.state})}
      else                          {this.props.onAdd({...this.state})}
      this.props.onClose();
    }
  
  }

/* -------------------------------------------------------------- */
/* -------------------- IMMOBILISATION TABLE -------------------- */
/* -------------------------------------------------------------- */

/* ---------- TABLE IMMOBILISATIONS ---------- */

class TableImmobilisations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 10,
      page: 0,
      showEditor: false,
      immobilisationToEdit: null,
    }
  }

  render() {
    const {immobilisations} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,immobilisationToEdit} = this.state;
    this.sortItems(immobilisations,columnSorted);
    return (
      <div className="group">
        <h3>Etat des immobilisations (début d'exercice)</h3>
        <div className="actions">
          <button onClick={() => this.triggerEditor()}>Ajouter une immobilisation</button>
          {immobilisations.length > 0 &&
            <button onClick={() => this.removeAll()}>Supprimer tout</button>}
          {immobilisations.length > 0 &&
            <button onClick={() => this.synchroniseAll()}>Synchroniser les données</button>}
        </div>

        {immobilisations.length > 0 &&
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
                  <td className="long">Empreinte sociétale</td>
                  <td className="short" onClick={() => this.changeColumnSorted("account")}>Compte</td>
                  <td className="short" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
                  <td colSpan="2"></td></tr>
              </thead>
              <tbody>
                {immobilisations.slice(page*nbItems,(page+1)*nbItems).map((immobilisation) => {
                  return(<RowTableImmobilisations key={"immobilisation_"+immobilisation.id} 
                                                  {...immobilisation}
                                                  onUpdate={this.updateImmobilisation.bind(this)}
                                                  onEdit={this.editImmobilisation.bind(this)}
                                                  onDelete={this.deleteImmobilisation.bind(this)}/>)
                })}
              </tbody>
            </table>
            {immobilisations.length > nbItems &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*nbItems < immobilisations.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
          </div>}
          {showEditor &&
            <ImmobilisationPopup {...immobilisationToEdit}
                                 onAdd={this.addImmobilisation.bind(this)}
                                 onUpdate={this.updateImmobilisation.bind(this)}
                                 onClose={this.closeEditor.bind(this)}/>}
      </div>
    )
  }

  /* ---------- ACTIONS ---------- */

  // Manage editor
  triggerEditor = () => this.setState({showEditor: true, immobilisationToEdit: null}) // add new immobilisation
  closeEditor = () =>this.setState({showEditor: false})

  // Remove all immobilisations
  removeAll = () => {this.props.financialData.removeImmobilisations();this.forceUpdate()}
  
  // Synchronisation
  async synchroniseAll() {
    await Promise.all(this.props.financialData.immobilisations.map(async immobilisation => {
      await this.fetchDataImmobilisation(immobilisation);
      return;
    }));
    this.props.didUpdate();
    this.forceUpdate();
  }

  async fetchDataImmobilisation(immobilisation) {
    await immobilisation.updateFootprintFromRemote();
    //this.props.financialData.updateImmobilisation(immobilisation);
    //this.forceUpdate();
  }

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
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.immobilisations.length) this.setState({page: this.state.page+1})}
  
  /* ----- OPERATIONS ON IMMOBILISATION ----- */

  editImmobilisation = (id) => this.setState({showEditor: true, immobilisationToEdit: this.props.financialData.getImmobilisation(id)})
  async addImmobilisation(props) {await this.props.financialData.addImmobilisation(props)}
  async updateImmobilisation(nextProps) {await this.props.financialData.updateImmobilisation(nextProps);this.props.onUpdate();this.forceUpdate()}
  deleteImmobilisation = (id) => {this.props.financialData.removeImmobilisation(id);this.props.onUpdate();this.forceUpdate()} // TO DO : update others tables

}

/* ---------- ROW IMMOBILISATION ---------- */

function RowTableImmobilisations(props) 
{
  const {id,label,amount,account,prevFootprintLoaded,footprintActivityCode,dataFetched} = props;
  
  const activityCode = footprintActivityCode.substring(0,2);
  const footprintDescription = prevFootprintLoaded ? "Reprise sur exercice précédent" : (activityCode!="00" ? "Empreinte des activités \""+divisions[activityCode]+"\"" : "Empreinte de la production française");

  const onActivityCodeChange = (event) => props.onUpdate({id: id, footprintActivityCode: event.target.value})

  return (
    <tr>
      <td className="auto">{label}</td>
      {prevFootprintLoaded &&
        <td className="long left crop"><span>{footprintDescription}</span></td>}
      {!prevFootprintLoaded &&
        <td className={"medium"+(dataFetched === true ? " valid" : "")}>
        <select onChange={onActivityCodeChange} value={activityCode}>{
          Object.entries(divisions)
            .sort((a,b) => parseInt(a)-parseInt(b))
            .map(([code,libelle]) => { return(
              <option className={(activityCode && code==activityCode) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>
              )})
        }</select></td>}
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

/* ---------- NEW / CHANGE IMMOBILISATION POP-UP ---------- */

class ImmobilisationPopup extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        label: props.label || "",
        amount: props.amount || "",
        account: props.account || "",
        footprintActivityCode: props.footprintActivityCode || "00",
      }
    }
  
    render() {
      const {label,amount,account,footprintActivityCode} = this.state;
      return (
        <div className="popup">
          <div className="popup-inner">
            <h3>{this.props.id == undefined ? "Ajout d'une immobilisation" : "Modification"}</h3>
            <div className="inputs">
              <div className="inline-input long">
                  <label>Libellé </label>
                  <InputText value={label} onUpdate={this.updateLabel.bind(this)}/>
              </div>
              <div className="inline-input short">
                  <label>Valeur </label>
                  <InputNumber className="input-number" value={amount} onUpdate={this.updateAmount.bind(this)}/>
                  <span>&nbsp;€</span>
              </div>
              <div className="inline-input short">
                  <label>Compte </label>
                  <InputText value={account} onUpdate={this.updateAccount.bind(this)}/>
              </div>
              <div className="inline-input long">
                <label>Activités associées </label>
                <select onChange={this.onActivityCodeChange} value={footprintActivityCode.substring(0,2)}>
                  {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b)).map(([code,libelle]) => { return(
                    <option key={code} value={code}>{code + " - " +libelle}</option>
                  )})
                }</select>
              </div>
            </div>
            <div className="footer">
              <button onClick={() => this.props.onClose()}>Fermer</button>
              <button onClick={() => this.updateImmobilisation()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )
    }
    
    updateLabel = (nextLabel) => this.setState({label: nextLabel})
    onActivityCodeChange = (event) => this.setState({footprintActivityCode: event.target.value})
    updateAccount = (nextAccount) => this.setState({account: nextAccount})  
    updateAmount = (nextAmount) => {if (nextAmount!=null) this.setState({amount: nextAmount})}

    /* ----- PROPS METHODS ----- */
  
    updateImmobilisation() {
      if (this.props.id!=undefined) {this.props.onUpdate({id: this.props.id, ...this.state})}
      else                          {this.props.onAdd({...this.state})}
      this.props.onClose();
    }
  
  }

/* ----------------------------------------------------------- */
/* -------------------- INVESTMENTS TABLE -------------------- */
/* ----------------------------------------------------------- */

/* ---------- TABLE INVESTMENTS ---------- */

class TableInvestments extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "amount",
      reverseSort: false,
      nbItems: 15,
      page: 0,
      showEditor: false,
      investmentToEdit: null,
    }
  }

  render() 
  {
    const {investments,companies,immobilisations} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,investmentToEdit} = this.state;

    this.sortItems(investments,columnSorted);
    
    return (
      <div className="group">
        <h3>Liste des dépenses d'investissement</h3>

        <div className="actions">
          <button onClick={() => this.triggerEditor()}>Ajouter une dépense d'investissement</button>
          {investments.length > 0 &&
            <button onClick={() => this.removeAll()}>Supprimer tout</button>}
        </div>
        
        {investments.length > 0 &&
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
                  <td className="auto">Fournisseur</td>
                  <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
                  <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
                  <td colSpan="2"></td></tr>
              </thead>
              <tbody>
                {investments.slice(page*nbItems,(page+1)*nbItems).map((investment) => {
                  return(<RowTableInvestments key={"investment_"+investment.id} 
                                              {...investment}
                                              onEdit={this.editInvestment.bind(this)}
                                              onDelete={this.deleteInvestment.bind(this)}/>)
                })}
              </tbody>
            </table>
            {investments.length > nbItems &&
              <div className="table-navigation">
                <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
                <button className={(page+1)*nbItems < investments.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
              </div>}
          </div>}
        
        {showEditor &&
          <InvestmentPopup {...investmentToEdit}
                           companies={companies} immobilisations={immobilisations}
                           onAdd={this.addInvestment.bind(this)}
                           onUpdate={this.updateInvestment.bind(this)}
                           onClose={this.closeEditor.bind(this)}/>}
      </div>
    )
  }

  /* ----- ACTIONS ----- */

  // manage editor
  triggerEditor = () => this.setState({showEditor: true, investmentToEdit: null}) //...to add investment
  closeEditor = () => this.setState({showEditor: false})

  // remove all investments
  removeAll = () => {this.props.financialData.removeInvestments();this.forceUpdate()}

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortItems(items,columSorted) {
    switch(columSorted) {
      case "label": items.sort((a,b) => a.label.localeCompare(b.label)); break;
      case "amount": items.sort((a,b) => b.amount - a.amount); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.investments.length) this.setState({page: this.state.page+1})}
  
  /* ----- OPERATIONS ON DEPRECIATION ----- */

  editInvestment = (id) => this.setState({showEditor: true, investmentToEdit: this.props.financialData.getInvestment(id)})
  async addInvestment(props) {await this.props.financialData.addInvestment(props)}
  async updateInvestment(props) {await this.props.financialData.updateInvestment(props)}
  deleteInvestment = (id) => {this.props.financialData.removeInvestment(id);this.forceUpdate()}

}

/* ---------- ROW INVESTMENT ---------- */

function RowTableInvestments(props) 
{
  const {id,label,companyName,account,amount} = props;
  return (
    <tr>
      <td className="auto">{label}</td>
      <td className="auto">{companyName}</td>
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

/* ---------- NEW / EDIT INVESTMENT POP-UP ---------- */

class InvestmentPopup extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        label: props.label || "",
        amount: props.amount || "",
        companyName: props.companyName || "",
        account: props.account || "",
      }
    }
  
    render() {
      const {companies,immobilisations} = this.props;
      const {label,companyName,account,amount} = this.state;
      return (
        <div className="popup">
          <div className="popup-inner">
            <h3>{this.props.id == undefined ? "Ajout d'une dépense d'investissement" : "Modification"}</h3>
            <div className="inputs">
              <div className="inline-input long">
                  <label>Libellé* </label>
                  <InputText value={label} onUpdate={this.updateLabel.bind(this)}/>
              </div>
              <div className="inline-input short">
                  <label>Montant* </label>
                  <InputNumber className="input-number" value={amount} onUpdate={this.updateAmount.bind(this)}/>
                  <span>&nbsp;€</span>
              </div>
              <div className="inline-input long">
                  <label>Fournisseur* </label>
                  <input value={companyName} 
                    list="companies"
                    onChange={this.onCorporateNameChange}
                    onKeyPress={this.onEnterPress}/>
                <datalist id="companies">
                  {companies.map((company) => {return <option key={company.id} value={company.corporateName}/>})}
                </datalist>
              </div>
              <div className="inline-input long">
                  <label>Compte d'immobilisation* </label>
                  <select onChange={this.onAccountImmobilisationSelect} value={account}>
                    {immobilisations.map(({label,account}) => { return <option key={account} value={account}>{account + " - " +label}</option>})}
                    {account=="" && <option key={"else"} value={""}>{"---"}</option>}
                  </select>
              </div>
            </div>
            <div className="footer">
              <button onClick={() => this.props.onClose()}>Fermer</button>
              <button onClick={() => this.updateDepreciation()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )
    }
  
    onEnterPress = (event) => {if (event.which==13) event.target.blur()}
  
    updateLabel = (nextLabel) => this.setState({label: nextLabel})
    onCorporateNameChange = (event) => this.setState({companyName: event.target.value})
    onAccountImmobilisationSelect = (event) => this.setState({account: event.target.value})
    updateAmount = (nextAmount) => {if (nextAmount!=null) this.setState({amount: nextAmount})}
  
    updateDepreciation() {
      if (this.props.id!=undefined) {this.props.onUpdate({id: this.props.id, ...this.state})}
      else                          {this.props.onAdd({...this.state})}
      this.props.onClose();
    }
  
  }