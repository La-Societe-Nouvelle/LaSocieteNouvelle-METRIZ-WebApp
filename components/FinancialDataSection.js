import React from 'react';

// Tabs
import { FinancialMainTab } from './financialTabs/FinancialMainTab';
import { FinancialExpensesTab } from './financialTabs/FinancialExpensesTab';
import { FinancialDepreciationsTab } from './financialTabs/FinancialDepreciationsTab';
import { CompaniesTab } from './financialTabs/CompaniesTab';

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDataSection extends React.Component {

  refTableMain = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
        selectedTab: "main"
    }
  }
    
  render() {
    const {selectedTab} = this.state;
    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Données financières</h1>
        </div>
        <SectionMenu selected={selectedTab} changeTab={this.onChangeTab.bind(this)}/>
        <div className="tab-view">
          { this.buildTabView() }
        </div>
      </div>
    )
  }

  /* ---------- TABLE BUILDERS ---------- */

  // Build selected tab
  buildTabView() 
  {
    const tabProps = {
      financialData: this.props.session.getFinancialData(), 
      changeTab: this.onChangeTab.bind(this),
      onUpdate: this.updateFinancialData.bind(this)}
    switch(this.state.selectedTab) 
    {
      case "main" :           return(<FinancialMainTab {...tabProps}/>)
      case "expenses" :       return(<FinancialExpensesTab {...tabProps}/>)
      case "depreciations" :  return(<FinancialDepreciationsTab {...tabProps}/>)
      case "companies" :      return(<CompaniesTab {...tabProps}/>)
    }
  }

  /* ----- SAVE CHANGES ----- */

  onChangeTab(nextTab) {
    this.setState({selectedTab: nextTab})
  }

  /* ----- SAVE CHANGES ----- */

  updateFinancialData(financialData) {
    this.props.session.updateFinancialData(financialData);
  }

}

/* ---------- SECTION MENU ---------- */ // Controls the displayed tab

function SectionMenu({selected, changeTab}){
  return (
    <div className="financial-section-menu">
      <div className="financial-section-menu-items">
        <button className={"menu-button"+(selected=="main" ? " selected" : "")}
                onClick = {() => changeTab("main")}>
          Soldes intermédiaires
        </button>
        <button className={"menu-button"+(selected=="expenses" ? " selected" : "")}
                onClick = {() => changeTab("expenses")}>
          Charges externes
        </button>
        <button className={"menu-button"+(selected=="depreciations" ? " selected" : "")}
                onClick = {() => changeTab("depreciations")}>
          Amortissements sur immobilisations
        </button>
        <button className={"menu-button"+("companies"==selected ? " selected" : "")}
                onClick = {() => changeTab("companies")}>
          Fournisseurs
        </button>
      </div>
    </div>
  );
}