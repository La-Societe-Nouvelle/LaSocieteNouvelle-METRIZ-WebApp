// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValueInput, valueOrDefault } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export class IncomeStatementTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Input variables
      productionInput: valueOrDefault(props.financialData.getProduction(),""),
      revenueInput: valueOrDefault(props.financialData.revenue,""),
      storedProductionInput: valueOrDefault(props.financialData.getStoredProduction(),""),
      immobilisedProductionInput: valueOrDefault(props.financialData.getImmobilisedProduction(),""),
      unstoredProductionInput: valueOrDefault(props.financialData.getUnstoredProduction(),""),
      amountExpensesInput: valueOrDefault(props.financialData.getAmountExpenses(),""),
      amountDepreciationsInput: valueOrDefault(props.financialData.getAmountDepreciations(),""),
    }
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props!==prevProps)
    {
      this.setState({
        productionInput: valueOrDefault(this.props.financialData.getProduction(),""),
        revenueInput: valueOrDefault(this.props.financialData.revenue,""),
        storedProductionInput: valueOrDefault(this.props.financialData.getStoredProduction(),""),
        immobilisedProductionInput: valueOrDefault(this.props.financialData.getImmobilisedProduction(),""),
        unstoredProductionInput: valueOrDefault(this.props.financialData.getUnstoredProduction(),""),
        amountExpensesInput: valueOrDefault(this.props.financialData.getAmountExpenses(),""),
        amountDepreciationsInput: valueOrDefault(this.props.financialData.getAmountDepreciations(),"")
      })
    }
  }

  updateInputs() 
  {
    this.state.productionInput = valueOrDefault(this.props.financialData.getProduction(),"");
    this.state.revenueInput = valueOrDefault(this.props.financialData.getRevenue(),"");
    this.state.storedProductionInput = valueOrDefault(this.props.financialData.getStoredProduction(),"");
    this.state.immobilisedProductionInput = valueOrDefault(this.props.financialData.getImmobilisedProduction(),"");
    this.state.unstoredProductionInput = valueOrDefault(this.props.financialData.getUnstoredProduction(),"");
    this.state.amountExpensesInput = valueOrDefault(this.props.financialData.getAmountExpenses(),"");
    this.state.amountDepreciationsInput = valueOrDefault(this.props.financialData.getAmountDepreciations(),"");
    this.forceUpdate();
  }

  render() 
  {
    const financialData = this.props.financialData;
    const {revenueInput,
           productionInput,
           storedProductionInput,
           immobilisedProductionInput,
           unstoredProductionInput,
           amountExpensesInput,
           amountDepreciationsInput} = this.state;
    const {purchasesDiscounts} = financialData;

    return (
      <table>
        <thead>
          <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
        </thead>
        <tbody>
          {/* --- Production items --- */}
          <tr className="with-bottom-line">
              <td>Chiffres d'affaires</td>
              <td className="column_amount">{printValueInput(revenueInput,0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>Production</td>
              <td className="column_amount">{printValueInput(productionInput,0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>&emsp;dont production stockée</td>
              <td className="column_amount">{printValueInput(storedProductionInput,0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>&emsp;dont production immobilisée</td>
              <td className="column_amount">{printValueInput(immobilisedProductionInput,0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line">
              <td>Production déstockée sur l'exercice précédent</td>
              <td className="column_amount">{printValueInput(unstoredProductionInput,0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>

          <tr className="with-bottom-line">
            <td>Consommations intermédiaires</td>
            <td className="column_amount">{printValueInput(financialData.getAmountIntermediateConsumption(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>Stockage achats</td>
            <td className="column_amount">{(financialData.getAmountFinalStocks() > 0 ? "(" : "")+printValueInput(financialData.getAmountFinalStocks(),0)+(financialData.getAmountFinalStocks() > 0 ? ")" : "")}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>Déstockage achats</td>
            <td className="column_amount">{printValueInput(financialData.getAmountInitialStocks(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
              <td>Charges externes</td>
              <td className="column_amount">{printValueInput(amountExpensesInput,0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
          {
            Object.entries(financialData.getExpensesAccounts()).map(([num,account]) => {
              return(
                <tr key={num}>
                <td>&emsp;{account.label}</td>
                <td className="column_amount">{printValueInput(account.amount,0)}</td>
                <td className="column_unit">&nbsp;€</td>
              </tr>
            )})
          }
          {purchasesDiscounts.length > 0 &&
            <tr>
              <td>&emsp;Remises, rabais, ristournes</td>
              <td className="column_amount">{"("+printValueInput(financialData.getAmountPurchasesDiscounts(),0)+")"}</td>
              <td className="column_unit">&nbsp;€</td></tr>
          }
          <tr className="with-bottom-line with-top-line">
              <td>Valeur ajoutée brute</td>
              <td className="column_amount">{printValueInput(financialData.getGrossValueAdded(),0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>

          <tr>
              <td>Dotations aux amortissements</td>
              <td className="column_amount">{printValueInput(amountDepreciationsInput,0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
          {
            Object.entries(financialData.getDepreciationsAccounts()).map(([num,account]) => {
              return(
              <tr key={num}>
                <td>&emsp;{account.label}</td>
                <td className="column_amount">{printValueInput(account.amount,0)}</td>
                <td className="column_unit">&nbsp;€</td>
              </tr>
            )})
          }
          <tr className="with-top-line with-bottom-line">
              <td>Valeur ajoutée nette</td>
              <td className="column_amount">{printValueInput(financialData.getNetValueAdded(),0)}</td>
              <td className="column_unit">&nbsp;€</td></tr>
        </tbody>
      </table>
    )
  }

}