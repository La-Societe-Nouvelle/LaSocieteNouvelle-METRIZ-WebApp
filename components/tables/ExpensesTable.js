// La Société Nouvelle

// React
import React from 'react';

// Libraries
import { metaAccounts } from '../../lib/accounts';

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
      nbItems: 15,
      page: 0,
    }
  }

  render() 
  {
    const {expenses} = this.props.financialData;
    const {columnSorted,nbItems,page} = this.state;

    const expensesByAccount = getExpensesGroupByAccount(expenses);
    this.sortExpenses(expensesByAccount,columnSorted);

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
            </tr>
          </thead>
          <tbody>
            {expensesByAccount.slice(page*nbItems,(page+1)*nbItems)
                              .map(({account,amount,accountLib}) => 
              <tr key={account}>
                <td className="short center">{account}</td>
                <td className="auto">{accountLib}</td>
                <td className="short right">{printValue(amount,0)}</td>
                <td className="column_unit">&nbsp;€</td>
              </tr>)}
          </tbody>
        </table>
        {expenses.length > nbItems &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*nbItems < expenses.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
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

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.expenses.length) this.setState({page: this.state.page+1})}

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