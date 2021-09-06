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
    
  render() 
  {
    const {session} = this.props;
    const {selectedTab} = this.state;

    return (
      <div className="section-view">
        <div className="section-view-header">
          <h1>Données financières</h1>
        </div>
        <SectionMenu selected={selectedTab} changeTab={this.onChangeTab.bind(this)}/>
        <div className="tab-view">
          <SectionView selectedView={selectedTab}
                       financialData={session.getFinancialData()}
                       changeTab={this.onChangeTab.bind(this)}
                       onUpdate={this.updateFootprints.bind(this)}
                       didUpdate={() => session.updateRevenueFootprint()}
                       loadKNWData={this.loadKNWData.bind(this)}/>
        </div>
      </div>
    )
  }
  
  /* ----- SELECTED TAB ----- */
  
  onChangeTab = (nextTab) => this.setState({selectedTab: nextTab})
    
  /* ----- UPDATES ----- */

  updateFootprints = () => this.props.session.updateRevenueFootprint();

  /* ----- OTHER METHODS ----- */

  loadKNWData = ({apprenticeshipTax,vocationalTrainingTax}) => 
  {
    this.props.session.impactsData.knwDetails.apprenticeshipTax = apprenticeshipTax;
    this.props.session.impactsData.knwDetails.vocationalTrainingTax = vocationalTrainingTax;
    this.props.session.updateRevenueIndicFootprint("knw");
  }

}

/* ---------- SECTION MENU ---------- */ 

// Controls the displayed tab

function SectionMenu({selected, changeTab}) 
{
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
          Immobilisations
        </button>
      </div>
    </div>
  );
}

/* ---------- SECTION VIEW ---------- */

// Displays the selected tab

function SectionView(viewProps) 
{
  switch(viewProps.selectedView) 
  {
    case "main" :           return(<FinancialMainTab {...viewProps}/>)
    case "expenses" :       return(<FinancialExpensesTab {...viewProps}/>)
    case "depreciations" :  return(<FinancialDepreciationsTab {...viewProps}/>)
  }
}