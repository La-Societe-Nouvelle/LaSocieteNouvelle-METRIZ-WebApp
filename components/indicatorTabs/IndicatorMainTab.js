import React from 'react';

import { Chart } from "react-google-charts";

import { printValue } from '../../src/utils/Utils';

import { StatementART } from '../statements/StatementART';
import { StatementDIS } from '../statements/StatementDIS';
import { StatementECO } from '../statements/StatementECO';
import { StatementGEQ } from '../statements/StatementGEQ';
import { StatementGHG } from '../statements/StatementGHG';
import { StatementHAZ } from '../statements/StatementHAZ';
import { StatementKNW } from '../statements/StatementKNW';
import { StatementMAT } from '../statements/StatementMAT';
import { StatementNRG } from '../statements/StatementNRG';
import { StatementSOC } from '../statements/StatementSOC';
import { StatementWAS } from '../statements/StatementWAS';
import { StatementWAT } from '../statements/StatementWAT';

// Export modules
import { exportIndicPDF, exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV } from '../../src/Export'

// Meta data
import { metaIndicators } from '../../lib/indic';

/* -------------------------------------------------- */
/* -------------------- MAIN TAB -------------------- */
/* -------------------------------------------------- */

export class MainTab extends React.Component {
  
  constructor(props) {
    super(props);
    this.refTable = React.createRef();  
  }

  render() {
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
            <ComparisonChart session={this.props.session} indic={this.props.indic}/>
          </div>
        </div>
      </div>
    )
  }

  updateTable = () => {
    this.refTable.current.forceUpdate();
  }

}

/* ---------- ASSESSMENT GROUP ---------- */

// Display the correct assessment view according to the indicator
function Statement(props) {
  let statementProps = {
    impactsData: props.session.impactsData,
    onUpdate: props.onUpdate,
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

    console.log(session.getNetValueAddedFootprint().getIndicator(indic).indic)
    console.log(session.getNetValueAddedFootprint().getIndicator(indic).getValueAbsolute(1));
    console.log(financialData.getNetValueAdded())
    console.log(session.getNetValueAddedFootprint().getIndicator(indic).getValueAbsolute(financialData.getNetValueAdded()))
  
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
          <tr className="with-bottom-line">
            <td>Chiffre d'affaires</td>
            <td className="column_value">{printValue(financialData.getRevenue(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getRevenueFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getRevenue()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          <tr>
            <td>Production stockée</td>
            <td className="column_value">({printValue(financialData.getStoredProduction(),0)})</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">({printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getStoredProduction()),nbDecimals)})</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          {financialData.getImmobilisedProduction() > 0 &&
            <tr>
              <td>Production immobilisée</td>
              <td className="column_value">({printValue(financialData.getImmobilisedProduction(),0)})</td>
              <td className="column_unit">&nbsp;€</td>
              <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
              {impactAbsolu ? <td className="column_value">({printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getImmobilisedProduction()),nbDecimals)})</td> : null}
              {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
            </tr>
          }
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
          <tr className="with-bottom-line">
            <td>Production déstockée sur l'exercice précédent</td>
            <td className="column_value">{printValue(financialData.getUnstoredProduction(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getUnstoredProductionFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getUnstoredProduction()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          <tr className="with-bottom-line">
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
            <td>Stockage achats</td>
            <td className="column_value">({printValue(financialData.getAmountFinalStocks(),0)})</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getFinalStocksFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getFinalStocksFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">({printValue(session.getFinalStocksFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountFinalStocks()),nbDecimals)})</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          <tr>
            <td>Déstockage achats</td>
            <td className="column_value">{printValue(financialData.getAmountInitialStocks(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getInitialStocksFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getInitialStocksFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getInitialStocksFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountInitialStocks()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          {financialData.purchasesDiscounts.length > 0 &&
            <tr>
              <td>Rabais, remises, ristournes</td>
              <td className="column_value">({printValue(financialData.getAmountPurchasesDiscounts(),0)})</td>
              <td className="column_unit">&nbsp;€</td>
              <td className="column_value">{printValue(session.getPurchasesDiscountsFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
              <td className="column_unit">&nbsp;{unit}</td>
              <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getPurchasesDiscountsFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
              {impactAbsolu ? <td className="column_value">({printValue(session.getPurchasesDiscountsFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountPurchasesDiscounts()),nbDecimals)})</td> : null}
              {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          }
          <tr>
            <td>Charges externes</td>
            <td className="column_value">{printValue(financialData.getAmountExpenses(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getExpensesFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getExpensesFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getExpensesFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountExpenses()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>
          {
              Object.entries(financialData.getExpensesAccounts()).map(([num,account]) => {
                const indicator = session.getExpensesAccountIndicator(num,indic);
                return(
                <tr key={num}>
                  <td>&emsp;{account.label}</td>
                  <td className="column_value">{printValue(account.amount,0)}</td>
                  <td className="column_unit">&nbsp;€</td>
                  <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
                  <td className="column_unit">&nbsp;{unit}</td>
                  <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
                  {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(account.amount),nbDecimals)}</td> : null}
                  {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
                </tr>
              )})
            }

          <tr className="with-top-line">
            <td>Valeur ajoutée brute</td>
            <td className="column_value">{printValue(financialData.getGrossValueAdded(),0)}</td>
            <td className="column_unit">&nbsp;€</td>
            <td className="column_value">{printValue(session.getGrossValueAddedFootprint().getIndicator(indic).getValue(),nbDecimals)}</td>
            <td className="column_unit">&nbsp;{unit}</td>
            <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getGrossValueAddedFootprint().getIndicator(indic).getUncertainty(),0)}&nbsp;%</td>
            {impactAbsolu ? <td className="column_value">{printValue(session.getGrossValueAddedFootprint().getIndicator(indic).getValueAbsolute(financialData.getGrossValueAdded()),nbDecimals)}</td> : null}
            {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
          </tr>  
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
          {
              Object.entries(financialData.getDepreciationsAccounts()).map(([num,account]) => {
                const indicator = session.getDepreciationsAccountIndicator(num,indic);
                return(
                <tr key={num}>
                  <td>&emsp;{account.label}</td>
                  <td className="column_value">{printValue(account.amount,0)}</td>
                  <td className="column_unit">&nbsp;€</td>
                  <td className="column_value">{printValue(indicator.getValue(),nbDecimals)}</td>
                  <td className="column_unit">&nbsp;{unit}</td>
                  <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(indicator.getUncertainty(),0)}&nbsp;%</td>
                  {impactAbsolu ? <td className="column_value">{printValue(indicator.getValueAbsolute(account.amount),nbDecimals)}</td> : null}
                  {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
                </tr>
              )})
            }
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

function ComparisonChart({session,indic}) 
{
  const {productionFootprint,netValueAddedFootprint,intermediateConsumptionFootprint} = session;
  const {productionSectorFootprint,valueAddedSectorFootprint,consumptionSectorFootprint,productionAreaFootprint,valueAddedAreaFootprint} = session.legalUnit;
  
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
  
  const viewWindow = viewsForIndic[indic];
  return (
    <div className="chart-container" align="center">
      <ColumnChart title="titre" data={dataConsumption} viewWindow={viewWindow} title="Consommations"/>
      <ColumnChart title="titre" data={dataValueAdded} viewWindow={viewWindow} title="Valeur Ajoutée"/>
      <ColumnChart title="titre" data={dataProduction} viewWindow={viewWindow} title="Production"/>
    </div>)
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