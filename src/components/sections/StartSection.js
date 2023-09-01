// La Société Nouvelle

// React
import React, { useState } from "react";
import { Button, Col, Container, Image, Row } from "react-bootstrap";

// Modals
import { Loader } from "../modals/Loader";

// Objects
import { Session } from "/src/Session";

/* ------------------------------------------------------- */
/* -------------------- START SECTION -------------------- */
/* ------------------------------------------------------- */

/** 2 options :
 *    -> Start : create new object session
 *    -> Resume : load previous session & show updater (to fecth last available data)
 * 
 *  Props :
 *    submit : return session to Metriz (new session or loaded session from backupfile)
 */

export const StartSection = ({
  submit
}) => {

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDataUpdater, setShowDataUpdater] = useState(false);

  // Start new session

  const startNewSession = () => {
    const session = new Session();
    submit(session);

    // Public logs
    console.log("--------------------------------------------------");
    console.log("Initialisation d'une nouvelle session");
    console.log(session);
  };

  // Import session

  const triggerImportFile = () => {
    document.getElementById("import-session").click();
  };

  const importFile = (event) => {
    loadSessionFile(event.target.files[0]);
  };

  const loadSessionFile = async (file) => 
  {
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async () => 
    {
      // Public logs
      console.log("--------------------------------------------------");
      console.log("chargement d'une session précédente");

      // text -> JSON
      const sessionProps = await JSON.parse(reader.result);

      // Public logs
      console.log("Session (contenu brut) : ")
      console.log(session);

      // update to current version
      await updateVersion(sessionProps);

      // JSON -> session
      const session = new Session(sessionProps);

      // re-compute footprints
      for (let period of session.availablePeriods) {
        await session.updateFootprints(period);
      }

      // Public logs
      console.log("Session (après actualisation des empreintes) : ")
      console.log(session);

      setSession(session);
      setIsLoading(false);
      setShowDataUpdater(true); // -> switch to data updater modals
    };
    reader.readAsText(file);
  };

  const loadUpdatedSession = (updatedSession) => {
    setSession(updatedSession);
    setShowDataUpdater(false);
    submit(updatedSession);

    // Public logs
    console.log("Session (après actualisation des données) : ")
    console.log(updatedSession);
  }


  return (
    <div className="pb-5">
      {isLoading && <Loader title={"Récupération des données..."}/>}
      {showDataUpdater && 
        <DataUpdater
          session={session}
          updatePrevSession={loadUpdatedSession}
        />}
      <div className="mb-5">
        <Container fluid>
          <div className="w-50 m-auto">
            <h1 className="text-center mb-0">
              Bienvenue sur l’application Web METRIZ
            </h1>
            <p className="text-end">par La Société Nouvelle</p>
          </div>
        </Container>
      </div>
      <div className="mb-5 mt-5 py-5 ">
        <Container fluid>
          <Row>
            <Col lg={{ span: 6, order: 1 }} sm={{ span: 12, order: 2 }}>
              <div className="ps-5">
                <h2 className=" mb-4">
                  Mesurez <b>l’empreinte sociétale</b> de votre entreprise
                </h2>
                <p>
                  Cette application <b>libre et open source</b> vous permet de
                  faire le lien entre vos données comptables, les empreintes
                  sociétales de vos fournisseurs et vos impacts directs.
                </p>
                <p>
                  Vous pouvez <b>comparer vos résultats</b> avec votre branche
                  d'activité et, si vous le souhaitez, <b>valoriser votre empreinte</b> en la publiant au sein de notre base de
                  données ouverte.
                </p>
                <div className="mt-5">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={startNewSession}
                  >
                    Nouvelle analyse
                  </Button>

                  <Button
                    variant="primary"
                    href="https://docs.lasocietenouvelle.org/application-web/tutorial"
                    target="_blank"
                  >
                    Guide d'utilisation
                  </Button>
                  <span className="vertical-lign"></span>
                  <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={triggerImportFile}
                  >
                    Reprendre une session
                  </Button>

                  <input
                    id="import-session"
                    type="file"
                    accept=".json"
                    onChange={importFile}
                    visibility="collapse"
                  />
                </div>
              </div>
            </Col>
            <Col lg={{ span: 6, order: 2 }} sm={{ span: 12, order: 1 }}>
            <div className="text-end pe-5">
                <Image
                  className="w-75"
                  fluid
                  src="/resources/metriz_illus.svg"
                  alt="Illustration Metriz"
                />
            </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="px-5">
        <Container fluid>
          <Row>
            <Col>
              <div className="text-center border p-4  illu-box ">
                <Image
                  fluid
                  src="/resources/open-source.svg"
                  alt="Icone open source"
                />
                <h3>Code source ouvert</h3>
                <p>
                  Le code source est ouvert, vous pouvez y accéder
                  via notre répertoire GitHub
                </p>
              </div>
            </Col>
            <Col>
              <div className="text-center border  p-4  illu-box ">
                <Image
                  fluid
                  src="/resources/loupe.svg"
                  alt="Icone Methodo "
                />
                <h3>Méthodologie publique</h3>
                <p>
                  La méthodologie est publique et accessible en ligne pour les
                  curieux et les experts
                </p>
              </div>
            </Col>
            <Col>
              <div className="text-center border  p-4  illu-box ">
                <Image
                  fluid
                  src="/resources/coop.svg"
                  alt="Icone Contribution"
                />
                <h3>Contribution bienvenue</h3>
                <p>
                  Une idée ? Une correction ? Une remarque ? Toute
                  contribution est la bienvenue
                </p>
              </div>
            </Col>

            <Col>
              <div className="text-center border  p-4  illu-box ">
                <Image
                  fluid
                  src="/resources/version.svg"
                  alt="Icone Versions spécifique"
                />
                <h3>Des besoins spécifiques?</h3>
                <p>
                  Contactez-nous pour bénéficier d'une version plus adaptée à 
                  vos activités
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}