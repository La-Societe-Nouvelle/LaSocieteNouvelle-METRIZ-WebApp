// La Société Nouvelle

// React
import { faBook, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Col, Container, Image, NavLink, Row } from "react-bootstrap";

/* ------------------------------------------------------- */
/* -------------------- START SECTION -------------------- */
/* ------------------------------------------------------- */

export class StartSection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container fluid id="start">
        <Row>
          <Col lg={7}>
            <section>
              <h1>
                Mesurez <span className="underline">l'empreinte sociétale</span>{" "}
                de votre entreprise en quelques clics.
              </h1>
              <p>
                Notre objectif est de vous permettre de{" "}
                <strong>mesurer l’empreinte la production</strong> de votre
                entreprise sur des enjeux{" "}
                <strong>majeurs de développement durable.</strong>
              </p>
              <Row id="section-picto">
                <Col>
                  <img
                    src="resources/pictos/sustainable.svg"
                    alt="Developpement durable"
                  />
                  <p>Développement durable</p>
                </Col>
                <Col>
                  <img
                    src="resources/pictos/performance.svg"
                    alt="Performance"
                  />
                  <p>Performance extra financière</p>
                </Col>
                <Col>
                  <img src="resources/pictos/compare.svg" alt="Comparaison" />
                  <p>Comparaison par rapport à votre secteur d’activité</p>
                </Col>
                <Col>
                  <img src="resources/pictos/goals.svg" alt="Engagement" />
                  <p>Engagements sociaux et environnementaux</p>
                </Col>
              </Row>
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={this.props.startNewSession}
                  >
                    Nouvelle analyse
                  </Button>

                  <a
                    className="btn btn-secondary"
                    href="https://docs.lasocietenouvelle.org"
                  >
                    Documentation
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
            </section>
          </Col>
          <Col lg={4}>
            <Image fluid src="/resources/team_working.png" alt="Team" />
          </Col>
        </Row>
      </Container>
    );
  }

  triggerImportFile = () => {
    document.getElementById("import-session").click();
  };
  importFile = (event) => {
    this.props.loadPrevSession(event.target.files[0]);
  };
}
