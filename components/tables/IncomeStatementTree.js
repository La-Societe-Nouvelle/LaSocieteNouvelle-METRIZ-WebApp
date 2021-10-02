// La Société Nouvelle

// React
import React from 'react';

// Utils
import { printValueInput, valueOrDefault } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export class IncomeStatementTree extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Input variables
      productionInput: valueOrDefault(props.financialData.getProduction(),""),
      revenueInput: valueOrDefault(props.financialData.revenue,""),
      immobilisedProductionInput: valueOrDefault(props.financialData.getImmobilisedProduction(),""),
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
        immobilisedProductionInput: valueOrDefault(this.props.financialData.getImmobilisedProduction(),""),
        amountDepreciationsInput: valueOrDefault(this.props.financialData.getAmountDepreciations(),"")
      })
    }
  }

  render() 
  {
    const financialData = this.props.financialData;
    const {revenueInput,
           productionInput,
           immobilisedProductionInput,
           amountDepreciationsInput} = this.state;
    const {purchasesDiscounts} = financialData;

    return (
      <table>
        <thead>
          <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
        </thead>
        <tbody>
          {/* --- Production items --- */}
          <tr>
            <td>Produits d'exploitation</td>
            <td className="column_value important">{printValueInput(financialData.getProduction() + financialData.getAmountOtherIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|--- Production sur l'exercice courant</td>
            <td className="column_value">{printValueInput(productionInput,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;|--- Consommations intermédiaires</td>
            <td className="column_value">{printValueInput(financialData.getAmountIntermediateConsumption(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;|&emsp;&emsp;|--- Stockage achats</td>
            <td className="column_value">{(financialData.getAmountStocks() > 0 ? "(" : "")+printValueInput(financialData.getAmountStocks(),0)+(financialData.getAmountStocks() > 0 ? ")" : "")}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;|&emsp;&emsp;|--- Déstockage achats</td>
            <td className="column_value">{printValueInput(financialData.getPrevAmountStocks(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;|&emsp;&emsp;|--- Charges externes</td>
            <td className="column_value">{printValueInput(financialData.getAmountExternalExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {Object.entries(financialData.getExpensesByAccounts()).map(([num,account]) => 
          <tr key={num}>
            <td>&emsp;|&emsp;&emsp;|&emsp;&emsp;&emsp;&emsp;|--- {account.label}</td>
            <td className="column_value">{printValueInput(account.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>)}
          <tr>
            <td>&emsp;|&emsp;&emsp;|--- Valeur ajoutée brute</td>
            <td className="column_value">{printValueInput(financialData.getGrossValueAdded(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;&emsp;&emsp;|--- Dotations aux amortissements</td>
            <td className="column_value">{printValueInput(amountDepreciationsInput,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          {financialData.depreciations.map((depreciation) => 
          <tr key={depreciation.id}>
            <td>&emsp;|&emsp;&emsp;&emsp;&emsp;|&emsp;&emsp;|--- {depreciation.account}</td>
            <td className="column_value">{printValueInput(depreciation.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td>
          </tr>)}
          <tr>
            <td>&emsp;|&emsp;&emsp;&emsp;&emsp;|--- Valeur ajoutée nette</td>
            <td className="column_value">{printValueInput(financialData.getNetValueAdded(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;|--- dont charges de personnel</td>
            <td className="column_value">{printValueInput(financialData.getAmountPersonnelExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;|--- dont impôts, taxe et versements assimilés</td>
            <td className="column_value">{printValueInput(financialData.getAmountTaxes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;|--- dont résultat d'exploitation</td>
            <td className="column_value">{printValueInput(financialData.getOperatingResult(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line">
            <td>&emsp;|--- Autres produits d'exploitation</td>
            <td className="column_value">{printValueInput(financialData.getAmountOtherIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          {/*<tr>
            <td>&emsp;dont autres charges d'exploitation</td>
            <td className="column_value">{printValueInput(financialData.getAmountOtherExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>*/}
          {/*<tr>
            <td>&emsp;dont dépréciations et provisions</td>
            <td className="column_value">{printValueInput(financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>*/}

        </tbody>
      </table>
    )
  }

}