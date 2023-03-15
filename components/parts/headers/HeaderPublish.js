// La Societe Nouvelle

// React
import React from "react";
import { Button, Container, Row } from "react-bootstrap";

/* -------------------- HEADER -------------------- */

export function HeaderPublish({ setStep, downloadSession }) {
  const refresh = () => location.reload(true);
  const saveSession = () => downloadSession();
  return (
    <header>
      <div className="top-bar mb-2">
        <ul className="nav">
          <li>
            <a href="https://docs.lasocietenouvelle.org/" target="_blank">
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
        <Button
          className="btn-sm me-4 my-2 p-2"
          variant="secondary"
          onClick={saveSession}
        >
          <i className="bi bi-arrow-down"></i>
          Sauvegarder ma session
        </Button>
      </div>
      <Container fluid id="menu">
        <Row>
          <div className="d-flex justify-content-between align-items-center">
                <img
                  src="/logo_la-societe-nouvelle_s.svg"
                  alt="logo"
                  onClick={refresh}
                />
              <div className="action">
                <button className="btn btn-secondary" onClick={() => setStep(4)}>
                  <i className="bi bi-chevron-left"></i> Retour à la déclaration des
                  impacts
                </button>
              </div>

          </div>
          <nav id="progression" className="d-flex">
            <div className={"stepper-item completed"}>
              <p className={"step-counter"}>
                <i className="bi bi-arrow-up"></i>{" "}
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
