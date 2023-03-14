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
    const {session,indic,period} = this.props;
    const {columnSorted} = this.state;

    const externalExpensesAccounts = session.financialData.externalExpenseAccounts;
    this.sortAccounts(externalExpensesAccounts,period,columnSorted);

    const nbDecimals = metaIndics[indic].nbDecimals;
    const unit = metaIndics[indic].unit;
    const unitAbsolute = metaIndics[indic].unitAbsolute;
    const impactAbsolu = ["ghg","haz","mat","nrg","was","wat"].includes(indic);

    return (
      <div className="table-main">
        <Table>
          <thead>
            <tr>
              <td  onClick={() => this.changeColumnSorted("account")}> <i className="bi bi-arrow-down-up me-1"></i>Compte</td>
              <td  onClick={() => this.changeColumnSorted("label")}> <i className="bi bi-arrow-down-up me-1"></i>Libellé</td>
              <td className="text-end" onClick={() => this.changeColumnSorted("amount")}> <i className="bi bi-arrow-down-up me-1"></i>Montant</td>
              <td  className="text-end">Empreinte</td>
              <td  className="text-end">Incertitude</td>
              {impactAbsolu ? <td  className="text-end">Impact</td> : null}
            </tr>
          </thead>
          <tbody>
          {externalExpensesAccounts.map(({accountNum,accountLib,periodsData}) => {
              return(
                <tr key={accountNum}>
                  <td> {accountNum}</td>
                  <td> {accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
                  <td  className="text-end">{printValue(periodsData[period.periodKey],0)} &euro;</td>
                  <td  className="text-end">{printValue(periodsData[period.periodKey].footprint.indicators[indic].getValue(),nbDecimals)} <span > {unit}</span></td>
                  <td  className="text-end"><u>+</u>{printValue(periodsData[period.periodKey].footprint.indicators[indic].getUncertainty(),0)}%</td>
                  {impactAbsolu ? <td  className="text-end">{printValue(periodsData[period.periodKey].footprint.indicators[indic].getValueAbsolute(periodsData[period.periodKey].amount),nbDecimals)}<span > {unitAbsolute}</span></td> : null}
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

  sortAccounts(accounts,period,columSorted) 
  {
    switch(columSorted) 
    {
      case "account": accounts.sort((a,b) => a.accountNum.localeCompare(b.accountNum)); break;
      case "amount": accounts.sort((a,b) => b.periodsData[period.periodKey].amount - a.periodsData[period.periodKey].amount); break;
    }
    if (this.state.reverseSort) accounts.reverse();
  }

}

export const getExpensesGroupByAccount = (expenses) =>  
{
    let expensesByAccount = {};
    expenses.forEach(({accountNum,accountLib,amount}) => 
    {
        if (expensesByAccount[accountNum] == undefined) expensesByAccount[accountNum] = {accountNum, amount, accountLib};
        else expensesByAccount[accountNum].amount+= amount;
    })
    return Object.entries(expensesByAccount).map(([accountNum,{amount,accountLib}]) => ({accountNum, amount, accountLib}));
}