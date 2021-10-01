import React from 'react';

// Tab Components
import { MainTab } from '/components/indicatorTabs/IndicatorMainTab';
import { ExpensesTab } from '/components/indicatorTabs/IndicatorExpensesTab';
import { DepreciationsTab } from '/components/indicatorTabs/IndicatorDepreciationsTab';

// Assessments components
import { AssessmentGHG } from '/components/assessments/AssessmentGHG';
import { AssessmentKNW } from '/components/assessments/AssessmentKNW';
import { AssessmentNRG } from '/components/assessments/AssessmentNRG';
import { AssessmentDIS } from '/components/assessments/AssessmentDIS';

// Export modules
import { exportIndicPDF, exportIndicDataExpensesCSV, exportIndicDataDepreciationsCSV } from '/src/writers/Export';

// Meta data
import { metaIndicators } from '/lib/indic';

/* ----------------------------------------------------------- */
/* -------------------- INDICATOR SECTION -------------------- */
/* ----------------------------------------------------------- */

export class IndicatorSection extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {selectedTab: "main"}
    this.refMainTab = React.createRef();
  }
  
  render() 
  {
    const {indic} = this.props;

    return (
      <div className="section-view">

        <div className="section-view-header"><h1>{metaIndicators[indic].libelle}</h1>
          <div className="section-view-header-odds">
            {metaIndicators[indic].odds.map((odd) => 
              <img key={"logo-odd-"+odd} src={"/resources/odds/F-WEB-Goal-"+odd+".png"} alt="logo"/>
            )}
          </div>
        </div>

        {this.buildTabView()}

      </div>
    )
  }

  // Switch tab according to the selected tab
  buildTabView()
  {
    const goBackToMain = () => this.setState({selectedTab: "main"})
    const refreshDisplay = async () => {
      await this.props.session.updateFootprints();
      this.refMainTab.current.updateTable();
    }
    const changeSelectedTab = (nextSelectedTab) => this.setState({selectedTab: nextSelectedTab})

    switch(this.state.selectedTab) 
    {
      case "main" :           return(<MainTab {...this.props} 
                                              onUpdate={refreshDisplay.bind(this)} ref={this.refMainTab}
                                              onPrintDetails={changeSelectedTab.bind(this)}/>)
      case "assessment" :     return(<Assessment {...this.props}
                                                 onUpdate={refreshDisplay.bind(this)}
                                                 onGoBack={goBackToMain.bind(this)}/>)
      case "expenses" :       return(<ExpensesTab {...this.props} 
                                                  onGoBack={goBackToMain.bind(this)}/>)
      case "depreciations" :  return(<DepreciationsTab {...this.props} 
                                                       onGoBack={goBackToMain.bind(this)}/>)
    }
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

function Assessment(props) 
{
  switch(props.indic) 
  {
    case "dis": return(<AssessmentDIS {...props}/>)
    case "geq": return(<AssessmentDIS {...props}/>)
    case "ghg": return(<AssessmentGHG {...props}/>)
    case "knw": return(<AssessmentKNW {...props}/>)
    case "nrg": return(<AssessmentNRG {...props}/>)
    default: return(<div></div>)
  }
}