// La Societe Nouvelle

// React
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faEnvelope, faBook } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
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
            <a href="https://docs.lasocietenouvelle.org/" target="_blank">
              <FontAwesomeIcon icon={faBook} /> Documentation
            </a>
          </li>
          <li>
            <a
              href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/"
              target="_blank"
            >
              <FontAwesomeIcon icon={faGithub} /> GitHub
            </a>
          </li>
          <li>
            <a href="https://lasocietenouvelle.org/contact" target="_blank">
              <FontAwesomeIcon icon={faEnvelope} /> Contactez-nous
            </a>
          </li>
        </ul>
        <Button className="download" variant="primary" onClick={saveSession}>
          <FontAwesomeIcon icon={faSync} className="me-2" /> 
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

          <nav id="progression" className="row">
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
              <div className="step-name">Saisie des états initiaux</div>
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
              className={"stepper-item" + (stepMax == 4 ? " completed" : "")}
            >
              <button
                className={"step-counter" + (step == 4 ? " current" : "")}
                disabled={stepMax < 4}
                onClick={() => setStep(4)}
              >
                4
              </button>
              <div className="step-name">Mesure de l'impact</div>
            </div>
          </nav>
        </Container>
      </Navbar>
    </header>
  );
}
