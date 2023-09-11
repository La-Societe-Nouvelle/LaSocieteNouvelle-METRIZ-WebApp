// La Société Nouvelle

// React
import React from "react";

// Bootstrap
import {
  Container, 
  Navbar } from "react-bootstrap";

// Components
import { Topbar } from "./Topbar";
import { getProgression } from "../../utils/progressionUtils";
import { useState } from "react";
import { useEffect } from "react";

// Step names
const stepNames = [
  "Import comptable",
  "Import des états initiaux",
  "Traitement des fournisseurs",
  "Déclaration des impacts directs",
  "Résultats",
]

/* -------------------- HEADER SECTION -------------------- */

export const HeaderSection = ({ step, setStep, session, period }) => 
{
  const refresh = () => location.reload(true);

  const [stepMax, setStepMax] = useState(0);

  useEffect(async () => {
    let progression = await getProgression(session,period)
    setStepMax(progression);
  }, [step]);
  
  return (
    <header>
      <Topbar 
        session={session}
      />
      <Navbar expand="lg">
        <Container fluid id="menu">
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
            {[...Array(5)].map((_, index) => 
            {
              const stepNumber = index + 1;
              const stepName = stepNames[index];
              const isCompleted = stepMax > stepNumber || stepMax==5;
              const isCurrentStep = step == stepNumber;
              return (
                <StepperItem
                  key={stepNumber}
                  stepNumber={stepNumber}
                  isCurrentStep={isCurrentStep}
                  stepName={stepName}
                  isCompleted={isCompleted}
                  setStep={setStep}
                />
              );
            })}
          </nav>
        </Container>
      </Navbar>
    </header>
  )
}

// Stepper item
const StepperItem = ({ stepNumber, stepName, isCurrentStep, isCompleted, setStep }) => 
{
  // handle click => go to step
  const handleClick = () => {
    setStep(stepNumber);
  };

  return (
    <div className={`stepper-item ${isCompleted ? "completed" : ""}`}>
      <button className={`step-counter ${isCurrentStep ? "current" : ""}`}
              disabled={!isCompleted}
              onClick={handleClick}>
        {stepNumber}
      </button>
      <div className="step-name">
        {stepName}
      </div>
    </div>
  )
}