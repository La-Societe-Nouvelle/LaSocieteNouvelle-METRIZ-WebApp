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
    <>
    {financialData.isFinancialDataLoaded &&  
      <table>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td className="align-right">Montant</td>
            </tr>
        </thead>
        <tbody> 
          <tr>
            <td>Production sur l'exercice courant</td>
            <td className="align-right">{printValue(production.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Chiffre d'Affaires</td> 
            <td className="align-right">{printValue(revenue.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Production stockée</td>
            <td className="align-right">{printValue(storedProduction.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Production immobilisée</td>
            <td className="align-right">{printValue(immobilisedProduction.amount,0)} &euro;</td>
            </tr>          
          
          <tr className="total">
            <td>Consommations intermédiaires</td>
            <td className={"important align-right"}>{printValue(intermediateConsumption.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="align-right">{printValue(-storedPurchases.amount,0)} &euro;</td>
            </tr>
        {externalExpensesAggregates.filter(aggregate => aggregate.amount != 0).map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td className="align-right">{printValue(amount,0)} &euro;</td>
            
          </tr>)}

          <tr className="total">
            <td>Consommations de capital fixe</td>
            <td className={"important align-right"}>{printValue(capitalConsumption.amount,0)} &euro;</td>
            </tr>
        {depreciationExpensesAggregates.filter(aggregate => aggregate.amount != 0).map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td className="align-right">{printValue(amount,0)} &euro;</td>
            
          </tr>)}

          <tr className="total">
            <td>Valeur ajoutée nette</td>
            <td className={"important align-right"}>{printValue(netValueAdded.amount,0)}  &euro;</td>
            </tr>
          <tr>
            <td>&emsp;dont charges de personnel</td>
            <td className={"detail align-right"}>{printValue(financialData.getAmountPersonnelExpenses(),0)}  &euro;</td>
            </tr>

        </tbody>
      </table>}
    </>)
}