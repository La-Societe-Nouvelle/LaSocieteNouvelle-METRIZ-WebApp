// La Société Nouvelle

// React
import React from 'react';
import { Table } from 'react-bootstrap';

// Utils
import { printValue } from '../../src/utils/Utils';

/* ---------- IMMOBILISATIONS TABLE ---------- */

export class ImmobilisationsTable extends React.Component {
  
  constructor(props) 
  {
    super(props);
    this.state = {
      columnSorted: "account",
      reverseSort: false
    }
  }

  render() 
  {
    const {immobilisations,depreciations,aggregates} = this.props.financialData;
    const {columnSorted} = this.state;
    
    this.sortItems(immobilisations,columnSorted);

    return (
      <>
        <Table  hover>
          <thead>
            <tr>
              <td className="short" onClick={() => this.changeColumnSorted("account")}>Compte</td>
              <td onClick={() => this.changeColumnSorted("accountLib")}>Libellé</td>
              <td className="text-end">Montant (N)</td>
              <td className="text-end">Montant (N-1)</td>
              <td className="text-end">Variation</td>
            </tr>
          </thead>
          <tbody>
            {immobilisations.map(({account,accountLib,amount,prevAmount}) => {
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
                      
          {immobilisations.length > 0 &&
             <tfoot>
             <tr>
                <td colSpan="2">TOTAL</td>
                <td className="text-end">{printValue(aggregates.netAmountImmobilisation.amount,0)} &euro;</td>
                <td className="text-end">{printValue(aggregates.netAmountImmobilisation.prevAmount,0)}  &euro;</td>
                <td className="text-end">{printValue(aggregates.netAmountImmobilisation.amount-aggregates.netAmountImmobilisation.prevAmount,0)}  &euro;</td>
              </tr>
            </tfoot>
          }
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
      case "accountLib": items.sort((a,b) => a.accountLib.localeCompare(b.accountLib)); break;
      case "account": items.sort((a,b) => a.account.localeCompare(b.account)); break;
      //case "prevAmount": items.sort((a,b) => b.prevAmount - a.prevAmount); break;
      //case "variation": items.sort((a,b) => (b.amount-b.prevAmount) - (a.amount-a.prevAmount)); break;
      //case "amount": items.sort((a,b) => b.amount - a.amount); break;
      // ...les valeurs affichées sont les valeurs nettes comptables (différentes des valeurs "amount")
    }
    if (this.state.reverseSort) items.reverse();
  }

}