// La Societe Nouvelle

// React
import React from "react";
import { Button, Container, Navbar} from "react-bootstrap";

/* -------------------- HEADER -------------------- */

export function HeaderSection({ step, stepMax, setStep, downloadSession }) {
  const refresh = () => location.reload(true);
  const saveSession = () => downloadSession();
  return (
    <header>
      <div className="top-bar">
        <ul className="nav">
          <li>
            <a href="https://docs.lasocietenouvelle.org/application-web" target="_blank">
            <i className="bi bi-book-fill"></i> Documentation
            </a>
          </li>
          <li>
            <a
              href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/"
              target="_blank"
            >
              <i className="bi bi-github"></i> GitHub
            </a>
          </li>
          <li>
            <a href="https://lasocietenouvelle.org/contact" target="_blank">
            <i className="bi bi-envelope-fill"></i> Contactez-nous
            </a>
          </li>
        </ul>
        <Button className="btn-sm me-4 my-2 p-2" variant="secondary" onClick={saveSession}>
        <i className="bi bi-arrow-down"></i>
          Sauvegarder ma session
        </Button>
      </div>
      <Navbar expand="lg">
        <Container fluid id="menu">
          <Navbar.Brand href="/">
            <img
              src="/logo_la-societe-nouvelle_s.svg"
              width="120"
              height="120"
              className="d-inline-block align-top"
              alt="logo"
              onClick={refresh}
            />
          </Navbar.Brand>

          <nav id="progression" className="d-flex">
            <div
              className={"stepper-item" + (stepMax >= 1 ? " completed" : "")}
            >
              <button
                className={"step-counter" + (step == 1 ? " current" : "")}
                disabled={stepMax < 1}
                onClick={() => setStep(1)}
              >
                1
              </button>
              <div className="step-name">Import comptable</div>
            </div>
            <div className={"stepper-item" + (stepMax > 2 ? " completed" : "")}>
              <button
                className={"step-counter" + (step == 2 ? " current" : "")}
                disabled={stepMax < 2}
                onClick={() => setStep(2)}
              >
                2
              </button>
              <div className="step-name">Import des états initiaux</div>
            </div>
            <div className={"stepper-item" + (stepMax > 3 ? " completed" : "")}>
              <button
                className={"step-counter" + (step == 3 ? " current" : "")}
                disabled={stepMax < 3}
                onClick={() => setStep(3)}
              >
                3
              </button>
              <div className="step-name">Traitement des fournisseurs</div>
            </div>
            <div
              className={"stepper-item" + (stepMax > 4 ? " completed" : "")}
            >
              <button
                className={"step-counter" + (step == 4 ? " current" : "")}
                disabled={stepMax < 4}
                onClick={() => setStep(4)}
              >
                4
              </button>
              <div className="step-name">Déclaration des impacts directs</div>
            </div>
            <div
              className={"stepper-item" + (stepMax == 5 ? " completed" : "")}
            >
              <button
                className={"step-counter" + (step == 5 ? " current" : "")}
                disabled={stepMax < 5}
                onClick={() => setStep(5)}
              >
                5
              </button>
              <div className="step-name">Résultats</div>
            </div>
          </nav>
        </Container>
      </Navbar>
    </header>
  );
}
