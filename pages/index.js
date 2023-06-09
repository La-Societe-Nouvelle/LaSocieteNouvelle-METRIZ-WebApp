// La Société Nouvelle

// React / Next
import React from "react";
import Head from "next/head";
import { BrowserView, MobileView } from "react-device-detect";

// Objects
import { Session } from "/src/Session";

// Sections
import { StartSection } from "/components/sections/StartSection";
import ImportSection from "../components/sections/import/ImportSection";
import { InitialStatesSection } from "/components/sections/InitialStatesSection";
import { ProvidersSection } from "../components/sections/companies/ProvidersSection";
import StatementSection from "../components/sections/statements/StatementSection";
import { PublishStatementSection } from "../components/sections/PublishStatementSection";
import DirectImpacts from "../components/sections/statements";
import Results from "../components/sections/results";


// Others components
import { Header } from "/components/parts/headers/Header";
import { HeaderSection } from "../components/parts/headers/HeaderSection";
import { HeaderPublish } from "../components/parts/headers/HeaderPublish";

import { updateVersion } from "/src/version/updateVersion";
import { Footer } from "../components/parts/Footer";
import { Mobile } from "../components/Mobile";
import { DataUpdater } from "../components/popups/dataUpdater/DataUpdater";

/*   _________________________________________________________________________________________________________
 *  |                                                                                                         |
 *  |   _-_ _-_- -_-_                                                                                         |
 *  |   -\-_\/-_-_/_-                                                                                         |
 *  |    -|_ \  / '-                  ___   __   __ .  __  ___  __          __               __          __   |
 *  |    _-\_-|/  _ /    |     /\    |     |  | |   | |     |  |     |\  | |  | |  | \    / |   |   |   |     |
 *  |        ||    |     |    /__\   |---| |  | |   | |-    |  |-    | \ | |  | |  |  \  /  |-  |   |   |-    |
 *  |       _||_  /'\    |__ /    \   ___| |__| |__ | |__   |  |__   |  \| |__| |__|   \/   |__ |__ |__ |__   |
 *  |                                                                                                         |
 *  |                                                                             Let's change the world...   |
 *  |_________________________________________________________________________________________________________|
 */

/* -------------------------------------------------------------------------------------- */
/* ---------------------------------------- HOME ---------------------------------------- */
/* -------------------------------------------------------------------------------------- */

export default function Home() {
  return (
    <>
      <Head>
        <title>METRIZ by La Société Nouvelle</title>
        <meta
          name="description"
          content="Metriz est une application web libre et open source qui vous permet de faire le lien entre vos données comptables, les empreintes sociétales de vos fournisseurs et vos impacts directs."
        />
        <meta property="og:title" content="Metriz by La Société Nouvelle" />
        <meta
          property="og:description"
          content="Metriz est une application web libre et open source qui vous permet de faire le lien entre vos données comptables, les empreintes sociétales de vos fournisseurs et vos impacts directs."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://metriz.lasocietenouvelle.org"
        />
        <meta property="og:image" content="/metriz_illus.jpg" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BrowserView>
        <Metriz />
      </BrowserView>
      <MobileView>
        <Mobile />
      </MobileView>
    </>
  );
}

/* ------------------------------------------------------------------------------------- */
/* ---------------------------------------- APP ---------------------------------------- */
/* ------------------------------------------------------------------------------------- */

/** Notes :
 *    2 variables :
 *        - Session (données saisies) -> LegalUnit (données relatives à l'unité légale) / FinancialData (données comptables) / ImpactsData (données d'impacts)
 *        - step -> étape courante
 */

class Metriz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session: new Session(),
      step: 0,
      loading: false,
      needsUpdate: false,
    };
  }

  render() {
    const { step, session, needsUpdate } = this.state;

    return (
      <>
        <div
          className={step == 0 ? "wrapper bg-white" : "wrapper"}
          id="wrapper"
        >
          {step == 0 ? (
            <Header />
          ) : step == 6 ? (
            <HeaderPublish
              setStep={this.setStep}
              downloadSession={this.downloadSession}
            />
          ) : (
            <HeaderSection
              step={step}
              stepMax={session.progression}
              setStep={this.setStep}
              downloadSession={this.downloadSession}
            />
          )}

          {needsUpdate && (
            <DataUpdater
              session={session}
              downloadSession={this.downloadSession}
              updatePrevSession={this.updatePrevSession}
            ></DataUpdater>
          )}

          {this.buildSectionView(step)}
        </div>

        <Footer step={step} />
      </>
    );
  }

  // change session
  setStep = (nextStep) => this.setState({ step: nextStep });

  // download session (session -> JSON data)
  downloadSession = async () => {
    // build JSON
    const session = this.state.session;
    const fileName = session.legalUnit.siren
      ? "session-metriz-" +
        session.legalUnit.siren +
        "-" +
        session.financialPeriod.periodKey.slice(2)
      : "session-metriz-" +
        session.legalUnit.corporateName +
        "-" +
        session.financialPeriod.periodKey.slice(2); // To update
    const json = JSON.stringify(session);

    // build download link & activate
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    link.click();
  };
  // Update previous session with updated session
  updatePrevSession = (updatedSession) => {
    this.setState({
      session: updatedSession,
    });
  };
  // import session (JSON data -> session)
  loadPrevSession = async (file) => {
    this.setState({ loading: true });
    const reader = new FileReader();

    reader.onload = async () => {
      // text -> JSON
      const prevProps = await JSON.parse(reader.result);
      // update to current version
      await updateVersion(prevProps);
      // JSON -> session
      const session = new Session(prevProps);

      for (let period of session.availablePeriods) {
        await session.updateFootprints(period);
      }

      this.setState({
        session: session,
        step: session.progression,
        loading: false,
        needsUpdate: true,
      });
    };
    reader.readAsText(file);
  };

  /* ----- SECTION ----- */

  // ...redirect to the selected section
  buildSectionView = (step) => {
    const { session } = this.state;

    const sectionProps = {
      session: session,
    };

    switch (step) {
      case 0:
        return (
          <StartSection
            startNewSession={() => this.setStep(1)}
            loadPrevSession={this.loadPrevSession}
            isLoading={this.state.loading}
          />
        );
      case 1:
        return (
          <ImportSection {...sectionProps} submit={this.validImportedData} />
        );
      case 2:
        return (
          <InitialStatesSection
            {...sectionProps}
            submit={this.validInitialStates}
            return={() => this.setStep(1)}
          />
        );
      case 3:
        return (
          <ProvidersSection {...sectionProps} submit={this.validProviders} />
        );
      case 4:
        return(
          <DirectImpacts {...sectionProps} submit={this.validStatements}  />
        );
        // return (
        //   <StatementSection {...sectionProps} publish={() => this.setStep(5)} />
        // );
        case 5:
          return(
            <Results {...sectionProps}  publish={() => this.setStep(5)}/>
          );
      case 6:
        return (
          <PublishStatementSection
            {...sectionProps}
            return={() => this.setStep(4)}
          />
        );
    }
  };

  /* ----- PROGESSION ---- */

  validImportedData = async () => {
    console.log("--------------------------------------------------");
    console.log("Ecritures comptables importées");
    console.log(this.state.session.financialData);

    // first year..
    // if (getAmountItems(this.state.session.financialData.immobilisations.concat(this.state.session.financialData.stocks).map(asset => asset.InitialState)) == 0) {
    //   this.state.session.progression++;
    // }

    let accountsShowed = this.state.session.financialData.immobilisations.concat(this.state.session.financialData.stocks);
    if (accountsShowed.length>0) {
      this.setStep(2);
      this.updateProgression(1);
    } else {
      this.setStep(3);
      this.updateProgression(2);
    }

  };

  validInitialStates = async () => {
    console.log("--------------------------------------------------");
    console.log("Empreintes des stocks et immobilisations initialisées");

    this.setStep(3);
    this.updateProgression(2);
  };

  validProviders = async () => {
    console.log("--------------------------------------------------");
    console.log("Empreintes des fournisseurs récupérées");

    let availablePeriods = this.state.session.availablePeriods;
    for (let period of availablePeriods) {
      this.state.session.updateFootprints(period);
    }

    this.setStep(4);
    this.updateProgression(3);
  };
  validStatements = async () => {
    console.log("--------------------------------------------------");
    console.log("Indicateurs déclarés");

    this.setStep(5);
    this.updateProgression(4);
  };


  updateProgression = (step) => {
    this.state.session.progression = Math.max(
      step + 1,
      this.state.session.progression
    );
  };
}
