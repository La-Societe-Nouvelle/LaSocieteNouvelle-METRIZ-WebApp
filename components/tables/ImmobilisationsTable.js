// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValue } from '../../src/utils/Utils';

/* ---------- IMMOBILISATIONS TABLE ---------- */

export class ImmobilisationsTable extends React.Component {
  
  constructor(props) 
  {
    super(props);
    this.state = {
      columnSorted: "account",
      reverseSort: false,
      nbItems: 10,
      page: 0,
    }
  }

  render() 
  {
    const {immobilisations,depreciations} = this.props.financialData;
    const {columnSorted,nbItems,page} = this.state;
    
    this.sortItems(immobilisations,columnSorted);

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <td className="short" onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td className="auto" onClick={() => this.changeColumnSorted("accountLib")}>Libellé</td>
              <td className="short" colSpan="2" onClick={() => this.changeColumnSorted("amount")}>Montant (N)</td>
              <td className="short" colSpan="2" onClick={() => this.changeColumnSorted("prevAmount")}>Montant (N-1)</td>
              <td className="short" colSpan="2" onClick={() => this.changeColumnSorted("variation")}>Variation</td>
            </tr>
          </thead>
          <tbody>
            {immobilisations.slice(page*nbItems,(page+1)*nbItems)
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
            
            {immobilisations.length > 0 &&
              <tr className="with-top-line">
                <td className="short center"> - </td>
                <td className="auto">TOTAL</td>
                <td className="short right">{printValue(this.props.financialData.getNetAmountImmobilisations(),0)}</td>
                <td className="column_unit">&nbsp;€</td>
                <td className="short right">{printValue(this.props.financialData.getPrevNetAmountImmobilisations(),0)}</td>
                <td className="column_unit">&nbsp;€</td>
                <td className="short right">{printValue(this.props.financialData.getNetAmountImmobilisations()-this.props.financialData.getPrevNetAmountImmobilisations(),0)}</td>
                <td className="column_unit">&nbsp;€</td>
              </tr>}
          </tbody>
        </table>
        {immobilisations.length > nbItems &&
          <div className="table-navigation">
            <button className={page==0 ? "hidden" : ""} onClick={this.prevPage}>Page précédente</button>
            <button className={(page+1)*nbItems < immobilisations.length ? "" : "hidden"} onClick={this.nextPage}>Page suivante</button>
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

  sortItems(items,columSorted) 
  {
    switch(columSorted) 
    {
      case "accountLib": items.sort((a,b) => a.accountLib.localeCompare(b.accountLib)); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
      case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      case "amount": items.sort((a,b) => b.amount - a.amount); break;
    }
    if (this.state.reverseSort) items.reverse();
  }

  /* ----- NAVIGATION ----- */

  prevPage = () => {if (this.state.page > 0) this.setState({page: this.state.page-1})}
  nextPage = () => {if ((this.state.page+1)*this.state.nbItems < this.props.financialData.immobilisations.length) this.setState({page: this.state.page+1})}
  
}