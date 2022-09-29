// La Société Nouvelle

// React
import React from "react";

// Components
import { CompaniesTable } from "../../tables/CompaniesTable";

import { ProgressBar } from "../../popups/ProgressBar";

// Readers
import { getSignificativeCompanies } from "../../../src/formulas/significativeLimitFormulas";
import { Container } from "react-bootstrap";
import { ErrorApi } from "../../ErrorAPI";

/* ----------------------------------------------------------- */
/* -------------------- COMPANIES SECTION -------------------- */
/* ----------------------------------------------------------- */

export class SectorSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companies: props.companies,
      companiesShowed: props.companies,
      significativeCompanies: [],
      view: "all",
      nbItems: 20,
      fetching: false,
      files: [],
      progression: 0,
      companyStep: props.companyStep,
      error: false,
    };
  }

  handleChange = (event) => {
    let view = event.target.value;
    switch (view) {
      case "aux":
        return this.setState({
          companiesShowed: this.state.companies.filter(
            (company) => !company.isDefaultAccount
          ),
          view: view,
        });
      case "expenses":
        return this.setState({
          companiesShowed: this.state.companies.filter(
            (company) => company.isDefaultAccount
          ),
          view: view,
        });
      case "significative":
        return this.setState({
          companiesShowed: this.state.significativeCompanies.filter(
            (company) => company.footprintActivityCode == "00"
          ),
          view: view,
        });
      case "defaultActivity":
        return this.setState({
          companiesShowed: this.state.companies.filter(
            (company) =>
              company.footprintActivityCode == "00" ||
              company.footprintActivityCode == "TOTAL"
          ),
          view: view,
        });
      default:
        return this.setState({
          companiesShowed: this.state.companies,
          view: view,
        });
    }
  };

  render() {
    const {
      companies,
      significativeCompanies,
      view,
      nbItems,
      fetching,
      progression,
      companiesShowed,
      error,
    } = this.state;

    const financialData = this.props.session.financialData;
    const isNextStepAvailable = nextStepAvailable(this.state);
    const setCompanyStep = this.props.setCompanyStep;

    return (
      <Container fluid id="sector-section">
        <section className="step">
          <div className="section-title mb-3">
            <h2>&Eacute;tape 3 - Traitement des fournisseurs</h2>
            <h3 className="subtitle ">
              Synchronisation des données grâce au secteur d'activité
            </h3>
          </div>
   

          <div className="step 3">
            {companies.length > 0 && (
              <>
                <div className="table-container">
                  <div className="table-data table-company">
                  {error && <ErrorApi />}

                    {!error && isNextStepAvailable ? (
                      <div className="alert alert-success">
                        <p>
                          <i className="bi bi-check2"></i> Tous les comptes ont
                          bien été synchronisés.
                        </p>
                      </div>
                    ) : (
                      <div className="alert alert-warning">
                        <p>
                          <i className="bi bi-exclamation-triangle"></i> Les
                          empreintes de certains comptes doivent être
                          synchronisées.
                        </p>
                      </div>
                    )}
                    {significativeCompanies.filter(
                      (company) => company.footprintActivityCode == "00"
                    ).length > 0 ? (
                      <div className="alert alert-warning">
                        <p>
                          <i className="bi bi-exclamation-triangle"></i> Grand
                          risque d'imprécision pour les comptes significatifs
                          qui ne sont pas reliés à un secteur d'activité.
                        </p>
                        <button
                          onClick={this.handleChange}
                          value="significative"
                          className={"btn btn-warning"}
                        >
                          Afficher les comptes significatifs sans secteur (
                          {
                            significativeCompanies.filter(
                              (company) => company.footprintActivityCode == "00"
                            ).length
                          }
                          /{significativeCompanies.length})
                        </button>
                      </div>
                    ) : (
                      ""
                    )}

                    <button
                      onClick={() => this.synchroniseCompanies()}
                      className={"btn btn-secondary"}
                    >
                      <i className="bi bi-arrow-repeat"></i> Synchroniser les
                      données
                    </button>
                    <div className="pagination">
                      <div className="form-group">
                        <select
                          value={view}
                          onChange={this.handleChange}
                          className="form-select"
                          >
                          <option
                            key="1"
                            value="
                          "
                          >
                            Tous les comptes (sans siren)
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
                            Comptes tiers non rattachés à un secteur d'activités
                          </option>
                        </select>
                      </div>

                      <div className="form-group">
                        <select
                          value={nbItems}
                          onChange={this.changeNbItems}
                          className="form-select"
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
          <div className="text-end">
            <button
              onClick={() => setCompanyStep(1)}
              className={"btn btn-primary me-2"}
            >
              <i className="bi bi-chevron-left"></i>
              Numéros de Siren
            </button>
            <button
              className={"btn btn-secondary"}
              id="validation-button"
              disabled={!isNextStepAvailable}
              onClick={this.props.submit}
            >
              Mesurer l'impact
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </section>
      </Container>
    );
  }

  /* ---------- VIEW ---------- */

  changeNbItems = (event) => this.setState({ nbItems: event.target.value });

  /* ---------- UPDATES ---------- */

  updateFootprints = () => {
    this.props.session.updateFootprints();
    this.setState({ companies: this.props.companies });
  };

  /* ---------- FETCHING DATA ---------- */

  synchroniseCompanies = async () => {
    let companiesToSynchronise = this.state.companies;
    let significativeCompanies = getSignificativeCompanies(
      this.props.session.financialData
    );
    // synchronise data
    this.setState({ fetching: true, progression: 0 });
    let i = 0;
    let n = companiesToSynchronise.length;
    for (let company of companiesToSynchronise) {
      try {
        await company.updateFromRemote();
      } catch (error) {
        this.setState({ error: true });
        break;
      }
      i++;
      this.setState({ progression: Math.round((i / n) * 100) });
    }

    // check if companies is a significative companies
    let result = companiesToSynchronise.filter((o1) =>
      significativeCompanies.some((o2) => o1.account === o2.account)
    );

    // update state
    this.setState({
      fetching: false,
      progression: 0,
      significativeCompanies: result,
      companyStep: 3,
    });
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
