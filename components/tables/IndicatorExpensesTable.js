// La Société Nouvelle

// React
import React from 'react';

// Libraries
import metaIndics from '/lib/indics';

// Utils
import { printValue } from "../../src/utils/Utils";
import { Table } from 'react-bootstrap';

/* -------------------- EXPENSES TABLE -------------------- */

/*  Notes :
 *  The table shows the footprint (indicator) for each expenditures accounts (subaccounts of 60, 61 & 62)
 */

export class IndicatorExpensesTable extends React.Component {
  
  constructor(props) 
  {
    super(props)
    this.state = 
    {
      columnSorted: "amount",
      reverseSort: false,
    }
  }

  render() 
  {
    const {session,indic} = this.props;
    const {columnSorted} = this.state;

    const expensesByAccount = getExpensesGroupByAccount(session.financialData.expenses);
    this.sortExpenses(expensesByAccount,columnSorted);

    const nbDecimals = metaIndics[indic].nbDecimals;
    const unit = metaIndics[indic].unit;
    const unitAbsolute = metaIndics[indic].unitAbsolute;
    const impactAbsolu = ["ghg","haz","mat","nrg","was","wat"].includes(indic);

    return (
      <div className="table-main">
        <Table>
          <thead>
            <tr>
              <td  onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td  onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td  onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              <td >Empreinte</td>
              <td >Incertitude</td>
              {impactAbsolu ? <td>Impact</td> : null}
            </tr>
          </thead>
          <tbody>
            {expensesByAccount.map(({account,amount,accountLib}) => 
            {
              const indicator = session.getExpensesAccountIndicator(account,indic);
              return(
                <tr key={account}>
                  <td >{account}</td>
                  <td >{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
                  <td >{printValue(amount,0)} &euro;</td>
                  <td >{printValue(indicator.getValue(),nbDecimals)} <span className="unit"> {unit}</span></td>
                  <td ><u>+</u>{printValue(indicator.getUncertainty(),0)}%</td>
                  {impactAbsolu ? <td>{printValue(indicator.getValueAbsolute(amount),nbDecimals)}<span className="unit"> {unitAbsolute}</span></td> : null}
                </tr>)})}
          </tbody>
        </Table>
      </div>
    )
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) 
  {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortExpenses(expenses,columSorted) 
  {
    switch(columSorted) 
    {
      case "account": expenses.sort((a,b) => a.account.localeCompare(b.account)); break;
      case "amount": expenses.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) expenses.reverse();
  }

}

const getExpensesGroupByAccount = (expenses) =>  
{
    let expensesByAccount = {};
    expenses.forEach(({account,accountLib,amount}) => 
    {
        if (expensesByAccount[account] == undefined) expensesByAccount[account] = {account, amount, accountLib};
        else expensesByAccount[account].amount+= amount;
    })
    return Object.entries(expensesByAccount).map(([account,{amount,accountLib}]) => ({account, amount, accountLib}));
}