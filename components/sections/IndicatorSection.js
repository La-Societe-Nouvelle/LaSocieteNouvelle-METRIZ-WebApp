// La Société Nouvelle

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

// Libraries
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";

// React
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRuler } from "@fortawesome/free-solid-svg-icons";
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
      productionAreaFootprint: new SocialFootprint(),
      valueAddedAreaFootprint: new SocialFootprint(),
      economicAreaData: null,
    };
  }


  componentDidMount() {
    fetchEconomicAreaData("FRA", "GVA").then((footprint) =>
      this.setState({ valueAddedAreaFootprint: footprint })
    );
    fetchEconomicAreaData("FRA", "GAP").then((footprint) =>
      this.setState({ productionAreaFootprint: footprint })
    );
  }

  render() {
    const { indic } = this.state;
    const { triggerPopup, selectedTable, comparativeDivision } = this.state;
    const isPublicationAvailable =
      Object.entries(
        this.props.session.financialData.aggregates.revenue.footprint.indicators
      ).filter(([_, indicator]) => indicator.value != null).length > 0;



    return (
      <div className="indicator-section">
        <section>
          <div className="container">
            <div className={"section-title"}>
              <h2><FontAwesomeIcon icon={faRuler} /> &Eacute;tape 5 - Mesure de l'impact</h2>
              <p>
                Primi igitur omnium statuuntur Epigonus et Eusebius ob nominum
                gentilitatem oppressi. praediximus enim Montium sub ipso vivendi
                termino his vocabulis appellatos fabricarum culpasse tribunos ut
                adminicula futurae molitioni pollicitos.
              </p>
            </div>
            <div className="indicator">
              <h3 className="h6">Sélectionner votre indicateur de mesure: </h3>
              <div className="form-group">
                <label>Indicateur de mesure</label>
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
            </div>
          </div>
        </section>
        <section className="selected-indicator">
          <div className="container">
            <h3 className="h6">Indicateur sélectionné :</h3>
            <h4 className={"subtitle underline"}>
              {metaIndics[indic].libelle}             {metaIndics[indic].isBeta && (
                <span className="beta">&nbsp;BETA&nbsp;</span>
              )}
            </h4>

            <p className="legend">
              Grandeur mesurée : Valeur ajoutée nette créée sur le territoire
              français (en euros)
            </p>
            <div className="statement-section">
              <h4>Déclaration des impacts directs</h4>
              <Statement
                indic={indic}
                impactsData={this.props.session.impactsData}
                onUpdate={this.willNetValueAddedIndicator.bind(this)}
                onValidate={this.validateIndicator.bind(this)}
                toAssessment={() => this.triggerPopup("assessment")}
              />
            </div>
          </div>

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
        </section>

        {/* <div className="section-view-header-odds">
          {metaIndics[indic].odds.map((odd) => <img key={"logo-odd-" + odd}
            src={"/resources/odds/F-WEB-Goal-" + odd + ".png"} height="100px;" alt="logo" />)}
        </div> */}
        <section className="row">
          <div className="menu-result">

          </div>
        </section>
        <section className="impact-result">
          <div className="container">
            <h3>Votre Impact</h3>
            <h4>{metaIndics[indic].libelle}</h4>
            <div className="form-group">
              <select
                className="form-input"
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
        </section>
        <section className="compare-section">
          <div className="container">
            <h3>Comparaison</h3>

            <h4>{metaIndics[indic].libelle}</h4>
            <div className="form-group">
              <label>Sélectionner une activité comparative : </label>
              <select
                className="form-input"
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
              <div className="container">
                <IndicatorGraphs
                  session={this.props.session}
                  indic={indic}
                  comparativeFootprints={this.state}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="analysis-section">
          <div className="container">
            {this.props.session.validations.includes(this.state.indic) && (
              <>
                <h3>Clés de decryptage</h3>
                <h4>{metaIndics[indic].libelle}</h4>
                <div className="analysis-container">
                  <Analyse
                    indic={this.state.indic}
                    session={this.props.session}
                  />


                </div>

              </>

            )}

          </div>
        </section>
        <section className={"action"}>
          <div className="container-fluid">
            <button
              className={"btn btn-secondary"}
              onClick={() =>
                exportIndicPDF(this.state.indic, this.props.session)
              }
            >
              Editer le rapport PDF
            </button>
            <button
              className={"btn btn-primary"}
              id="validation-button"
              disabled={!isPublicationAvailable}
              onClick={this.props.publish}
            >
              Publier mes résultats
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
    <div className="analysis">
      {analyse.map((paragraph) => (
        <p>{paragraph.reduce((a, b) => a + " " + b, "")}</p>
      ))}
    </div>
  );
};

const Paragraph = (text) => {
  return <p>{(text.reduce((a, b) => a + " " + b), "")}</p>;
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
  console.log(endpoint);
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
  console.log(endpoint);
  response = await fetch(endpoint, { method: "get" });
  data = await response.json();
  if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);

  return footprint;
};
