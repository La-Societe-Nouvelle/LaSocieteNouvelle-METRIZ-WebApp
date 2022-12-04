// La Société Nouvelle

// Utils
import { Table } from 'react-bootstrap';
import { printValue } from '../../src/utils/Utils';

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
      <Table  hover>
        <thead>
          <tr>
            <td>Agrégat</td>
            <td className="text-end">Montant</td>
            </tr>
        </thead>
        <tbody> 
          <tr className="fw-bold border-top">
            <td>Production sur l'exercice courant</td>
            <td className="text-end">{printValue(production.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Chiffre d'Affaires</td> 
            <td className="text-end">{printValue(revenue.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Production stockée</td>
            <td className="text-end">{printValue(storedProduction.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Production immobilisée</td>
            <td className="text-end">{printValue(immobilisedProduction.amount,0)} &euro;</td>
            </tr>          
          
          <tr className="fw-bold border-top">
            <td>Consommations intermédiaires</td>
            <td className={"important text-end"}>{printValue(intermediateConsumption.amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="text-end">{printValue(-storedPurchases.amount,0)} &euro;</td>
            </tr>
        {externalExpensesAggregates.filter(aggregate => aggregate.amount != 0).map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td className="text-end">{printValue(amount,0)} &euro;</td>
            
          </tr>)}

          <tr className="fw-bold border-top">
            <td>Consommations de capital fixe</td>
            <td className={"important text-end"}>{printValue(capitalConsumption.amount,0)} &euro;</td>
            </tr>
        {depreciationExpensesAggregates.filter(aggregate => aggregate.amount != 0).map(({accountLib,amount},index) => 
          <tr key={index}>
            <td>&emsp;{accountLib}</td>
            <td className="text-end">{printValue(amount,0)} &euro;</td>
            
          </tr>)}

          <tr className="fw-bold border-top">
            <td>Valeur ajoutée nette</td>
            <td className={"important text-end"}>{printValue(netValueAdded.amount,0)}  &euro;</td>
            </tr>
          <tr>
            <td>&emsp;dont charges de personnel</td>
            <td className={"detail text-end"}>{printValue(financialData.getAmountPersonnelExpenses(),0)}  &euro;</td>
            </tr>

        </tbody>
      </Table>}
    </>)
}