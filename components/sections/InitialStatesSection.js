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
import { getPrevDate } from "../../src/utils/Utils";

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
                empreintes des comptes de stocks et d'immobilisations en début
                d'exercice
              </b>
              . Ces empreintes peuvent être reprises de l'exercice précédent ou
              estimées sur la base de l'exercice courant ou initialisées à
              partir de valeurs par défaut.
            </p>
          </div>
          <div className="step p-4">
            <h3 className="mb-3"> Reprise sur l'exercice précédent</h3>
            <p className="small">
              En cas d'analyse réalisée pour l'exercice précédent,{" "}
              <b>importez le fichier</b> de l'analyse de l'exercice précédent.
              L'ajout de la sauvegarde permet d'assurer une continuité vis-à-vis
              de l'exercice en cours. La sauvegarde contient les valeurs des
              indicateurs associés aux comptes de stocks, d'immobilisations et
              d'amortissements en fin d'exercice.
            </p>

            <label>Importer votre fichier de sauvegarde (.json)</label>
            <Dropzone onDrop={this.onDrop} maxFiles={1} multiple={false}>
              {({ getRootProps, getInputProps }) => (
                <div className="dropzone-section">
                  <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    <p>
                      <i className="bi bi-file-arrow-up-fill"></i> Glisser votre
                      fichier ici
                    </p>
                    <p className="small">OU</p>
                    <p className="btn btn-primary">
                      Selectionner votre fichier
                    </p>
                  </div>
                </div>
              )}
            </Dropzone>
            {files.length > 0 && message == "" && (
              <div className="alert alert-success">
                <p>
                  Votre fichier <b>{files[0].name}</b> a bien été importé
                </p>
              </div>
            )}
            {showMessage && (
              <div className="alert alert-danger">
                <p>{titlePopup}</p>
                <p>{message}</p>
              </div>
            )}
          </div>
          <div className="step p-4 my-3">
            <h3 className="mb-3"> Initialiser les états initiaux </h3>

            <div className="small">
              <p>
                <i className="bi bi-info-circle"></i> <b>Valeur par défaut :</b>{" "}
                Les valeurs par défaut correspondent aux données disponibles
                pour la branche économique la plus proche.
              </p>
              <p>
                <i className="bi  bi-info-circle"></i>{" "}
                <b>Estimée sur exercice courant : </b>Nous initialisons
                l'empreinte du compte en début d'exercice. à partir des
                opérations réalisées sur l'exercice courant.
              </p>
            </div>

            {error && <ErrorApi />}
            {!isNextStepAvailable ? (
              <div className="alert alert-info">
                <p>
                  <i className="bi bi-exclamation-circle"></i> Les empreintes de
                  certains comptes doivent être synchronisées.
                </p>
                <button
                  onClick={() => this.synchroniseAll()}
                  className="btn btn-secondary"
                >
                  <i className="bi bi-arrow-repeat"></i> Synchroniser les
                  données
                </button>
              </div>
            ) : (
              <div className={"alert alert-success"}>
                <p>
                  <i className="bi bi-check2"></i> Les données ont bien été
                  synchronisées.
                </p>
              </div>
            )}
            {financialData.immobilisations.concat(financialData.stocks).length >
              0 && (
              <div className="table-data mt-2">
                <InitialStatesTable
                  financialData={financialData}
                  financialPeriod={this.props.session.financialPeriod}
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
          </div>

          <div className="text-end">
            <button
              className={"btn btn-primary me-2"}
              onClick={this.props.return}
            >
              <i className="bi bi-chevron-left"></i>Etape précédente
            </button>
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
    // accounts
    const accountsToSync = this.props.session.financialData.immobilisations
      .concat(this.props.session.financialData.stocks)
      .filter((asset) => asset.initialStateType == "defaultData");

    // init progression
    this.setState({ fetching: true, syncProgression: 0 });

    let i = 0;
    let n = accountsToSync.length;
    for (let account of accountsToSync) {
      try {
        await account.updateInitialStateFootprintFromRemote();
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

    //await this.props.session.updateFootprints();
    this.setState({
      fetching: false,
      syncProgression: 0,
      financialData: this.props.session.financialData,
    });
  }

  /* ----- UPDATES ----- */

  updateFootprints = () => {
    //this.props.session.updateFootprints();
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
        const currSession = this.props.session;

        // update to current version
        updateVersion(prevSession);

        const prevYear = prevSession.financialPeriod.periodKey.slice(2);
        const currYear = currSession.financialPeriod.periodKey.slice(2);
     
        const isObjectInAvailablePeriods = prevSession.availablePeriods.find(
          (obj) => {
            return currSession.availablePeriods.some((period) => {
              return period.periodKey === obj.periodKey;
            });
          }
        );

        if (isObjectInAvailablePeriods) {
          // TO DO : Change alert message into pop up alert
          this.setState({
            titlePopup: "Erreur - Fichier",
            message:
              "Des données sont déjà disponibles pour l'année correspondante à la sauvegarde importée.",
            showMessage: true,
          });
          return;
        }

        if (prevSession.legalUnit.siren != currSession.legalUnit.siren) {
          this.setState({
            titlePopup: "Erreur - Fichier",
            message: "Les numéros de siren ne correspondent pas.",
            showMessage: true,
          });
          return;
        }
      
        if (
          parseInt(prevYear) != parseInt(currYear) - 1 ||
          prevSession.financialPeriod.dateEnd !=
            getPrevDate(currSession.financialPeriod.dateStart)
        ) {
          this.setState({
            titlePopup: "Erreur - Fichier",
            message: "La sauvegarde ne correspond pas à l'année précédente.",
            showMessage: true,
          });
          return;
        }

      
        // Update session with prev values 
        currSession.loadSessionFromBackup(prevSession);

        // Update financialData with prev values
        currSession.financialData.loadFinancialDataFromBackUp(prevSession.financialData);
 
        // Update component
        this.setState({
          financialData: this.props.session.financialData,
          message: "",
          showMessage: false,
        });
      } catch (error) {
        console.log(error)
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

// condition : data fetched for all accounts using default data for initial state (or no account with data unfetched if using default data as initial state)
const nextStepAvailable = ({ financialData }) => {
  let accounts = financialData.immobilisations.concat(financialData.stocks);
  return !accounts.some(
    (account) =>
      (account.initialStateType == "defaultData" && !account.initialStateSet) ||
      (account.isAmortisable && account.initialStateType == "none")
  );
};
