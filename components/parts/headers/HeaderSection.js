import React from "react";
import {Container, Navbar } from "react-bootstrap";
import TopBar from "./Topbar";

export function HeaderSection({ step, stepMax, setStep, session }) {
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
            {[...Array(5)].map((_, index) => {
              const stepNumber = index + 1;
              const stepName = [
                "Import comptable",
                "Import des états initiaux",
                "Traitement des fournisseurs",
                "Déclaration des impacts directs",
                "Résultats",
              ][index];
              const isCompleted = stepMax >= stepNumber;

              return (
                <StepperItem
                  key={stepNumber}
                  step={step}
                  stepNumber={stepNumber}
                  stepName={stepName}
                  setStep={setStep}
                  isCompleted={isCompleted}
                />
              );
            })}
          </nav>
        </Container>
      </Navbar>
    </header>
  );
}

export function StepperItem({
  step,
  stepNumber,
  stepName,
  setStep,
  isCompleted,
}) {
  const handleClick = () => {
    if (isCompleted) {
      setStep(stepNumber);
    }
  };

  return (
    <div className={`stepper-item ${isCompleted ? "completed" : ""}`}>
      <button
        className={`step-counter ${step === stepNumber ? "current" : ""}`}
        disabled={!isCompleted}
        onClick={handleClick}
      >
        {stepNumber}
      </button>
      <div className="step-name">{stepName}</div>
    </div>
  );
}