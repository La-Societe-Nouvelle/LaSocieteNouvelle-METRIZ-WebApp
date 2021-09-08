import React from 'react';

// Tabs
import { FinancialMainTab } from '../financialTabs/FinancialMainTab';
import { FinancialExpensesTab } from '../financialTabs/FinancialExpensesTab';
import { FinancialDepreciationsTab } from '../financialTabs/FinancialDepreciationsTab';
import { CompaniesTab } from '../financialTabs/CompaniesTab';

/* ----------------------------------------------------------- */
/* -------------------- FINANCIAL SECTION -------------------- */
/* ----------------------------------------------------------- */

export class FinancialDataSection extends React.Component {

  refTableMain = React.createRef();

  constructor(props) 
  {
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
        <div className="section-view-main">
          <SectionMenu selected={selectedTab} changeTab={this.onChangeTab.bind(this)}/>
          <div className="tab-view">
            {this.buildtabView(selectedTab)}
          </div>
        </div>
      </div>
    )
  }
  
  /* ----- SELECTED TAB ----- */
  
  onChangeTab = (nextTab) => this.setState({selectedTab: nextTab})
    
  /* ----- UPDATES ----- */

  updateFootprints = () => this.props.session.updateRevenueFootprint()

  /* ----- OTHER METHODS ----- */

  // update knw details from FEC data
  loadKNWData = ({apprenticeshipTax,vocationalTrainingTax}) => 
  {
    this.props.session.impactsData.knwDetails.apprenticeshipTax = apprenticeshipTax;
    this.props.session.impactsData.knwDetails.vocationalTrainingTax = vocationalTrainingTax;
    this.props.session.updateRevenueIndicFootprint("knw");
  }

  /* ----- TAB ---- */

  buildtabView = (selectedTab) => 
  {
    const session = this.props.session;
    const tabProps = {
      financialData: session.financialData,
      onUpdate: this.updateFootprints.bind(this)
    }
    
    switch(selectedTab) 
    {
      case "main" :           return(<FinancialMainTab {...tabProps} loadKNWData={this.loadKNWData.bind(this)}/>)
      case "expenses" :       return(<FinancialExpensesTab {...tabProps}/>)
      case "depreciations" :  return(<FinancialDepreciationsTab {...tabProps}/>)
    }
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