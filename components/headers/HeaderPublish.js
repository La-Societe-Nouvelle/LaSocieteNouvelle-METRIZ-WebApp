// La Societe Nouvelle

// React
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faEnvelope,
  faBook,
  faRuler,
  faBackward,
  faChevronRight,
  faChevronLeft,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Button, Container, Row } from "react-bootstrap";

/* -------------------- HEADER -------------------- */

export function HeaderPublish({ setStep, downloadSession }) {
  const refresh = () => location.reload(true);
  const saveSession = () => downloadSession();
  return (
    <header>
      <div className="top-bar">
        <ul className="nav">
          <li>
            <a href="https://docs.lasocietenouvelle.org/" target="_blank">
              {" "}
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
              {" "}
              <FontAwesomeIcon icon={faEnvelope} /> Contactez-nous
            </a>
          </li>
        </ul>
        <Button className="download" variant="primary" onClick={saveSession}>
          <FontAwesomeIcon icon={faSync} className="me-2" />
          Sauvegarder ma session
        </Button>
      </div>
      <Container fluid id="menu">
        <Row>
          <div className="logo">
            <img
              src="/logo_la-societe-nouvelle_s.svg"
              alt="logo"
              onClick={refresh}
            />
          </div>
          <div className="action">
            <button className="btn btn-secondary" onClick={() => setStep(4)}>
              {" "}
              <FontAwesomeIcon icon={faChevronLeft} /> Retour à la mesure des
              impacts{" "}
            </button>
          </div>
          <nav id="progression" className="row">
            <div className={"stepper-item completed"}>
              <p className={"step-counter"}>
                <FontAwesomeIcon icon={faUpload} />{" "}
              </p>
              <div className="step-name">
                <h2>Publier mes résultats</h2>
              </div>
            </div>
          </nav>
        </Row>
      </Container>
    </header>
  );
}
