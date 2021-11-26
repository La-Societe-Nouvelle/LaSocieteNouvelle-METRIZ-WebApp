// La Société Nouvelle

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import metaIndics from '/lib/indics';
import { buildIndicatorAggregate } from '../../src/formulas/footprintFormulas';

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorIncomeStatementTable = ({indic,session}) =>
{
  const financialData = session.financialData;

  const nbDecimals = metaIndics[indic].nbDecimals;
  const unit = metaIndics[indic].unit;
  const unitAbsolute = metaIndics[indic].unitAbsolute;
  const impactAbsolu = ["ghg","haz","mat","nrg","was","wat"].includes(indic);

  const expensesGroups = getBasicExpensesGroups(indic,financialData);
  const depreciationExpensesGroups = getBasicDepreciationExpensesGroups(indic,financialData);

  return (
    <table>
      <thead>
        <tr>
          <td colSpan="3">Agrégat</td>
          <td className="column_value" colSpan="2">Valeur</td>
          <td className="column_uncertainty">Incertitude</td>
          {impactAbsolu ? <td className="column_value" colSpan="2">Impact</td> : null}
        </tr>
      </thead>
      <tbody>
        <tr className="with-top-margin">
          <td>Chiffre d'affaires</td>
          <td className="column_value">{printValue(financialData.getRevenue(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getRevenueFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getRevenueFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getRevenueFootprint().getIndicator(indic).getValueAbsolute(financialData.getRevenue()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}</tr>
        <tr>
          <td>Production stockée</td>
          <td className="column_value">{printValue(financialData.getStoredProduction(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getStoredProduction()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}</tr>
        <tr>
          <td>Production immobilisée</td>
          <td className="column_value">{printValue(financialData.getImmobilisedProduction(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getImmobilisedProduction()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}</tr>
        <tr className="with-top-margin">
          <td>Autres produits d'exploitation</td>
          <td className="column_value">{printValue(financialData.getAmountOtherOperatingIncomes(),0)}</td>
          <td className="column_unit">&nbsp;€</td></tr>
        <tr className="with-bottom-line with-top-margin">
          <td><b>TOTAL DES PRODUITS D'EXPLOITATION</b></td>
          <td className="column_value important">{printValue(financialData.getAmountOperatingIncomes(),0)}</td>
          <td className="column_unit important">&nbsp;€</td>
          <td></td><td></td><td></td></tr>
          
        <tr className="with-top-margin">
          <td>CHARGES EXTERNES</td></tr>
        <tr>
          <td>&emsp;Variation de stocks</td>
          <td className="column_value">{printValue(-financialData.getVariationPurchasesStocks(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getVariationPurchasesStocks()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}</tr>
      {expensesGroups.filter(group => group.expenses.length > 0).map(({label,amount,indicator},index) => 
        <tr key={index}>
          <td>&emsp;{label}</td>
          <td className="column_value">{printValue(amount,0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(financialData.getVariationPurchasesStocks()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}</tr>)}
        <tr>
          <td></td>
          <td className="column_value important with-top-line">{printValue(financialData.getAmountIntermediateConsumption(),0)}</td>
          <td className="column_unit important">&nbsp;€</td>
          <td className="column_value">{printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountIntermediateConsumption()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}</tr>

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
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getDepreciationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getDepreciationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getDepreciationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountDepreciationExpenses()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}</tr>
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
  )
}

/* ----- GROUP FUNCTIONS ----- */

const getBasicExpensesGroups = (indic,financialData) =>
{
  let expensesGroups = financialData.getBasicExpensesGroups();

  expensesGroups.forEach(group => 
  {
    group.amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0);
    group.indicator = buildIndicatorAggregate(indic,group.expenses);
  });

  return expensesGroups;
}

const getBasicDepreciationExpensesGroups = (indic,financialData) =>
{
  let expensesGroups = financialData.getBasicDepreciationExpensesGroups();

  expensesGroups.forEach(group => 
  {
    group.amount = group.expenses.map(expense => expense.amount).reduce((a,b) => a+b,0);
    group.indicator = buildIndicatorAggregate(indic,group.expenses);
  });

  return expensesGroups;
}