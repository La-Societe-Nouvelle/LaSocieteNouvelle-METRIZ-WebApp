// La Société Nouvelle

// React
import React from "react";

// Components
import { UnidentifiedCompaniesTable } from "../../tables/UnidentifiedCompaniesTable";
import { ProgressBar } from "../../popups/ProgressBar";

// Readers
import { getSignificativeCompanies } from "../../../src/formulas/significativeLimitFormulas";
import { Container } from "react-bootstrap";
import { ErrorApi } from "../../ErrorAPI";

// Objectfs
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// api
import api from "/src/api";

/* ----------------------------------------------------------- */
/* -------------------- COMPANIES SECTION -------------------- */
/* ----------------------------------------------------------- */

export class SectorSection extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      unidentifiedProviders: props.unidentifiedProviders,         // companies without siren
      unidentifiedProvidersShowed: props.unidentifiedProviders,   // view
      significativeProviders: [],                                 // significative companies
      view: "all",                                                // filter view
      nbItems: 20,                                                // nb items
      fetching: false,                                            // -> to show popup
      progression: 0,                                             // progession -> popup
      error: false,
      minFpt: null,
      maxFpt: null,
      isNextStepAvailable: nextStepAvailable(props.unidentifiedProviders),
    };
  }

  componentDidMount = async () => 
  {
    let minFpt = await fetchMinFootprint();
    let maxFpt = await fetchMaxFootprint();
    let significativeCompanies = await getSignificativeCompanies(
      this.props.session.financialData.providers,
      this.props.session.financialData.expenses,
      this.props.session.financialData.investments,
      minFpt,maxFpt,
      this.props.financialPeriod
    );
    this.setState({significativeCompanies,minFpt,maxFpt})
  }

  render() 
  {
    const {
      unidentifiedProviders,
      significativeProviders,
      unidentifiedProvidersShowed,
      view,
      nbItems,
      fetching,
      progression,
      error,
      isNextStepAvailable,
    } = this.state;
    
    const financialData = this.props.financialData;
    const period = this.props.financialPeriod;
    
    const showedProviders = this.getShowedProviders(view);
    console.log(showedProviders.length);
    if (showedProviders.length == 0 && view!="") this.setState({view: ""}); // reset filter

    const nbSignificativeProvidersWithoutActivity = unidentifiedProviders.filter((provider) => provider.defaultFootprintParams.code == "00" && significativeProviders.includes(provider.providerNum)).length;
    const someSignificativeProvidersWithoutActivity = nbSignificativeProvidersWithoutActivity > 0;
    
    return (
      <Container fluid id="sector-section">
        <section className="step">
          <div className="section-title mb-3">
            <h2 className="mb-3">Etape 3 - Traitement des fournisseurs</h2>
            <h3 className=" mb-4 ">Synchronisation des données grâce au secteur d'activité</h3>
          </div>
          <div className="step 3">
            <div className="table-container">
              <div className="table-data table-company">
                {/* ---------- Show error popup ---------- */}
                {error && 
                  <ErrorApi />}
                {/* ---------- Show message next step available ---------- */}
                {(!error && isNextStepAvailable) &&
                  <div className="alert alert-success">
                    <p><i className="bi bi-check2-all"></i> Tous les comptes ont bien été synchronisés.</p>
                  </div>}
                {/* ---------- Show message missing data ---------- */}
                {(!error && !isNextStepAvailable) &&
                  <div className="alert alert-info">
                  <p><i className="bi bi bi-exclamation-circle"></i> Les empreintes de certains comptes doivent être synchronisées.</p>
                  <button className={"btn btn-secondary"}
                    onClick={() => this.synchroniseProviders()}>
                    <i className="bi bi-arrow-repeat"></i> Synchroniser les données
                  </button>
                </div>}
                {/* ---------- Show message significative accounts have default activity ---------- */}
                {someSignificativeProvidersWithoutActivity &&
                  <div className="alert alert-warning"> 
                    <p><i className="bi bi-exclamation-triangle"></i> Grand risque d'imprécision pour les comptes significatifs qui ne sont pas reliés à un secteur d'activité.</p>
                    <button
                      className={"btn btn-warning"}
                      value="significative"
                      onClick={() => this.setState({view: "significativeWithoutActivity"})}>
                      Afficher les comptes significatifs sans secteur ({nbSignificativeProvidersWithoutActivity} compte{nbSignificativeProvidersWithoutActivity > 1 ? "s" : ""})
                    </button>
                  </div>}
                
                {/* ---------- Head ---------- */}
                <div className="pagination">
                  <div className="form-group">
                    <select
                      className="form-select"
                      value={view}
                      onChange={(event) => this.setState({view: event.target.value})}>
                      <option key="1" value="">Tous les comptes (sans siren)</option>
                      <option key="2" value="aux">Comptes fournisseurs uniquement</option>
                      <option key="3" value="expenses">Autres comptes tiers</option>
                      <option key="4" value="significative">Comptes significatifs</option>
                      <option key="5" value="defaultActivity">Comptes tiers non rattachés à un secteur d'activité</option>
                      {someSignificativeProvidersWithoutActivity && <option key="6" value="significativeWithoutActivity">Comptes significatifs non rattachés à un secteur d'activité</option>}
                    </select>
                  </div>
                  <div className="form-group">
                    <select
                      className="form-select"
                      value={nbItems}
                      onChange={this.changeNbItems}>
                      <option key="1" value="20">20 fournisseurs par page</option>
                      <option key="2" value="50">50 fournisseurs par page</option>
                      <option key="3" value="all">Afficher tous les fournisseurs</option>
                    </select>
                  </div>
                </div>

                {/* ---------- Table ---------- */}
                <UnidentifiedCompaniesTable
                  nbItems={nbItems == "all" ? unidentifiedProviders.length : parseInt(nbItems)}
                  onUpdate={this.updateFootprints.bind(this)}
                  providers={showedProviders}
                  significativeProviders={significativeProviders}
                  financialData={financialData}
                  financialPeriod={period}
                  refreshSection={this.refreshSection}
                />

              </div>
            </div>

            {fetching &&
              <div className="popup">
                <ProgressBar
                  message="Récupération des données fournisseurs..."
                  progression={progression}/>
              </div>}

          </div>
          <div className="text-end">
            <button
              className={"btn btn-primary me-2"}
              onClick={this.props.prevStep}>
              <i className="bi bi-chevron-left"></i>Numéros de Siren
            </button>
            <button
              className={"btn btn-secondary"}
              id="validation-button"
              disabled={!isNextStepAvailable}
              onClick={this.props.nextStep}>
              Mesurer l'impact <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </section>
      </Container>
    );
  }

  /* ---------- VIEW ---------- */

  changeNbItems = (event) => this.setState({ nbItems: event.target.value });

  getShowedProviders = (view) => 
  {
    switch (view) 
    {
      case "aux": // provider account
        return this.props.unidentifiedProviders.filter((provider) => !provider.isDefaultProviderAccount);
      case "expenses": // default provider account
        return this.props.unidentifiedProviders.filter((provider) => provider.isDefaultProviderAccount);
      case "significative": // significative provider
        return this.props.unidentifiedProviders.filter((provider) => this.state.significativeProviders.includes(provider.providerNum));
      case "significativeWithoutActivity":  // significative provider & no activity code set
        return this.props.unidentifiedProviders.filter((provider) => this.state.significativeProviders.includes(provider.providerNum) && provider.defaultFootprintParams.code == "00");
      case "defaultActivity": // no activity code set
        return this.props.unidentifiedProviders.filter((provider) => provider.defaultFootprintParams.code == "00");
      default: // default
        return this.props.unidentifiedProviders;
    }
  };

  /* ---------- UPDATES ---------- */

  updateFootprints = async () => 
  {
    //this.props.session.updateFootprints();

    // check if companies is a significative companies
    let {minFpt,maxFpt} = this.state;
    let significativeProviders = await getSignificativeCompanies(
      this.props.session.financialData.providers,
      this.props.session.financialData.expenses,
      this.props.session.financialData.investments,
      minFpt,maxFpt,
      this.props.financialPeriod
    );

    this.setState({ providers: this.props.providers, significativeProviders: significativeProviders });
  };

  /* ---------- FETCHING DATA ---------- */

  synchroniseProviders = async () => 
  {
    let providersToSynchronise = this.props.unidentifiedProviders; // only showed ?
    console.log(providersToSynchronise);
    // synchronise data
    this.setState({ fetching: true, progression: 0 });
    let i = 0;
    let n = providersToSynchronise.length;
    for (let provider of providersToSynchronise) {
      try {
        await provider.updateFromRemote();
      } catch (error) {
        console.log(error);
        this.setState({ error: true });
        break;
      }
      i++;
      this.setState({ progression: Math.round((i / n) * 100) });
    }

    // check if providers is a significative companies
    let {minFpt,maxFpt} = this.state;
    let significativeProviders = await getSignificativeCompanies(
      this.props.session.financialData.providers,
      this.props.session.financialData.expenses,
      this.props.session.financialData.investments,
      minFpt,maxFpt,
      this.props.financialPeriod
    );

    // update state
    const isNextStepAvailable = nextStepAvailable(this.props.unidentifiedProviders);
    this.setState({
      fetching: false,
      progression: 0,
      significativeCompanies: significativeProviders,
      isNextStepAvailable
    });
    this.setState({view: this.state.view});

    // update session
    //this.props.session.updateFootprints();
  }

  refreshSection = () => 
  {
    const isNextStepAvailable = nextStepAvailable(this.props.unidentifiedProviders);
    if (this.state.isNextStepAvailable!=isNextStepAvailable) {
      this.setState({ isNextStepAvailable });
    }
  }
}

/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const fetchMinFootprint = async () =>
{
  let footprint = await api.get("defaultfootprint?code=FPT_MIN_DIVISION&aggregate=TRESS&area=FRA")
    .then((res) => 
    {
      let status = res.data.header.code;
      if (status == 200) {
        let data = res.data;
        let footprint = new SocialFootprint();
        footprint.updateAll(data.footprint);
        return footprint;
      } else {
        return null;
      }
    }).catch((err) => {
      return null;
    });
  
  return footprint;
}

const fetchMaxFootprint = async () =>
{
  let footprint = await api.get("defaultfootprint?code=FPT_MAX_DIVISION&aggregate=TRESS&area=FRA")
    .then((res) => 
    {
      let status = res.data.header.code;
      if (status == 200) {
        let data = res.data;
        let footprint = new SocialFootprint();
        footprint.updateAll(data.footprint);
        return footprint;
      } else {
        return null;
      }
    }).catch((err) => {
      return null;
    });

  return footprint;
}


/* -------------------------------------------------- ANNEXES -------------------------------------------------- */

const nextStepAvailable = (providers) => 
{
  let stepAvailable = !providers.some((provider) => provider.footprintStatus != 200);
  return stepAvailable;
};