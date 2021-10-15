// La Société Nouvelle

// Libraries
import { metaAccounts } from '../../lib/accounts';

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
    <div className="table-container">

    {financialData.isFinancialDataLoaded &&  
      <table>
        <thead>
          <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
        </thead>
        <tbody>

          <tr className="with-bottom-line">
            <td>Produits d'exploitation</td>
            <td className="column_value">{printValue(financialData.getProduction() + financialData.getAmountOtherOperatingIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          <tr>
            <td>Production sur l'exercice courant</td>
            <td className="column_value important">{printValue(financialData.getProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Chiffre d'Affaires</td>
            <td className="column_value">{printValue(financialData.getRevenue(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Production stockée</td>
            <td className="column_value">{printValue(financialData.getAmountProductionStockVariations(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Production immobilisée</td>
            <td className="column_value">{printValue(financialData.getImmobilisedProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>Autres produits d'exploitation</td>
            <td className="column_value">{printValue(financialData.getAmountOtherOperatingIncomes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          
          
          <tr className="with-top-line">
            <td>Consommations intermédiaires</td>
            <td className="column_value important">{printValue(financialData.getAmountIntermediateConsumption(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="column_value">{financialData.getVariationPurchasesStocks() > 0 ? ("("+printValue(financialData.getVariationPurchasesStocks(),0)+")") : printValue(financialData.getVariationPurchasesStocks(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {expensesGroups.filter(group => group.expenses.length > 0).map(({label,amount}) => 
          <tr key={label}>
            <td>&emsp;{label}</td>
            <td className="column_value">{printValue(amount,0)}</td>
            <td className="column_unit">&nbsp;€</td>
          </tr>)}

          <tr className="with-top-line">
            <td>Dotations aux amortissements sur immobilisations</td>
            <td className="column_value important">{printValue(financialData.getAmountDepreciationExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {depreciationExpensesGroups.filter(group => group.expenses.length > 0).map(({label,amount}) => 
          <tr key={label}>
            <td>&emsp;{label}</td>
            <td className="column_value">{printValue(amount,0)}</td>
            <td className="column_unit">&nbsp;€</td>
          </tr>)}

          <tr className="with-top-line">
            <td>Valeur ajoutée nette</td>
            <td className="column_value important">{printValue(financialData.getNetValueAdded(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;dont charges de personnel</td>
            <td className="column_value detail">{printValue(financialData.getAmountPersonnelExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;dont impôts, taxe et versements assimilés</td>
            <td className="column_value detail">{printValue(financialData.getAmountTaxes(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr className="with-bottom-line">
            <td>&emsp;dont résultat d'exploitation</td>
            <td className="column_value detail">{printValue(financialData.getOperatingResult(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          {/*<tr>
            <td>&emsp;dont autres charges d'exploitation</td>
            <td className="column_value">{printValue(financialData.getAmountOtherExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>*/}
          {/*<tr>
            <td>&emsp;dont dépréciations et provisions</td>
            <td className="column_value">{printValue(financialData.getAmountProvisions(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>*/}

        </tbody>
      </table>}
    </div>)
}

const groupDepreciationExpensesByAccounts = (expenses) =>
{
  let expensesByAccounts = {};
  expenses.forEach((expense) => 
  {
    let account = expense.account.substring(0,5);
    if (expensesByAccounts[account]==undefined) expensesByAccounts[account] = {...expense, accountLib: metaAccounts.accountsDepreciationExpenses[account]};
    else expensesByAccounts[account].amount+= expense.amount;
  })
  return expensesByAccounts;
}