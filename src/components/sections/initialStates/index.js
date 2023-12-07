// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Image } from "react-bootstrap";

// Components
import { ImportBackUpView } from "./views/ImportBackUpView";

// Utils
import { checkInitialStates } from "../../../utils/progressionUtils";
import { SyncInitialStatesView } from "./views/SyncInitialStatesView";

/* ---------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- INITIAL STATES SECTION -------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------------------------------------- */

export const InitialStatesSection = ({
  session,
  sessionDidUpdate,
  period,
  onReturn,
  submit
}) => {

  // accounts
  const [assets, setAssets] = useState([
    ...session.financialData.immobilisations,
    ...session.financialData.stocks
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  // ----------------------------------------------------------------------------------------------------
  
  const onUpdate = () => {
    setAssets([
      ...session.financialData.immobilisations,
      ...session.financialData.stocks
    ]);
    sessionDidUpdate();
  }

  // ----------------------------------------------------------------------------------------------------

  const isNextStepAvailable = () => {
    let initialStatesValid = checkInitialStates(session,period);
    return initialStatesValid;
  };

  return (
    <section className="step">
      <div className="section-title">
        <h2 className="mb-3"> Etape 2 - Importez vos états initiaux</h2>
      </div>

      <div className="alert-info">
        <div className="info-icon">
          <Image src="/info-circle.svg" alt="icon info" />
        </div>
        <div>
          <p>
            Les états initiaux correspondent aux{" "}
            <b>
              empreintes des comptes de stocks et d'immobilisations en début
              d'exercice
            </b>
          .
          </p>
          <p className="mt-1">
            Ils peuvent être directement <b>repris de l'analyse sur l'exercice précédent</b>, pour assurer une continuité avec l'exercice en cours, 
            ou être <b>initialisés à partir d'empreintes génériques</b>.
          </p>
          <p className="mt-1">
            L'import de la sauvegarde de l'exercice précédent permet également de récupérer 
            les résultats obtenus sur les année antérieures afin de suivre l'évolution de son empreinte sociétale.
          </p>
        </div>
      </div>

      
      <ImportBackUpView session={session} backUpDidLoad={onUpdate} />

      <SyncInitialStatesView
        assets={assets}
        session={session}
        period={period}
        initialStatesDidUpdate={onUpdate}
      />

      <div className="text-end">
        <button className={"btn btn-primary me-2"} onClick={onReturn}>
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
  );
}