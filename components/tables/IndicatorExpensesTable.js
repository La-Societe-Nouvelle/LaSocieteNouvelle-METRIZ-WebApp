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
              <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="text-end" onClick={() => this.changeColumnSorted("amount")}>Montant</td>
              <td className="text-end">Valeur</td>
              <td className="text-end">Incertitude</td>
              {impactAbsolu ? <td className="column_value" colSpan="2">Impact</td> : null}
            </tr>
          </thead>
          <tbody>
            {expensesByAccount.map(({account,amount,accountLib}) => 
            {
              const indicator = session.getExpensesAccountIndicator(account,indic);
              return(
                <tr key={account}>
                  <td className="short center">{account}</td>
                  <td className="auto">{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
                  <td className="text-end">{printValue(amount,0)} &euro;</td>
                  <td className="column_value">{printValue(indicator.getValue(),nbDecimals)} {unit}</td>
                  <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
                  {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(amount),nbDecimals)}</td> : null}
                  {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
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