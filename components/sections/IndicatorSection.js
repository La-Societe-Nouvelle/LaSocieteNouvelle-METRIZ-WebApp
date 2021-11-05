// La Société Nouvelle

// React
import React from 'react';

// Modules
import Popup from 'reactjs-popup';

// Tab Components
import { IndicatorStatementTable } from '../tables/IndicatorStatementTable';
import { IndicatorExpensesTable } from '../tables/IndicatorExpensesTable';
import { IndicatorCompaniesTable } from '../tables/IndicatorCompaniesTable';
import { IndicatorGraphs } from '../graphs/IndicatorGraphs';

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

// Assessments components
import { AssessmentGHG } from '/components/assessments/AssessmentGHG';
import { AssessmentKNW } from '/components/assessments/AssessmentKNW';
import { AssessmentNRG } from '/components/assessments/AssessmentNRG';
import { AssessmentDIS } from '/components/assessments/AssessmentDIS';

// Export modules
import { exportIndicPDF, exportIndicDataExpensesCSV } from '/src/writers/Export';

// Libraries
import metaIndics from '/lib/indics';

/* ----------------------------------------------------------- */
/* -------------------- INDICATOR SECTION -------------------- */
/* ----------------------------------------------------------- */

/** Informations
 *  Props : session / indic / updateMenu
 *  Components :
 *    - Statement area
 *    - Indicator statement table
 *    - Graphs
 *  Popups :
 *    - assessment tool (if defined)
 *    - published data of providers (not available yet)
 *    - details for each accounts (not available yet)
 *  Actions :
 *    - export reporting (.pdf)
 *  State :
 *    - triggerPopup
 */

export class IndicatorSection extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
      triggerPopup: "",
      selectedTable: "incomeStatement"
    }
  }

  componentDidUpdate(prevProps)
  {
    if (prevProps.indic!=this.props.indic) this.setState({triggerPopup: ""})
  }
  
  render() 
  {
    const {indic} = this.props;
    const {triggerPopup,selectedTable} = this.state;

    const isAllValid = this.props.session.financialData.isFinancialDataLoaded
                    && !(this.props.session.financialData.companies.filter(company => company.status != 200).length > 0)
                    && !(this.props.session.financialData.immobilisations.concat(this.props.session.financialData.stocks).filter(account => account.initialState=="defaultData" && !account.dataFetched).length > 0);

    return (
      <div className="section-view">

        <div className="section-view-header"><h1>{metaIndics[indic].libelle}</h1>
          <div className="section-view-header-odds">
            {metaIndics[indic].odds.map((odd) => 
              <img key={"logo-odd-"+odd} src={"/resources/odds/F-WEB-Goal-"+odd+".png"} alt="logo"/>)}
          </div>
        </div>

      {!isAllValid &&
        <div>
          <p>Informations : {!this.props.session.financialData.isFinancialDataLoaded ? "Absences d'écritures comptables" : "Données non-synchronisées (Etats initiaux ou Fournisseurs)"}</p>
        </div>}

        <div className="indicator-section-view">
          <div className="groups">

            <div className="group">
              <h3>Déclaration des impacts directs</h3>
              <Statement indic={indic}
                         impactsData={this.props.session.impactsData}
                         onUpdate={ this.checkNetValueAddedIndicator.bind(this)}
                         onValidate={this.validateIndicator.bind(this)}
                         toAssessment={() => this.triggerPopup("assessment")}/>
            </div>

            <div className="group"><h3>Tableau récapitulatif</h3>
              <div className="actions">
                <button onClick={() => exportIndicPDF(this.props.indic,this.props.session)}>Editer rapport</button>
                <select value={selectedTable}
                        onChange={this.changeShowedTable}>
                <option key="1" value="incomeStatement">Compte de résultat</option>
                <option key="2" value="expensesAccounts">Détails - Comptes de charges</option>
                <option key="3" value="companies">Valeurs publiées - Fournisseurs</option>
              </select>
              </div>
              
              {this.buildtable(selectedTable)}

            </div>

            <div className="group">
              <h3>Graphiques comparatifs</h3>
              <IndicatorGraphs session={this.props.session} indic={this.props.indic}/>
            </div>

          </div>
        </div>

        {triggerPopup=="assessment" &&
          <div className="popup">
            <div className="popup-inner full-size">
              <Assessment indic={indic}
                          impactsData={this.props.session.impactsData}
                          onUpdate={this.checkNetValueAddedIndicator.bind(this)}
                          onValidate={this.validateIndicator.bind(this)}
                          onGoBack={() => this.triggerPopup("")}/>
            </div>
          </div>}

      </div>
    )
  }

  buildtable = (selectedTable) => 
  {
    switch(selectedTable) 
    {
      case "incomeStatement" :  return(<IndicatorStatementTable session={this.props.session} indic={this.props.indic}/>)
      case "expensesAccounts" : return(<IndicatorExpensesTable session={this.props.session} indic={this.props.indic}/>)
      case "companies" :        return(<IndicatorCompaniesTable session={this.props.session} indic={this.props.indic}/>)
    }
  }

  /* ----- SELECTED TAB ----- */
  
  changeShowedTable = (event) => this.setState({selectedTable: event.target.value})

  /* ----- - ----- */

  checkNetValueAddedIndicator = async (indic) =>
  {
    let nextIndicator = this.props.session.getValueAddedIndicator(indic);
    if (nextIndicator!==this.props.session.netValueAddedFootprint.indicators[indic]) {
      this.props.session.validations = this.props.session.validations.filter(item => item != indic);
      await this.props.session.updateIndicator(indic);
      if (indic==this.props.indic) this.forceUpdate();
    }
  }

  validateIndicator = async () =>
  {
    if (this.props.session.validations.indexOf(this.props.indic) < 0) this.props.session.validations.push(this.props.indic);
    await this.props.session.updateIndicator(this.props.indic);
    this.forceUpdate();
  }

  triggerPopup = (popupLabel) => this.setState({triggerPopup: popupLabel})

  // Reporting
  exportReporting = () => exportIndicPDF(this.props.indic,this.props.session)

}

/* ----- STATEMENTS ----- */

// Display the correct assessment view according to the indicator
function Statement(props) 
{
  switch(props.indic) 
  {
    case "art" : return(<StatementART {...props}/>)
    case "dis" : return(<StatementDIS {...props}/>)
    case "eco" : return(<StatementECO {...props}/>)
    case "geq" : return(<StatementGEQ {...props}/>)
    case "ghg" : return(<StatementGHG {...props}/>)
    case "haz" : return(<StatementHAZ {...props}/>)
    case "knw" : return(<StatementKNW {...props}/>)
    case "mat" : return(<StatementMAT {...props}/>)
    case "nrg" : return(<StatementNRG {...props}/>)
    case "soc" : return(<StatementSOC {...props}/>)
    case "was" : return(<StatementWAS {...props}/>)
    case "wat" : return(<StatementWAT {...props}/>)
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