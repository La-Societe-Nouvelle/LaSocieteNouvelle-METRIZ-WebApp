// La Société Nouvelle

// React
import React from 'react';
import { Table } from 'react-bootstrap';

// Utils
import { getAmountItems, getSumItems } from "/src/utils/Utils";
import { printValue } from "/src/utils/formatters";
import { getPrevDate } from "/src/utils/periodsUtils";

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
    const period = this.props.period;
    const prevStateDateEnd = getPrevDate(period.dateStart);
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
          {stocks.map((stock) => {
            return(
              <tr key={stock.accountNum}>
                <td >{stock.accountNum}</td>
                <td>{stock.accountLib.charAt(0).toUpperCase() + stock.accountLib.slice(1).toLowerCase()}</td>
                <td className="text-end">{printValue(stock.states[period.dateEnd].amount,0)}  &euro;</td>
                <td className="text-end">{printValue(stock.states[prevStateDateEnd].amount,0)}  &euro;</td>
                <td className="text-end">{printValue(stock.states[period.dateEnd].amount - stock.states[prevStateDateEnd].amount,0)}  &euro;</td>
              </tr>)})}
 
          </tbody>
          <tfoot>
          {stocks.length > 0 &&
            <tr className="border-top">
              <td colSpan="2"> Total</td>
              <td className="text-end">{printValue(getAmountItems(stocks.map(stock => stock.states[period.dateEnd])), 0)}  &euro;</td>
              <td className="text-end">{printValue(getAmountItems(stocks.map(stock => stock.states[prevStateDateEnd])), 0)}  &euro;</td>
              <td className="text-end">{printValue(getSumItems(stocks.map(stock => stock.states[period.dateEnd].amount - stock.states[prevStateDateEnd].amount)),0)}  &euro;</td>
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
      case "account": items.sort((a,b) => a.accountNum.localeCompare(b.accountNum)); break;
      //case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      //case "amount": items.sort((a,b) => b.amount - a.amount); break;
      //case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      // ...les valeurs affichées sont les valeurs nettes comptables (différentes des valeurs "amount")
    }
    if (this.state.reverseSort) items.reverse();
  }

}

const getGrossAmountStock = (stock,date) => stock.states[date].amount
const getNetAmountStock = (stock,date) => stock.states[date].amount - stock.states[date].depreciationAmount