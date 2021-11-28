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
    const {expenseAccounts} = this.props.financialData;
    const {columnSorted,reverseSort} = this.state;

    const externalExpensesAccounts = expenseAccounts.filter(account => /^6(0[^3]|1|2)/.test(account.accountNum));
    sortExpenses(externalExpensesAccounts,columnSorted,reverseSort);

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
            {externalExpensesAccounts.map(({accountNum,amount,accountLib}) => 
              <tr key={accountNum}>
                <td className="short center">{accountNum}</td>
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

}

const sortExpenses = (accounts,columSorted,reverseSort) =>
{
  switch(columSorted) 
  {
    case "account": accounts.sort((a,b) => a.accountNum.localeCompare(b.accountNum)); break;
    case "amount": accounts.sort((a,b) => b.amount - a.amount); break;
  }
  if (reverseSort) accounts.reverse();
}