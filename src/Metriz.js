// La Société Nouvelle

// React / Next
import React, { useState } from "react";

// Error Handler
import ErrorBoundary from "/src/utils/ErrorBoundary";

// Sections
import { StartSection } from "/src/components/sections/StartSection";
import AccountingImportSection from "/src/components/sections/accountingImport";
import { InitialStatesSection } from "/src/components/sections/initialStates";
import ProvidersSection  from "/src/components/sections/providers";
import DirectImpacts from "/src/components/sections/statements";
import Results from "/src/components/sections/results";
import PublishStatementSection from "/src/components/sections/publishStatement";

// Others components
import { Header } from "/src/components/parts/headers/Header";
import { HeaderSection } from "/src/components/parts/headers/HeaderSection";
import { HeaderPublish } from "/src/components/parts/headers/HeaderPublish";
import { Footer } from "/src/components/parts/Footer";

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
  const currentDate = getCurrentDateString();
  
  const initSession = (newSession) => {

    const initialStep = newSession.progression === 0 ? 1 : newSession.progression;

    setSession(newSession);
    setStep(initialStep);
  };


  const buildSectionView = () => {
    const sections = [
      <StartSection submit={initSession}  />,
      <AccountingImportSection session={session} submit={validImportedData} />,
      <InitialStatesSection
        session={session}
        submit={validInitialStates}
        onReturn={() => setStep(1)}
      />,
      <ProvidersSection session={session} submit={validProviders} />,
      <DirectImpacts session={session} submit={validStatements} />,
      <Results
        session={session}
        goBack={() => setStep(4)}
        publish={() => setStep(6)}
      />,
      <PublishStatementSection session={session} />,
    ];

    return sections[step];
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


  return (
    <>
      {step == 0 ? (
        <Header />
      ) : step == 6 ? (
        <HeaderPublish setStep={() => setStep(step)} session={session} />
      ) : (
        <HeaderSection
          step={step}
          stepMax={session.progression}
          setStep={() => setStep(step)}
          session={session}
        />
      )}
      <ErrorBoundary session={session}>{buildSectionView(step)}</ErrorBoundary>
      <Footer />
    </>
  );
};
