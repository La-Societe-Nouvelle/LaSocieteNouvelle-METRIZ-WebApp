// La Société Nouvelle

// React
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faWarning, faSync } from "@fortawesome/free-solid-svg-icons";


// Components
import { CompaniesTable } from "../../tables/CompaniesTable";

import { ProgressBar } from "../../popups/ProgressBar";

// Readers
import { getSignificativeCompanies } from "../../../src/formulas/significativeLimitFormulas";

/* ----------------------------------------------------------- */
/* -------------------- COMPANIES SECTION -------------------- */
/* ----------------------------------------------------------- */

export class SectorSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companies: props.companies,
      significativeCompanies: [],
      view: "all",
      nbItems: 20,
      fetching: false,
      files: [],
      progression: 0,
      companyStep: props.companyStep
    };


  }

  componentDidUpdate() {

    // change view to main if array of companies with data unfetched empty
    if (
      this.state.view == "defaultActivity" &&
      this.state.companies.filter((company) => company.footprintActivityCode == "00").length > 0
    )
      this.setState({ view: "all" });

    // update significative companies array
    if (
      this.state.significativeCompanies.length == 0 &&
      this.state.companies.filter((company) => company.status != 200).length ==
      0
    ) {
      let significativeCompanies = getSignificativeCompanies(
        this.props.session.financialData
      );
      this.setState({ significativeCompanies });
    }

  }

  render() {
    const {
      companies,
      significativeCompanies,
      view,
      nbItems,
      fetching,
      progression,

    } = this.state;
    const financialData = this.props.session.financialData;

    // Filter commpanies showed
    const companiesShowed = filterCompanies(
      companies,
      view,
      significativeCompanies
    );

    const isNextStepAvailable = nextStepAvailable(this.state);

    return (
      <section className="container">

        <div className={"section-title"}>
          <h2>&Eacute;tape 4 - Traitement des fournisseurs</h2>

        </div>

        <div className="step-company mt-2">

          <h3 className={"subtitle underline"}>
            2. Synchronisation des données grâce au secteur d'activité
          </h3>

          <p>
            Vous pouvez calculer l'empreinte des comptes fournisseurs grâce au secteur d'activité.
            Assurez-vous d'avoir selectionné un secteur pour obtenir un calcul plus précis de l'empreinte du compte fournisseur.
          </p>
   

          {companies.length > 0 && (
            <>

              <div className="table-container">
                <div className="table-data table-company">

                  <div className="alert alert-warning">
                    {
                      console.log( this.state.significativeCompanies)
                    }
                    {
                       this.state.significativeCompanies.length > 0 &&
                       this.state.companies.filter((company) => company.status != 200).length > 0 ?
                       <p>
                       <FontAwesomeIcon icon={faWarning} /> L'empreinte de certains comptes ne sont pas initialisés. 
                     </p>
 
                      :
                      ""
                    }
       
                    <button
                      onClick={() => this.synchroniseCompanies()}
                      className={"btn btn-warning"}
                    >
                      <FontAwesomeIcon icon={faSync} /> Synchroniser les
                      données
                    </button>
                  </div>

                  <div className="pagination">


                    <div className="form-group">
                      <select
                        value={view}
                        onChange={this.changeView}
                        className="form-input"
                      >
                        <option key="1" value="all">
                          Tous les comptes externes
                        </option>
                        <option key="2" value="aux">
                          Comptes fournisseurs uniquement
                        </option>
                        <option key="3" value="expenses">
                          Autres comptes tiers
                        </option>

                        {significativeCompanies.length > 0 && (
                          <option key="5" value="significative">
                            Comptes significatifs
                          </option>
                        )}
                        <option key="6" value="defaultActivity">
                          Comptes tiers non rattachés à un secteur
                          d'activités
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <select
                        value={nbItems}
                        onChange={this.changeNbItems}
                        className="form-input"
                      >
                        <option key="1" value="20">
                          20 fournisseurs par page
                        </option>
                        <option key="2" value="50">
                          50 fournisseurs par page
                        </option>
                        <option key="3" value="all">
                          Afficher tous les fournisseurs
                        </option>
                      </select>
                    </div>
                  </div>

                  <CompaniesTable
                    nbItems={
                      nbItems == "all"
                        ? companiesShowed.length
                        : parseInt(nbItems)
                    }
                    onUpdate={this.updateFootprints.bind(this)}
                    companies={companiesShowed}
                    financialData={financialData}
                  />


                </div>
              </div>
            </>
          )}

          {fetching && (
            <div className="popup">
              <ProgressBar
                message="Récupération des données fournisseurs..."
                progression={progression}
              />
            </div>
          )}
        </div>
     
        <div className={"action container-fluid"}>
        <button
            className={"btn btn-secondary"}
            id="validation-button"
            disabled={!isNextStepAvailable}
            onClick={this.props.submit}
          >
           Mesurer l'impact
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </section>

    );
  }

  /* ---------- VIEW ---------- */

  changeView = (event) => this.setState({ view: event.target.value });
  changeNbItems = (event) => this.setState({ nbItems: event.target.value });

  /* ---------- UPDATES ---------- */

  updateFootprints = () => {
    this.props.session.updateFootprints();
    this.setState({ companies: this.props.session.financialData.companies });
  };


  /* ---------- FETCHING DATA ---------- */

  synchroniseCompanies = async () => {
    
    let companiesToSynchronise = this.state.companies.filter((company) => company.state == "default");

    // synchronise data
    this.setState({ fetching: true, progression: 0 });
    let i = 0;
    let n = companiesToSynchronise.length;
    for (let company of companiesToSynchronise) {
      await company.updateFromRemote()
      i++;
      this.setState({ progression: Math.round((i / n) * 100) });
    }

    console.log( this.state.companies.filter((company) => company.status != 200).length );

    // update view
    if (
      this.state.companies.filter((company) => company.status != 200).length > 0
    ) {
      this.state.view = "unsync";
    }
  
     
    // update signficative companies
    if (
      this.state.companies.filter((company) => company.status != 200).length ==
      0
    )
      this.state.significativeCompanies = getSignificativeCompanies(
        this.props.session.financialData
      );

    // update state
    this.setState({ fetching: false, progression: 0, companyStep: 3 });
    // update session
    this.props.session.updateFootprints();
  };
}

/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const nextStepAvailable = ({ companies }) =>
// condition : data fetched for all companies (or no company with data unfetched)
{
  return !(companies.filter((company) => company.status != 200).length > 0);
};

/* ---------- DISPLAY ---------- */

const filterCompanies = (companies, view, significativeCompanies) => {
  switch (view) {
    case "aux":
      return companies.filter((company) => !company.isDefaultAccount);
    case "expenses":
      return companies.filter((company) => company.isDefaultAccount);
    case "undefined":
      return companies.filter((company) => company.state != "siren");
    case "unsync":
      return companies.filter((company) => company.status != 200);
    case "defaultActivity":
      return companies.filter(
        (company) =>
          company.state == "default" &&
          (company.footprintActivityCode == "00" ||
            company.footprintActivityCode == "TOTAL")
      );
    case "significative":
      return significativeCompanies;
    default:
      return companies;
  }
};