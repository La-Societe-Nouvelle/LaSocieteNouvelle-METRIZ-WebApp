import React, { useContext, useEffect, useState } from "react";
import {Container, Accordion, useAccordionButton,Card,AccordionContext,Modal, Button} from "react-bootstrap";

// Libraries
import metaIndics from "/lib/indics";

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
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentGHG } from "/components/assessments/AssessmentGHG";



import ResultSection from "./ResultSection";
import { downloadReport, exportFootprintPDF, exportIndicPDF } from "../../../src/writers/Export";
import { GraphsPDF } from "../../graphs/GraphsPDF";

import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

const AssesmentSection = (props) => {
  const [view, setView] = useState("statement");
  const [indic, setIndic] = useState();

  const [allSectorsProductionAreaFootprint, setAllSectorsProductionFootprint] =
    useState(new SocialFootprint());

  const [
    allSectorsValueAddedAreaFootprint,
    setAllSectorsValueAddedAreaFootprint,
  ] = useState(new SocialFootprint());
  const [allSectorsConsumptionFootprint, setAllSectorsConsumptionFootprint] =
    useState(new SocialFootprint());

  useEffect(() => {
    fetchEconomicAreaData("FRA", "GVA").then((footprint) =>
      setAllSectorsValueAddedAreaFootprint(footprint)
    );
    fetchEconomicAreaData("FRA", "PRD").then((footprint) =>
      setAllSectorsProductionFootprint(footprint)
    );
    fetchEconomicAreaData("FRA", "IC").then((footprint) =>
      setAllSectorsConsumptionFootprint(footprint)
    );
  }, []);

  const fetchEconomicAreaData = async (area, flow) => {
    let endpoint;
    let response;
    let data;

    // comparative data
    let footprint = new SocialFootprint();

    // Available production
    endpoint =
      apiBaseUrl +
      "/default?" +
      "area=" +
      area +
      "&activity=00" +
      "&flow=" +
      flow;
    response = await fetch(endpoint, { method: "get" });
    data = await response.json();
    if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);
    return footprint;
  };

  const handleView = (indic) => {
    setIndic(indic);
    setView("result");
  };

  return (
    <Container fluid className="indicator-section">
      <section className="step">
        {view == "statement" ? (
          <>
            <h2>
              <i className="bi bi-rulers"></i> &Eacute;tape 4 - Déclaration des
              impacts
            </h2>
            <p>
              Pour chaque indicateur, déclarez vos impacts directs et obtenez
              les éléments d'analyse.
            </p>
            <Indicators
              impactsData={props.session.impactsData}
              session={props.session}
              viewResult={handleView}
              comparativeFootprints={{
                allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
                allSectorsProductionAreaFootprint:
                  allSectorsProductionAreaFootprint,
                allSectorsValueAddedAreaFootprint:
                  allSectorsValueAddedAreaFootprint,
              }}
            />
          </>
        ) : (
          <ResultSection
            session={props.session}
            indic={indic}
            goBack={() => setView("statement")}
            comparativeFootprints={{
              allSectorsConsumptionFootprint: allSectorsConsumptionFootprint,
              allSectorsProductionAreaFootprint:
                allSectorsProductionAreaFootprint,
              allSectorsValueAddedAreaFootprint:
                allSectorsValueAddedAreaFootprint,
            }}
          />
        )}
      </section>
    </Container>
  );
};

const Indicators = (props) => {
  const [validations, SetValidations] = useState(props.session.validations);
  const [popUp, setPopUp] = useState();

  useEffect(() => {}, [validations]);

  /* ----- CHANGE/VALIDATION HANDLER ----- */

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
    setPopUp(indic);
  };

  const handleClose = () => setPopUp("");

  return (
    <>
      {validations.length > 0 && 
            validations.map((indic, key) => (
              <GraphsPDF
                key={key}
                session={props.session}
                indic={indic}
                comparativeFootprints={props.comparativeFootprints}
              />
            ))}

      <h3> Création de la valeur</h3>

      <Accordion>
        {/* --------------------------- ECO ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="eco">
                  {metaIndics["eco"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("eco") ? false : true}
                  onClick={() => props.viewResult("eco")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("eco") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "eco",
                      props.session,
                      "00",
                      "#print-Production-eco",
                      "#print-Consumption-eco",
                      "#print-Value-eco",
                      "#piechart-eco"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
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
        {/* --------------------------- ART ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="art">
                  {metaIndics["art"].libelle}
                  <span className="beta ms-1">BETA</span>
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("art") ? false : true}
                  onClick={() => props.viewResult("art")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("art") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "art",
                      props.session,
                      "00",
                      "#print-Production-art",
                      "#print-Consumption-art",
                      "#print-Value-art",
                      "#piechart-art"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
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
        {/* --------------------------- SOC ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="soc">
                  {metaIndics["soc"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("soc") ? false : true}
                  onClick={() => props.viewResult("soc")}
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
        {/* --------------------------- DIS ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="dis">
                  {metaIndics["dis"].libelle}{" "}
                  <span className="beta ms-1">BETA</span>
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("dis") ? false : true}
                  onClick={() => props.viewResult("dis")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("dis") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "dis",
                      props.session,
                      "00",
                      "#print-Production-dis",
                      "#print-Consumption-dis",
                      "#print-Value-dis",
                      "#piechart-dis"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="dis">
            <Card.Body>
              <StatementDIS
                indic="dis"
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("dis")}
                onValidate={() => validateIndicator("dis")}
                toAssessment={() => triggerPopup("dis")}
              />

              <ModalAssesment
                indic="dis"
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("dis")}
                onValidate={() => validateIndicator("dis")}
                onGoBack={handleClose}
                popUp={popUp}
                handleClose={handleClose}
                title="Données Sociales"
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        {/* --------------------------- GEQ ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="geq">
                  {metaIndics["geq"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("geq") ? false : true}
                  onClick={() => props.viewResult("geq")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("geq") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "geq",
                      props.session,
                      "00",
                      "#print-Production-geq",
                      "#print-Consumption-geq",
                      "#print-Value-geq",
                      "#piechart-geq"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="geq">
            <Card.Body>
              <StatementGEQ
                indic="geq"
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("geq")}
                onValidate={() => validateIndicator("geq")}
                toAssessment={() => triggerPopup("geq")}
              />

              <ModalAssesment
                indic="geq"
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("geq")}
                onValidate={() => validateIndicator("geq")}
                onGoBack={handleClose}
                popUp={popUp}
                handleClose={handleClose}
                title="Données Sociales"
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        {/* --------------------------- KNW ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="knw">
                  {metaIndics["knw"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("knw") ? false : true}
                  onClick={() => props.viewResult("knw")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("knw") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "knw",
                      props.session,
                      "00",
                      "#print-Production-knw",
                      "#print-Consumption-knw",
                      "#print-Value-knw",
                      "#piechart-knw"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="knw">
            <Card.Body>
              <StatementKNW
                indic="knw"
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("knw")}
                onValidate={() => validateIndicator("knw")}
                toAssessment={() => triggerPopup("knw")}
              />
              <ModalAssesment
                indic="knw"
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("knw")}
                onValidate={() => validateIndicator("knw")}
                popUp={popUp}
                onGoBack={handleClose}
                handleClose={handleClose}
                title="Outil de mesure"
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <h3>Empreinte environnementale</h3>

      <Accordion>
        {/* --------------------------- GHG ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="ghg">
                  {metaIndics["ghg"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("ghg") ? false : true}
                  onClick={() => props.viewResult("ghg")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("ghg") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "ghg",
                      props.session,
                      "00",
                      "#print-Production-ghg",
                      "#print-Consumption-ghg",
                      "#print-Value-ghg",
                      "#piechart-ghg"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="ghg">
            <Card.Body>
              <StatementGHG
                indic={"ghg"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("ghg")}
                onValidate={() => validateIndicator("ghg")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        {/* --------------------------- NRG ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="nrg">
                  {metaIndics["nrg"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("nrg") ? false : true}
                  onClick={() => props.viewResult("nrg")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("nrg") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "nrg",
                      props.session,
                      "00",
                      "#print-Production-nrg",
                      "#print-Consumption-nrg",
                      "#print-Value-nrg",
                      "#piechart-nrg"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="nrg">
            <Card.Body>
              <StatementNRG
                indic={"nrg"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("nrg")}
                onValidate={() => validateIndicator("nrg")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        {/* --------------------------- WAT ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="wat">
                  {metaIndics["wat"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("wat") ? false : true}
                  onClick={() => props.viewResult("wat")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("wat") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "wat",
                      props.session,
                      "00",
                      "#print-Production-wat",
                      "#print-Consumption-wat",
                      "#print-Value-wat",
                      "#piechart-wat"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="wat">
            <Card.Body>
              <StatementWAT
                indic={"wat"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("wat")}
                onValidate={() => validateIndicator("wat")}
              />
            </Card.Body>
          </Accordion.Collapse>
          {/* --------------------------- SOC ------------------------------------------*/}
        </Card>
        {/* --------------------------- MAT ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="mat">
                  {metaIndics["mat"].libelle}{" "}
                  <span className="beta ms-1">BETA</span>
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("mat") ? false : true}
                  onClick={() => props.viewResult("mat")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("mat") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "mat",
                      props.session,
                      "00",
                      "#print-Production-mat",
                      "#print-Consumption-mat",
                      "#print-Value-mat",
                      "#piechart-mat"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="mat">
            <Card.Body>
              <StatementMAT
                indic={"mat"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("mat")}
                onValidate={() => validateIndicator("mat")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        {/* --------------------------- WAS ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="was">
                  {metaIndics["was"].libelle}
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("was") ? false : true}
                  onClick={() => props.viewResult("was")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("was") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "was",
                      props.session,
                      "00",
                      "#print-Production-was",
                      "#print-Consumption-was",
                      "#print-Value-was",
                      "#piechart-was"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="was">
            <Card.Body>
              <StatementWAS
                indic={"was"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("was")}
                onValidate={() => validateIndicator("was")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        {/* --------------------------- HAZ ------------------------------------------*/}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <ArrowToggle eventKey="haz">
                  {metaIndics["haz"].libelle}{" "}
                  <span className="beta ms-1">BETA</span>
                </ArrowToggle>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={validations.includes("haz") ? false : true}
                  onClick={() => props.viewResult("haz")}
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={validations.includes("haz") ? false : true}
                  onClick={() =>
                    exportIndicPDF(
                      "haz",
                      props.session,
                      "00",
                      "#print-Production-haz",
                      "#print-Consumption-haz",
                      "#print-Value-haz",
                      "#piechart-haz"
                    )
                  }
                >
                  <i className="bi bi-download"></i> Livrable
                </button>
              </div>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey="haz">
            <Card.Body>
              <StatementHAZ
                indic={"haz"}
                impactsData={props.impactsData}
                onUpdate={willNetValueAddedIndicator.bind("haz")}
                onValidate={() => validateIndicator("haz")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <h3>Export des résultats</h3>

      <div className="flex">
              <p>
                Rapport sur l'empreinte sociétale
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportFootprintPDF(props.session)}
              >
                <i className="bi bi-download"></i> Télécharger
              </Button>
            </div>
            <div className="flex mt-2">
              <p>
               Dossier Complet : Ensemble des livrables et fichier de sauvegarde
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadReport(validations, props.session, "00")}
              >
                <i className="bi bi-download"></i> Télécharger
              </Button>
            </div>
    </>
  );
};

function ArrowToggle({ children, eventKey, callback }) {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey)
  );

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <button className="btn btn-link" onClick={decoratedOnClick}>
      {isCurrentEventKey ? (
        <i className="bi bi-chevron-up"></i>
      ) : (
        <i className="bi bi-chevron-down"></i>
      )}{" "}
      {children}
    </button>
  );
}

// Display the correct assessment view according to the indicator
function ModalAssesment(props) {
  return (
    <Modal
      show={props.popUp == props.indic}
      onHide={props.handleClose}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(() => {
          switch (props.indic) {
            case "dis":
              return <AssessmentDIS {...props} />;
            case "geq":
              return <AssessmentDIS {...props} />;
            case "knw":
              return <AssessmentKNW {...props} />;
            case "ghg":
               return <AssessmentGHG {...props} />;
             case "nrg":
              return <AssessmentNRG {...props} />;
            default:
              return <div></div>;
          }
        })()}
      </Modal.Body>
    </Modal>
  );
}

export default AssesmentSection;
