// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

// Components
import { ImportBackUpView } from "./views/ImportBackUpView";

// Utils
import { checkInitialStates } from "../../../utils/progressionUtils";
import { InitialStatesView } from "./views/InitialStatesView";

/* -------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- INITIAL STATES SECTION ---------------------------------------- */
/* -------------------------------------------------------------------------------------------------------- */

export const InitialStatesSection = ({
  session,
  period,
  onReturn,
  submit
}) => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const isNextStepAvailable = () => {
    let initialStatesValid = checkInitialStates(session,period);
    return initialStatesValid;
  };

  const onUpdate = () => {
    console.log("data loaded");
  }

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

        <ImportBackUpView
          session={session}
          backUpDidLoad={onUpdate}
        />
        
        <InitialStatesView
          session={session}
          period={period}
          initialStatesDidUpdate={onUpdate}
        />

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