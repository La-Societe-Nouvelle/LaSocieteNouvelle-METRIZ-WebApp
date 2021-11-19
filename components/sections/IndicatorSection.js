// La Société Nouvelle

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

// Libraries
import metaIndics from '/lib/indics';
import divisions from '/lib/divisions'; 

// React
import React from 'react';

// Objects
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint';

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
import { exportIndicPDF } from '/src/writers/Export';

/* ----------------------------------------------------------- */
/* -------------------- INDICATOR SECTION -------------------- */
/* ----------------------------------------------------------- */

/** Informations
 *  Props : session / indic
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
      indic: "eco",
      triggerPopup: "",
      selectedTable: "incomeStatement",
      comparativeDivision: "00",
      productionSectorFootprint: new SocialFootprint(),
      valueAddedSectorFootprint: new SocialFootprint(),
      consumptionSectorFootprint: new SocialFootprint(),
      productionAreaFootprint: new SocialFootprint(),
      valueAddedAreaFootprint: new SocialFootprint(),
      economicAreaData: null
    }
  }

  componentDidMount()
  {
    fetchEconomicAreaData("FRA","GDP").then(footprint => this.setState({valueAddedAreaFootprint: footprint}));
    fetchEconomicAreaData("FRA","GAP").then(footprint => this.setState({productionAreaFootprint: footprint}));
  }
  
  render() 
  {
    const {indic} = this.state;
    const {triggerPopup,selectedTable,comparativeDivision} = this.state;

    const isPublicationAvailable = Object.entries(this.props.session.revenueFootprint.indicators).filter(([_,indicator]) => indicator.value!=null).length > 0;

    return (
      <div className="section-view">

        <div className="section-view-actions">
          <div className="sections-actions">
            <select id="selection-indicator"
                    value={indic}
                    onChange={this.changeSelectedIndicator}>
              <option disabled>Création de la valeur</option>
              <option key="eco" value="eco">&emsp;&emsp;{metaIndics["eco"].libelle}</option>
              <option key="art" value="art">&emsp;&emsp;{metaIndics["art"].libelle}</option>
              <option key="soc" value="soc">&emsp;&emsp;{metaIndics["soc"].libelle}</option>
              <option disabled>Empreinte sociale</option>
              <option key="dis" value="dis">&emsp;&emsp;{metaIndics["dis"].libelle}</option>
              <option key="geq" value="geq">&emsp;&emsp;{metaIndics["geq"].libelle}</option>
              <option key="knw" value="knw">&emsp;&emsp;{metaIndics["knw"].libelle}</option>
              <option disabled>Empreinte environnementale</option>
              <option key="ghg" value="ghg">&emsp;&emsp;{metaIndics["ghg"].libelle}</option>
              <option key="nrg" value="nrg">&emsp;&emsp;{metaIndics["nrg"].libelle}</option>
              <option key="wat" value="wat">&emsp;&emsp;{metaIndics["wat"].libelle}</option>
              <option key="mat" value="mat">&emsp;&emsp;{metaIndics["mat"].libelle}</option>
              <option key="was" value="was">&emsp;&emsp;{metaIndics["was"].libelle}</option>
              <option key="haz" value="haz">&emsp;&emsp;{metaIndics["haz"].libelle}</option>
            </select>
          </div>
          <div>
            <button id="validation-button" disabled={!isPublicationAvailable} onClick={this.props.publish}>Publication</button>
          </div>
        </div>

        <div className="section-top-notes">
          <p><b>Notes : </b>
            Une description de l'indicateur est disponible <a href={"https://lasocietenouvelle.org/indicateur/"+indic} target="_blank">ici</a>
          </p>
        </div>

        <div className="section-view-header-odds">
          {metaIndics[indic].odds.map((odd) => <img key={"logo-odd-"+odd} 
                                                    src={"/resources/odds/F-WEB-Goal-"+odd+".png"} alt="logo"/>)}
        </div>

        <div className="section-view-header">
          <h1>{metaIndics[indic].libelle}</h1>
        </div>

        <div className="indicator-section-view">

          <div className="group">
            <h3>Déclaration des impacts directs</h3>
            <Statement indic={indic}
                       impactsData={this.props.session.impactsData}
                       onUpdate={ this.willNetValueAddedIndicator.bind(this)}
                       onValidate={this.validateIndicator.bind(this)}
                       toAssessment={() => this.triggerPopup("assessment")}/>
          </div>

          <div className="group">
            <h3>Tableau récapitulatif</h3>
            <div className="actions">
              <button onClick={() => exportIndicPDF(this.state.indic,this.props.session)}>Editer rapport</button>
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
            <div className="actions">
              <div>Division économique comparative : </div>
              <select value={comparativeDivision}
                      onChange={this.changeComparativeDivision}>
                {Object.entries(divisions).sort((a,b) => parseInt(a)-parseInt(b))
                                          .map(([code,libelle]) => 
                <option key={code} 
                        value={code}>
                  {code + " - " +libelle}
                </option>)}
              </select>
            </div>
            <IndicatorGraphs session={this.props.session} 
                             indic={indic}
                             comparativeFootprints={this.state}/>
          </div>

        </div>

      {triggerPopup=="assessment" &&
        <div className="popup">
          <div className="popup-inner full-size">
            <Assessment indic={indic}
                        impactsData={this.props.session.impactsData}
                        onUpdate={this.willNetValueAddedIndicator.bind(this)}
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
      case "incomeStatement" :  return(<IndicatorStatementTable session={this.props.session} indic={this.state.indic}/>)
      case "expensesAccounts" : return(<IndicatorExpensesTable session={this.props.session} indic={this.state.indic}/>)
      case "companies" :        return(<IndicatorCompaniesTable session={this.props.session} indic={this.state.indic}/>)
    }
  }

  /* ----- SELECTED INDICATOR / TABLE ----- */
  
  changeSelectedIndicator = (event) => this.setState({indic: event.target.value})
  changeShowedTable = (event) => this.setState({selectedTable: event.target.value})

  changeComparativeDivision = async (event) => 
  {
    let division = event.target.value;
    this.setState({comparativeDivision: division});
    let productionSectorFootprint = await fetchDivisionData(division,"PRD");
    let valueAddedSectorFootprint = await fetchDivisionData(division,"GVA");
    let consumptionSectorFootprint = await fetchDivisionData(division,"IC");
    this.setState({productionSectorFootprint,valueAddedSectorFootprint,consumptionSectorFootprint});
  }

  /* ----- CHANGE/VALIDATION HANDLER ----- */

  // check if net value indicator will change with new value & cancel value if necessary
  willNetValueAddedIndicator = async (indic) =>
  {
    // get new value
    let nextIndicator = this.props.session.getNetValueAddedIndicator(indic);

    if (nextIndicator!==this.props.session.netValueAddedFootprint.indicators[indic]) 
    {
      // remove validation
      this.props.session.validations = this.props.session.validations.filter(item => item != indic);
      // update footprint
      await this.props.session.updateIndicator(indic);
      // update state
      if (indic==this.state.indic) this.forceUpdate();
    }
  }

  validateIndicator = async () =>
  {
    // add validation
    if (!this.props.session.validations.includes(this.state.indic)) this.props.session.validations.push(this.state.indic);
    // update footprint
    await this.props.session.updateIndicator(this.state.indic);
    // update state
    this.forceUpdate();
  }

  /* ----- POP-UP ----- */

  triggerPopup = (popupLabel) => this.setState({triggerPopup: popupLabel})

}

/* ----- STATEMENTS / ASSESSMENTS COMPONENTS ----- */

// Display the correct statement view according to the indicator
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

// Display the correct assessment view according to the indicator
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

// Fetch comparative data

const fetchDivisionData = async (division,flow) =>
{
  let endpoint; let response; let data;

  // comparative data
  let footprint = new SocialFootprint();

  endpoint = apiBaseUrl + "/default?" + "pays=FRA" + "&activite="+division +"&flow="+flow;
  console.log(endpoint);
  response = await fetch(endpoint, {method:'get'});
  data = await response.json();
  if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);
  
  return footprint;
}

const fetchEconomicAreaData = async (area,flow) =>
{
  let endpoint; let response; let data;

  // comparative data
  let footprint = new SocialFootprint();
  
  // Available production
  endpoint = apiBaseUrl + "/default?" + "pays="+area + "&activite=00" +"&flow="+flow;
  console.log(endpoint);
  response = await fetch(endpoint, {method:'get'});
  data = await response.json();
  if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);

  return footprint;
}