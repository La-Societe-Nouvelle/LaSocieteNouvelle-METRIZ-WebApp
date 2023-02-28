// La Société Nouvelle

// React
import React, { useState } from 'react';
import Select from "react-select";

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import divisions from '/lib/divisions'; 
import branches from '/lib/branches'; 
import { Table } from 'react-bootstrap';

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
        <Table>
          <thead>
            <tr>
              <td onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td colSpan="2">États initiaux - Empreinte sociétale</td>
              <td className="text-end" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              </tr>
          </thead>
          <tbody>
            {accounts.slice(page*nbItems,(page+1)*nbItems)
                     .map((account) => 
              <Row key={account.accountNum} 
                   {...account}
                   onInitialStateUpdate={this.updateAccount.bind(this)}
                   syncData={this.synchroniseAccount.bind(this)}/>)}
          </tbody>
        </Table>

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
      case "account": items.sort((a,b) => a.accountNum.localeCompare(b.accountNum)); break;
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
    if (/^2/.test(nextProps.accountNum)) this.props.financialData.updateImmobilisation(nextProps);
    // Stock
    else if (/^3/.test(nextProps.accountNum)) this.props.financialData.updateStock(nextProps);
    
    this.props.onUpdate();
  }

}

/* ---------- INPUTS/OUTPUTS AVAILABLE ---------- */

const buildHasInputs = (account,financialData) =>
{
  if (/^3/.test(account.accountNum)) {
    account.hasInputs = financialData.expenses.filter(expense => expense.accountNum == account.accountAux).length > 0;
    account.hasOutputs = financialData.stockVariations.filter(stockVariation => stockVariation.accountAux == account.accountNum).length > 0;
  } else if (/^2/.test(account.accountNum)) {
    account.hasInputs = financialData.investments.filter(investment => investment.accountNum == account.accountNum).length > 0;
    account.hasOutputs = financialData.depreciations.filter(depreciation => depreciation.accountAux == account.accountNum).length > 0;
  }
}

/* ---------- ROWS ---------- */

const Row = (props) => 
{
  switch(props.accountNum.charAt(0))
  {
    case "2": return <RowTableImmobilisations {...props}/>
    case "3": return <RowTableStocks {...props}/>
  }
}

/* ---------- ROW IMMOBILISATION ---------- */

function RowTableImmobilisations(props) 
{
  const {id,accountNum,accountLib,prevAmount,initialState,prevFootprintActivityCode,dataFetched,hasInputs,hasOutputs,isDepreciableImmobilisation} = props;
  const activityCode = /^[0-9]{2}/.test(prevFootprintActivityCode) ? prevFootprintActivityCode.substring(0,2) : prevFootprintActivityCode;


  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id, accountNum, prevFootprintActivityCode: event.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id, accountNum, initialState: event.value})


    const branchesOptions = [];
    const initialStateOptions = [];
    const defaultValueInitialState = {};

  Object.entries(branches)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([value, label]) => (
      branchesOptions.push({ value: value, label: value + " - " + label })
    ))

  const getDefaultValue = (initialState) => {
    
    switch (initialState) {
      case "none":
        defaultValueInitialState = {value:"none", label: "---"};
        break;
        case "prevFootprint":
          defaultValueInitialState ={value:"prevFootprint", label: "Reprise sur exercice précédent"}
        break;
        case "currentFootprint":
          defaultValueInitialState = {value:"currentFootprint", label: "Estimée sur exerice courant"}
        break;
      default:
        defaultValueInitialState = {value:"defaultData", label:"Valeurs par défaut"};
        break;
    }

    return defaultValueInitialState;
  }
  const getInitialStateOption = (initialState ,hasInputs) => {

    switch (initialState) {
      case "none":
        initialStateOptions.push({value:"none", label: "---"})
        break;
        case "prevFootprint":
          initialStateOptions.push({value:"prevFootprint", label: "Reprise sur exercice précédent"})
        break;
      default:
        break;
    }
    
    if(hasInputs) {
      initialStateOptions.push({value:"currentFootprint", label: "Estimée sur exerice courant"})
    }

    initialStateOptions.push({value:"defaultData", label:"Valeurs par défaut"})

    return initialStateOptions;
  }

  if (isDepreciableImmobilisation && hasOutputs) {
    return (
      <tr>
        <td >{accountNum}</td>
        <td>
          {accountLib.charAt(0).toUpperCase() +
            accountLib.slice(1).toLowerCase()}
        </td>
        <td colSpan={initialState == "defaultData" ? 1 : 2}>

        <Select
            defaultValue={getDefaultValue(initialState)}
            placeholder={"Choisissez..."}
            className={
              initialState == "prevFootprint" ||
              initialState == "currentFootprint" ||
              dataFetched
                ? "success"
                : ""
            }
            options={getInitialStateOption(initialState, hasInputs)}
            onChange={onOriginStateChange}

          />
          
        </td>
        {initialState == "defaultData" && (
          <td className={dataFetched === true ? " success" : ""}>

        <Select
            defaultValue={{
              label: activityCode + " - " + branches[activityCode],
              value: activityCode,
            }}
            placeholder={"Choisissez une branche"}
            className={dataFetched ? " success" : ""}
            options={branchesOptions}
            onChange={onActivityCodeChange}
          
          />

        
          </td>
        )}
        <td className="text-end">{printValue(prevAmount, 0)} &euro;</td>
  
      </tr>
    );
  } 
  else if (isDepreciableImmobilisation) {
    return (<tr>
              <td>{accountNum}</td>
              <td>{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
              <td colSpan="2">&nbsp;&nbsp;Immobilisation non amortie sur l'exercice</td>
              <td className="text-end">{printValue(prevAmount,0)} &euro;</td>
        
            </tr>)
  } else {
    return (<tr>
              <td >{accountNum}</td>
              <td>{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
              <td colSpan="2">&nbsp;&nbsp;Immobilisation non prise en compte (non amortissable)</td>
              <td className="text-end">{printValue(prevAmount,0)} &euro;</td>
        
            </tr>)
  }
}

/* ---------- ROW STOCK ---------- */

function RowTableStocks(props)
{
  const {id,prevAmount,accountNum,accountLib,accountAux,initialState,isProductionStock,prevFootprintActivityCode,dataFetched,hasInputs,hasOutputs} = props;
  const activityCode = prevFootprintActivityCode.substring(0,2);

  const onActivityCodeChange = (event) => props.onInitialStateUpdate({id, accountNum, prevFootprintActivityCode: event.value})
  const onOriginStateChange = (event) => props.onInitialStateUpdate({id, accountNum, initialState: event.value})

  const initialStateOptions = [];
  const defaultValueInitialState = {};
  const divisionsOptions = [];

  const getDefaultValue = (initialState) => {
    
    switch (initialState) {
      case "none":
        defaultValueInitialState = {value:"none", label: "---"};
        break;
        case "prevFootprint":
          defaultValueInitialState ={value:"prevFootprint", label: "Reprise sur exercice précédent"}
        break;
        case "currentFootprint":
          defaultValueInitialState = {value:"currentFootprint", label: "Estimée sur exerice courant"}
        break;
      default:
        defaultValueInitialState = {value:"defaultData", label:"Valeurs par défaut"};
        break;
    }

    return defaultValueInitialState;
  }
  const getInitialStateOption = (initialState ,hasInputs) => {

    switch (initialState) {
      case "none":
        initialStateOptions.push({value:"none", label: "---"})
        break;
        case "prevFootprint":
          initialStateOptions.push({value:"prevFootprint", label: "Reprise sur exercice précédent"})
        break;
      default:
        break;
    }
    
    if(hasInputs) {
      initialStateOptions.push({value:"currentFootprint", label: "Estimée sur exerice courant"})
    }

    initialStateOptions.push({value:"defaultData", label:"Valeurs par défaut"})

    return initialStateOptions;
  }

  Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b)).map(([value, label]) => (
    divisionsOptions.push({ value: value, label: value + " - " + label })
  ))

  return (
    <tr>
      <td >{accountNum}</td>
      <td>{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
      {!isProductionStock &&
        <td colSpan={initialState=="defaultData" ? 1 : 2}>
            <Select
            defaultValue={getDefaultValue(initialState)}
            placeholder={"Choisissez..."}
            className={
              initialState == "prevFootprint" ||
              initialState == "currentFootprint" ||
              dataFetched
                ? "success"
                : ""
            }
            options={getInitialStateOption(initialState, hasInputs)}
            onChange={onOriginStateChange}

          />

          </td>}
        {isProductionStock &&
          <td colSpan="2">
              <Select
              placeholder={"Choisissez..."}
              defaultValue={{label:"Estimée sur exercice courant", value:"none"}}
              className={
                initialState == "currentFootprint" 
                  ? "success"
                  : ""
              }
              options={[{label:"Estimée sur exercice courant", value:"none"}]}

            />
          </td>}
      {initialState=="defaultData" &&
          <td className={dataFetched === true ? "success" : ""}>

      <Select
            defaultValue={{
              label: activityCode + " - " + divisions[activityCode],
              value: activityCode,
            }}
            placeholder={"Choisissez une division"}
            className={dataFetched ? "success" : ""}
            options={divisionsOptions}
            onChange={onActivityCodeChange}
          
          />

          
          </td>}
      <td className="text-end">{printValue(prevAmount,0)} &euro;</td>

    </tr>
  )
}