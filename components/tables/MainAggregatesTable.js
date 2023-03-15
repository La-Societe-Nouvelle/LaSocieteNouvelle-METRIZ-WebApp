// La Société Nouvelle

// Utils
import { Table } from 'react-bootstrap';
import { buildFixedCapitalConsumptionsAggregates, buildIntermediateConsumptionsAggregates } from '../../src/formulas/aggregatesBuilder';
import { printValue } from '../../src/utils/Utils';

/* ---------- INCOME STATEMENT TABLE ---------- */

export const MainAggregatesTable = ({financialData,period}) =>
{
  const periodKey = period.periodKey;
  const intermediateConsumptionsAggregates = buildIntermediateConsumptionsAggregates(financialData, periodKey);
  const fixedCapitalConsumptionsAggregates = buildFixedCapitalConsumptionsAggregates(financialData, periodKey);

  const {revenue,
         storedProduction,
         immobilisedProduction} = financialData.productionAggregates;

  const {production,
         intermediateConsumptions,
         fixedCapitalConsumptions,
         netValueAdded} = financialData.mainAggregates;
  
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
            <td className="text-end">{printValue(production.periodsData[periodKey].amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Chiffre d'Affaires</td> 
            <td className="text-end">{printValue(revenue.periodsData[periodKey].amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Production stockée</td>
            <td className="text-end">{printValue(storedProduction.periodsData[periodKey].amount,0)} &euro;</td>
            </tr>
          <tr>
            <td>&emsp;Production immobilisée</td>
            <td className="text-end">{printValue(immobilisedProduction.periodsData[periodKey].amount,0)} &euro;</td>
            </tr>          
          
          <tr className="fw-bold border-top">
            <td>Consommations intermédiaires</td>
            <td className={"important text-end"}>{printValue(intermediateConsumptions.periodsData[periodKey].amount,0)} &euro;</td>
            </tr>
        {intermediateConsumptionsAggregates.filter(aggregate => aggregate.amount != 0).map(({label,amount},index) => 
          <tr key={index}>
            <td>&emsp;{label}</td>
            <td className="text-end">{printValue(amount,0)} &euro;</td>
            
          </tr>)}

          <tr className="fw-bold border-top">
            <td>Consommations de capital fixe</td>
            <td className={"important text-end"}>{printValue(fixedCapitalConsumptions.periodsData[periodKey].amount,0)} &euro;</td>
            </tr>
        {fixedCapitalConsumptionsAggregates.filter(aggregate => aggregate.amount != 0).map(({label,amount},index) => 
          <tr key={index}>
            <td>&emsp;{label}</td>
            <td className="text-end">{printValue(amount,0)} &euro;</td>
            
          </tr>)}

          <tr className="fw-bold border-top">
            <td>Valeur ajoutée nette</td>
            <td className={"important text-end"}>{printValue(netValueAdded.periodsData[periodKey].amount,0)}  &euro;</td>
            </tr>
          <tr>
            <td>&emsp;dont charges de personnel</td>
            <td className={"detail text-end"}>{printValue(financialData.otherFinancialData.personnelExpenses.periodsData[periodKey].amount,0)}  &euro;</td>
            </tr>

        </tbody>
      </Table>}
    </>)
}