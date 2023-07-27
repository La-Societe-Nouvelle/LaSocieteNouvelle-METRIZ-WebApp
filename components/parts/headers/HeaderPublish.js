// La Societe Nouvelle

// React
import React from "react";
import { Container, Navbar } from "react-bootstrap";
import TopBar from "./Topbar";

export function HeaderPublish({ setStep, session }) {
  const refresh = () => location.reload(true);
  return (
    <header>
      <TopBar session={session} />
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
            <div className={`stepper-item completed`}>
              <button className={`step-counter `} onClick={() => setStep(5)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <div className="step-name">Retour à l'analyse</div>
            </div>
            <div className={`stepper-item `}>
              <button className={`step-counter current`} disabled>
                <i className="bi bi-cloud-arrow-up-fill"></i>
              </button>
              <div className="step-name">Publication</div>
            </div>
          </nav>
        </Container>
      </Navbar>

    </header>
  );
}
