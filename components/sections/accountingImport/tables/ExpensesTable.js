// La Société Nouvelle

// React
import React from 'react';
import { Table } from 'react-bootstrap';

// Utils
import { printValue } from "../../../../src/utils/Utils";

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
    const {externalExpensesAccounts} = this.props.financialData;
    const periodKey = this.props.period.periodKey;
    const {columnSorted,reverseSort} = this.state;

    sortExpenses(externalExpensesAccounts,periodKey,columnSorted,reverseSort);

    return (
      <>
        <Table  hover>
          <thead>
            <tr>
              <td  onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td  onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="text-end" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
            </tr>
          </thead>
          <tbody>
            {externalExpensesAccounts.map((account) => 
              <tr key={account.accountNum}>
                <td >{account.accountNum}</td>
                <td >{account.accountLib.charAt(0).toUpperCase() + account.accountLib.slice(1).toLowerCase()}</td>
                <td className="text-end">{printValue(account.periodsData[periodKey].amount,0)} &euro;</td>
              </tr>)}
          </tbody>
        </Table>
      </>
    )
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) 
  {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

}

const sortExpenses = (accounts,periodKey,columSorted,reverseSort) =>
{
  switch(columSorted) 
  {
    case "account": accounts.sort((a,b) => a.accountNum.localeCompare(b.accountNum)); break;
    case "amount": accounts.sort((a,b) => b.periodsData[periodKey].amount - a.periodsData[periodKey].amount); break;
  }
  if (reverseSort) accounts.reverse();
}