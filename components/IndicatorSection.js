import React from 'react';

// Tab Components
import { MainTab } from './indicatorTabs/IndicatorMainTab';
import { ExpensesTab } from './indicatorTabs/IndicatorExpensesTab';
import { DepreciationsTab } from './indicatorTabs/IndicatorDepreciationsTab';

// Export modules
import { exportIndicPDF, exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV } from '../src/Export';

// Meta data
import { metaIndicators } from '../lib/indic';
import { ImpactsData } from '../src/ImpactsData';

/* -------------------- INDICATOR SECTION -------------------- */
export class IndicatorSection extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: "main"
    }
    this.refMainTab = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.props.indic!=prevProps.indic) this.setState({selectedTab: "main"})
  }

  render() {
    const {indic} = this.props;
    return (
      <div className="section-view">
        <div className="section-view-header">
            <h1>{metaIndicators[indic].libelle}</h1>
          <div className="section-view-header-odds">
            {metaIndicators[indic].odds.map((odd) => {
              return (
                <img key={"logo-odd-"+odd} src={"/resources/odds/F-WEB-Goal-"+odd+".png"} alt="logo"/>
              )})
            }
          </div>
        </div>
        {this.buildTabView()}
      </div>
    )
  }

  // Switch tab according to the selected tab
  buildTabView()
  {
    switch(this.state.selectedTab) {
      case "main" :           return(<MainTab {...this.props} onUpdate={this.updateImpactsData.bind(this)} ref={this.refMainTab}
                                        onPrintDetails={this.onPrintDetails.bind(this)}/>)
      case "expenses" :       return(<ExpensesTab {...this.props} 
                                        onGoBack={this.goBack.bind(this)}/>)
      case "depreciations" :  return(<DepreciationsTab {...this.props} 
                                        onGoBack={this.goBack.bind(this)}/>)
    }
  }

  // Go Back
  goBack() {
    this.setState({selectedTab: "main"});
  }

  didUpdate = () => this.props.session.updateRevenueFootprint()

  // Update session
  async updateImpactsData(impactsData) {
    //await this.props.session.updateImpactsData(impactsData);
    await this.props.session.updateRevenueFootprint();
    this.refMainTab.current.updateTable();
    //this.forceUpdate();
  }

  // Save changes
  updateFinancialData(financialData) {
    this.state.session.updateFinancialData(financialData);
    this.props.onUpdate(this.state.session);
  }

  //
  onPrintDetails(details) {
    this.setState({selectedTab: details});
  }

  // Reporting
  exportReporting() {
    exportIndicPDF(this.props.indic,this.props.session);
  }

  // Csv
  exportExpensesData() {
    let csvContent = exportIndicDataExpensesCSV(this.props.indic,this.props.session);
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_"+(this.props.session.legalUnit.siren!="" ? this.props.session.legalUnit.siren : "xxxxxxxxx")+"-"+this.props.indic.toUpperCase()+"-expenses.csv");
    document.body.appendChild(link);
    link.click();
  }

  exportDepreciationsData() {
    let csvContent = exportIndicDataExpensesCSV(this.props.indic,this.props.session);
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_"+(this.props.session.legalUnit.siren!="" ? this.props.session.legalUnit.siren : "xxxxxxxxx")+"-"+this.props.indic.toUpperCase()+"-depreciations.csv");
    document.body.appendChild(link);
    link.click();
  }

}