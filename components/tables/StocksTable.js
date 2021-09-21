// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue } from "../../src/utils/Utils";

/* ---------- TABLE STOCKS ---------- */

export class StocksTable extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = 
    {
      columnSorted: "account",
      reverseSort: false,
      nbItems: 15,
      page: 0,
    }
  }

  render() 
  {
    const {stocks,depreciations} = this.props.financialData;
    const {columnSorted,nbItems,page} = this.state;

    this.sortItems(stocks,columnSorted);

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <td className="short center" onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="auto" onClick={() => this.changeColumnSorted("label")}>Libellé</td>
              <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant (N)</td>
              <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("prevAmount")}>Montant (N-1)</td>
              <td className="short center" colSpan="2" onClick={() => this.changeColumnSorted("variation")}>Variation</td>
            </tr>
          </thead>
          <tbody>
          {stocks.slice(page*nbItems,(page+1)*nbItems)
                  .map(({account,accountLib,amount,prevAmount}) => {
            let valueLoss = depreciations.filter(depreciation => depreciation.accountAux==account)
                                         .map(depreciation => depreciation.amount)
                                         .reduce((a,b) => a + b,0);
            let prevValueLoss = depreciations.filter(depreciation => depreciation.accountAux==account)
                                             .map(depreciation => depreciation.prevAmount)
                                             .reduce((a,b) => a + b,0);
            return(
              <tr key={account}>
                <td className="short center">{account}</td>
                <td className="auto">{accountLib}</td>
                <td className="short right">{printValue(amount-valueLoss,0)}</td>
                <td className="column_unit">&nbsp;€</td>
                <td className="short right">{printValue(prevAmount-prevValueLoss,0)}</td>
                <td className="column_unit">&nbsp;€</td>
                <td className="short right">{printValue((amount-valueLoss)-(prevAmount-prevValueLoss),0)}</td>
                <td className="column_unit">&nbsp;€</td>
              </tr>)})}
          {stocks.length > 0 &&
            <tr className="with-top-line">
              <td className="short center"> - </td>
              <td className="auto">TOTAL</td>
              <td className="short right">{printValue(this.props.financialData.getAmountStocks(),0)}</td>
              <td className="column_unit">&nbsp;€</td>
              <td className="short right">{printValue(this.props.financialData.getPrevAmountStocks(),0)}</td>
              <td className="column_unit">&nbsp;€</td>
              <td className="short right">{printValue(this.props.financialData.getVariationStocks(),0)}</td>
              <td className="column_unit">&nbsp;€</td>
          </tr>}
          </tbody>
        </table>
        {stocks.length > nbItems &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*nbItems < stocks.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
          </div>}
      </div>
    )
  }

  /* ----- ACTIONS ----- */

  // Import CSV File
  importPrevStateFile = (event) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const previousPeriodFootprints = JSON.parse(reader.result);
      Object.entries(previousPeriodFootprints).forEach(([accountStock,footprint]) => {
        let stock = this.props.financialData.getInitialStockByAccount(accountStock);
        stock.footprint = footprint;
        stock.prevFootprint = true;
      }).then(this.forceUpdate());
    };
    reader.readAsText(event.target.files[0]);
  }

  /* ----- SORTING ----- */

  changeColumnSorted(columnSorted) 
  {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortItems(items,columSorted) 
  {
    switch(columSorted) {
      case "label": items.sort((a,b) => a.label.localeCompare(b.label)); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
      case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      case "amount": items.sort((a,b) => b.amount - a.amount); break;
      case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.stocks.length) this.setState({page: this.state.page+1})}

}