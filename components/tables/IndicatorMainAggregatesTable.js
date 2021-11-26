// La Société Nouvelle

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import metaIndics from '/lib/indics';
import { buildIndicatorAggregate } from '../../src/formulas/footprintFormulas';

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorMainAggregatesTable = ({indic,session}) =>
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
        <tr>
          <td>Production</td>
          <td className="column_value">{printValue(financialData.getProduction(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getProduction()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>
        <tr>
          <td>&emsp;Production vendue</td>
          <td className="column_value">{printValue(financialData.getRevenue(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getRevenueFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getRevenueFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getRevenueFootprint().getIndicator(indic).getValueAbsolute(financialData.getRevenue()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>
      {financialData.stockVariations.filter(variation => variation.account.charAt(0)=="7").length > 0 &&
        <tr>
          <td>&emsp;Production stockée</td>
          <td className="column_value">{printValue(financialData.getAmountProductionStockVariations(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getProductionStockVariationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountProductionStockVariations()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>}
      {financialData.getImmobilisedProduction() > 0 &&
        <tr>
          <td>&emsp;Production immobilisée</td>
          <td className="column_value">({printValue(financialData.getImmobilisedProduction(),0)})</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">({printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getImmobilisedProduction()),nbDecimals)})</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>
        }
        <tr className="with-top-line">
          <td>Consommations intermédiaires</td>
          <td className="column_value">{printValue(financialData.getAmountIntermediateConsumption(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getIntermediateConsumptionFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountIntermediateConsumption()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>
      {financialData.stocks.filter(stock => !stock.isProductionStock).length > 0 &&
        <tr>
          <td>&emsp;Variation de stocks</td>
          <td className="column_value">{printValue(-financialData.getVariationPurchasesStocks(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(-session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getVariationPurchasesStocks()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>}

      {expensesGroups.filter(group => group.expenses.length > 0)
                     .map(({label,amount,indicator},index) => 
        <tr key={index}>
          <td>&emsp;{label}</td>
          <td className="column_value">{printValue(amount,0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(amount),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>)}

        <tr className="with-top-line">
          <td>Dotations aux amortissements</td>
          <td className="column_value">{printValue(financialData.getAmountDepreciationExpenses(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getDepreciationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getDepreciationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getDepreciationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountDepreciationExpenses()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>
      {depreciationExpensesGroups.filter(group => group.expenses.length > 0)
                                 .map(({label,amount,indicator},index) => 
        <tr key={index}>
          <td>&emsp;{label}</td>
          <td className="column_value">{printValue(amount,0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(amount),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>)}
        
        <tr className="with-top-line">
          <td>Valeur ajoutée nette</td>
          <td className="column_value">{printValue(financialData.getNetValueAdded(),0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(session.getNetValueAddedFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getNetValueAddedFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getNetValueAddedFootprint().getIndicator(indic).getValueAbsolute(financialData.getNetValueAdded()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>
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