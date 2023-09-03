// La Société Nouvelle

// React / Next
import React, { useState } from "react";

// Error Handler
import ErrorBoundary from "/src/utils/ErrorBoundary";

// Sections
import { StartSection } from "/src/components/sections/start/StartSection";
import AccountingImportSection from "/src/components/sections/accountingImport";
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
import { getCurrentDateString } from "./utils/Utils";

/* ------------------------------------------------------------------------------------- */
/* ---------------------------------------- APP ---------------------------------------- */
/* ------------------------------------------------------------------------------------- */

export const Metriz = () => {
  const [session, setSession] = useState({});
  const [step, setStep] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState();

  const currentDate = getCurrentDateString();

  const initSession = (newSession) => {
    console.log(newSession.progression);
    const initialStep =
      newSession.progression === 0 ? 1 : newSession.progression;
    const period = newSession.availablePeriods[0];

    setSession(newSession);
    setStep(initialStep);
    setSelectedPeriod(period);
  };

  const updateSelectedPeriod = (period) => {
    setSelectedPeriod(period);
  };

  // Validations
  const handleStep = (nextStep) => {
    setStep(nextStep);
  };

  const validImportedData = async () => {
    console.log("--------------------------------------------------");
    console.log("Ecritures comptables importées");
    console.log(session.financialData);

    // first year..
    // if (getAmountItems(session.financialData.immobilisations.concat(session.financialData.stocks).map(asset => asset.InitialState)) == 0) {
    //   setStep(1);
    //   updateProgression(1);
    // }

    let accountsShowed = session.financialData.immobilisations.concat(
      session.financialData.stocks
    );
    console.log(accountsShowed);

    if (accountsShowed.length > 0) {
      updateProgression(2);
    } else {
      updateProgression(3);
    }
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(session.id, 1, currentDate, []);
    }
  };

  const validInitialStates = async () => {
    updateProgression(3);

    if (process.env.NODE_ENV === "production") {
      await logUserProgress(session.id, 2, currentDate, []);
    }
  };

  const validProviders = async () => {
    let availablePeriods = session.availablePeriods;

    for (let period of availablePeriods) {
      session.updateFootprints(period);
    }

    updateProgression(4);

    if (process.env.NODE_ENV === "production") {
      await logUserProgress(session.id, 3, currentDate, []);
    }
  };

  const validStatements = async () => {
    updateProgression(5);

    const financialPeriod = session.financialPeriod.periodKey;
    if (process.env.NODE_ENV === "production") {
      await logUserProgress(
        session.id,
        4,
        currentDate,
        session.validations[financialPeriod]
      );
    }
  };

  const updateProgression = (nextStep) => {
    setStep(nextStep);
    setSession((prevSession) => ({
      ...prevSession,
      progression: Math.max(nextStep, prevSession.progression),
    }));
  };

  // Sections Views
  const buildSectionView = () => {
    const sections = [
      <StartSection submit={initSession} />,
      <AccountingImportSection session={session} submit={validImportedData} />,
      <InitialStatesSection
        session={session}
        period={selectedPeriod}
        submit={validInitialStates}
        onReturn={() => setStep(1)}
      />,
      <ProvidersSection
        session={session}
        submit={validProviders}
        period={selectedPeriod}
      />,
      <DirectImpacts
        session={session}
        submit={validStatements}
        period={selectedPeriod}
      />,
      <Results
        session={session}
        period={selectedPeriod}
        goBack={() => setStep(4)}
        publish={() => setStep(6)}
      />,
      <PublishStatementSection session={session} />,
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
          setStep={handleStep}
          session={session}
        />
      )}
      {step == 6 && <HeaderPublish setStep={handleStep} session={session} />}

      {/* Sections */}

      <ErrorBoundary session={session}>{buildSectionView(step)}</ErrorBoundary>

      {/* Footer */}

      <Footer />
    </>
  );
};
