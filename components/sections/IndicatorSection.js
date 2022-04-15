// La Société Nouvelle

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

// Libraries
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";

// React
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRuler, faFileZipper, faChevronRight, faArrowDown, faFilePdf, faBook, faCheck, faShare, faEye } from "@fortawesome/free-solid-svg-icons";
// Objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Tab Components
import { IndicatorMainAggregatesTable } from "../tables/IndicatorMainAggregatesTable";
import { IndicatorExpensesTable } from "../tables/IndicatorExpensesTable";
import { IndicatorCompaniesTable } from "../tables/IndicatorCompaniesTable";
import { IndicatorGraphs } from "../graphs/IndicatorGraphs";

// Components
import { StatementART } from "/components/statements/StatementART";
import { StatementDIS } from "/components/statements/StatementDIS";
import { StatementECO } from "/components/statements/StatementECO";
import { StatementGEQ } from "/components/statements/StatementGEQ";
import { StatementGHG } from "/components/statements/StatementGHG";
import { StatementHAZ } from "/components/statements/StatementHAZ";
import { StatementKNW } from "/components/statements/StatementKNW";
import { StatementMAT } from "/components/statements/StatementMAT";
import { StatementNRG } from "/components/statements/StatementNRG";
import { StatementSOC } from "/components/statements/StatementSOC";
import { StatementWAS } from "/components/statements/StatementWAS";
import { StatementWAT } from "/components/statements/StatementWAT";

// Assessments components
import { AssessmentGHG } from "/components/assessments/AssessmentGHG";
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentDIS } from "/components/assessments/AssessmentDIS";

// Export modules
import { exportIndicPDF } from "/src/writers/Export";
import { downloadReport, exportFootprintPDF, generateFootprintPDF, generatePDF } from "../../src/writers/Export";

// Analysis writers
import { analysisTextWriterECO } from "../../src/writers/analysis/analysisTextWriterECO";
import { analysisTextWriterGHG } from "../../src/writers/analysis/analysisTextWriterGHG";
import { analysisTextWriterART } from "../../src/writers/analysis/analysisTextWriterART";
import { analysisTextWriterDIS } from "../../src/writers/analysis/analysisTextWriterDIS";
import { analysisTextWriterGEQ } from "../../src/writers/analysis/analysisTextWriterGEQ";
import { analysisTextWriterHAZ } from "../../src/writers/analysis/analysisTextWriterHAZ";
import { analysisTextWriterKNW } from "../../src/writers/analysis/analysisTextWriterKNW";
import { analysisTextWriterMAT } from "../../src/writers/analysis/analysisTextWriterMAT";
import { analysisTextWriterNRG } from "../../src/writers/analysis/analysisTextWriterNRG";
import { analysisTextWriterSOC } from "../../src/writers/analysis/analysisTextWriterSOC";
import { analysisTextWriterWAS } from "../../src/writers/analysis/analysisTextWriterWAS";
import { analysisTextWriterWAT } from "../../src/writers/analysis/analysisTextWriterWAT";


import RapportPopup from "../popups/RapportPopup";
import LoadingSpinner from "../LoadingSpinner";
import { GraphsPDF } from "../graphs/GraphsPDF";


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
  constructor(props) {
    super(props);
    this.state = {
      indic: "eco",
      triggerPopup: "",
      selectedTable: "mainAggregates",
      comparativeDivision: "00",
      productionSectorFootprint: new SocialFootprint(),
      valueAddedSectorFootprint: new SocialFootprint(),
      consumptionSectorFootprint: new SocialFootprint(),
      allSectorsProductionAreaFootprint: new SocialFootprint(),
      allSectorsValueAddedAreaFootprint: new SocialFootprint(),
      allSectorsConsumptionFootprint: new SocialFootprint(),
      economicAreaData: null,
      isLoading: false,
      graphPdf: true
    };

  }

  componentDidMount() {

    window.scrollTo(0, 0);

    fetchEconomicAreaData("FRA", "GVA").then((footprint) =>
      this.setState({ allSectorsValueAddedAreaFootprint: footprint })
    );
    fetchEconomicAreaData("FRA", "PRD").then((footprint) =>
      this.setState({ allSectorsProductionAreaFootprint: footprint })
    );

    fetchEconomicAreaData("FRA", "IC").then((footprint) =>
      this.setState({ allSectorsConsumptionFootprint: footprint })
    );

  }

  render() {
    const { indic, comparativeDivision, triggerPopup, selectedTable, isLoading, graphPdf } = this.state;

    const isPublicationAvailable = Object.entries(this.props.session.financialData.aggregates.revenue.footprint.indicators).filter(([_, indicator]) => indicator.value != null).length > 0;

    return (
      <div className="container-fluid indicator-section">
        <section className="step">
          {
            graphPdf && (
              this.props.session.validations.map((indic, key) =>
                <GraphsPDF
                  key={key}
                  session={this.props.session}
                  indic={indic}
                  comparativeFootprints={this.state} />
              )
            )
          }
          <div className="section-title">
            <h2><FontAwesomeIcon icon={faRuler} /> &Eacute;tape 5 - Mesure de l'impact</h2>
            <p>
              Pour chaque indicateur, déclarez vos impacts directs et obtenez les éléments d'analyse.
            </p>
          </div>
          <div className="form-group">
            <label>Sélectionner un indicateur : </label>
            <select
              className="form-input"
              id="selection-indicator"
              value={indic}
              onChange={this.changeSelectedIndicator}
            >
              <optgroup label="Création de la valeur">

                <option key="eco" value="eco">
                  {metaIndics["eco"].libelle}
                </option>
                <option key="art" value="art">
                  {metaIndics["art"].libelle}
                </option>
                <option key="soc" value="soc">
                  {metaIndics["soc"].libelle}
                </option>
              </optgroup>
              <optgroup label="Empreinte sociale">
                <option key="dis" value="dis">
                  {metaIndics["dis"].libelle}
                </option>
                <option key="geq" value="geq">
                  {metaIndics["geq"].libelle}
                </option>
                <option key="knw" value="knw">
                  {metaIndics["knw"].libelle}
                </option>
              </optgroup>
              <optgroup label="Empreinte environnementale">
                <option key="ghg" value="ghg">
                  {metaIndics["ghg"].libelle}
                </option>
                <option key="nrg" value="nrg">
                  {metaIndics["nrg"].libelle}
                </option>
                <option key="wat" value="wat">
                  {metaIndics["wat"].libelle}
                </option>
                <option key="mat" value="mat">
                  {metaIndics["mat"].libelle}
                </option>
                <option key="was" value="was">
                  {metaIndics["was"].libelle}
                </option>
                <option key="haz" value="haz">
                  {metaIndics["haz"].libelle}
                </option>
              </optgroup>
            </select>
          </div>

          <div className="indicator-title">
            <div>
              <h3>
                {metaIndics[indic].libelle} {metaIndics[indic].isBeta && (
                  <span className="beta">&nbsp;BETA&nbsp;</span>
                )}

              </h3>
              <p >
                <a className="btn btn-info" href={"https://docs.lasocietenouvelle.org/application-web/declarations/declaration-" + indic} target="_blank">
                  <FontAwesomeIcon icon={faBook} /> Accéder à la documentation
                </a>
              </p>
            </div>
            <div className="indicator-img">
              {metaIndics[indic].odds.map((odd) => <img key={"logo-odd-" + odd}
                src={"/resources/odds/F-WEB-Goal-" + odd + ".png"} alt="logo" />)}
            </div>
          </div>
          <div className="step">

            <h4>Déclaration des impacts directs</h4>

            <Statement
              indic={indic}
              impactsData={this.props.session.impactsData}
              onUpdate={this.willNetValueAddedIndicator.bind(this)}
              onValidate={this.validateIndicator.bind(this)}
              toAssessment={() => this.triggerPopup("assessment")}
            />

            {triggerPopup == "assessment" && (
              <div className="modal-overlay">
                <div className="modal-wrapper">
                  <div className="modal">
                    <Assessment
                      indic={indic}
                      impactsData={this.props.session.impactsData}
                      onUpdate={this.willNetValueAddedIndicator.bind(this)}
                      onValidate={this.validateIndicator.bind(this)}
                      onGoBack={() => this.triggerPopup("")}
                    />
                  </div>
                </div>
              </div>

            )}

          </div>

          {this.props.session.validations.includes(this.state.indic) && (
            <>
              <div className="impact-result step">
                <h4>Votre Impact</h4>
                <div className="container">
                  <div className="form-group">
                    <select
                      className={"form-input small-input"}
                      value={selectedTable}
                      onChange={this.changeShowedTable}
                    >
                      <option key="1" value="mainAggregates">
                        Soldes intermédiaires de gestion
                      </option>
                      <option key="2" value="expensesAccounts">
                        Détails - Comptes de charges
                      </option>
                      {/*<option key="3" value="companies">Valeurs publiées - Fournisseurs</option>*/}
                    </select>

                  </div>
                  {this.buildtable(selectedTable)}
                </div>
              </div>
              <div className="compare-section step">
                <h4>Comparaison</h4>
                <div className="container">

                  <div className="form-group">
                    <label>Sélectionner une activité comparative : </label>
                    <select
                      className={"form-input small-input"}
                      value={comparativeDivision}
                      onChange={this.changeComparativeDivision}
                    >
                      {Object.entries(divisions)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map(([code, libelle]) => (
                          <option key={code} value={code}>
                            {code + " - " + libelle}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="graph-section">
                    <IndicatorGraphs
                      session={this.props.session}
                      indic={indic}
                      comparativeFootprints={this.state}
                    />

                  </div>
                </div>
              </div>

              <div className="analysis-section step">
                <h4>Note d'analyse</h4>
                <div className="analysis-container">
                  <div>
                    <Analyse
                      indic={this.state.indic}
                      session={this.props.session}
                    />
                  </div>
                  <div>
                    <img src="/resources/illu_analyse.svg" alt="Analyse" />
                  </div>
                </div>
              </div>
            </>

          )}
          <div className="step download-section">
            <h4>Téléchargement</h4>
            <div className="flex">
              <h5><FontAwesomeIcon icon={faFilePdf} /> Rapport sur l'indicateur : {metaIndics[indic].libelle} </h5>
              <button
                className={"btn btn-primary"}
                disabled={this.props.session.validations.includes(this.state.indic) ? false : true}
                onClick={() =>
                  exportIndicPDF(this.state.indic, this.props.session, this.state.comparativeDivision, '#Production', '#Consumption', '#Value')
                }
              >
                <FontAwesomeIcon icon={faEye} /> Visualiser (.pdf)
              </button>
            </div>

            <div className="flex">
              <h5>
                <FontAwesomeIcon icon={faFilePdf} /> Rapport sur l'empreinte sociétale
              </h5>
              <button
                className={"btn btn-primary"}
                onClick={() =>
                  exportFootprintPDF(this.props.session)
                }
              >
                <FontAwesomeIcon icon={faEye} /> Visualiser (.pdf)
              </button>
            </div>
            {this.props.session.validations.length > 1 && (
              <div className="flex">
                <div>
                  <h5>
                    <FontAwesomeIcon icon={faFileZipper} />  Télécharger le dossier complet
                  </h5>

                  <ul>
                    {
                      this.props.session.validations.map((indic, index) =>
                        <li key={index}>
                          <FontAwesomeIcon icon={faCheck} /> Indicateur : {metaIndics[indic].libelle}
                        </li>
                      )
                    }
                    <li> <FontAwesomeIcon icon={faCheck} /> Rapport sur l'empreinte environnementale</li>
                    <li> <FontAwesomeIcon icon={faCheck} /> Rapport sur l'empreinte économique et sociale</li>
                    <li> <FontAwesomeIcon icon={faCheck} /> Rapport général sur l'empreinte sociétale</li>
                    <li> <FontAwesomeIcon icon={faCheck} /> Fichier de sauvegarde de la session</li>
                  </ul>
                </div>
                <button
                  className={"btn btn-primary"}
                  onClick={() => {
                    this.generateGraph(this.props.session.validations, this.props.session, this.state.comparativeDivision)
                  }
                  }
                >

                  {isLoading ? <LoadingSpinner /> : <FontAwesomeIcon icon={faArrowDown} />}  Télécharger (.zip)
                </button>

              </div>)
            }

          </div>

          {triggerPopup == "rapport" && (
            <RapportPopup session={this.props.session} onGoBack={() => this.triggerPopup("")}
            />
          )}

          <div className="align-right">
            {/* <button
              className={"btn btn-primary"}
              onClick={() => this.setState({ triggerPopup: "rapport" })}
            >
              <FontAwesomeIcon icon={faShare} /> Envoyer rapport
            </button> */}
            <button
              className={"btn btn-secondary"}
              id="validation-button"
              disabled={!isPublicationAvailable}
              onClick={this.props.publish}
            >
              Publier mes résultats <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

        </section>
      </div>
    );
  }

  buildtable = (selectedTable) => {
    switch (selectedTable) {
      case "mainAggregates":
        return (
          <IndicatorMainAggregatesTable
            session={this.props.session}
            indic={this.state.indic}
          />
        );
      case "expensesAccounts":
        return (
          <IndicatorExpensesTable
            session={this.props.session}
            indic={this.state.indic}
          />
        );
      case "companies":
        return (
          <IndicatorCompaniesTable
            session={this.props.session}
            indic={this.state.indic}
          />
        );
    }
  };


  /* ---------- ACTIONS ---------- */

  generateGraph = (indics, session, comparativeDivision) => {

    this.setState(
      {
        isLoading: true,
      },
      () => {

        downloadReport(indics, session, comparativeDivision)
        this.setState({ isLoading: false})
      }
    );
  }


  /* ----- SELECTED INDICATOR / TABLE ----- */

  changeSelectedIndicator = (event) =>
    this.setState({ indic: event.target.value });
  changeShowedTable = (event) =>
    this.setState({ selectedTable: event.target.value });

  changeComparativeDivision = async (event) => {
    let division = event.target.value;
    if (division != "00") {
      this.setState({ comparativeDivision: division });
      let productionSectorFootprint = await fetchDivisionData(division, "PRD");
      let valueAddedSectorFootprint = await fetchDivisionData(division, "GVA");
      let consumptionSectorFootprint = await fetchDivisionData(division, "IC");
      this.setState({
        productionSectorFootprint,
        valueAddedSectorFootprint,
        consumptionSectorFootprint,
      });
    } else {
      this.setState({
        comparativeDivision: division,
        productionSectorFootprint: new SocialFootprint(),
        valueAddedSectorFootprint: new SocialFootprint(),
        consumptionSectorFootprint: new SocialFootprint(),
      });
    }
  };

  /* ----- CHANGE/VALIDATION HANDLER ----- */

  // check if net value indicator will change with new value & cancel value if necessary
  willNetValueAddedIndicator = async (indic) => {
    // get new value
    let nextIndicator = this.props.session.getNetValueAddedIndicator(indic);

    if (
      nextIndicator !==
      this.props.session.financialData.aggregates.netValueAdded.footprint
        .indicators[indic]
    ) {
      // remove validation
      this.props.session.validations = this.props.session.validations.filter(
        (item) => item != indic
      );
      // update footprint
      await this.props.session.updateIndicator(indic);
      // update state
      if (indic == this.state.indic) this.forceUpdate();
    }
  };

  validateIndicator = async () => {
    // add validation
    if (!this.props.session.validations.includes(this.state.indic))
      this.props.session.validations.push(this.state.indic);
    // update footprint
    await this.props.session.updateIndicator(this.state.indic);
    // update state
    this.forceUpdate();
  };

  /* ----- POP-UP ----- */

  triggerPopup = (popupLabel) => this.setState({ triggerPopup: popupLabel });

}

/* ----- STATEMENTS / ASSESSMENTS COMPONENTS ----- */

// Display the correct statement view according to the indicator
function Statement(props) {
  switch (props.indic) {
    case "art":
      return <StatementART {...props} />;
    case "dis":
      return <StatementDIS {...props} />;
    case "eco":
      return <StatementECO {...props} />;
    case "geq":
      return <StatementGEQ {...props} />;
    case "ghg":
      return <StatementGHG {...props} />;
    case "haz":
      return <StatementHAZ {...props} />;
    case "knw":
      return <StatementKNW {...props} />;
    case "mat":
      return <StatementMAT {...props} />;
    case "nrg":
      return <StatementNRG {...props} />;
    case "soc":
      return <StatementSOC {...props} />;
    case "was":
      return <StatementWAS {...props} />;
    case "wat":
      return <StatementWAT {...props} />;
  }
}

// Display the correct assessment view according to the indicator
function Assessment(props) {
  switch (props.indic) {
    case "dis":
      return <AssessmentDIS {...props} />;
    case "geq":
      return <AssessmentDIS {...props} />;
    case "ghg":
      return <AssessmentGHG {...props} />;
    case "knw":
      return <AssessmentKNW {...props} />;
    case "nrg":
      return <AssessmentNRG {...props} />;
    default:
      return <div></div>;
  }
}

/* ----- STATEMENTS / ASSESSMENTS COMPONENTS ----- */

const Analyse = (indic, session) => {
  let analyse = getAnalyse(indic, session);

  return (
    <>
      {analyse.map((paragraph, index) => (
        <p key={index}>{paragraph.reduce((a, b) => a + " " + b)}</p>
      ))}
    </>
  );
};



// Display the correct statement view according to the indicator
function getAnalyse(props) {
  switch (props.indic) {
    case "art":
      return analysisTextWriterART(props.session);
    case "dis":
      return analysisTextWriterDIS(props.session);
    case "eco":
      return analysisTextWriterECO(props.session);
    case "geq":
      return analysisTextWriterGEQ(props.session);
    case "ghg":
      return analysisTextWriterGHG(props.session);
    case "haz":
      return analysisTextWriterHAZ(props.session);
    case "knw":
      return analysisTextWriterKNW(props.session);
    case "mat":
      return analysisTextWriterMAT(props.session);
    case "nrg":
      return analysisTextWriterNRG(props.session);
    case "soc":
      return analysisTextWriterSOC(props.session);
    case "was":
      return analysisTextWriterWAS(props.session);
    case "wat":
      return analysisTextWriterWAT(props.session);
  }
}

// Fetch comparative data

const fetchDivisionData = async (division, flow) => {
  let endpoint;
  let response;
  let data;

  // comparative data
  let footprint = new SocialFootprint();

  endpoint =
    apiBaseUrl +
    "/default?" +
    "area=FRA" +
    "&activity=" +
    division +
    "&flow=" +
    flow;
  response = await fetch(endpoint, { method: "get" });
  data = await response.json();
  if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);

  return footprint;
};

const fetchEconomicAreaData = async (area, flow) => {
  let endpoint;
  let response;
  let data;

  // comparative data
  let footprint = new SocialFootprint();

  // Available production
  endpoint =
    apiBaseUrl +
    "/default?" +
    "area=" +
    area +
    "&activity=00" +
    "&flow=" +
    flow;
  response = await fetch(endpoint, { method: "get" });
  data = await response.json();
  if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);

  return footprint;
};
