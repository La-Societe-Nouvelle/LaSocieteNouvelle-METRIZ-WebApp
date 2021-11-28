// La Société Nouvelle

// Libraries
import metaAccounts from '../../lib/accounts';

// Utils
import { printValue } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export const IncomeStatementTable = ({financialData}) =>
{
  const externalExpensesMainAccounts = financialData.getBasicExpensesGroups();
        externalExpensesMainAccounts.forEach(group => group.amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0));

  const depreciationExpensesMainAccounts = financialData.getBasicDepreciationExpensesGroups();
        depreciationExpensesMainAccounts.forEach(group => group.amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0));
  
  return(
    <div className="table-main">

      <table>
        <thead>
          <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
        </thead>
        <tbody>

          <tr className="with-top-margin">
            <td>Chiffre d'affaires</td>
            <td className="column_value">{printValue(financialData.getRevenue(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          <tr>
            <td>Production stockée</td>
            <td className="column_value">{printValue(financialData.getStoredProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>Production immobilisée</td>
            <td className="column_value">{printValue(financialData.getImmobilisedProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-top-margin">
            <td>Autres produits d'exploitation</td>
            <td className="column_value">{printValue(financialData.getAmountOtherOperatingIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line with-top-margin">
            <td><b>TOTAL DES PRODUITS D'EXPLOITATION</b></td>
            <td className="column_value important">{printValue(financialData.getAmountOperatingIncomes(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>
          
          <tr className="with-top-margin">
            <td>CHARGES EXTERNES</td></tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="column_value">{printValue(-financialData.getVariationPurchasesStocks(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {externalExpensesMainAccounts.filter(group => group.expenses.length > 0).map(({label,amount},index) => 
          <tr key={index}>
            <td>&emsp;{label}</td>
            <td className="column_value">{printValue(amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>)}
          <tr>
            <td></td>
            <td className="column_value important with-top-line">{printValue(financialData.getAmountIntermediateConsumption(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>

          <tr className="with-top-margin">
            <td>IMPOTS, TAXES ET VERSEMENTS ASSIMILES</td>
            <td className="column_value">{printValue(financialData.getAmountTaxes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          <tr className="with-top-margin">
            <td>CHARGES DE PERSONNEL</td>
            <td className="column_value">{printValue(financialData.getAmountPersonnelExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr className="with-top-margin">
            <td>DOTATIONS D'EXPLOITATION</td></tr>
          <tr>
            <td>&emsp;Dotations aux amortissements sur immobilisations</td>
            <td className="column_value">{printValue(financialData.getAmountDepreciationExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Autres dotations aux amortissements, aux dépréciations et aux provisions</td>
            <td className="column_value">{printValue(financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td></td>
            <td className="column_value important with-top-line">{printValue(financialData.getAmountDepreciationExpenses()+financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>

          <tr className="with-top-margin">
            <td>AUTRES CHARGES D'EXPLOITATION</td>
            <td className="column_value">{printValue(financialData.getAmountOtherExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr className="with-bottom-line with-top-margin">
            <td><b>TOTAL DES CHARGES D'EXPLOITATION</b></td>
            <td className="column_value important">{printValue(financialData.getAmountOperatingExpenses(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>

          <tr className="with-bottom-line with-top-margin">
            <td><b>RESULTAT D'EXPLOITATION</b></td>
            <td className="column_value important">{printValue(financialData.getOperatingResult(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>

          <tr className="with-top-margin">
            <td>PRODUITS FINANCIERS</td>
            <td className="column_value">{printValue(financialData.getAmountFinancialIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>CHARGES FINANCIERES</td>
            <td className="column_value">{printValue(financialData.getAmountFinancialExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line with-top-margin">
            <td><b>RESULTAT FINANCIER</b></td>
            <td className="column_value important">{printValue(financialData.getFinancialResult(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>

          <tr className="with-top-margin">
            <td>PRODUITS EXCEPTIONNELS</td>
            <td className="column_value">{printValue(financialData.getAmountExceptionalIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>CHARGES EXCEPTIONNELLES</td>
            <td className="column_value">{printValue(financialData.getAmountExceptionalExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line with-top-margin">
            <td><b>RESULTAT EXCEPTIONNEL</b></td>
            <td className="column_value important">{printValue(financialData.getExceptionalResult(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>

          <tr className="with-top-margin with-bottom-margin">
            <td>PARTICIPATION DES SALARIES, IMPOTS SUR LES BENEFICES ET ASSIMILES</td>
            <td className="column_value">{printValue(financialData.getAmountTaxOnProfits(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          <tr className="with-bottom-line with-top-line">
            <td><b>BENEFICE OU PERTE</b></td>
            <td className="column_value important">{printValue(financialData.getProfit(),0)}</td>
            <td className="column_unit important">&nbsp;€</td></tr>

        </tbody>
      </table>
    </div>)
}