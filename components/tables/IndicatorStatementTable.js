// La Société Nouvelle

// Utils
import { printValue } from '/src/utils/Utils';

// Libraries
import { metaIndicators } from '/lib/indic';
import { metaAccounts } from '/lib/accounts';

/* ---------- INDICATOR STATEMENT TABLE ---------- */

export const IndicatorStatementTable = ({indic,session}) =>
{
  const financialData = session.financialData;

  const nbDecimals = metaIndicators[indic].nbDecimals;
  const unit = metaIndicators[indic].unit;
  const unitAbsolute = metaIndicators[indic].unitAbsolute;
  const impactAbsolu = ["ghg","haz","mat","nrg","was","wat"].includes(indic);

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
      {Object.entries(groupExpensesByAccounts(financialData.expenses)).map(([_,{account,accountLib,amount}]) => {
        const indicator = session.getExpensesAccountIndicator(account,indic);
        return (
        <tr key={account}>
          <td>&emsp;{accountLib}</td>
          <td className="column_value">{printValue(amount,0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(amount),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>)})}

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
      {Object.entries(groupDepreciationsByAccounts(financialData.depreciationExpenses)).map(([_,{account,accountLib,amount}]) => {
        const indicator = session.getDepreciationsAccountIndicator(account,indic);
        return (
        <tr key={account}>
          <td>&emsp;{accountLib}</td>
          <td className="column_value">{printValue(amount,0)}</td>
          <td className="column_unit">&nbsp;€</td>
          <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(amount),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>)})}
        
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

const groupExpensesByAccounts = (expenses) =>
{
  let expensesByAccounts = {};
  expenses.forEach((expense) => 
  {
    let account = expense.account.substring(0,2);
    if (expensesByAccounts[account]==undefined) expensesByAccounts[account] = {...expense, account, accountLib: metaAccounts.accountsExpenses[account]};
    else expensesByAccounts[account].amount+= expense.amount;
  })
  return expensesByAccounts;
}

const groupDepreciationsByAccounts = (depreciationExpenses) =>
{
  let depreciationExpensesByAccounts = {};
  depreciationExpenses.forEach((expense) => 
  {
    let account = expense.account.substring(0,5);
    if (depreciationExpensesByAccounts[account]==undefined) depreciationExpensesByAccounts[account] = {...expense, account, accountLib: metaAccounts.accountsDepreciationExpenses[account]};
    else depreciationExpensesByAccounts[account].amount+= expense.amount;
  })
  return depreciationExpensesByAccounts;
}