import React, { useState } from 'react';

// Utils
import { printValue } from '../src/utils/Utils';

// Libs
import { divisions } from '../lib/nace'; 

/* ---------------------------------------------------------------- */
/* -------------------- INITIAL STATES SECTION -------------------- */
/* ---------------------------------------------------------------- */

export class InitialStatesSection extends React.Component {

  constructor(props) {
    super(props);
  }
    
  render()
  {
    const {session} = this.props;
    const {financialData} = session;

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Etats initiaux</h1>
        </div>

        <div className="tab-view">
          <div className="financial-tab-view-inner">
            <div className="groups">
              <TableAccounts 
                financialData={financialData} 
                onUpdate={this.updateFootprints.bind(this)}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
      
  /* ----- UPDATES ----- */

  updateFootprints = () => this.props.session.updateRevenueFootprint();

}


/* -------------------------------------------------------- */
/* -------------------- ACCOUNTS TABLE -------------------- */
/* -------------------------------------------------------- */

/* ---------- TABLE ACCOUNTS ---------- */

class TableAccounts extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      columnSorted: "account",
      reverseSort: false,
      nbItems: 10,
      page: 0,
      showEditor: false,
      immobilisationToEdit: null,
    }
  }

  render()
  {
    const {immobilisations,depreciations,initialStocks,expenses} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,immobilisationToEdit} = this.state;
    this.sortItems(immobilisations,columnSorted);

    return (
      <div className="group"><h3>Comptes</h3>

        <div className="actions">
          {immobilisations.length > 0 && <button onClick={() => this.synchroniseAll()}>Synchroniser les données</button>}
        </div>

        {immobilisations.length > 0 &&
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <td className="short" onClick={() => this.changeColumnSorted("account")}>Compte</td>
                  <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
                  <td className="long" colSpan="2">Empreinte sociétale</td>
                  <td className="short" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
                  <td colSpan="2"></td></tr>
              </thead>
              <tbody>
                {immobilisations.slice(page*nbItems,(page+1)*nbItems)
                                .map((immobilisation) => 
                  <RowTableImmobilisations key={"immobilisation_"+immobilisation.id} 
                                           {...immobilisation}
                                           depreciations={depreciations}
                                           onInitialStateUpdate={this.updateImmobilisation.bind(this)}
                                           syncData={this.synchroniseImmobilisation.bind(this)}/>)}
                {initialStocks.slice(page*nbItems,(page+1)*nbItems)
                              .map(stock => 
                  <RowTableStocks key={"stock_"+stock.id} 
                                  {...stock}
                                  expenses={expenses}
                                  onInitialStateUpdate={this.updateStock.bind(this)}
                                  syncData={this.synchroniseStock.bind(this)}/>)}
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
                                 onUpdate={this.updateImmobilisation.bind(this)}
                                 onClose={this.closeEditor.bind(this)}/>}
      </div>
    )
  }

  /* ---------- ACTIONS ---------- */
  
  // Synchronisation
  async synchroniseAll() 
  {
    await Promise.all(this.props.financialData.immobilisations.filter(immobilisation => immobilisation.initialState == "defaultData")
                                                              .map(async immobilisation => await this.fetchDefaultData(immobilisation)));
    this.forceUpdate();
  }

  async synchroniseImmobilisation(id) {
    let immobilisation = this.props.financialData.getImmobilisation(id);
    await this.fetchDefaultData(immobilisation);
  }

  async synchroniseStock(id) {
    let stock = this.props.financialData.getInitialStock(id);
    await this.fetchDefaultData(stock);
  }

  async fetchDefaultData(stockOrImmobilisation) {
    await stockOrImmobilisation.updateFootprintFromRemote();
    this.forceUpdate();
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

  updateImmobilisation(nextProps) 
  {
    this.props.financialData.updateImmobilisation(nextProps)
      .then(() => this.forceUpdate());
    this.props.onUpdate();
  }

  updateStock(nextProps) 
  {
    this.props.financialData.updateStock(nextProps)
      .then(() => this.forceUpdate());
    this.props.onUpdate();
  }

}

/* ---------- ROW IMMOBILISATION ---------- */

function RowTableImmobilisations(props) 
{
  const {id,label,amount,account,prevFootprintLoaded,initialState,footprintActivityCode,dataFetched,depreciations} = props;
  const activityCode = footprintActivityCode.substring(0,2);
  const entries = depreciations.filter(depreciation => depreciation.accountImmobilisation==account);


  const [toggleIcon,setToggleIcon] = useState(false);

  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id: id, footprintActivityCode: event.target.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id: id, initialState: event.target.value})
  const syncData = async (event) => {
    setToggleIcon(true);
    await props.syncData(id);
    setToggleIcon(false);
  }

  return (
    <tr>
      <td className="short center">{account}</td>
      <td className="auto">{label}</td>
      <td colSpan={initialState=="defaultData" ? 1 : 2}>
        <select className={prevFootprintLoaded || dataFetched ? "valid" : ""}
                value={initialState}
                onChange={onOriginStateChange}>
          {initialState=="none" && <option key="none" value="none">---</option>}
          {initialState=="prevFootprint" && <option key="prevFootprint" value="prevFootprint">Reprise sur exerice précédent</option>}
          {entries.length > 0 && <option key="currentFootprint" value="currentFootprint">Estimée sur exerice courant</option>}
          <option key="defaultData" value="defaultData">Valeurs par défaut</option>
        </select></td>
      {initialState=="defaultData" &&
        <td className={"medium"+(dataFetched === true ? " valid" : "")}>
          <select onChange={onActivityCodeChange} value={activityCode}>
            {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b))
                                    .map(([code,libelle]) => <option className={(activityCode && code==activityCode) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>)}
          </select></td>}
      <td className="short right">{printValue(amount,0)}</td>
      <td className="column_unit">&nbsp;€</td>
      {initialState=="defaultData" &&
        <td className="column_icon">
          <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="sync" 
               onClick={() => syncData(id)}/></td>}
    </tr>
  )
}

/* ---------- ROW STOCK ---------- */

function RowTableStocks(props) 
{
  const {id,label,amount,account,accountPurchases,prevFootprintLoaded,initialState,footprintActivityCode,dataFetched,expenses} = props;
  const activityCode = footprintActivityCode.substring(0,2);
  const entries = expenses.filter(expense => expense.account==accountPurchases);

  const [toggleIcon,setToggleIcon] = useState(false);

  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id: id, footprintActivityCode: event.target.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id: id, initialState: event.target.value})
  const syncData = async (event) => {
    setToggleIcon(true);
    await props.syncData(id);
    setToggleIcon(false);
  }

  return (
    <tr>
      <td className="short center">{account}</td>
      <td className="auto">{label}</td>
      <td colSpan={initialState=="defaultData" ? 1 : 2}>
        <select className={prevFootprintLoaded || dataFetched ? "valid" : ""}
                value={initialState}
                onChange={onOriginStateChange}>
          {initialState=="none" && <option key="none" value="none">---</option>}
          {initialState=="prevFootprint" && <option key="prevFootprint" value="prevFootprint">Reprise sur exerice précédent</option>}
          {entries.length > 0 && <option key="currentFootprint" value="currentFootprint">Estimée sur exerice courant</option>}
          <option key="defaultData" value="defaultData">Valeurs par défaut</option>
        </select></td>
      {initialState=="defaultData" &&
        <td className={"medium"+(dataFetched === true ? " valid" : "")}>
          <select onChange={onActivityCodeChange} value={activityCode}>
            {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b))
                                    .map(([code,libelle]) => <option className={(activityCode && code==activityCode) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>)}
          </select></td>}
      <td className="short right">{printValue(amount,0)}</td>
      <td className="column_unit">&nbsp;€</td>
      {initialState=="defaultData" &&
        <td className="column_icon">
          <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="sync" 
               onClick={() => syncData(id)}/></td>}
    </tr>
  )
}