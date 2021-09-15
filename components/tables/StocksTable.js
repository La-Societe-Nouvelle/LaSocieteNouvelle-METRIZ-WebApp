// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue } from "../../src/utils/Utils";
import { InputNumber } from '../InputNumber';
import { InputText } from '../InputText';

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
      showEditor: false,
      stockToEdit: null,
    }
  }

  render() 
  {
    const {stocks} = this.props.financialData;
    const {columnSorted,nbItems,page,showEditor,stockToEdit} = this.state;

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
                  .map(({account,accountLib,amount,prevAmount}) => 
            <tr key={account}>
              <td className="short center">{account}</td>
              <td className="auto">{accountLib}</td>
              <td className="short right">{printValue(amount,0)}</td>
              <td className="column_unit">&nbsp;€</td>
              <td className="short right">{printValue(prevAmount,0)}</td>
              <td className="column_unit">&nbsp;€</td>
              <td className="short right">{printValue(amount-prevAmount,0)}</td>
              <td className="column_unit">&nbsp;€</td>
            </tr>)}
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

  // Manage editor
  closeEditor = () => this.setState({showEditor: false})
  
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

  changeColumnSorted(columnSorted) {
    if (columnSorted!=this.state.columnSorted)  {this.setState({columnSorted: columnSorted, reverseSort: false})}
    else                                        {this.setState({reverseSort: !this.state.reverseSort})}
  }

  sortItems(items,columSorted) {
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

  /* ----- OPERATIONS ON EXPENSE ----- */

  editStock = (id) => {this.setState({showEditor: true, stockToEdit: this.props.financialData.getInitialStock(id)})}
  deleteStock = (id) => {this.props.financialData.removeInitialStock(id);this.props.onUpdate();this.forceUpdate()}

}

/* ---------- ROW STOCK ---------- */

/* ---------- ROW TOTAL ---------- */

function RowTotal(props) 
{
  const {financialData} = props
  
  return (
    <tr className="with-top-line">
      <td className="short center"> - </td>
      <td className="auto">TOTAL</td>
      <td className="short right">{printValue(financialData.getPrevAmountStocks(),0)}</td>
      <td className="column_unit">&nbsp;€</td>
      <td className="short right">{printValue(financialData.getVariationStocks(),0)}</td>
      <td className="column_unit">&nbsp;€</td>
      <td className="short right">{printValue(financialData.getAmountStocks(),0)}</td>
      <td className="column_unit">&nbsp;€</td>
    </tr>
  )
}