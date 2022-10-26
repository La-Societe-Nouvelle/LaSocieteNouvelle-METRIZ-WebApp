// La Société Nouvelle

// React / Next
import React from 'react';
import Head from 'next/head';
import {BrowserView, MobileView} from 'react-device-detect';

// Objects
import { Session } from '/src/Session';

// Sections 
import { StartSection } from '/components/sections/StartSection';
import ImportSection from '../components/sections/import/ImportSection';
import { InitialStatesSection } from '/components/sections/InitialStatesSection';
import { CompaniesSection } from '/components/sections/companies/CompaniesSection';
import StatementSection from '../components/sections/statements/StatementSection';
import { PublishStatementSection } from '../components/sections/PublishStatementSection';

// Others components
import { Header } from '/components/parts/headers/Header';
import { HeaderSection } from '../components/parts/headers/HeaderSection';
import { HeaderPublish } from '../components/parts/headers/HeaderPublish';

import { getPrevAmountItems } from '/src/utils/Utils';
import { updateVersion } from '/src/version/updateVersion';
import { Footer } from '../components/parts/Footer';
import { Mobile} from '../components/Mobile'

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
        <meta name="description" content="L'OpenData au service de l'économie" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <BrowserView>
         <Metriz />
      </BrowserView>
      <MobileView>
        <Mobile/>
      </MobileView>
    </>
  )
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
    this.state =
    {
      session: new Session(),
      step: 0
    }
  }

  render() {
    const { step, session } = this.state;
    return (
      <>
        <div className="wrapper" id="wrapper">
          {step == 0 ? (
            <Header />
          ) :
          step == 5 ? (
            <HeaderPublish setStep={this.setStep} downloadSession={this.downloadSession} />
          ) :
            (
              <HeaderSection step={step} stepMax={session.progression} setStep={this.setStep} downloadSession={this.downloadSession} />
            )
          }
          {this.buildSectionView(step)}
        </div>
        <Footer step={step} />
      </>
    )
  }

  // change session
  setStep = (nextStep) => this.setState({ step: nextStep });

  // download session (session -> JSON data)
  downloadSession = async () => {
    // build JSON
    const session = this.state.session;
    const fileName = "svg_ese_" + session.legalUnit.siren; // To update
    const json = JSON.stringify(session);

    // build download link & activate
    const blob = new Blob([json], { type: 'application/json' });
    const href =  URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + ".json";
    link.click();
  }

  // import session (JSON data -> session)
  loadPrevSession = async(file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      // text -> JSON
      const prevProps = await JSON.parse(reader.result);
     
      // update to current version
      await updateVersion(prevProps);
      // JSON -> session
      const session =  new Session(prevProps);
      
      this.setState({
        session: session,
        step: session.progression,
        selectedSection: "legalData"
      })
    }
    reader.readAsText(file);
  }

  /* ----- SECTION ----- */

  // ...redirect to the selected section
  buildSectionView = (step) => {
    const { session } = this.state;

    const sectionProps = {
      session: session,
      submit: () => this.validStep(this.state.step),
    }



    switch (step) {
      case 0: return (<StartSection startNewSession={() => this.setStep(1)} loadPrevSession={this.loadPrevSession} />)
      case 1: return (<ImportSection {...sectionProps} />)
      case 2: return (<InitialStatesSection {...sectionProps} />)
      case 3: return (<CompaniesSection {...sectionProps} />)
      case 4: return (<StatementSection {...sectionProps} publish={() => this.setStep(5)} />)
      case 5: return (<PublishStatementSection {...sectionProps} return={() => this.setStep(4)} />)

    }
  }


  /* ----- PROGESSION ---- */


  validStep = (step) => 
  {
    // Increase progression
    this.state.session.progression = Math.max(step + 1, this.state.session.progression);

    // skip initial states if first year
    if (this.state.session.progression == 2 && getPrevAmountItems(this.state.session.financialData.immobilisations.concat(this.state.session.financialData.stocks)) == 0) {
      this.state.session.progression++;
    }

    // update current step
    this.setStep(this.state.session.progression);
  }

}