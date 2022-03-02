// La Société Nouvelle

// React
import React from "react";
import Dropzone from "react-dropzone";

// Components
import { InitialStatesTable } from "/components/tables/InitialStatesTable";
import { ProgressBar } from "../popups/ProgressBar";
import { MessagePopup } from "../popups/MessagePopup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faWarning, faSync, faPen, faChevronRight, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { updateVersion } from "../../src/version/updateVersion";

/* ---------------------------------------------------------------- */
/* -------------------- INITIAL STATES SECTION -------------------- */
/* ---------------------------------------------------------------- */

export class InitialStatesSection extends React.Component {
  constructor(props) {
    super(props);

    this.onDrop = (files) => {
      this.setState({ files });
      this.importFile();
    };

    this.state = {
      financialData: props.session.financialData,
      fetching: false,
      syncProgression: 0,
      showMessage: false,
      titlePopup: "",
      message: "",
      files: [],
      view: "importData"
    };

  }

  render() {

    const {
      financialData,
      fetching,
      syncProgression,
      showMessage,
      titlePopup,
      files,
      message
    } = this.state;

    const accountsShowed = financialData.immobilisations.concat(
      financialData.stocks
    );

    const isNextStepAvailable = nextStepAvailable(this.state) && message == "";
    return (
      <>
        <section className="container">

          <div className={"section-title"}>
            <h2> <FontAwesomeIcon icon={faPen} /> &Eacute;tape 3 - Saisissez vos états initiaux</h2>
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

              <button value="importData"
                className={this.state.view == "importData" ? "active" : ""}
                onClick={this.changeView}
              >
                Importer la sauvegarde de l'année dernière
              </button>

              <button
                className={this.state.view == "defaultData" ? "active" : ""}
                onClick={this.changeView}
                value="defaultData"
              >
                Initialiser avec des valeurs par défaut
              </button>

            </div>
            {
              this.state.view == "defaultData" ? <>

                <p>
                  En cas d'analyse réalisée pour l'exercice précédent, importez le fichier de sauvegarde
                  via le deuxième onglet.
                </p>
                <p>
                  <b>Valeur par défaut :</b> Les valeurs par défaut correspondent
                  aux données disponibles pour la branche économique la plus
                  proche.
                </p>
                <p>
                  <b>Estimée sur exercice courant : </b>Nous initialisons l'empreinte du compte en début d'exercice.
                  à partir des opérations réalisées sur l'exercice courant.
                </p>
                {!isNextStepAvailable && (
                  <div className={"alert alert-warning"}>
                    <p>
                      <FontAwesomeIcon icon={faWarning} /> L'empreinte de certains comptes ne sont pas initialisés.
                    </p>
                    <button onClick={() => this.synchroniseAll()} className={"btn btn-secondary"}>
                      <FontAwesomeIcon icon={faSync} /> Synchroniser les données
                    </button>
                  </div>
                )}
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


                {fetching && (
                  <div className="popup">
                    <ProgressBar
                      message="Récupération des données par défaut..."
                      progression={syncProgression}
                    />
                  </div>
                )}


              </>
                :
                <>
                  <p>
                    L'ajout de la sauvegarde de l'analyse sur l'exercice précédent permet d'assurer
                    une continuité vis-à-vis de l'exercice en cours. La sauvegarde contient les
                    valeurs des indicateurs associés aux comptes de stocks, d'immobilisations et d'amortissements
                    en fin d'exercice.
                  </p>
                  <h5>
                    Importer votre fichier de sauvegarde (.json)
                  </h5>

                  <Dropzone onDrop={this.onDrop} maxFiles={1} multiple={false} >
                    {({ getRootProps, getInputProps }) => (
                      <div className="dropzone-section">
                        <div {...getRootProps()} className="dropzone">
                          <input {...getInputProps()} />
                          <p>
                            Glisser votre fichier
                            <span>
                              ou cliquez ici pour sélectionner votre fichier
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </>
            }

          </div>
          {
            (files.length > 0 && !!this.message) ?
              <div className={"alert alert-success"}>
                <h4>Votre fichier a bien été importé</h4>
                <ul>
                  {
                    files.map((file) => (
                      <li key={file.name} > <FontAwesomeIcon icon={faFileExcel} /> {file.name}
                      </li>
                    ))
                  }
                </ul>
              </div>
              :
              ""
          }
          {
            showMessage ?
              <div className={"alert alert-error"}>
                <h4>{titlePopup}</h4>
                <p>
                  {message}
                </p>
              </div> : ""
          }


        </section>
        <section className={"action"}>
          <div className="container-fluid">

            <button className={"btn btn-secondary"}
              id="validation-button"
              disabled={!isNextStepAvailable}
              onClick={this.props.submit}
            >
              Valider les états initiaux   <FontAwesomeIcon icon={faChevronRight} />

            </button>
          </div>
        </section>

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
  /* ---------- SELECTED VIEW ---------- */

  changeView = (event) => this.setState({ view: event.target.value });

  /* ----- UPDATES ----- */

  updateFootprints = () => {
    this.props.session.updateFootprints();
    this.setState({ financialData: this.props.session.financialData });
  };

  /* ---------- BACK-UP IMPORT ---------- */

  importFile = () => {

    let file = this.state.files[0];

    let reader = new FileReader();
    reader.onload = async () => {
      try {
        // text -> JSON
        const prevSession = JSON.parse(reader.result);

        // update to current version
        updateVersion(prevSession);

        if (
          //prevSession.legalUnit.siren == this.props.session.legalUnit.siren &&
          parseInt(prevSession.year) == parseInt(this.props.session.year) - 1
        ) {
          // JSON -> session
          this.props.session.financialData.loadInitialStates(prevSession);

          // Update component
          this.setState({ financialData: this.props.session.financialData, message: "" });
        }
        else if (
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
