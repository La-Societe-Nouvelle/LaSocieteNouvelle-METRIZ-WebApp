// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Image } from "react-bootstrap";

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
    ...session.financialData.immobilisations
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  // ----------------------------------------------------------------------------------------------------
  
  const onUpdate = () => {
    setAssets([
      ...session.financialData.immobilisations
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
        <h2 className="mb-3"> Etape 2 - Empreintes des immobilisations</h2>
      </div>

      <div className="alert-info">
        <div className="info-icon">
          <Image src="/info-circle.svg" alt="icon info" />
        </div>
        <div>
          <p>
            Les externalités associées aux immobilisations sont estimées à partir
            des empreintes des activités économiques sollicités.
          </p>
        </div>
      </div>

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
          Valider <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </section>
  );
}