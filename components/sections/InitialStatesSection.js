// La Société Nouvelle

// React
import React from "react";
import Dropzone from "react-dropzone";

// Components
import { InitialStatesTable } from "/components/tables/InitialStatesTable";
import { ProgressBar } from "../popups/ProgressBar";

import { updateVersion } from "../../src/version/updateVersion";
import { Container } from "react-bootstrap";
import { ErrorApi } from "../ErrorAPI";

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
      view: "importData",
      error: false,
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      financialData,
      fetching,
      syncProgression,
      showMessage,
      titlePopup,
      files,
      message,
      error,
    } = this.state;

    const accountsShowed = financialData.immobilisations.concat(
      financialData.stocks
    );

    const isNextStepAvailable = nextStepAvailable(this.state) && message == "";
    return (
      <Container fluid>
        <section className="step">
          <div className="section-title">
            <h2 className="mb-3"> Etape 2 - Importez vos états initiaux</h2>
            <p>
              Les états initiaux correspondent aux{" "}
              <b>
                empreintes des comptes de stocks et d’immobilisations en début
                d’exercice
              </b>
              . Ces empreintes peuvent être reprises de l’exercice précédent
              (onglet 1) ou estimées sur la base de l’exercice courant ou
              initialisées à partir de valeurs par défaut (onglet 2)
            </p>
          </div>

          <div className="table-menu">
            <button
              value="importData"
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
          {this.state.view == "defaultData" ? (
            <section className="step">
              <div className="small-text">
                <p>
                  En cas d'analyse réalisée pour l'exercice précédent, importez
                  le fichier de sauvegarde via le premier onglet.
                </p>
                <p>
                  <i className="bi bi-exclamation-circle"></i>{" "}
                  <b>Valeur par défaut :</b> Les valeurs par défaut
                  correspondent aux données disponibles pour la branche
                  économique la plus proche.
                </p>
                <p>
                  <i className="bi bi-exclamation-circle"></i>{" "}
                  <b>Estimée sur exercice courant : </b>Nous initialisons
                  l'empreinte du compte en début d'exercice. à partir des
                  opérations réalisées sur l'exercice courant.
                </p>
              </div>

              {error && <ErrorApi />}
              {!isNextStepAvailable ? (
                <div className="alert alert-warning">
                  <p>
                    <i className="bi bi-exclamation-triangle"></i> Les
                    empreintes de certains comptes doivent être synchronisées.
                  </p>
                  <button
                    onClick={() => this.synchroniseAll()}
                    className="btn btn-warning"
                  >
                    <i className="bi bi-arrow-repeat"></i> Synchroniser les
                    données
                  </button>
                </div>
              ) :  <div className={"alert alert-success"}>
              <p>
                <i className="bi bi-check2"></i> Les données ont bien été synchronisées.
              </p>
            </div>}
              {financialData.immobilisations.concat(financialData.stocks)
                .length > 0 && (
                <div className="table-data mt-2">
                  <InitialStatesTable
                    financialData={financialData}
                    accountsShowed={accountsShowed}
                    onUpdate={this.updateFootprints.bind(this)}
                  />
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
            </section>
          ) : (
            <section className="step">
              <p className="small-text mb-2">
                L'ajout de la sauvegarde de l'analyse sur l'exercice précédent
                permet d'assurer une continuité vis-à-vis de l'exercice en
                cours. La sauvegarde contient les valeurs des indicateurs
                associés aux comptes de stocks, d'immobilisations et
                d'amortissements en fin d'exercice.
              </p>
              <label>Importer votre fichier de sauvegarde (.json)</label>
              <Dropzone onDrop={this.onDrop} maxFiles={1} multiple={false}>
                {({ getRootProps, getInputProps }) => (
                  <div className="dropzone-section">
                    <div {...getRootProps()} className="dropzone">
                      <input {...getInputProps()} />
                      <p>
                        <i className="bi bi-file-arrow-up-fill"></i> Glisser
                        votre fichier ici
                      </p>
                      <p className="small-text">OU</p>
                      <p className="btn btn-primary">
                        Selectionner votre fichier
                      </p>
                    </div>
                  </div>
                )}
              </Dropzone>
              {files.length > 0 && message == "" && (
                <div className="alert alert-success">
                  <h4>Votre fichier a bien été importé</h4>
                  <ul>
                    {files.map((file) => (
                      <li key={file.name}>
                        {" "}
                        <i className="bi bi-file-earmark-excel-fill"></i>{" "}
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {showMessage && (
                <div className="alert alert-danger">
                  <p>{titlePopup}</p>
                  <p>{message}</p>
                </div>
              )}
            </section>
          )}

          <div className="text-end">
            <button
              className={"btn btn-secondary"}
              id="validation-button"
              disabled={!isNextStepAvailable}
              onClick={this.props.submit}
            >
              Valider les états initiaux <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </section>
      </Container>
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
      try {
        await account.updatePrevFootprintFromRemote();
      } catch (error) {
        this.setState({ error: true });
        break;
      }
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

  changeView = (event) =>
    this.setState({
      view: event.target.value,
      files: [],
      showMessage: false,
      message: "",
    });

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
          parseInt(prevSession.year) ==
          parseInt(this.props.session.year) - 1
        ) {
          // JSON -> session
          this.props.session.financialData.loadInitialStates(prevSession);

          // Update component
          this.setState({
            financialData: this.props.session.financialData,
            message: "",
            showMessage: false,
          });
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
