// La Société Nouvelle

// Utils
import { getAmountItems, printValue } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export const MainAggregatesTable = ({financialData}) =>
{
  const externalExpensesAggregates = financialData.getExternalExpensesAggregates();

  const depreciationExpensesAggregates = financialData.getBasicDepreciationExpensesAggregates();

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
        {externalExpensesAggregates.filter(aggregate => aggregate.amount != 0).map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td className="column_value">{printValue(amount,0)}</td>
            <td className="column_unit">&nbsp;€</td>
          </tr>)}

          <tr className="with-top-line">
            <td>Consommations de capital fixe</td>
            <td className="column_value important">{printValue(capitalConsumption.amount,0)}</td>
            <td className="column_unit">&nbsp;€</td></tr>
        {depreciationExpensesAggregates.filter(aggregate => aggregate.amount != 0).map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
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