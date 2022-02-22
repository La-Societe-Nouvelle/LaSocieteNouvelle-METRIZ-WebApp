// La Société Nouvelle

// React
import React from "react";

// Components
import { InitialStatesTable } from "/components/tables/InitialStatesTable";
import { ProgressBar } from "../popups/ProgressBar";
import { MessagePopup } from "../popups/MessagePopup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faWarning, faSync } from "@fortawesome/free-solid-svg-icons";

/* ---------------------------------------------------------------- */
/* -------------------- INITIAL STATES SECTION -------------------- */
/* ---------------------------------------------------------------- */

export class InitialStatesSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      financialData: props.session.financialData,
      fetching: false,
      syncProgression: 0,
      showMessage: false,
      titlePopup: "",
      message: "",
    };
  }

  render() {
    const {
      financialData,
      fetching,
      syncProgression,
      showMessage,
      titlePopup,
      message,
    } = this.state;
    const accountsShowed = financialData.immobilisations.concat(
      financialData.stocks
    );

    const isNextStepAvailable = nextStepAvailable(this.state);

    return (
      <>
        <div className="container-fluid">
          <div className={"section-title"}>
            <h2>&Eacute;tape 3 - Saisissez vos états initiaux</h2>
            <p>
              Les états initiaux correspondent aux empreintes des comptes de
              stocks et d’immobilisations en début d’exercice. Les empreintes
              peuvent être saisies sur la base de l’exercice courant / valeurs
              par défaut (onglet 1), ou reprises de l’exercice précédent (onglet
              2).
            </p>
          </div>

          <div className="table-container">
            <div className="table-menu">
              <button
                className="active"
                onClick={this.changeView}
              >
                Utiliser les données de mon ancien exercice ou valeur par défaut
              </button>

              <button
                onClick={() => document.getElementById("import-states").click()}
              >
                Importer une sauvegarde de l'année dernière
              </button>
              <input
                id="import-states"
                visibility="collapse"
                type="file"
                accept=".json"
                onChange={this.importFile}
              />
            </div>

            <p>
              Cognitis enim pilatorum caesorumque funeribus nemo deinde ad has
              stationes appulit navem, sed ut Scironis praerupta letalia
              declinantes litoribus Cypriis contigui navigabant, quae Isauriae
              scopulis sunt controversa.
            </p>
            <p>
              <b>Valeur par défaut :</b> Les valeurs par défaut correspondent
              alors aux données disponibles pour la branche économique la plus
              proche et relatives à la production disponible en France.
            </p>
            <p>
              <b>Estimée sur exercice courant : </b>À partir de votre exercice
              courrant, nous estimons vos états initiaux à date.
            </p>
            <div className="table-btn">
              <button onClick={() => this.synchroniseAll()} className={"btn btn-secondary"}>
              <FontAwesomeIcon icon={faSync} /> Synchroniser les données
          </button>
            </div>
    
        
            {financialData.immobilisations.concat(financialData.stocks).length >
              0 && (
              <div className="table-data">
                <InitialStatesTable
                  financialData={financialData}
                  accountsShowed={accountsShowed}
                  onUpdate={this.updateFootprints.bind(this)}
                />
              </div>
            )}

            {isNextStepAvailable && (
              <div className={"alert alert-success"}>
                <p>
                  <FontAwesomeIcon icon={faCheck} /> Données complètes.
                </p>
              </div>
            )}
            {!isNextStepAvailable && (
              <div className={"alert alert-warning"}>
                <p>
                  <FontAwesomeIcon icon={faWarning} /> L'empreinte de certains comptes ne sont pas initialisés.
                </p>
              </div>
            )}
          </div>

          {fetching && (
            <div className="popup">
              <ProgressBar
                message="Récupération des données par défaut..."
                progression={syncProgression}
              />
            </div>
          )}
          {showMessage && (
            <MessagePopup
              title={titlePopup}
              message={message}
              closePopup={() => this.setState({ showMessage: false })}
            />
          )}
        </div>
        <div className={"action container-fluid"}>

          <button className={"btn btn-primary"}
            id="validation-button"
            disabled={!isNextStepAvailable}
            onClick={this.props.submit}
          >
            Je valide les états initiaux
          </button>
        </div>
      </>
    );
  }

  /* ---------- ACTIONS ---------- */

  // Synchronisation
  async synchroniseAll() {
    // init progression
    this.setState({ fetching: true, syncProgression: 0 });

    // accounts
    const accountsToSync = this.props.session.financialData.immobilisations
      .concat(this.props.session.financialData.stocks)
      .filter((account) => account.initialState == "defaultData");

    let i = 0;
    let n = accountsToSync.length;
    for (let account of accountsToSync) {
      await account.updatePrevFootprintFromRemote();
      i++;
      this.setState({
        syncProgression: Math.round((i / n) * 100),
        financialData: this.props.session.financialData,
      });
    }

    await this.props.session.updateFootprints();
    this.setState({
      fetching: false,
      syncProgression: 0,
      financialData: this.props.session.financialData,
    });
  }
  /* ---------- SELECTED TABLE ---------- */

  changeView = (event) => this.setState({ view: event.target.value });

  /* ----- UPDATES ----- */

  updateFootprints = () => {
    this.props.session.updateFootprints();
    this.setState({ financialData: this.props.session.financialData });
  };

  /* ---------- BACK-UP IMPORT ---------- */

  importFile = (event) => {
    let file = event.target.files[0];

    let reader = new FileReader();
    reader.onload = async () => {
      try {
        // text -> JSON
        const prevSession = JSON.parse(reader.result);

        // update to current version
        updateVersion(prevProps);

        if (
          prevSession.legalUnit.siren == this.props.session.legalUnit.siren &&
          parseInt(prevSession.year) == parseInt(this.props.session.year) - 1
        ) {
          // JSON -> session
          this.props.session.financialData.loadInitialStates(prevSession);

          // Update component
          this.setState({ financialData: this.props.session.financialData });
        } else if (
          prevSession.legalUnit.siren != this.props.session.legalUnit.siren
        ) {
          this.setState({
            titlePopup: "Erreur - Fichier",
            message: "Les numéros de siren ne correspondent pas.",
            showMessage: true,
          });
        } else {
          this.setState({
            titlePopup: "Erreur - Fichier",
            message: "La sauvegarde ne correspond pas à l'année précédente.",
            showMessage: true,
          });
        }
      } catch (error) {
        this.setState({
          titlePopup: "Erreur - Fichier",
          message: "Fichier non lisible.",
          showMessage: true,
        });
      }
    };

    try {
      reader.readAsText(file);
    } catch (error) {
      this.setState({
        titlePopup: "Erreur - Fichier",
        message: "Fihcier non lisible.",
        showMessage: true,
      });
    }
  };
}

/* -------------------------------------------------- NEXT SECTION -------------------------------------------------- */

const nextStepAvailable = ({ financialData }) =>
  // condition : data fetched for all accounts using default data for initial state (or no account with data unfetched if using default data as initial state)
  {
    let accounts = financialData.immobilisations.concat(financialData.stocks);
    return !(
      accounts.filter(
        (account) =>
          account.initialState == "defaultData" && !account.dataFetched
      ).length > 0
    );
  };
