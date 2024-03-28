// La Societe Nouvelle

// React
import React from "react";
import { useState, useEffect } from "react";

// Bootstrap
import { Container, Navbar } from "react-bootstrap";

// Components
import { Topbar } from "./Topbar";
import { getProgression } from "../../utils/progressionUtils";

/* -------------------- HEADER PUBLISH FORM -------------------- */

export const HeaderPublish = ({
  step,
  setStep,
  session,
  period,
  onSelectPeriod,
}) => {
  // reload on click
  const refresh = () => location.reload(true);
  const [stepMax, setStepMax] = useState(0);
  useEffect(async () => {
    let progression = await getProgression(session, period);
    setStepMax(progression);
  }, [step]);
  return (
    <header className="overflow-hidden">
      <Topbar
        session={session}
        progression={stepMax}
        period={period}
        onSelectPeriod={onSelectPeriod}
      />
      <Container fluid>
        <Navbar expand="lg">
          <Navbar.Brand href="/">
            <img
              className="d-inline-block align-top"
              src="/logo_la-societe-nouvelle_s.svg"
              width="120"
              height="120"
              alt="logo"
              onClick={refresh}
            />
          </Navbar.Brand>
          <nav className="d-flex" id="progression">
            <div className={`stepper-item completed`}>
              <button className={`step-counter `} onClick={() => setStep(5)}>
                <i className="bi bi-chevron-left" />
              </button>
              <div className="step-name">Retour à l'analyse</div>
            </div>
            <div className={`stepper-item`}>
              <button className={`step-counter current`} disabled={true}>
                <i className="bi bi-cloud-arrow-up-fill" />
              </button>
              <div className="step-name">Publication</div>
            </div>
          </nav>
        </Navbar>
      </Container>
    </header>
  );
};
