// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";

// Components
import { InitialStatesTable } from "./InitialStatesTable";
import { ProgressBar } from "../../modals/ProgressBar";

import { updateVersion } from "/src/version/updateVersion";
import { Container } from "react-bootstrap";
import { getPrevDate } from "/src/utils/Utils";
import { Session } from "/src/Session";
import { ErrorAPIModal, ErrorFileModal, SuccessFileModal } from "../../modals/userInfoModals";
import { getMoreRecentYearlyPeriod, getYearPeriod } from "../../../utils/periodsUtils";

/* ---------------------------------------------------------------- */
/* -------------------- INITIAL STATES SECTION -------------------- */
/* ---------------------------------------------------------------- */

export const InitialStatesSection = ({
  session,
  period,
  selectPeriod,
  onReturn,
  submit
}) => {

  const [fetching, setFetching] = useState(false);
  const [syncProgression, setSyncProgression] = useState(0);
  const [titlePopup, setTitlePopup] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [error, setError] = useState(false);

  const onDrop = (files) => {
    setFiles(files);
    importFile();
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const accountsShowed = session.financialData.immobilisations.concat(
    session.financialData.stocks
  );

  const isNextStepAvailable = () => {
    let accounts = session.financialData.immobilisations.concat(session.financialData.stocks);
    return !accounts.some(
      (account) =>
        (account.initialStateType == "defaultData" && !account.initialStateSet) ||
        (account.isAmortisable && account.initialStateType == "none")
    );
  };;

  /* ---------- ACTIONS ---------- */

  // Synchronisation
  const synchroniseAll = async () => {
    // accounts
    const accountsToSync = session.financialData.immobilisations
      .concat(session.financialData.stocks)
      .filter((asset) => asset.initialStateType == "defaultData");

    // init progression
    setFetching(true);
    setSyncProgression(0);

    let i = 0;
    let n = accountsToSync.length;
    for (let account of accountsToSync) {
      try {
        await account.updateInitialStateFootprintFromRemote();
      } catch (error) {
        setError(true)
        break;
      }
      i++;
      setSyncProgression(Math.round((i / n) * 100));
    }

    setFetching(false);
    setSyncProgression(0);
  }

  /* ----- UPDATES ----- */

  const updateFootprints = () => {
    //this.props.session.updateFootprints();
    //this.setState({ financialData: this.props.session.financialData });
  };

  /* ---------- BACK-UP IMPORT ---------- */

  const importFile = () => {
    let file = files[0];

    let reader = new FileReader();
    reader.onload = async () => {
      try {
        // text -> JSON
        const prevSessionData = JSON.parse(reader.result);

        // update to current version
        await updateVersion(prevSessionData);

        // build session object
        const prevSession = new Session(prevSessionData);

        const currSession = session;
        const currYear = getYearPeriod(period);

        const prevMoreRecentPeriod = getMoreRecentYearlyPeriod(prevSession);
        const prevYear = getYearPeriod(prevMoreRecentPeriod);

        // Matching periods ---------------------------------

        // check if prev session periods not includes current session period
        const conflictingPeriod = prevSession.availablePeriods
          .find((prevPeriod) => currSession.availablePeriods
            .some((period) => period.periodKey === prevPeriod.periodKey));

        if (conflictingPeriod) {
          const existingYear = getYearPeriod(conflictingPeriod); // Récupérer les années de la période
          setTitlePopup("Erreur - Sauvegarde");
          setMessage(
            "Des données existent déjà pour l'exercice de "+existingYear+"."
            + " Veuillez vérifier la sauvegarde et réessayer."
          );
          setPopupError(true);
          return;
        }

        // check if prev session periods linked to current period
        const prevPeriod = prevSession.availablePeriods
          .find((prevPeriod) => prevPeriod.dateEnd == getPrevDate(period.dateStart));

        if (!prevPeriod) {
          setTitlePopup("Erreur de Fichier");
          setMessage(
            "La sauvegarde ne correspond pas à l'année précédente."
            +" Veuillez vérifier le fichier et réessayer."
          );
          setPopupError(true);
        }

        // Matching siren -----------------------------------
        // /!\ if not set ?

        if (prevSession.legalUnit.siren != currSession.legalUnit.siren) {
          setTitlePopup("Erreur de Fichier");
          setMessage(
            "Les numéros de siren ne correspondent pas."
            + " Veuillez vérifier le fichier et réessayer."
          );
          setPopupError(true);
          return;
        }

        let checkANouveaux = true;
        currSession.financialData.immobilisations
          .filter((immobilisation) => immobilisation.initialState.amount > 0)
          .forEach((immobilisation) => 
          {
            let prevImmobilisation = prevSession.financialData.immobilisations
              .find((account) => account.accountNum == immobilisation.accountNum);
            
            let prevStateDateEnd = immobilisation.initialState.date;
            if (!prevImmobilisation) {
              checkANouveaux = false;
            } else if (!prevImmobilisation.states[prevStateDateEnd]) {
              checkANouveaux = false;
            } else if (
              prevImmobilisation.states[prevStateDateEnd].amount !=
                immobilisation.initialState.amount ||
              (immobilisation.amortisationAccountNum &&
                prevImmobilisation.states[prevStateDateEnd]
                  .amortisationAmount !=
                  immobilisation.initialState.amortisationAmount) ||
              (immobilisation.depreciationAccountNum &&
                prevImmobilisation.states[prevStateDateEnd]
                  .depreciationAmount !=
                  immobilisation.initialState.depreciationAmount)
            ) {
              checkANouveaux = false;
            }
          });
        currSession.financialData.stocks
          .filter((stock) => stock.initialState.amount > 0)
          .forEach((stock) => {
            let prevStock = prevSession.financialData.stocks.find(
              (prevStock) => prevStock.accountNum == stock.accountNum
            );
            let prevStateDateEnd = stock.initialState.date;
            if (!prevStock) {
              checkANouveaux = false;
            } else if (!prevStock.states[prevStateDateEnd]) {
              checkANouveaux = false;
            } else if (
              prevStock.states[prevStateDateEnd].amount !=
                stock.initialState.amount ||
              (stock.depreciationAccountNum &&
                prevStock.states[prevStateDateEnd].depreciationAmount !=
                  stock.initialState.depreciationAmount)
            ) {
              checkANouveaux = false;
            }
          });
        if (!checkANouveaux) {
          setTitlePopup("Erreur - Correspondances des données");
          setMessage("Des données importées ne correspondent pas aux données du journal des A-Nouveaux. Veuillez vérifier le fichier et réessayer.");
          setPopupError(true);
          return;
        }

        // Update session with prev values
        await currSession.loadSessionFromBackup(prevSession);

        // Update financialData with prev values
        await currSession.financialData.loadFinancialDataFromBackUp(
          prevSession.financialData
        );
        //await currSession.updateFootprints(prevSession.financialPeriod);

        // Update component
        setPopupSuccess(true);
        setTitlePopup("Reprise sur l'exercice précédent");
        setMessage("Les données de l'exercice précédent ont été ajoutées avec succès. Les valeurs des indicateurs de stocks, immobilisations et amortissements en fin d'exercice vont être prises en compte pour l'exercice en cours.");
      } catch (error) {

        if(error.message == "Network Error") {
          setError(true);
        }
        else{
          setTitlePopup("Erreur - Fichier");
          setMessage("Oops ! Quelque chose s'est mal passé lors de l'import de la sauvegarde. "+
              "Veuillez vérifier le fichier et réessayer.");
          setPopupError(true);
        }
       
      }
    };

    try {
      reader.readAsText(file);
    } catch (error) {
      console.log(error);
      setTitlePopup("Erreur - Fichier");
      setMessage("Fichier non lisible. Veuillez vérifier le fichier et réessayer");
      setPopupError(true);
    }
  };


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
          <Dropzone onDrop={onDrop} maxFiles={1} multiple={false}>
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
            <SuccessFileModal
              showModal={popupSuccess}
              message={message}
              title={titlePopup}
              closePopup={() => setPopupSuccess(false)}
            />
          )}
          {popupError && (
            <ErrorFileModal
              showModal={popupError}
              title={titlePopup}
              errorMessage={message}
              onClose={() => setPopupError(false)}
            />
          )}
          <ErrorAPIModal
            hasError={error}
            onClose={() => setError(false)}
          ></ErrorAPIModal>
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

          {!isNextStepAvailable() ? (
            <div className="alert alert-info">
              <p>
                <i className="bi bi-exclamation-circle"></i> Les empreintes de
                certains comptes doivent être synchronisées.
              </p>
              <button
                onClick={() => synchroniseAll()}
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
          {session.financialData.immobilisations.concat(session.financialData.stocks).length >
            0 && (
            <div className="table-data mt-2">
              <InitialStatesTable
                financialData={session.financialData}
                period={period}
                accountsShowed={accountsShowed}
                onUpdate={updateFootprints}
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
            onClick={onReturn}
          >
            <i className="bi bi-chevron-left"></i>Etape précédente
          </button>
          <button
            className={"btn btn-secondary"}
            id="validation-button"
            disabled={!isNextStepAvailable()}
            onClick={submit}
          >
            Valider les états initiaux <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </section>
    </Container>
  )
}