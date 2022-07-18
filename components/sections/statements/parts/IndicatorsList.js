import React, { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContext,
  Card,
  Modal,
  useAccordionButton,
} from "react-bootstrap";
import { exportIndicPDF } from "../../../../src/writers/Export";
import { GraphsPDF } from "../../../graphs/GraphsPDF";
import {
  StatementART,
  StatementDIS,
  StatementECO,
  StatementGEQ,
  StatementGHG,
  StatementKNW,
  StatementMAT,
  StatementNRG,
  StatementSOC,
  StatementWAT,
} from "../forms";
import metaIndics from "/lib/indics";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

import { AssessmentDIS } from "/components/assessments/AssessmentDIS";
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentGHG } from "/components/assessments/AssessmentGHG";
import ChangeDivision from "../../../popups/ChangeDivision";

const IndicatorsList = (props) => {
  const [validations, SetValidations] = useState(props.session.validations);
  const [popUp, setPopUp] = useState();
  const [comparativeDivision, setComparativeDivision] = useState();
  const [indicToExport, setIndicToExport] = useState();
  const [productionSectorFootprint, setProductionSectorFootprint] = useState(
    new SocialFootprint()
  );
  const [valueAddedSectorFootprint, setValueAddedSectorFootPrint] = useState(
    new SocialFootprint()
  );
  const [consumptionSectorFootprint, setConsumptionSectorFootPrint] = useState(
    new SocialFootprint()
  );

  useEffect(async () => {
    
    if (comparativeDivision != "00") {
      let productionSectorFootprint = await fetchDivisionData(
        comparativeDivision,
        "PRD"
      );
      let valueAddedSectorFootprint = await fetchDivisionData(
        comparativeDivision,
        "GVA"
      );
      let consumptionSectorFootprint = await fetchDivisionData(
        comparativeDivision,
        "IC"
      );

      setProductionSectorFootprint(productionSectorFootprint);
      setValueAddedSectorFootPrint(valueAddedSectorFootprint);
      setConsumptionSectorFootPrint(consumptionSectorFootprint);

      props.session.comparativeDivision = comparativeDivision;
    } else {
      setProductionSectorFootprint(new SocialFootprint());
      setValueAddedSectorFootPrint(new SocialFootprint());
      setConsumptionSectorFootPrint(new SocialFootprint());
    }
  }, [comparativeDivision, validations]);

  /* ----- POP-UP ----- */

  const triggerPopup = (indic) => {
    setPopUp(indic);
  };

  const handleClose = () => setPopUp("");

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
      SetValidations(validations.filter(
        (item) => item != indic
      ))
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

  const valueCreation = ["eco", "art", "soc"];
  const socialFootprint = ["dis", "geq", "knw"];
  const environmentalFootprint = ["ghg", "nrg", "wat", "mat", "was", "haz"];

  const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2";

  const fetchDivisionData = async (division, flow) => {
    let endpoint;
    let response;
    let data;

    // comparative data
    let footprint = new SocialFootprint();

    endpoint =
      apiBaseUrl +
      "/default?" +
      "area=FRA" +
      "&activity=" +
      division +
      "&flow=" +
      flow;
    response = await fetch(endpoint, { method: "get" });
    data = await response.json();
    if (data.header.statut == 200) footprint.updateAll(data.empreinteSocietale);

    return footprint;
  };

  const updateDivision = (division) => {
    setComparativeDivision(division);
  };
  const handleDownloadPDF = async (key, comparativeDivision) => {
    
    if (!comparativeDivision) {
      setIndicToExport(key);
      setPopUp("division");
    } else {

      exportIndicPDF(
        key,
        props.session,
        comparativeDivision,
        "#print-Production-" + key,
        "#print-Consumption-" + key,
        "#print-Value-" + key,
        environmentalFootprint.includes(key) ? "#piechart-" + key : ""
      );
      setPopUp("");
    }
  };
  return (
    <>
      {validations.length > 0 &&
        validations.map((indic, key) => (
          <GraphsPDF
            key={key}
            session={props.session}
            indic={indic}
            comparativeFootprints={props.comparativeFootprints}
            productionSectorFootprint={productionSectorFootprint}
            valueAddedSectorFootprint={valueAddedSectorFootprint}
            consumptionSectorFootprint={consumptionSectorFootprint}
          />
        ))}
      {popUp == "division" && (
        <ChangeDivision
          indic={indicToExport}
          session={props.session}
          handleDivision={updateDivision}
          onGoBack={handleClose}
          handleClose={handleClose}
          handleDownload={handleDownloadPDF}
        ></ChangeDivision>
      )}
      <h3> Création de la valeur</h3>

      <Accordion>
        {Object.entries(metaIndics)
          .filter((indic) => indic.some((el) => valueCreation.includes(el)))
          .map(([key, value]) => (
            <Card key={key}>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <ArrowToggle eventKey={key}>
                      {value.libelle}
                      {value.isBeta && <span className="beta ms-1">BETA</span>}
                    </ArrowToggle>
                  </div>
                  <div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={validations.includes(key) ? false : true}
                      onClick={() => props.viewResult(key)}
                    >
                      <i className="bi bi-clipboard-data"></i> Résultats
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={validations.includes(key) ? false : true}
                      onClick={() =>
                        handleDownloadPDF(key, comparativeDivision)
                      }
                    >
                      <i className="bi bi-download"></i> Livrable
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Accordion.Collapse eventKey={key}>
                <Card.Body>
                  {(() => {
                    switch (key) {
                      case "eco":
                        return (
                          <StatementECO
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("eco")}
                            onValidate={() => validateIndicator("eco")}
                          />
                        );
                      case "art":
                        return (
                          <StatementART
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("art")}
                            onValidate={() => validateIndicator("art")}
                          />
                        );
                      case "soc":
                        return (
                          <StatementSOC
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("soc")}
                            onValidate={() => validateIndicator("soc")}
                          />
                        );

                      default:
                        return <div></div>;
                    }
                  })()}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          ))}
      </Accordion>

      <h3> Empreinte sociale</h3>

      <Accordion>
        {Object.entries(metaIndics)
          .filter((indic) => indic.some((el) => socialFootprint.includes(el)))
          .map(([key, value]) => (
            <Card key={key}>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <ArrowToggle eventKey={key}>
                      {value.libelle}
                      {value.isBeta && <span className="beta ms-1">BETA</span>}
                    </ArrowToggle>
                  </div>
                  <div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={validations.includes(key) ? false : true}
                      onClick={() => props.viewResult(key)}
                    >
                      <i className="bi bi-clipboard-data"></i> Résultats
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={validations.includes(key) ? false : true}
                      onClick={() =>
                        handleDownloadPDF(key, comparativeDivision)
                      }
                    >
                      <i className="bi bi-download"></i> Livrable
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Accordion.Collapse eventKey={key}>
                <Card.Body>
                  {(() => {
                    switch (key) {
                      case "dis":
                        return (
                          <>
                            <StatementDIS
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
                          </>
                        );
                      case "geq":
                        return (
                          <>
                            <StatementGEQ
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
                          </>
                        );
                      case "knw":
                        return (
                          <>
                            <StatementKNW
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
                          </>
                        );

                      default:
                        return <div></div>;
                    }
                  })()}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          ))}
      </Accordion>

      <h3>Empreinte environnementale</h3>

      <Accordion>
        {Object.entries(metaIndics)
          .filter((indic) =>
            indic.some((el) => environmentalFootprint.includes(el))
          )
          .map(([key, value]) => (
            <Card key={key}>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <ArrowToggle eventKey={key}>
                      {value.libelle}
                      {value.isBeta && <span className="beta ms-1">BETA</span>}
                    </ArrowToggle>
                  </div>
                  <div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={validations.includes(key) ? false : true}
                      onClick={() => props.viewResult(key)}
                    >
                      <i className="bi bi-clipboard-data"></i> Résultats
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={validations.includes(key) ? false : true}
                      onClick={() =>
                        handleDownloadPDF(key, comparativeDivision)
                      }
                    >
                      <i className="bi bi-download"></i> Livrable
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Accordion.Collapse eventKey={key}>
                <Card.Body>
                  {(() => {
                    switch (key) {
                      case "ghg":
                        return (
                          <>
                            <StatementGHG
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("ghg")}
                              onValidate={() => validateIndicator("ghg")}
                              toAssessment={() => triggerPopup("ghg")}
                            />
                            <ModalAssesment
                              indic="ghg"
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("ghg")}
                              onValidate={() => validateIndicator("ghg")}
                              onGoBack={handleClose}
                              popUp={popUp}
                              handleClose={handleClose}
                              title="Outil de mesure des émissions"
                            />
                          </>
                        );
                      case "nrg":
                        return (
                          <>
                            <StatementNRG
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("nrg")}
                              onValidate={() => validateIndicator("nrg")}
                              toAssessment={() => triggerPopup("nrg")}
                            />
                            <ModalAssesment
                              indic="nrg"
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("nrg")}
                              onValidate={() => validateIndicator("nrg")}
                              onGoBack={handleClose}
                              popUp={popUp}
                              handleClose={handleClose}
                              title="Outil de mesure des énergies"
                            />
                          </>
                        );
                      case "wat":
                        return (
                          <>
                            <StatementWAT
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("wat")}
                              onValidate={() => validateIndicator("wat")}
                            />
                          </>
                        );
                      case "mat":
                        return (
                          <StatementMAT
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("mat")}
                            onValidate={() => validateIndicator("mat")}
                          />
                        );
                      case "was":
                        return (
                          <StatementMAT
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("was")}
                            onValidate={() => validateIndicator("was")}
                          />
                        );
                      case "haz":
                        return (
                          <StatementMAT
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("haz")}
                            onValidate={() => validateIndicator("haz")}
                          />
                        );
                      default:
                        return <div></div>;
                    }
                  })()}
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          ))}
      </Accordion>
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
      )}
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
      fullscreen
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
export default IndicatorsList;
