// La Société Nouvelle

// React
import React from 'react';
import { Table } from 'react-bootstrap';

// Utils
import { printValue } from "../../src/utils/Utils";

/* ---------- TABLE STOCKS ---------- */

export class StocksTable extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = 
    {
      columnSorted: "account",
      reverseSort: false
    }
  }

  render() 
  {
    const {stocks,depreciations,aggregates} = this.props.financialData;
    const {columnSorted} = this.state;

    this.sortItems(stocks,columnSorted);

    return (
      <>
        <Table  hover>
          <thead>
            <tr>
              <td  onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="text-end">Montant (N)</td>
              <td  className="text-end">Montant (N-1)</td>
              <td  className="text-end">Variation</td>
            </tr>
          </thead>
          <tbody>
          {stocks.map(({account,accountLib,amount,prevAmount}) => {
            let valueLoss = depreciations.filter(depreciation => depreciation.accountAux==account)
                                         .map(depreciation => depreciation.amount)
                                         .reduce((a,b) => a + b,0);
            let prevValueLoss = depreciations.filter(depreciation => depreciation.accountAux==account)
                                             .map(depreciation => depreciation.prevAmount)
                                             .reduce((a,b) => a + b,0);
            return(
              <tr key={account}>
                <td >{account}</td>
                <td>{accountLib.charAt(0).toUpperCase() + accountLib.slice(1).toLowerCase()}</td>
                <td className="text-end">{printValue(amount-valueLoss,0)}  &euro;</td>
                <td className="text-end">{printValue(prevAmount-prevValueLoss,0)}  &euro;</td>
                <td className="text-end">{printValue((amount-valueLoss)-(prevAmount-prevValueLoss),0)}  &euro;</td>
              </tr>)})}
 
          </tbody>
          <tfoot>
          {stocks.length > 0 &&
            <tr className="with-top-line">
              <td colSpan="2"> Total</td>
              <td className="text-end">{printValue(aggregates.netAmountStocks.amount,0)}  &euro;</td>
              <td className="text-end">{printValue(aggregates.netAmountStocks.prevAmount,0)}  &euro;</td>
              <td className="text-end">{printValue(aggregates.netAmountStocks.amount - aggregates.netAmountStocks.prevAmount,0)}  &euro;</td>
          </tr>}
          </tfoot>
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

  sortItems(items,columSorted) 
  {
    switch(columSorted) 
    {
      case "label": items.sort((a,b) => a.accountLib.localeCompare(b.accountLib)); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
      //case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      //case "amount": items.sort((a,b) => b.amount - a.amount); break;
      //case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      // ...les valeurs affichées sont les valeurs nettes comptables (différentes des valeurs "amount")
    }
    if (this.state.reverseSort) items.reverse();
  }

}