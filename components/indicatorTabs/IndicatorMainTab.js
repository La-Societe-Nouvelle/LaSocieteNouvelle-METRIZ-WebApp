import React from 'react';

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
import {indic as metaIndic} from '../../lib/indic';

/* -------------------------------------------------- */
/* -------------------- MAIN TAB -------------------- */
/* -------------------------------------------------- */

export function MainTab(props) {

  const exportReporting = (props) => exportIndicPDF(props.indic,props.session);
  
  return (
    <div className="indicator-section-view">
      <div className="groups">
        <div className="group">
          <h3>Déclaration des impacts directs</h3>
          <Assessment {...props}/>
        </div>
        <div className="group">
          <h3>Tableau récapitulatif</h3>
          <div className="actions">
            <button onClick={() => exportIndicPDF(props.indic,props.session)}>Editer rapport</button>
            <button onClick={() => props.onPrintDetails("expenses")}>Détails des dépenses</button>
            <button onClick={() => props.onPrintDetails("depreciations")}>Détails des amortissements</button>
          </div>
          <TableMain {...props}/>
        </div>
      </div>
    </div>
  )
}

/* ---------- ASSESSMENT GROUP ---------- */

// Display the correct assessment view according to the indicator
function Assessment(props) {
  let assessmentProps = {
    indicator: props.session.getValueAddedFootprint(props.indic),
    onUpdate: props.onUpdate
  }
  switch(props.indic) {
    case "art" : return(<StatementART {...assessmentProps}/>)
    case "dis" : return(<StatementDIS {...assessmentProps}/>)
    case "eco" : return(<StatementECO {...assessmentProps}/>)
    case "geq" : return(<StatementGEQ {...assessmentProps}/>)
    case "ghg" : return(<StatementGHG {...assessmentProps}/>)
    case "haz" : return(<StatementHAZ {...assessmentProps}/>)
    case "knw" : return(<StatementKNW {...assessmentProps}/>)
    case "mat" : return(<StatementMAT {...assessmentProps}/>)
    case "nrg" : return(<StatementNRG {...assessmentProps}/>)
    case "soc" : return(<StatementSOC {...assessmentProps}/>)
    case "was" : return(<StatementWAS {...assessmentProps}/>)
    case "wat" : return(<StatementWAT {...assessmentProps}/>)
  }
}

/* ---------- TABLE RECAP GROUP ---------- */

function TableMain({session,indic}) {
    
  const financialData = session.getFinancialData();

  const nbDecimals = metaIndic[indic].nbDecimals;
  const unit = metaIndic[indic].unit;
  const unitAbsolute = metaIndic[indic].unitAbsolute;
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
          <td className="column_value">{printValue(session.getValueAddedFootprint(indic).getValue(),nbDecimals)}</td>
          <td className="column_unit">&nbsp;{unit}</td>
          <td className="column_uncertainty"><u>+</u>&nbsp;{printValue(session.getValueAddedFootprint(indic).getUncertainty(),0)}&nbsp;%</td>
          {impactAbsolu ? <td className="column_value">{printValue(session.getValueAddedFootprint(indic).getValueAbsolute(financialData.getNetValueAdded()),nbDecimals)}</td> : null}
          {impactAbsolu ? <td className="column_unit">&nbsp;{unitAbsolute}</td> : null}
        </tr>
      </tbody>
    </table>
  )
}