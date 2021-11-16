// La Société Nouvelle

// Libraries
import metaAccounts from '../../lib/accounts';

// Utils
import { printValue } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export const IncomeStatementTable = ({financialData}) =>
{
  const expensesGroups = financialData.getBasicExpensesGroups();
        expensesGroups.forEach(group => group.amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0));

  const depreciationExpensesGroups = financialData.getBasicDepreciationExpensesGroups();
        depreciationExpensesGroups.forEach(group => group.amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0));
  
  return(
    <div className="table-main">

    {financialData.isFinancialDataLoaded &&  
      <table>
        <thead>
          <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
        </thead>
        <tbody>

          <tr>
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
          <tr>
            <td>Autres produits d'exploitation</td>
            <td className="column_value">{printValue(financialData.getAmountOtherOperatingIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line">
            <td><b>TOTAL DES PRODUITS D'EXPLOITATION</b></td>
            <td className="column_value important">{printValue(financialData.getProduction() + financialData.getAmountOtherOperatingIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          <tr>
            <td>CHARGES EXTERNES</td></tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="column_value">{financialData.getVariationPurchasesStocks() > 0 ? ("("+printValue(financialData.getVariationPurchasesStocks(),0)+")") : printValue(financialData.getVariationPurchasesStocks(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {expensesGroups.filter(group => group.expenses.length > 0).map(({label,amount},index) => 
          <tr key={index}>
            <td>&emsp;{label}</td>
            <td className="column_value">{printValue(amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>)}
          <tr>
            <td><b>Total des charges externes</b></td>
            <td className="column_value important">{printValue(financialData.getAmountIntermediateConsumption(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr>
            <td>IMPOTS, TAXES ET VERSEMENTS ASSIMILES</td>
            <td className="column_value">{financialData.getAmountTaxes() < 0 ? ("("+printValue(financialData.getAmountTaxes(),0)+")") : printValue(financialData.getAmountTaxes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          <tr>
            <td>CHARGES DE PERSONNEL</td>
            <td className="column_value">{financialData.getAmountPersonnelExpenses() < 0 ? ("("+printValue(financialData.getAmountPersonnelExpenses(),0)+")") : printValue(financialData.getAmountPersonnelExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr>
            <td>DOTATIONS D'EXPLOITATION</td></tr>
          <tr>
            <td>Dotations aux amortissements sur immobilisations</td>
            <td className="column_value">{printValue(financialData.getAmountDepreciationExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>Dotations aux provisions</td>
            <td className="column_value">{printValue(financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td><b>Total des dotations d'exploitation</b></td>
            <td className="column_value important">{printValue(financialData.getAmountDepreciationExpenses()+financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr>
            <td>AUTRES CHARGES D'EXPLOITATION</td>
            <td className="column_value">{financialData.getAmountOtherExpenses() < 0 ? ("("+printValue(financialData.getAmountOtherExpenses(),0)+")") : printValue(financialData.getAmountOtherExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr className="with-bottom-line">
            <td><b>TOTAL DES CHARGES D'EXPLOITATION</b></td>
            <td className="column_value important">{printValue(financialData.getAmountIntermediateConsumption()+financialData.getAmountTaxes()+financialData.getAmountPersonnelExpenses()+financialData.getAmountDepreciationExpenses()+financialData.getAmountProvisions()+financialData.getAmountOtherExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr>
            <td>PRODUITS FINANCIERS</td>
            <td className="column_value">{printValue(financialData.getAmountFinancialIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>CHARGES FINANCIERES</td>
            <td className="column_value">{printValue(financialData.getAmountFinancialExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line">
            <td><b>RESULTAT FINANCIER</b></td>
            <td className="column_value important">{printValue(financialData.getFinancialResult(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr>
            <td>PRODUITS EXCEPTIONNELS</td>
            <td className="column_value">{printValue(financialData.getAmountExceptionalIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>CHARGES EXCEPTIONNELLES</td>
            <td className="column_value">{printValue(financialData.getAmountExceptionalExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line">
            <td><b>RESULTAT EXCEPTIONNEL</b></td>
            <td className="column_value important">{printValue(financialData.getExceptionalResult(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

          <tr>
            <td>Participation des salariés aux résultats de l'entreprise</td>
            <td className="column_value">{printValue(financialData.getAmountTaxOnProfits()+financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>Impôts sur les bénéfices</td>
            <td className="column_value">{printValue(financialData.getAmountTaxOnProfits()+financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          <tr className="with-bottom-line with-top-line">
            <td><b>BENEFICE OU PERTE</b></td>
            <td className="column_value important">{printValue(financialData.getAmountTaxOnProfits(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

        </tbody>
      </table>}
    </div>)
}