// La Société Nouvelle

// React
import React, { useState } from 'react';

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import { divisions } from '/lib/nace'; 

/* ---------- INITIAL STATES TABLE ---------- */

export class InitialStatesTable extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = 
    {
      columnSorted: "account",
      reverseSort: false,
      nbItems: 10,
      page: 0,
    }
  }

  render()
  {
    const {immobilisations,depreciations,stocks,expenses,investments,stockVariations} = this.props.financialData;
    const {columnSorted,nbItems,page} = this.state;

    const immobilisationsShowed = immobilisations.filter(immobilisation => ["20","21","22","23","25"].includes(immobilisation.account.substring(0,2)));
    this.sortItems(immobilisationsShowed,columnSorted);
    
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <td className="short" onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="long" colSpan="2">Empreinte sociétale</td>
              <td className="short" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant (N-1)</td>
              <td colSpan="2"></td></tr>
          </thead>
          <tbody>
            {immobilisationsShowed.slice(page*nbItems,(page+1)*nbItems)
                                  .map((immobilisation) => 
              <RowTableImmobilisations key={"immobilisation_"+immobilisation.id} 
                                        {...immobilisation}
                                        depreciations={depreciations}
                                        investments={investments}
                                        onInitialStateUpdate={this.updateImmobilisation.bind(this)}
                                        syncData={this.synchroniseImmobilisation.bind(this)}/>)}
            {stocks.slice(page*nbItems,(page+1)*nbItems)
                   .map(stock => 
              <RowTableStocks key={"stock_"+stock.id} 
                              {...stock}
                              expenses={expenses}
                              stockVariations={stockVariations}
                              onInitialStateUpdate={this.updateStock.bind(this)}
                              syncData={this.synchroniseStock.bind(this)}/>)}
          </tbody>
        </table>
        {immobilisationsShowed.length > nbItems &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*nbItems < immobilisationsShowed.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
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

  synchroniseImmobilisation = async (id) => {
    let immobilisation = this.props.financialData.getImmobilisation(id);
    await this.fetchDefaultData(immobilisation);
    this.props.onUpdate();
  }

  async synchroniseStock(id) {
    let stock = this.props.financialData.getInitialStock(id);
    await this.fetchDefaultData(stock);
  }

  async fetchDefaultData(stockOrImmobilisation) 
  {
    await stockOrImmobilisation.updatePrevFootprintFromRemote();
    this.forceUpdate();
    this.props.onUpdate();
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
      case "amount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
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
  const {id,prevAmount,account,accountLib,initialState,prevFootprintActivityCode,dataFetched,depreciations,investments,isDepreciableImmobilisation} = props;
  const activityCode = prevFootprintActivityCode.substring(0,2);

  const entries = investments.filter(investment => investment.account == account);
  const immobilisationUsed = depreciations.filter(depreciation => depreciation.accountAux == account).length > 0;

  const [toggleIcon,setToggleIcon] = useState(false);

  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id: id, prevFootprintActivityCode: event.target.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id: id, initialState: event.target.value})
  const syncData = async (event) => {
    setToggleIcon(true);
    await props.syncData(id);
    setToggleIcon(false);
  }

  if (isDepreciableImmobilisation && immobilisationUsed) {
    return (<tr>
              <td className="short center">{account}</td>
              <td className="auto">{accountLib}</td>
              <td colSpan={initialState=="defaultData" ? 1 : 2}>
                <select className={(initialState=="prevFootprint" || dataFetched) ? "valid" : ""}
                        value={initialState}
                        onChange={onOriginStateChange}>
                  {initialState=="none" &&          <option key="none" value="none">---</option>}
                  {initialState=="prevFootprint" && <option key="prevFootprint" value="prevFootprint">Reprise sur exerice précédent</option>}
                  {entries.length > 0 &&            <option key="currentFootprint" value="currentFootprint">Estimée sur exerice courant</option>}
                  <option key="defaultData" value="defaultData">Valeurs par défaut</option>
                </select>
              </td>
            {initialState=="defaultData" &&
              <td className={"medium"+(dataFetched === true ? " valid" : "")}>
                <select onChange={onActivityCodeChange} value={activityCode}>
                  {Object.entries(divisions)
                         .sort((a,b) => parseInt(a)-parseInt(b))
                         .map(([code,libelle]) => 
                    <option className={(activityCode && code==activityCode) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>)}
                </select></td>}
              <td className="short right">{printValue(prevAmount,0)}</td>
              <td className="column_unit">&nbsp;€</td>
              {initialState=="defaultData" &&
                <td className="column_icon">
                  <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="sync" 
                      onClick={() => syncData(id)}/></td>}
            </tr>)
  } else if (isDepreciableImmobilisation) {
    return (<tr>
              <td className="short center">{account}</td>
              <td className="auto">{accountLib}</td>
              <td colSpan="2">Immobilisation non amortie sur l'exercice</td>
              <td className="short right">{printValue(prevAmount,0)}</td>
              <td className="column_unit">&nbsp;€</td>
              {initialState=="defaultData" &&
                <td className="column_icon">
                  <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="sync" 
                        onClick={() => syncData(id)}/></td>}
            </tr>)
  } else {
    return (<tr>
              <td className="short center">{account}</td>
              <td className="auto">{accountLib}</td>
              <td colSpan="2">Immobilisation non prise en compte (non amortissable)</td>
              <td className="short right">{printValue(prevAmount,0)}</td>
              <td className="column_unit">&nbsp;€</td>
              {initialState=="defaultData" &&
                <td className="column_icon">
                  <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="sync" 
                        onClick={() => syncData(id)}/></td>}
            </tr>)
  }
}

/* ---------- ROW STOCK ---------- */

function RowTableStocks(props)
{
  const {id,prevAmount,account,accountLib,accountAux,initialState,isProductionStock,prevFootprintActivityCode,dataFetched,expenses,stockVariations} = props;
  const activityCode = prevFootprintActivityCode.substring(0,2);

  const entries = expenses.filter(expense => expense.account == accountAux);
  const stockUsed = stockVariations.filter(stockVariation => stockVariation.accountAux == account).length > 0;

  const [toggleIcon,setToggleIcon] = useState(false);

  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id: id, prevFootprintActivityCode: event.target.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id: id, initialState: event.target.value})
  const syncData = async (event) => {
    setToggleIcon(true);
    await props.syncData(id);
    setToggleIcon(false);
  }

  return (
    <tr>
      <td className="short center">{account}</td>
      <td className="auto">{accountLib}</td>
      {!isProductionStock &&
        <td colSpan={initialState=="defaultData" ? 1 : 2}>
          <select className={initialState=="prevFootprint" || dataFetched ? "valid" : ""}
                  value={initialState}
                  onChange={onOriginStateChange}>
            {initialState=="none" && <option key="none" value="none">---</option>}
            {initialState=="prevFootprint" && <option key="prevFootprint" value="prevFootprint">Reprise sur exerice précédent</option>}
            {entries.length > 0 && <option key="currentFootprint" value="currentFootprint">Estimée sur exercice courant</option>}
            <option key="defaultData" value="defaultData">Valeurs par défaut</option>
          </select></td>}
      {isProductionStock &&
        <td colSpan="2">
          <select value="currentFootprint"
                  onChange={onOriginStateChange}>
            <option key="currentFootprint" value="none">Estimée sur exercice courant</option>
          </select></td>}
      {initialState=="defaultData" &&
        <td className={"medium"+(dataFetched === true ? " valid" : "")}>
          <select onChange={onActivityCodeChange} value={activityCode}>
            {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b))
                                    .map(([code,libelle]) => <option className={(activityCode && code==activityCode) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>)}
          </select></td>}
      <td className="short right">{printValue(prevAmount,0)}</td>
      <td className="column_unit">&nbsp;€</td>
      {initialState=="defaultData" &&
        <td className="column_icon">
          <img className={"img" + (toggleIcon ? " active" : "")} src="/resources/icon_refresh.jpg" alt="sync" 
               onClick={() => syncData(id)}/></td>}
    </tr>
  )
}