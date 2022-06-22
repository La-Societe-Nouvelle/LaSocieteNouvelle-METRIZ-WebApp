import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Accordion,
  useAccordionButton,
  Card,
  AccordionContext,
  Modal,
  Image,
} from "react-bootstrap";

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
import ResultSection from "./ResultSection";


const AssesmentSection = (props) => {


  const [view,setView] = useState("statement");
  const [indic, setIndic] = useState();

  const handleView = indic => {
    console.log(indic);
    setIndic(indic); 
    setView("result");
  } 


  

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
            />
          </>
        ) : (
        <ResultSection session={props.session} indic={indic} />
        )}
      </section>
    </Container>
  );
}

const Indicators = (props) => {
  const [validations, SetValidations] = useState(props.session.validations);
  const [popUp, setPopUp] = useState();

  useEffect(() => {
  }, [validations]);
  
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
                  onClick={()=>props.viewResult("eco")}
                  
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
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
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
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
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
                >
                  <i className="bi bi-clipboard-data"></i> Résultats
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
                  onClick={()=>props.viewResult("ghg")}
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
                onUpdate={willNetValueAddedIndicator.bind("haz")}
                onValidate={() => validateIndicator("haz")}
              />
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>

      <h3>Export des résultats</h3>
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
            // case "ghg":
            //   return <AssessmentGHG {...props} />;

            // case "nrg":
            //   return <AssessmentNRG {...props} />;
            default:
              return <div></div>;
          }
        })()}
      </Modal.Body>
    </Modal>
  );
}


export default AssesmentSection;
