// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue } from "../../src/utils/Utils";

/* -------------------- EXPENSES TABLE -------------------- */

/*  Notes :
 *  The table shows the amount of expenses for each expenditures accounts (subaccounts of 60, 61 & 62)
 */

export class ExpensesTable extends React.Component {
  
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
    const {expenses} = this.props.financialData;
    const {columnSorted} = this.state;

    const expensesByAccount = getExpensesGroupByAccount(expenses);
    this.sortExpenses(expensesByAccount,columnSorted);

    return (
      <div className="table-main">
        <table>
          <thead>
            <tr>
              <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
            </tr>
          </thead>
          <tbody>
            {expensesByAccount.map(({account,amount,accountLib}) => 
              <tr key={account}>
                <td className="short center">{account}</td>
                <td className="auto">{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
                <td className="short right">{printValue(amount,0)}</td>
                <td className="column_unit">&nbsp;€</td>
              </tr>)}
          </tbody>
        </table>
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