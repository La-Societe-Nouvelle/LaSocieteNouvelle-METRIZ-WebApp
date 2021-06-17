
import React from 'react';

import { AssessmentART } from './views/AssessmentART';
import { AssessmentDIS } from './views/AssessmentDIS';
import { AssessmentECO } from './views/AssessmentECO';
import { AssessmentGEQ } from './views/AssessmentGEQ';
import { AssessmentGHG } from './views/AssessmentGHG';
import { AssessmentHAZ } from './views/AssessmentHAZ';
import { AssessmentKNW } from './views/AssessmentKNW';
import { AssessmentMAT } from './views/AssessmentMAT';
import { AssessmentNRG } from './views/AssessmentNRG';
import { AssessmentSOC } from './views/AssessmentSOC';
import { AssessmentWAS } from './views/AssessmentWAS';
import { AssessmentWAT } from './views/AssessmentWAT';

import {indic as indicData} from '../lib/indic';

/* -------------------- INDICATOR VIEW -------------------- */

export class IndicatorSection extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      session: props.session,
      selectedTab: "main"
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.indic!=prevProps.indic) {
      this.setState({
        session: this.props.session,
        selectedTab: "main"});
    }
  }

  render() {
    const {selectedTab} = this.state;
    const {indic} = this.props;
    return (
      <div className="section-view">
        <h1>{indicData[indic].libelle}</h1>
        <SectionMenu selected={selectedTab} parent={this}/>
        {this.buildTabView()}
      </div>
    )
  }

  // Switch tab according to the selected tab
  buildTabView() {
    switch(this.state.selectedTab)
    {
      case "main" : return(this.buildMain())
      case "valueAdded" : return(this.buildTabValueAdded())
      case "expenses" : return(this.buildTabExpenses())
      case "depreciations" : return(this.buildTabDepreciations())
    }
  }

  // Main tab (aggregates)
  buildMain() {
    const {session,indic} = this.props;
    return (
      <div className="financial_data_main_view">
        <div className="coporate-social-footprint">
          <h3>Tableau récapitulatif</h3>
          <TableMain session={this.props.session} indic={this.props.indic}/>
        </div>
      </div>
    )
  }

  // Net Value Added tab - Assessment
  buildTabValueAdded() {
    const {indic} = this.props;
    return (
      <div className="value-added-tab">
        <div className="value-added-tab">
          <h3>Déclaration des impacts directs</h3>
          {this.getIndicatorView(indic)}
        </div>
      </div>
    )
  }
  // Display the correct assessment view according to the indicator
  getIndicatorView(indic) {
    switch(indic) {
      case "art" : return(<AssessmentART session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "dis" : return(<AssessmentDIS session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "eco" : return(<AssessmentECO session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "geq" : return(<AssessmentGEQ session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "ghg" : return(<AssessmentGHG session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "haz" : return(<AssessmentHAZ session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "knw" : return(<AssessmentKNW session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "mat" : return(<AssessmentMAT session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "nrg" : return(<AssessmentNRG session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "soc" : return(<AssessmentSOC session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "was" : return(<AssessmentWAS session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
      case "wat" : return(<AssessmentWAT session={this.props.session} onUpdate={this.updateIndicator.bind(this)}/>)
    }
  }

  // Expenses details tab
  buildTabExpenses() {
    const {session,indic} = this.props;
    return (
      <div className="financial_data_expenses_view">
        <h3>Détails des impacts indirects des consommations</h3>
        <TableExpenses 
          indic={indic}
          parent={this} 
          financialData={session.getFinancialData()}
          onUpdate={this.updateFinancialData.bind(this)}/>
      </div>
    )
  }

  // Depreciations details tab
  buildTabDepreciations() {
    const {session,indic} = this.props;
    return (
      <div className="financial_data_expenses_view">
        <h3>Détails des impacts indirects des immobilisations</h3>
        <TableDepreciations 
          indic={indic}
          parent={this} 
          financialData={session.getFinancialData()} 
          onUpdate={this.updateFinancialData.bind(this)}/>
      </div>
    )
  }

  // Update session
  updateIndicator(indicator) {
    this.state.session.setValueAddedIndicator(indicator);
    this.state.session.updateProductionFootprint(this.props.indic);
    this.props.onUpdate(this.state.session);
  }

  // Save changes
  updateFinancialData(financialData) {
    this.state.session.financialData = financialData;
    this.state.session.updateExpensesIndicFootprint(this.props.indic);
    this.state.session.updateDepreciationsIndicFootprint(this.props.indic);
  }

}

/* ---------- TABS MENU ---------- */ // Controls the displayed tab

function SectionMenu({selected, parent}){
  return (
    <div className="menu-section">
      <div className="menu-section-items">
        <button onClick = {() => parent.setState({selectedTab: "main"})}>
          Soldes intermédiaires
        </button>
        <button onClick = {() => parent.setState({selectedTab: "valueAdded"})}>
          Impacts directs - Valeur Ajoutée
        </button>
        <button onClick = {() => parent.setState({selectedTab: "expenses"})}>
          Impacts indirects - Consommations
        </button>
        <button onClick = {() => parent.setState({selectedTab: "depreciations"})}>
          Impacts indirects - Immobilisations
        </button>
      </div>
    </div>
  );
}

class Tab extends React.Component {
  render() {
    return(
      <div></div>
    )
  }
}

/* ---------- MAIN TAB ---------- */

function TableMain({session,indic}) {
  // Update data
  session.updateFootprints(indic);
  session.updateProductionFootprint(indic);
  
  const financialData = session.getFinancialData();

  const nbDecimals = indicData[indic].nbDecimals;
  const impactAbsolu = ["ghg","haz","mat","nrg","was","wat"].includes(indic);

  return (
    <table>
      <thead>
        <tr>
          <td>Agrégat</td>
          <td>Montant (en €)</td>
          <td>Valeur (en {indicData[indic].unit})</td>
          <td>Incertitude (en %)</td>
        {impactAbsolu ? <td>Impact (en {indicData[indic].unitAbsolute})</td> : <div/>}
        </tr>
      </thead>
      <tbody>
        <tr className="with-bottom-line">
          <td>Chiffre d'affaires</td>
          <td className="column_value"><input value={printValue(financialData.getRevenue(),0)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)} disabled={true}/></td>
          {impactAbsolu ? <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getRevenue()),nbDecimals)} disabled={true}/></td> : <div/>}
        </tr>
        <tr>
          <td>Production</td>
          <td className="column_value"><input value={printValue(financialData.getProduction(),0)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)} disabled={true}/></td>
          {impactAbsolu ? <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getProduction()),nbDecimals)} disabled={true}/></td> : <div/>}
        </tr>
        <tr className="with-bottom-line">
          <td>Production déstockée</td>
          <td className="column_value"><input value={printValue(financialData.getUnstoredProduction(),0)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getValue(),nbDecimals)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getUncertainty(),0)} disabled={true}/></td>
          {impactAbsolu ? <td className="column_value"><input value={printValue(session.getProductionFootprint().getIndicator(indic).getValueAbsolute(financialData.getUnstoredProduction()),nbDecimals)} disabled={true}/></td> : <div/>}
        </tr>
        <tr>
          <td>Charges externes</td>
          <td className="column_value"><input value={printValue(financialData.getAmountExpenses(),0)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getExpensesFootprint().getIndicator(indic).getValue(),nbDecimals)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getExpensesFootprint().getIndicator(indic).getUncertainty(),0)} disabled={true}/></td>
          {impactAbsolu ? <td className="column_value"><input value={printValue(session.getExpensesFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountExpenses()),nbDecimals)} disabled={true}/></td> : <div/>}
        </tr>
        <tr className="with-bottom-line">
          <td>Dotations aux amortissements</td>
          <td className="column_value"><input value={printValue(financialData.getAmountDepreciations(),0)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getDepreciationsFootprint().getIndicator(indic).getValue(),nbDecimals)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getDepreciationsFootprint().getIndicator(indic).getUncertainty(),0)} disabled={true}/></td>
          {impactAbsolu ? <td className="column_value"><input value={printValue(session.getDepreciationsFootprint().getIndicator(indic).getValueAbsolute(financialData.getAmountDepreciations()),nbDecimals)} disabled={true}/></td> : <div/>}
        </tr>
        <tr>
          <td>Valeur ajoutée nette</td>
          <td className="column_value"><input value={printValue(financialData.getNetValueAdded(),0)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getValueAddedFootprint(indic).getValue(),nbDecimals)} disabled={true}/></td>
          <td className="column_value"><input value={printValue(session.getValueAddedFootprint(indic).getUncertainty(),0)} disabled={true}/></td>
          {impactAbsolu ? <td className="column_value"><input value={printValue(session.getValueAddedFootprint(indic).getValueAbsolute(financialData.getNetValueAdded()),nbDecimals)} disabled={true}/></td> : <div/>}
        </tr>
      </tbody>
    </table>
  )
}

/* ---------- EXPENSES TAB ---------- */

class TableExpenses extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      financialData: props.financialData,
      indic: props.indic,
      parent: props.parent
    }
  }

  render() {
    const expenses = this.state.financialData.getExpenses();
    expenses.sort((a,b) => b.getFootprint().getIndicator(this.props.indic).getValueAbsolute(b.getAmount()) - a.getFootprint().getIndicator(this.props.indic).getValueAbsolute(a.getAmount()));
    return (
      <table>
        <thead>
          <tr>
            <td>Identifiant</td>
            <td>Denomination</td>
            <td>Montant (en €)</td>
            <td>Intensité</td>
            <td>Incertitude (en %)</td>
            <td>Flag</td>
        </tr>
        </thead>
        <tbody>
          {
            expenses.map((expense) => {
              return(<RowTableExpenses 
                key={"expense_"+expense.getId()} 
                expense={expense} 
                onUpdate={this.updateExpense.bind(this)} 
                indic={this.props.indic}/>)
            })
          }
        </tbody>
      </table>
    )
  }

  updateExpense(id,value,uncertainty) {
    this.state.financialData.getExpense(id).getFootprint().getIndicator(this.props.indic).setValue(value);
    this.state.financialData.getExpense(id).getFootprint().getIndicator(this.props.indic).setUncertainty(uncertainty);
    this.props.onUpdate(this.state.financialData);
  }

}

class RowTableExpenses extends React.Component {
  
  constructor(props) {
    super(props);
    const indicator = props.expense.getFootprint().getIndicator(props.indic);
    this.state = {
      valueInput: indicator.getValue(),
      uncertaintyInput: indicator.getUncertainty()
    };
  }

  render() {
    const {corporateId,corporateName,footprint,amount} = this.props.expense;
    const {valueInput,uncertaintyInput} = this.state;
    return (
      <tr>
        <td className="column_corporateId">{corporateId}</td>
        <td className="column_corporateName">{corporateName}</td>
        <td className="column_value"><input value={printValue(amount,0)} disabled={true}/></td>
        <td className="column_value"><input value={valueInput} onChange={this.onValueChange} onBlur={this.onBlur}/></td>
        <td className="column_value"><input value={uncertaintyInput} onChange={this.onUncertaintyChange} onBlur={this.onBlur}/></td>
        <td className="column_libelleFlag">{footprint.getIndicator(this.props.indic).getLibelleFlag()}</td>
      </tr>
    )
  }

  onValueChange = (event) => {
    this.setState({valueInput: event.target.value})
  }
  onUncertaintyChange = (event) => {
    this.setState({uncertaintyInput: event.target.value})
  }

  onBlur = (event) => {
    let value = !isNaN(parseFloat(this.state.valueInput)) ? parseFloat(this.state.valueInput) : null;
    let uncertainty = !isNaN(parseFloat(this.state.uncertaintyInput)) ? parseFloat(this.state.uncertaintyInput) : null;
    this.props.onUpdate(this.props.expense.getId(),value,uncertainty);
  }
}

  /* ---------- DEPRECIATIONS TAB ---------- */

class TableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      financialData: props.financialData,
      indic: props.indic,
      parent: props.parent
    }
  }

  render() {
    const depreciations = this.state.financialData.getDepreciations();
    return (
      <table>
        <thead>
          <tr><td>Identifiant</td><td>Denomination</td><td>Montant (en €)</td><td>Intensité</td><td>Incertitude (en %)</td><td>Flag</td></tr>
        </thead>
        <tbody>
          {
            depreciations.map((depreciation) => {
              return(<RowTableDepreciations 
                indic={this.props.indic}
                key={"depreciation_"+depreciation.getId()} 
                depreciation={depreciation} 
                onUpdate={this.updateDepreciation.bind(this)}/>)
            })
          }
        </tbody>
      </table>
    )
  }

  updateDepreciation(id,value,uncertainty) {
    this.state.financialData.getDepreciation(id).getFootprint().getIndicator(this.props.indic).setValue(value);
    this.state.financialData.getDepreciation(id).getFootprint().getIndicator(this.props.indic).setUncertainty(uncertainty);
    this.props.onUpdate(this.state.financialData);
  }

}

class RowTableDepreciations extends React.Component {
  
  constructor(props) {
    super(props);
    const indicator = props.depreciation.getFootprint().getIndicator(props.indic);
    this.state = {
      valueInput: indicator.getValue(),
      uncertaintyInput: indicator.getUncertainty()
    };
  }

  render() {
    const {corporateId,corporateName,footprint,amount} = this.props.depreciation;
    const {valueInput,uncertaintyInput} = this.state;
    return (
      <tr>
        <td className="column_corporateId">{corporateId}</td>
        <td className="column_corporateName">{corporateName}</td>
        <td className="column_value"><input value={printValue(amount,0)} disabled={true}/></td>
        <td className="column_value"><input value={valueInput} onChange={this.onValueChange} onBlur={this.onBlur}/></td>
        <td className="column_value"><input value={uncertaintyInput} onChange={this.onUncertaintyChange} onBlur={this.onBlur}/></td>
        <td className="column_libelleFlag">{footprint.getIndicator(this.props.indic).getLibelleFlag()}</td>
      </tr>
    )
  }

  onValueChange = (event) => {
    this.setState({valueInput: event.target.value})
  }
  onUncertaintyChange = (event) => {
    this.setState({uncertaintyInput: event.target.value})
  }

  onBlur = (event) => {
    let value = !isNaN(parseFloat(this.state.valueInput)) ? parseFloat(this.state.valueInput) : null;
    let uncertainty = !isNaN(parseFloat(this.state.uncertaintyInput)) ? parseFloat(this.state.uncertaintyInput) : null;
    this.props.onUpdate(this.props.depreciation.getId(),value,uncertainty);
  }

}

function printValue(value,precision) {
  if (value==null) {return ""}
  else             {return (Math.round(value*Math.pow(10,precision))/Math.pow(10,precision)).toFixed(precision)}
}