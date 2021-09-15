import React from 'react';

// Modules
import { Chart } from "react-google-charts";

// Utils
import { printValue } from '/src/utils/Utils';

// Components
import { StatementART } from '/components/statements/StatementART';
import { StatementDIS } from '/components/statements/StatementDIS';
import { StatementECO } from '/components/statements/StatementECO';
import { StatementGEQ } from '/components/statements/StatementGEQ';
import { StatementGHG } from '/components/statements/StatementGHG';
import { StatementHAZ } from '/components/statements/StatementHAZ';
import { StatementKNW } from '/components/statements/StatementKNW';
import { StatementMAT } from '/components/statements/StatementMAT';
import { StatementNRG } from '/components/statements/StatementNRG';
import { StatementSOC } from '/components/statements/StatementSOC';
import { StatementWAS } from '/components/statements/StatementWAS';
import { StatementWAT } from '/components/statements/StatementWAT';

// Export modules
import { exportIndicPDF, exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV } from '../../src/Export'

// Libraries
import { metaIndicators } from '/lib/indic';
import { metaAccounts } from '/lib/accounts';

/* -------------------------------------------------- */
/* -------------------- MAIN TAB -------------------- */
/* -------------------------------------------------- */

export class MainTab extends React.Component {
  
  constructor(props) 
  {
    super(props);
    this.refTable = React.createRef();  
    this.refInsights = React.createRef();
  }

  componentDidUpdate(prevProps) 
  {
    if (this.props.impactsData!==prevProps.impactsData) {
      console.log("update");
    }
  }

  render() 
  {
    return (
      <div className="indicator-section-view">
        <div className="groups">
          <div className="group">
            <h3>Déclaration des impacts directs</h3>
            <Statement {...this.props}/>
          </div>
          <div className="group">
            <h3>Tableau récapitulatif</h3>
            <div className="actions">
              <button onClick={() => exportIndicPDF(this.props.indic,this.props.session)}>Editer rapport</button>
              <button onClick={() => this.props.onPrintDetails("expenses")}>Détails des dépenses</button>
              <button onClick={() => this.props.onPrintDetails("depreciations")}>Détails des immobilisations</button>
            </div>
            <TableMain {...this.props} ref={this.refTable}/>
          </div>
          <div className="group">
            <h3>Graphiques comparatifs</h3>
            <Insights session={this.props.session} indic={this.props.indic} ref={this.refInsights}/>
          </div>
        </div>
      </div>
    )
  }

  updateTable = () => {
    this.refTable.current.forceUpdate();
    this.refInsights.current.forceUpdate();
  }

}

/* ---------- ASSESSMENT GROUP ---------- */

// Display the correct assessment view according to the indicator
function Statement(props) 
{
  let statementProps = {
    impactsData: props.session.impactsData,
    onUpdate: props.onUpdate,
    toAssessment: () => props.onPrintDetails("assessment"),
  }
  switch(props.indic) {
    case "art" : return(<StatementART {...statementProps}/>)
    case "dis" : return(<StatementDIS {...statementProps}/>)
    case "eco" : return(<StatementECO {...statementProps}/>)
    case "geq" : return(<StatementGEQ {...statementProps}/>)
    case "ghg" : return(<StatementGHG {...statementProps}/>)
    case "haz" : return(<StatementHAZ {...statementProps}/>)
    case "knw" : return(<StatementKNW {...statementProps}/>)
    case "mat" : return(<StatementMAT {...statementProps}/>)
    case "nrg" : return(<StatementNRG {...statementProps}/>)
    case "soc" : return(<StatementSOC {...statementProps}/>)
    case "was" : return(<StatementWAS {...statementProps}/>)
    case "wat" : return(<StatementWAT {...statementProps}/>)
  }
}

/* ---------- TABLE RECAP GROUP ---------- */

class TableMain extends React.Component {

  constructor(props) {
    super(props)
  }
    
  render()
  {
    const {indic,session} = this.props;
    const financialData = session.getFinancialData();
  
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
            <td>Production disponible</td>
            <td className="column_value">{printValue(financialData.getAvailableProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getAvailableProduction()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          <tr>
            <td>&emsp;Production vendue</td>
            <td className="column_value">{printValue(financialData.getRevenue(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getRevenue()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
        {financialData.getStoredProduction() > 0 &&
          <tr>
            <td>&emsp;Production stockée</td>
            <td className="column_value">{printValue(financialData.getStoredProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">({printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getStoredProduction()),nbDecimals)})</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>}
        {financialData.getImmobilisedProduction() > 0 &&
          <tr>
            <td>&emsp;Production immobilisée</td>
            <td className="column_value">({printValue(financialData.getImmobilisedProduction(),0)})</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getAvailableProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">({printValue(session.getAvailableProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getImmobilisedProduction()),nbDecimals)})</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          }
          <tr className="with-top-line">
            <td>Production sur l'exercice courant</td>
            <td className="column_value">{printValue(financialData.getProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getProduction()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          <tr>
            <td>Production déstockée sur l'exercice précédent</td>
            <td className="column_value">{printValue(financialData.getUnstoredProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getUnstoredProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getUnstoredProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getUnstoredProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getUnstoredProduction()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
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
          <tr>
            <td>&emsp;Variation de stocks</td>
            <td className="column_value">({printValue(financialData.getVariationPurchasesStocks(),0)})</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">({printValue(session.getPurchasesStocksVariationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getVariationPurchasesStocks()),nbDecimals)})</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
        {Object.entries(groupExpensesByAccounts(financialData.expenses)).map(([_,{account,accountLib,amount}]) => {
          const indicator = session.getExpensesAccountIndicator(account,indic);
          return(
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
            <td className="column_value">{printValue(financialData.getAmountDepreciations(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getDepreciationsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getDepreciationsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getDepreciationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountDepreciations()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
        {Object.entries(groupDepreciationsByAccounts(financialData.depreciations)).map(([_,{account,accountLib,amount}]) => {
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

}

const viewsForIndic = {
    art: {min:0, max:100},
    dis: {min:0, max:100},
    eco: {min:0, max:100},
    geq: {min:0, max:100},
    ghg: {min:0},
    haz: {min:0},
    knw: {min:0, max:100},
    mat: {min:0},
    nrg: {min:0},
    was: {min:0},
    wat: {min:0},
    soc: {min:0, max:100},
}

class Insights extends React.Component{
  
  constructor(props) {
    super(props)
  }

  render()
  {
    const {session,indic} = this.props;
    const {legalUnit,productionFootprint,netValueAddedFootprint,intermediateConsumptionFootprint} = session;
    const {productionSectorFootprint,valueAddedSectorFootprint,consumptionSectorFootprint,productionAreaFootprint,valueAddedAreaFootprint} = legalUnit;
    
    const dataProduction = [
      ["", "title", { role: "style" }],
      ["Situation", productionFootprint.getIndicator(indic).value || 0.0, "#616161"],
      ["Branche", productionSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
      ["France", productionAreaFootprint.getIndicator(indic).value || 0.0, "#818181"],
    ]
  
    const dataValueAdded = [
      ["", "title", { role: "style" }],
      ["Situation", netValueAddedFootprint.getIndicator(indic).value || 0.0, "#616161"],
      ["Branche", valueAddedSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
      ["France", valueAddedAreaFootprint.getIndicator(indic).value || 0.0, "#818181"],
    ]
    
    const dataConsumption = [
      ["", "title", { role: "style" }],
      ["Situation", intermediateConsumptionFootprint.getIndicator(indic).value || 0.0, "#616161"],
      ["Branche", consumptionSectorFootprint.getIndicator(indic).value || 0.0, "#818181"],
    ]
    
    const unit = metaIndicators[indic].unit;
    const viewWindow = viewsForIndic[indic];
    return (
      <div>
        <div className="chart-container" align="center">
          <ColumnChart title="titre" data={dataProduction} viewWindow={viewWindow} title="Production"/>
          <ColumnChart title="titre" data={dataConsumption} viewWindow={viewWindow} title="Consommations"/>
          <ColumnChart title="titre" data={dataValueAdded} viewWindow={viewWindow} title="Valeur Ajoutée"/>
        </div>
  
        <table>
          <thead>
            <tr>
              <td className="auto" colSpan="1">Agrégat</td>
              {/*<td className="column_value" colSpan="2">Exercice précédent</td>*/}
              <td className="column_value" colSpan="2">Unité légale</td>
              <td className="column_value" colSpan="2">Branche</td>
              <td className="column_value" colSpan="2">France</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Production</td>
              <td className="short right">{printValue(productionFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="short right">{printValue(productionSectorFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="short right">{printValue(productionAreaFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
            </tr>
            <tr>
              <td>Consommations intermédiaires</td>
              <td className="short right">{printValue(intermediateConsumptionFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="short right">{printValue(consumptionSectorFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="short right">{printValue(null,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
            </tr>
            <tr>
              <td>Valeur ajoutée</td>
              <td className="short right">{printValue(netValueAddedFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="short right">{printValue(valueAddedSectorFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="short right">{printValue(valueAddedAreaFootprint.getIndicator(indic).value,1)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
            </tr>
          </tbody>
        </table>
      </div>)
  }
  
}

function ColumnChart({title, data, viewWindow}) {
  return (
    <div align="center">
      <Chart
        height={"200px"}
        chartType="ColumnChart"
        loader={<div>Chargement</div>}
        data={data}
        options={{
          title: title,
          legend: {position: 'none'},
          vAxis: {viewWindow: viewWindow, viewWindowMode: "explicit"},
          enableInteractivity: false,
          animation:{duration:600, easing:"inAndOut"}
        }}
      />
    </div>)
}

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

const groupDepreciationsByAccounts = (depreciations) =>
{
  let depreciationsByAccounts = {};
  depreciations.forEach((depreciation) => 
  {
    let account = depreciation.account.substring(0,3);
    if (depreciationsByAccounts[account]==undefined) depreciationsByAccounts[account] = {...depreciation, account, accountLib: metaAccounts.accountsDepreciations[account]};
    else depreciationsByAccounts[account].amount+= depreciation.amount;
  })
  return depreciationsByAccounts;
}