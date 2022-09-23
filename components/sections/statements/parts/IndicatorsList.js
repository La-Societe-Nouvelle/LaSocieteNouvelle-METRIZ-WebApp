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
  StatementHAZ,
  StatementKNW,
  StatementMAT,
  StatementNRG,
  StatementSOC,
  StatementWAS,
  StatementWAT,
} from "../forms";
import metaIndics from "/lib/indics";
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

import { AssessmentDIS } from "/components/assessments/AssessmentDIS";
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentGHG } from "/components/assessments/AssessmentGHG";
import ChangeDivision from "../../../popups/ChangeDivision";
import api from "../../../../src/api";
import axios from "axios";

const IndicatorsList = (props) => {
  const [validations, SetValidations] = useState(props.session.validations);
  const [updatedIndic, setUpdatedIndic] = useState("");
  const [popUp, setPopUp] = useState();
  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeDivision
  );
  const [indicToExport, setIndicToExport] = useState();

  const [comparativeFootprints, setComparativeFootprints] = useState();
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

  
    // SET ALL SECTORS FOOTPRINTS
    setComparativeFootprints(props.allSectorsFootprints);

    // SET COMPARATIVE DIVISIONS  FOOTPRINTS
    fetchComparativeDivision();

    if (validations.length > 0) {
      props.publish();
    }
  }, [validations, comparativeDivision]);

  // SET COMPARATIVE DIVISIONS  FOOTPRINTS

  const fetchComparativeDivision = async () => {

    const getValueAdded = api.get(
      "defaultfootprint/?code=" +
        comparativeDivision +
        "&aggregate=GVA&area=FRA"
    );
    const getProduction = api.get(
      "defaultfootprint/?code=" +
        comparativeDivision +
        "&aggregate=PRD&area=FRA"
    );
    const getConsumption = api.get(
      "defaultfootprint/?code=" + comparativeDivision + "&aggregate=IC&area=FRA"
    );

    await axios
      .all([getValueAdded, getProduction, getConsumption])
      .then(
        axios.spread((...responses) => {
          const valueAdded = responses[0];
          const production = responses[1];
          const consumption = responses[2];

          if (valueAdded.data.header.code == 200) {
            let valueAddedFootprint = new SocialFootprint();
            valueAddedFootprint.updateAll(valueAdded.data.footprint);

            setValueAddedSectorFootPrint(valueAddedFootprint);
          }

          if (production.data.header.code == 200) {
            let productionFootprint = new SocialFootprint();
            productionFootprint.updateAll(production.data.footprint);

            setProductionSectorFootprint(productionFootprint);
          }

          if (consumption.data.header.code == 200) {
            let consumptionFootprint = new SocialFootprint();
            consumptionFootprint.updateAll(consumption.data.footprint);

            setConsumptionSectorFootPrint(consumptionFootprint);
          }
        })
      )
      .catch((errors) => {
        console.log(errors);
      });
  };
  /* ----- POP-UP ----- */

  const triggerPopup = (indic) => {
    setPopUp(indic);
  };

  const handleClose = () => setPopUp("");

  // check if net value indicator will change with new value & cancel value if necessary
  const willNetValueAddedIndicator = async (indic) => {
    setUpdatedIndic();

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
      SetValidations(validations.filter((item) => item != indic));
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

    setUpdatedIndic(indic);
  };

  const valueCreation = ["eco", "art", "soc"];
  const socialFootprint = ["dis", "geq", "knw"];
  const environmentalFootprint = ["ghg", "nrg", "wat", "mat", "was", "haz"];


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

  // Resusable Components

  const SuccessMessage = () => {
    return (
      <p className="mt-4 small-text alert alert-success">
        ✓ La déclaration des impacts a été mise à jour.
      </p>
    );
  };

  const IconWarning = () => {
    return (
      <span className="icon-warning" title="Informations à valider">
        <i className=" bi bi-exclamation-triangle me-0"></i>
      </span>
    );
  };

  return (
    <>

      {comparativeFootprints && validations.length > 0 &&
        validations.map((indic, key) => (
          <GraphsPDF
            key={key}
            financialData={props.session.financialData}
            indic={indic}
            comparativeFootprints={comparativeFootprints}
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

                  {updatedIndic && updatedIndic == key && <SuccessMessage />}
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
                  {updatedIndic && updatedIndic == key && <SuccessMessage />}
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
                      {key == "ghg" &&
                        props.impactsData.greenhousesGazEmissions != 0 &&
                        !validations.includes(key) && <IconWarning />}
                      {key == "nrg" &&
                        props.impactsData.energyConsumption != 0 &&
                        !validations.includes(key) && <IconWarning />}
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
                          <StatementWAS
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("was")}
                            onValidate={() => validateIndicator("was")}
                          />
                        );
                      case "haz":
                        return (
                          <StatementHAZ
                            impactsData={props.impactsData}
                            onUpdate={willNetValueAddedIndicator.bind("haz")}
                            onValidate={() => validateIndicator("haz")}
                          />
                        );
                      default:
                        return <div></div>;
                    }
                  })()}
                  {updatedIndic && updatedIndic == key && <SuccessMessage />}
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
