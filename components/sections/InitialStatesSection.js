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
import { Session } from "../../src/Session";
import { MessagePopup, MessagePopupErrors, MessagePopupSuccess } from "../popups/MessagePopup";

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
      titlePopup: "",
      message: "",
      files: [],
      popupSuccess:false,
      popupError:false,
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
      titlePopup,
      message,
      error,
      popupError,
      popupSuccess
    } = this.state;

    const accountsShowed = financialData.immobilisations.concat(
      financialData.stocks
    );

    const isNextStepAvailable = nextStepAvailable(this.state);
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
            {popupSuccess && (
                <MessagePopupSuccess
                message={message}
                title={titlePopup} 
                closePopup={() =>this.setState({ popupSuccess: false })}
              />
            )}
           {popupError && (
              <MessagePopupErrors
                message={message}
                title={titlePopup} 
                closePopup={() =>this.setState({ popupError: false })}
              />
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
        const prevSessionData = JSON.parse(reader.result);
        
        // update to current version
        await updateVersion(prevSessionData);

        const currSession = this.props.session;

        const prevSession = new Session(prevSessionData);

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

          this.setState({
            titlePopup: "Erreur - Fichier",
            message:
              "Des données sont déjà disponibles pour l'année correspondante à la sauvegarde importée. Veuillez vérifier le fichier et réessayer",
            popupError: true 
          });
          return;
        }

        if (prevSession.legalUnit.siren != currSession.legalUnit.siren) {
          this.setState({
            titlePopup: "Erreur de Fichier",
            message: "Les numéros de siren ne correspondent pas. Veuillez vérifier le fichier et réessayer",
            popupError: true 
          });
          return;
        }
      
        if (
          parseInt(prevYear) != parseInt(currYear) - 1 ||
          prevSession.financialPeriod.dateEnd !=
            getPrevDate(currSession.financialPeriod.dateStart)
        ) {
          this.setState({
            titlePopup: "Erreur de Fichier",
            message: "La sauvegarde ne correspond pas à l'année précédente. Veuillez vérifier le fichier et réessayer.",
            popupError: true 

          });
          return;
        }

        let checkANouveaux = true;
        currSession.financialData.immobilisations
          .filter(immobilisation => immobilisation.initialState.amount > 0)
          .forEach(immobilisation => {
            let prevImmobilisation = prevSession.financialData.immobilisations.find(prevImmobilisation => prevImmobilisation.accountNum==immobilisation.accountNum);
            let prevStateDateEnd = immobilisation.initialState.date;
            if (!prevImmobilisation) {checkANouveaux = false;}
            else if (!prevImmobilisation.states[prevStateDateEnd]) {checkANouveaux = false;}
            else if (prevImmobilisation.states[prevStateDateEnd].amount!=immobilisation.initialState.amount
              || (immobilisation.amortisationAccountNum && prevImmobilisation.states[prevStateDateEnd].amortisationAmount!=immobilisation.initialState.amortisationAmount)
              || (immobilisation.depreciationAccountNum && prevImmobilisation.states[prevStateDateEnd].depreciationAmount!=immobilisation.initialState.depreciationAmount)) {
                checkANouveaux = false;
            }
        });
        currSession.financialData.stocks
          .filter(stock => stock.initialState.amount > 0)
          .forEach(stock => {
            let prevStock = prevSession.financialData.stocks.find(prevStock => prevStock.accountNum==stock.accountNum);
            let prevStateDateEnd = stock.initialState.date;
            if (!prevStock) {checkANouveaux = false;}
            else if (!prevStock.states[prevStateDateEnd]) {checkANouveaux = false;}
            else if (prevStock.states[prevStateDateEnd].amount!=stock.initialState.amount
              || (stock.depreciationAccountNum && prevStock.states[prevStateDateEnd].depreciationAmount!=stock.initialState.depreciationAmount)) {
                checkANouveaux = false;
            }
        });
        if (!checkANouveaux) {
          this.setState({
            titlePopup: "Erreur - Correspondances des données",
            message:
              "Des données importées ne correspondent pas aux données du journal des A-Nouveaux. Veuillez vérifier le fichier et réessayer.",
            popupError: true 
          });
          return;
        }

        // Update session with prev values
        await currSession.loadSessionFromBackup(prevSession);
        
        // Update financialData with prev values
        await currSession.financialData.loadFinancialDataFromBackUp(prevSession.financialData);
        await currSession.updateFootprints(prevSession.financialPeriod);
 
        // Update component
        this.setState({
          financialData: this.props.session.financialData,
          popupSuccess: true,
          titlePopup: "Importation réussie",
          message:
            "Les données de l'exercice précédent ont été ajoutées avec succès. Les valeurs des indicateurs de stocks, immobilisations et amortissements en fin d'exercice ont été prises en compte pour l'exercice en cours.",
        });
        
      } catch (error) {
        console.log(error)
        this.setState({
          titlePopup: "Erreur - Fichier",
          message: "Fichier non lisible. Veuillez vérifier le fichier et réessayer",
          popupError: true 
        });
      }
    };

    try {
      reader.readAsText(file);
    } catch (error) {
      this.setState({
        titlePopup: "Erreur - Fichier",
        message: "Fichier non lisible. Veuillez vérifier le fichier et réessayer",
        popupError: true 
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
