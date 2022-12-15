// La Société Nouvelle

// React

import React from "react";
import { Button, Col, Container, Image, Row } from "react-bootstrap";
import { Loader } from "../popups/Loader";

/* ------------------------------------------------------- */
/* -------------------- START SECTION -------------------- */
/* ------------------------------------------------------- */

export class StartSection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="pb-5">
        {this.props.isLoading && <Loader />}
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
        <div className="mb-5 mt-5 pt-5 pb-3 ">
          <Container fluid>
            <Row>
              <Col>
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
                    d’activité et, si vous le souhaitez, <b>valoriser votre empreinte</b> en la publiant au sein de notre base de
                    données ouverte.
                  </p>
                  <div className="mt-5">
                    <Button
                      variant="secondary"
                      className="me-2"
                      onClick={this.props.startNewSession}
                    >
                      Nouvelle analyse
                    </Button>

                    <a
                      className="btn btn-primary"
                      href="https://docs.lasocietenouvelle.org/application-web/tutorial"
                      target="_blank"
                    >
                      Guide d'utilisation
                    </a>
                    <span className="vertical-lign"></span>
                    <Button
                      variant="outline-primary"
                      onClick={this.triggerImportFile}
                    >
                      Reprendre une session
                    </Button>

                    <input
                      id="import-session"
                      type="file"
                      accept=".json"
                      onChange={this.importFile}
                      visibility="collapse"
                    />
                  </div>
                </div>
              </Col>
              <Col>
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

  triggerImportFile = () => {
    document.getElementById("import-session").click();
  };
  importFile = (event) => {
    this.props.loadPrevSession(event.target.files[0]);
  };
}
