// La Société Nouvelle

// Libraries
import { metaAccounts } from '../../lib/accounts';

// Utils
import { printValue } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export const IncomeStatementTable = ({financialData}) =>

  <div className="table-container">

  {financialData.isFinancialDataLoaded &&  
    <table>
      <thead>
        <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
      </thead>
      <tbody>

        <tr className="with-bottom-line">
          <td>Produits d'exploitation</td>
          <td className="column_amount">{printValue(financialData.getProduction() + financialData.getAmountOtherOperatingIncomes(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        
        <tr>
          <td>Production sur l'exercice courant</td>
          <td className="column_amount important">{printValue(financialData.getProduction(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>&emsp;Chiffre d'Affaires</td>
          <td className="column_amount">{printValue(financialData.getRevenue(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>&emsp;Production stockée</td>
          <td className="column_amount">{printValue(financialData.getStoredProduction(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>&emsp;Production déstockée sur l'exercice précédent</td>
          <td className="column_amount">{"("+printValue(financialData.getUnstoredProduction(),0)+")"}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>&emsp;Production immobilisée</td>
          <td className="column_amount">{printValue(financialData.getImmobilisedProduction(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>Autres produits d'exploitation</td>
          <td className="column_amount">{printValue(financialData.getAmountOtherOperatingIncomes(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        
        
        <tr className="with-top-line">
          <td>Consommations intermédiaires</td>
          <td className="column_amount important">{printValue(financialData.getAmountIntermediateConsumption(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>&emsp;Variation de stocks</td>
          <td className="column_amount">{financialData.getVariationPurchasesStocks() > 0 ? ("("+printValue(financialData.getVariationPurchasesStocks(),0)+")") : printValue(financialData.getVariationPurchasesStocks(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
      {Object.entries(groupExpensesByAccounts(financialData.expenses)).map(([_,{account,accountLib,amount}]) => 
        <tr key={account}>
          <td>&emsp;{accountLib}</td>
          <td className="column_amount">{printValue(amount,0)}</td>
          <td className="column_unit">&nbsp;€</td>
        </tr>)}

        <tr className="with-top-line">
          <td>Dotations aux amortissements sur immobilisations</td>
          <td className="column_amount important">{printValue(financialData.getAmountDepreciations(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
      {Object.entries(groupDepreciationsByAccounts(financialData.depreciations)).map(([_,{account,accountLib,amount}]) => 
        <tr key={account}>
          <td>&emsp;{accountLib}</td>
          <td className="column_amount">{printValue(amount,0)}</td>
          <td className="column_unit">&nbsp;€</td>
        </tr>)}

        <tr className="with-top-line">
          <td>Valeur ajoutée nette</td>
          <td className="column_amount important">{printValue(financialData.getNetValueAdded(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>&emsp;dont charges de personnel</td>
          <td className="column_amount detail">{printValue(financialData.getAmountPersonnelExpenses(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr>
          <td>&emsp;dont impôts, taxe et versements assimilés</td>
          <td className="column_amount detail">{printValue(financialData.getAmountTaxes(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr className="with-bottom-line">
          <td>&emsp;dont résultat d'exploitation</td>
          <td className="column_amount detail">{printValue(financialData.getOperatingResult(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        {/*<tr>
          <td>&emsp;dont autres charges d'exploitation</td>
          <td className="column_amount">{printValue(financialData.getAmountOtherExpenses(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>*/}
        {/*<tr>
          <td>&emsp;dont dépréciations et provisions</td>
          <td className="column_amount">{printValue(financialData.getAmountProvisions(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>*/}

      </tbody>
    </table>}
  </div>

const groupExpensesByAccounts = (expenses) =>
{
  let expensesByAccounts = {};
  expenses.forEach((expense) => 
  {
    let account = expense.account.substring(0,2);
    if (expensesByAccounts[account]==undefined) expensesByAccounts[account] = {...expense, accountLib: metaAccounts.accountsExpenses[account]};
    else expensesByAccounts[account].amount+= expense.amount;
  })
  return expensesByAccounts;
}

const groupDepreciationsByAccounts = (depreciations) =>
{
  let depreciationsByAccounts = {};
  depreciations.forEach((depreciation) => 
  {
    let account = depreciation.account.substring(0,3);
    if (depreciationsByAccounts[account]==undefined) depreciationsByAccounts[account] = {...depreciation, accountLib: metaAccounts.accountsDepreciations[account]};
    else depreciationsByAccounts[account].amount+= depreciation.amount;
  })
  return depreciationsByAccounts;
}