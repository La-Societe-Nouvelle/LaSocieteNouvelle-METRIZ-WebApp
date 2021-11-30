// La Société Nouvelle

// Utils
import { getAmountItems, printValue } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export const MainAggregatesTable = ({financialData}) =>
{
  const externalExpensesMainAccounts = financialData.getBasicExpensesGroups();
        externalExpensesMainAccounts.forEach(group => group.amount = getAmountItems(group.expenses));

  const depreciationExpensesMainAccounts = financialData.getBasicDepreciationExpensesGroups();
        depreciationExpensesMainAccounts.forEach(group => group.amount = getAmountItems(group.expenses));

  const {production,
         revenue,
         storedProduction,
         immobilisedProduction,
         intermediateConsumption,
         storedPurchases,
         capitalConsumption,
         netValueAdded} = financialData.aggregates;
  
  return(
    <div className="table-main">

    {financialData.isFinancialDataLoaded &&  
      <table>
        <thead>
          <tr><td>Agrégat</td><td colSpan="2">Montant</td></tr>
        </thead>
        <tbody>
          
          <tr>
            <td>Production sur l'exercice courant</td>
            <td className="column_value important">{printValue(production.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Chiffre d'Affaires</td>
            <td className="column_value">{printValue(revenue.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Production stockée</td>
            <td className="column_value">{printValue(storedProduction.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Production immobilisée</td>
            <td className="column_value">{printValue(immobilisedProduction.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>          
          
          <tr className="with-top-line">
            <td>Consommations intermédiaires</td>
            <td className="column_value important">{printValue(intermediateConsumption.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="column_value">{printValue(-storedPurchases.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {externalExpensesMainAccounts.filter(group => group.expenses.length > 0).map(({label,amount},index) => 
          <tr key={index}>
            <td>&emsp;{label}</td>
            <td className="column_value">{printValue(amount,0)}</td>
            <td className="column_unit">&nbsp;€</td>
          </tr>)}

          <tr className="with-top-line">
            <td>Consommations de capital fixe</td>
            <td className="column_value important">{printValue(capitalConsumption.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {depreciationExpensesMainAccounts.filter(group => group.expenses.length > 0).map(({label,amount},index) => 
          <tr key={index}>
            <td>&emsp;{label}</td>
            <td className="column_value">{printValue(amount,0)}</td>
            <td className="column_unit">&nbsp;€</td>
          </tr>)}

          <tr className="with-top-line">
            <td>Valeur ajoutée nette</td>
            <td className="column_value important">{printValue(netValueAdded.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
          <tr>
            <td>&emsp;dont charges de personnel</td>
            <td className="column_value detail">{printValue(financialData.getAmountPersonnelExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>

        </tbody>
      </table>}
    </div>)
}