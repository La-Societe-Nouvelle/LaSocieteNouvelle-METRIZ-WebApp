// La Société Nouvelle

// React
import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import divisions from '/lib/divisions'; 
import branches from '/lib/branches'; 

/* ---------- INITIAL STATES TABLE ---------- */

export class InitialStatesTable extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = 
    {
      columnSorted: "account",
      reverseSort: false,
      nbItems: 20,
      page: 0,
    }
  }

  render()
  {
    const {immobilisations,stocks} = this.props.financialData;
    const {columnSorted,nbItems,page} = this.state;

    const accounts = immobilisations.concat(stocks);  // merge array
    accounts.forEach(account => buildHasInputs(account,this.props.financialData));
    this.sortItems(accounts,columnSorted);

    this.sortItems(immobilisations,columnSorted);
    this.sortItems(stocks,columnSorted);

    const nbAccounts = accounts.length;
    
    return (
      <>
        <table className="w100">
          <thead>
            <tr>
              <td onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td colSpan="2">États initiaux - Empreinte sociétale</td>
              <td className="align-right" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              </tr>
          </thead>
          <tbody>
            {accounts.slice(page*nbItems,(page+1)*nbItems)
                     .map((account) => 
              <Row key={account.account} 
                   {...account}
                   onInitialStateUpdate={this.updateAccount.bind(this)}
                   syncData={this.synchroniseAccount.bind(this)}/>)}
          </tbody>
        </table>

      {nbAccounts.length > nbItems &&
        <div className="table-navigation">
          <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
          <button className={(page+1)*nbItems < nbAccounts.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
        </div>}

      </>
    )
  }

  /* ---------- ACTIONS ---------- */

  synchroniseAccount = async (accountNum) =>
  {
    // Immobilisation
    if (/^2/.test(accountNum)) 
    {
      let immobilisation = this.props.financialData.getImmobilisationByAccount(accountNum);
      this.fetchDefaultData(immobilisation);
    } 
    // Stock
    else if (/^3/.test(accountNum)) 
    {
      let stock = this.props.financialData.getStockByAccount(accountNum);
      this.fetchDefaultData(stock);
    }
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

  sortItems(items,columSorted) 
  {
    switch(columSorted) 
    {
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

  updateAccount = (nextProps) =>
  {
    // Immobilisation
    if (/^2/.test(nextProps.account)) this.props.financialData.updateImmobilisation(nextProps);
    // Stock
    else if (/^3/.test(nextProps.account)) this.props.financialData.updateStock(nextProps);
    
    this.props.onUpdate();
  }

}

/* ---------- INPUTS/OUTPUTS AVAILABLE ---------- */

const buildHasInputs = (account,financialData) =>
{
  if (/^3/.test(account.account)) {
    account.hasInputs = financialData.expenses.filter(expense => expense.account == account.accountAux).length > 0;
    account.hasOutputs = financialData.stockVariations.filter(stockVariation => stockVariation.accountAux == account.account).length > 0;
  } else if (/^2/.test(account.account)) {
    account.hasInputs = financialData.investments.filter(investment => investment.account == account.account).length > 0;
    account.hasOutputs = financialData.depreciations.filter(depreciation => depreciation.accountAux == account.account).length > 0;
  }
}

/* ---------- ROWS ---------- */

const Row = (props) => 
{
  switch(props.account.charAt(0))
  {
    case "2": return <RowTableImmobilisations {...props}/>
    case "3": return <RowTableStocks {...props}/>
  }
}

/* ---------- ROW IMMOBILISATION ---------- */

function RowTableImmobilisations(props) 
{
  const {id,account,accountLib,prevAmount,initialState,prevFootprintActivityCode,dataFetched,hasInputs,hasOutputs,isDepreciableImmobilisation} = props;
  const activityCode = /^[0-9]{2}/.test(prevFootprintActivityCode) ? prevFootprintActivityCode.substring(0,2) : prevFootprintActivityCode;

  const [toggleIcon,setToggleIcon] = useState(false);

  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id: id, account: account, prevFootprintActivityCode: event.target.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id: id, account: account, initialState: event.target.value})
  const syncData = async () => {
    setToggleIcon(true);
    await props.syncData(account);
    setToggleIcon(false);
  }

  if (isDepreciableImmobilisation && hasOutputs) {
    return (
      <tr>
        <td className="short center">{account}</td>
        <td className="auto">
          {accountLib.charAt(0).toUpperCase() +
            accountLib.slice(1).toLowerCase()}
        </td>
        <td colSpan={initialState == "defaultData" ? 1 : 2}>
          <select
            className={
              initialState == "prevFootprint" ||
              initialState == "currentFootprint" ||
              dataFetched
                ? "valid"
                : ""
            }
            value={initialState}
            onChange={onOriginStateChange}
          >
            {initialState == "none" && (
              <option key="none" value="none">
                ---
              </option>
            )}
            {initialState == "prevFootprint" && (
              <option key="prevFootprint" value="prevFootprint">
                Reprise sur exercice précédent
              </option>
            )}
            {hasInputs && (
              <option key="currentFootprint" value="currentFootprint">
                Estimée sur exerice courant
              </option>
            )}
            <option key="defaultData" value="defaultData">
              Valeurs par défaut
            </option>
          </select>
        </td>
        {initialState == "defaultData" && (
          <td className={"medium" + (dataFetched === true ? " valid" : "")}>
            <select
              className={dataFetched ? " valid" : ""}
              value={activityCode}
              onChange={onActivityCodeChange}
            >
              {Object.entries(branches)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([code, libelle]) => (
                  <option
                    className={
                      activityCode && code == activityCode
                        ? "default-option"
                        : ""
                    }
                    key={code}
                    value={code}
                  >
                    {code + " - " + libelle}
                  </option>
                ))}
            </select>
          </td>
        )}
        <td className="align-right">{printValue(prevAmount, 0)} &euro;</td>
  
      </tr>
    );
  } 
  else if (isDepreciableImmobilisation) {
    return (<tr>
              <td className="short center">{account}</td>
              <td className="auto">{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
              <td colSpan="2">&nbsp;&nbsp;Immobilisation non amortie sur l'exercice</td>
              <td className="align-right">{printValue(prevAmount,0)} &euro;</td>
        
            </tr>)
  } else {
    return (<tr>
              <td className="short center">{account}</td>
              <td className="auto">{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
              <td colSpan="2">&nbsp;&nbsp;Immobilisation non prise en compte (non amortissable)</td>
              <td className="align-right">{printValue(prevAmount,0)} &euro;</td>
        
            </tr>)
  }
}

/* ---------- ROW STOCK ---------- */

function RowTableStocks(props)
{
  const {id,prevAmount,account,accountLib,accountAux,initialState,isProductionStock,prevFootprintActivityCode,dataFetched,hasInputs,hasOutputs} = props;
  const activityCode = prevFootprintActivityCode.substring(0,2);

  const [toggleIcon,setToggleIcon] = useState(false);

  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id: id, account: account, prevFootprintActivityCode: event.target.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id: id, account: account, initialState: event.target.value})
  const syncData = async () => {
    setToggleIcon(true);
    await props.syncData(account);
    setToggleIcon(false);
  }

  return (
    <tr>
      <td className="short center">{account}</td>
      <td className="auto">{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
      {!isProductionStock &&
        <td colSpan={initialState=="defaultData" ? 1 : 2}>
          <select className={initialState=="prevFootprint" || initialState=="currentFootprint" || dataFetched ? "valid" : ""}
                  value={initialState}
                  onChange={onOriginStateChange}>
            {initialState=="none" && <option key="none" value="none">---</option>}
            {initialState=="prevFootprint" && <option key="prevFootprint" value="prevFootprint">Reprise sur exerice précédent</option>}
            {hasInputs > 0 && <option key="currentFootprint" value="currentFootprint">Estimée sur exercice courant</option>}
            <option key="defaultData" value="defaultData">Valeurs par défaut</option>
          </select></td>}
      {isProductionStock &&
        <td colSpan="2">
          <select className={initialState=="currentFootprint" ? "valid" : ""}
                  value="currentFootprint"
                  onChange={onOriginStateChange}>
            <option key="currentFootprint" value="none">Estimée sur exercice courant</option>
          </select></td>}
      {initialState=="defaultData" &&
        <td className={"medium"+(dataFetched === true ? " valid" : "")}>
          <select onChange={onActivityCodeChange} value={activityCode}>
            {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b))
                                    .map(([code,libelle]) => <option className={(activityCode && code==activityCode) ? "default-option" : ""} key={code} value={code}>{code + " - " +libelle}</option>)}
          </select></td>}
      <td className="align-right">{printValue(prevAmount,0)} &euro;</td>

    </tr>
  )
}