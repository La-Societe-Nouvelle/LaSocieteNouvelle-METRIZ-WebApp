import React, { useEffect, useState } from "react";
import {
  Container,
  FormSelect,
  Accordion,
  useAccordionButton,
  Card,
  Button,
} from "react-bootstrap";

// Libraries
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";
import {
  StatementART,
  StatementDIS,
  StatementECO,
  StatementGEQ,
  StatementGHG,
  StatementHAZ,
  StatementKNW,
  StatementMAT,
  StatementNRG,
  StatementSOC,
  StatementWAS,
  StatementWAT,
} from "./indics";

import { AssessmentDIS } from "/components/assessments/AssessmentDIS";

export default function AssesmentSection(props) {
  return (
    <Container fluid className="indicator-section">
      <section className="step">
        <div className="section-title">
          <h2>
            <i className="bi bi-rulers"></i> &Eacute;tape 4 - Déclaration des impacts
          </h2>
          <p>
            Pour chaque indicateur, déclarez vos impacts directs et obtenez les
            éléments d'analyse.
          </p>

          <Indicators
            impactsData={props.session.impactsData}
            session={props.session}
          />
        </div>
      </section>
    </Container>
  );
}

const Indicators = (props) => {
  const [validations, SetValidations] = useState(props.session.validations);
  const [popUp, displayPopup] = useState();

  useEffect(() => {
    console.log(validations);
    console.log("changed");
  }, [validations]); /* ----- CHANGE/VALIDATION HANDLER ----- */

  // check if net value indicator will change with new value & cancel value if necessary
  const willNetValueAddedIndicator = async (indic) => {
    // get new value
    let nextIndicator = props.session.getNetValueAddedIndicator(indic);

    if (
      nextIndicator !==
      props.session.financialData.aggregates.netValueAdded.footprint.indicators[
        indic
      ]
    ) {
      // remove validation
      props.session.validations = props.session.validations.filter(
        (item) => item != indic
      );
      // update footprint
      await props.session.updateIndicator(indic);
    }
  };

  const validateIndicator = async (indic) => {
    console.log(indic);
    console.log(validations);
    if (!validations.includes(indic)) {
      SetValidations((validations) => [...validations, indic]);
    }
    // add validation
    if (!props.session.validations.includes(indic)) {
    }
    props.session.validations.push(indic);
    // update footprint
    await props.session.updateIndicator(indic);
  };

  /* ----- POP-UP ----- */
  const triggerPopup = (indic) => {
    console.log(indic);
    displayPopup(indic);
  };

  return (
    <>
      <h3> Création de la valeur</h3>

      <Accordion>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("eco") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["eco"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="eco">
                  <i className="bi bi-arrow-down"></i> Déclarer 
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("eco") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="eco">
            <Card.Body>
              <p>
                <a
                  className="btn btn-outline-primary btn-sm mb-3"
                  href="https://docs.lasocietenouvelle.org/application-web/declarations/declaration-eco"
                  target="_blank"
                >
                  <i className="bi bi-info-lg"></i> Information sur l'indicateur
                </a>
              </p>
              <StatementECO
                indic={"eco"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("eco")}
                onValidate={() => validateIndicator("eco")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("art") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["art"].libelle}
                <span className="beta ms-1">BETA</span>
              </div>
              <div>
                <CustomToggle eventKey="art">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("art") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("art") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="art">
            <Card.Body>
              <p>
                <a
                  className="btn btn-outline-primary btn-sm mb-3"
                  href="https://docs.lasocietenouvelle.org/application-web/declarations/declaration-art"
                  target="_blank"
                >
                  <i className="bi bi-info-lg"></i> Information sur l'indicateur
                </a>
              </p>
              <StatementART
                indic={"art"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("art")}
                onValidate={() => validateIndicator("art")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("soc") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["soc"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="soc">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("soc") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("soc") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="soc">
            <Card.Body>
              <p>
                <a
                  className="btn btn-outline-primary btn-sm mb-3"
                  href="https://docs.lasocietenouvelle.org/application-web/declarations/declaration-soc"
                  target="_blank"
                >
                  <i className="bi bi-info-lg"></i> Information
                </a>
              </p>
              <StatementSOC
                indic={"soc"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("soc")}
                onValidate={() => validateIndicator("soc")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <h3>Empreinte sociale</h3>

      <Accordion>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("dis") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["dis"].libelle}{" "}
                <span className="beta ms-1">BETA</span>
              </div>
              <div>
                <CustomToggle eventKey="dis">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("dis") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("dis") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="dis">
            <Card.Body>
              <StatementDIS
                indic={"dis"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
                toAssessment={() => triggerPopup("dis")}
              />

              {popUp && popUp == "dis" && (
                <div className="modal-overlay">
                  <div className="modal-wrapper">
                    <div className="modal">
                      <AssessmentDIS
                        indic={"dis"}
                        impactsData={props.impactsData}
                        onUpdate={willNetValueAddedIndicator.bind("dis")}
                        onValidate={() => validateIndicator("dis")}
                        onGoBack={() => triggerPopup("")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("geq") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["geq"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="geq">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("geq") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("geq") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="geq">
            <Card.Body>
              <StatementGEQ
                indic={"geq"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("knw") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["knw"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="knw">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("knw") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("knw") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="knw">
            <Card.Body>
              <StatementKNW
                indic={"knw"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <h3>Empreinte environnementale</h3>

      <Accordion>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("ghg") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["ghg"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="ghg">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("ghg") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("ghg") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="ghg">
            <Card.Body>
              <StatementGHG
                indic={"ghg"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("nrg") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["nrg"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="nrg">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("nrg") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("nrg") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="nrg">
            <Card.Body>
              <StatementNRG
                indic={"nrg"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("wat") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["wat"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="wat">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("wat") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("wat") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="wat">
            <Card.Body>
              <StatementWAT
                indic={"wat"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("mat") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["mat"].libelle}{" "}
                <span className="beta ms-1">BETA</span>
              </div>
              <div>
                <CustomToggle eventKey="mat">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("mat") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("mat") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="mat">
            <Card.Body>
              <StatementMAT
                indic={"mat"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("was") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["was"].libelle}
              </div>
              <div>
                <CustomToggle eventKey="was">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("was") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("was") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="was">
            <Card.Body>
              <StatementWAS
                indic={"was"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>

        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {validations.includes("haz") && (
                  <i className="bi bi-check-circle-fill icon-success"></i>
                )}
                {metaIndics["haz"].libelle}{" "}
                <span className="beta ms-1">BETA</span>
              </div>
              <div>
                <CustomToggle eventKey="haz">
                  <i className="bi bi-pencil"></i>{" "}
                  {validations.includes("haz") ? "Modifier" : "Déclarer"}
                </CustomToggle>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("haz") ? false : true}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="haz">
            <Card.Body>
              <StatementHAZ
                indic={"haz"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind(this)}
                onValidate={validateIndicator.bind(this)}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <h3>Export des résultats</h3>
    </>
  );
};

function CustomToggle({ children, eventKey }) {
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    console.log("totally custom!")
  );

  return (
    <button
      className="btn btn-sm btn-secondary"
      onClick={decoratedOnClick}
    >
      {children}
    </button>
  );
}
