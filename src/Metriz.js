// La Société Nouvelle

// React / Next
import React, { useState } from "react";

// Error Handler
import ErrorBoundary from "/src/utils/ErrorBoundary";

// Sections
import { StartSection } from "/src/components/sections/start/StartSection";
import { AccountingImportSection } from "/src/components/sections/accountingImport";
import { InitialStatesSection } from "/src/components/sections/initialStates";
import ProvidersSection from "/src/components/sections/providers";
import DirectImpacts from "/src/components/sections/statements";
import Results from "/src/components/sections/results";
import PublishStatementSection from "/src/components/sections/publishStatement";

// Others components
import { HeaderSection } from "/src/components/pageComponents/HeaderSection";
import { HeaderPublish } from "/src/components/pageComponents/HeaderPublish";
import { Footer } from "/src/components/pageComponents/Footer";

// Logs
import { logUserProgress } from "/src/services/StatsService";

// Utils
import { getCurrentDateString } from "/src/utils/periodsUtils";
import { getMoreRecentYearlyPeriod } from "/src/utils/periodsUtils";
import { checkInitialStates } from "./utils/progressionUtils";

/* ------------------------------------------------------------------------------------- */
/* ---------------------------------------- APP ---------------------------------------- */
/* ------------------------------------------------------------------------------------- */

export const Metriz = () => 
{
  const [session, setSession] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState({});
  const [step, setStep] = useState(0);

  const currentDate = getCurrentDateString();

  // init session
  const initSession = (session) => 
  {
    let defaultPeriod = getMoreRecentYearlyPeriod(session.availablePeriods);

    setSession(session);
    setSelectedPeriod(defaultPeriod);
    setStep(session.progression);
  };

  const updateSelectedPeriod = (period) => {
    setSelectedPeriod(period);
  };

  // Validations --------------------------------------

  const updateStep = (nextStep) => {
    setStep(nextStep);
  };

  // imported data
  const validFinancialData = async () => 
  {
    // console logs
    console.log("--------------------------------------------------");
    console.log("[SESSION] Validation des données comptables");
    console.log("Données comptables : ");
    console.log(session.financialData);
    console.log("Objet session : ");
    console.log(session);
    console.log("--------------------------------------------------");

    // next step
    let initialStatesValidation = checkInitialStates(session,selectedPeriod);
    if (!initialStatesValidation) {
      setStep(2);
    } else {
      setStep(3);
    }

    // server logs
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(session.id, 1, currentDate, []);
    }
  };

  const validInitialStates = async () => 
  {
    // console logs
    console.log("--------------------------------------------------");
    console.log("[SESSION] Validation des états initiaux");
    console.log("Etats initiaux : ");
    console.log(session.financialData.immobilisations);
    console.log(session.financialData.stocks);
    console.log("Objet session : ");
    console.log(session);
    console.log("--------------------------------------------------");

    // next step
    setStep(3);

    // server logs
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(session.id, 2, currentDate, []);
    }
  };

  const validProviders = async () => 
  {
    // console logs
    console.log("--------------------------------------------------");
    console.log("[SESSION] Validation des empreintes fournisseurs");
    console.log("Données fournisseurs : ");
    console.log(session.financialData.providers);
    console.log("Objet session : ");
    console.log(session);
    console.log("--------------------------------------------------");

    // next step
    setStep(4);

    // server logs
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(session.id, 3, currentDate, []);
    }
  };

  const validStatements = async () => 
  {
    // console logs
    console.log("--------------------------------------------------");
    console.log("[SESSION] Validation des déclarations d'impacts directs");
    console.log("Données d'impacts : ");
    console.log(session.impactsData[selectedPeriod.periodKey]);
    console.log("Objet session : ");
    console.log(session);
    console.log("--------------------------------------------------");
    
    // next step
    setStep(5);

    // server logs
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(session.id, 4, currentDate, 
        session.validations[selectedPeriod.periodKey]);
    }
  };

  // Sections Views
  const buildSectionView = () => {
    const sections = [
      <StartSection 
        submit={initSession} 
      />,
      <AccountingImportSection 
        session={session}
        period={selectedPeriod}
        submit={validFinancialData} 
      />,
      <InitialStatesSection
        session={session}
        period={selectedPeriod}
        submit={validInitialStates}
        onReturn={() => setStep(1)}
      />,
      <ProvidersSection
        session={session}
        period={selectedPeriod}
        submit={validProviders}
      />,
      <DirectImpacts
        session={session}
        period={selectedPeriod}
        submit={validStatements}
      />,
      <Results
        session={session}
        period={selectedPeriod}
        goBack={() => setStep(4)}
        publish={() => setStep(6)}
      />,
      <PublishStatementSection 
        session={session}
      />,
    ];

    return sections[step];
  };

  return (
    <>
      {/* Header */}

      {step > 0 && step < 6 && (
        <HeaderSection
          step={step}
          stepMax={session.progression}
          setStep={updateStep}
          session={session}
        />
      )}
      {step == 6 && <HeaderPublish setStep={updateStep} session={session} />}

      {/* Sections */}

      <ErrorBoundary session={session}>{buildSectionView(step)}</ErrorBoundary>

      {/* Footer */}

      <Footer />
    </>
  );
}