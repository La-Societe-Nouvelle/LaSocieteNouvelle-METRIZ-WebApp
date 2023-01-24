import React, { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContext,
  Card,
  Col,
  Modal,
  Row,
  useAccordionButton,
} from "react-bootstrap";

import {
  StatementART,
  StatementIDR,
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
import divisions from "/lib/divisions";

import { AssessmentDIS } from "/components/assessments/AssessmentDIS";
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentGHG } from "/components/assessments/AssessmentGHG";
import { ImportDSN } from "../../../assessments/ImportDSN";

import ChangeDivision from "../../../popups/ChangeDivision";

import ComparativeGraphs from "../../../graphs/ComparativeGraphs";
import PieGraph from "../../../graphs/PieGraph";

import { getTargetSerieId } from "/src/utils/Utils";
import { basicPDFReport } from "../../../../src/writers/deliverables/PDFGenerator";

import getSerieData from "/src/services/responses/SerieData";
import getMacroSerieData from "/src/services/responses/MacroSerieData";
import getHistoricalSerieData from "/src/services/responses/HistoricalSerieData";

const IndicatorsList = (props) => {
  
  const [prevIndics] = useState(props.session.indics);
  const [notAvailableIndics, setnotAvailableIndics] = useState([]);

  const [validations, SetValidations] = useState(props.session.validations);
  const [updatedIndic, setUpdatedIndic] = useState("");
  const [popUp, setPopUp] = useState();
  const [displayGraph, setDisplayGraph] = useState(true);
  const [indicToExport, setIndicToExport] = useState();

  const [comparativeData, setComparativeData] = useState(
    props.session.comparativeData
  );
  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeData.activityCode
  );
  useEffect(async () => {
    if (validations.length > 0) {
      props.publish();
    }
  }, [validations]);

  useEffect(() => {
    // return indics not included in available list of indicators
    const filteredIndics = Object.keys(metaIndics).filter(
      (key) => !prevIndics.includes(key)
    );
    if (filteredIndics.length > 0) {
      setnotAvailableIndics(filteredIndics);
    }
  }, []);

  const updateComparativeAreaData = async (indic) => {
    let idTarget = getTargetSerieId(indic);

    let newComparativeData = await getMacroSerieData(
      indic,
      "00",
      comparativeData,
      "areaFootprint"
    );

    // Target Area Footprint
    if (idTarget) {
      newComparativeData = await getSerieData(
        idTarget,
        "00",
        indic,
        newComparativeData,
        "targetAreaFootprint"
      );
    }

    return newComparativeData;
  };
  const updateComparativeDivisionData = async (
    indic,
    newComparativeData,
    comparativeDivision
  ) => {
    newComparativeData = await getMacroSerieData(
      indic,
      comparativeDivision,
      newComparativeData,
      "divisionFootprint"
    );
    newComparativeData = await getHistoricalSerieData(
      comparativeDivision,
      indic,
      newComparativeData,
      "trendsFootprint"
    );

    newComparativeData = await getHistoricalSerieData(
      comparativeDivision,
      indic,
      newComparativeData,
      "targetDivisionFootprint"
    );

    return newComparativeData;
  };

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
    setDisplayGraph(false);
    if (!validations.includes(indic)) {
      // Get footprint for all sectors
      let newComparativeData = await updateComparativeAreaData(indic);
      if (comparativeDivision != "00") {
        newComparativeData = await updateComparativeDivisionData(
          indic,
          newComparativeData,
          comparativeDivision
        );
      }

      props.session.comparativeData = newComparativeData;
      setComparativeData(newComparativeData);

      SetValidations((validations) => [...validations, indic]);
    }
    // add validation
    if (!props.session.validations.includes(indic)) {
      props.session.validations.push(indic);
    }
    // update footprint
    await props.session.updateIndicator(indic);
    setUpdatedIndic(indic);
    setDisplayGraph(true);
  };

  // Update comparative division
  const updateDivision = async (division) => {
    setDisplayGraph(false);

    props.session.comparativeData.activityCode = division;

    let newComparativeData = comparativeData;

    for await (const indic of validations) {
      // update comparative data according to validated indicators
      const updatedData = await updateComparativeDivisionData(
        indic,
        newComparativeData,
        division
      );
      newComparativeData = updatedData;
    }

    props.session.comparativeData = newComparativeData;
    setComparativeData(newComparativeData);
    setComparativeDivision(division);
    setDisplayGraph(true);
  };

  // Export pdf on click
  const handleDownloadPDF = async (key, comparativeDivision) => {
    // Display pop up to choose a comparative division
    if (comparativeDivision == "00") {
      // Pass indic to export to download PDF directly from PopUp
      setIndicToExport(key);
      setPopUp("division");
    } else {
      basicPDFReport(
        key,
        metaIndics[key].libelle,
        metaIndics[key].unit,
        props.session.financialData,
        props.session.impactsData,
        props.session.comparativeData,
        divisions[comparativeDivision],
        true
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

  /* ----- POP-UP ----- */

  const triggerPopup = (indic) => {
    setPopUp(indic);
  };

  // CLOSE POP-UP
  const handleClose = () => setPopUp("");

  //  INDICATORS CATEGORIES
  const valueCreation = ["eco", "art", "soc"];
  const socialFootprint = ["idr", "geq", "knw"];
  const environmentalFootprint = ["ghg", "nrg", "wat", "mat", "was", "haz"];

  // Pie Graph component to print in PDF

  const PieGraphRow = (props) => {
    let indic = props.indic;
    let intermediateConsumption = props.aggregates.intermediateConsumption;
    let capitalConsumption = props.aggregates.capitalConsumption;
    let netValueAdded = props.aggregates.netValueAdded;

    return (
      <Row>
        <div className="piechart-container">
          <PieGraph
            id={"piechart-" + indic}
            intermediateConsumption={intermediateConsumption.footprint.indicators[
              indic
            ].getGrossImpact(intermediateConsumption.amount)}
            capitalConsumption={capitalConsumption.footprint.indicators[
              indic
            ].getGrossImpact(capitalConsumption.amount)}
            netValueAdded={netValueAdded.footprint.indicators[
              indic
            ].getGrossImpact(netValueAdded.amount)}
          />
        </div>
      </Row>
    );
  };

  return (
    <>
      {validations.length > 0 && displayGraph && (
        <div className="hidden">
          {validations.map((indic, key) => (
            <>
              <Row className="graphs" key={key}>
                <Col sm={3} xl={3} lg={3} md={3}>
                  <ComparativeGraphs
                    id={"production-" + indic}
                    graphDataset={[
                      comparativeData.production.areaFootprint.indicators[indic]
                        .value,
                      props.session.financialData.aggregates.production.footprint.getIndicator(
                        indic
                      ).value,
                      comparativeData.production.divisionFootprint.indicators[
                        indic
                      ].value,
                    ]}
                    targetData={[
                      comparativeData.production.targetAreaFootprint.indicators[
                        indic
                      ].value,
                      null,
                      comparativeData.production.targetDivisionFootprint.indicators[
                        indic
                      ].data.at(-1).value,
                    ]}
                    titleChart="Production"
                    indic={indic}
                  />
                </Col>
                <Col sm={3} xl={3} lg={3} md={3}>
                  <ComparativeGraphs
                    id={"intermediateConsumption-" + indic}
                    graphDataset={[
                      comparativeData.intermediateConsumption.areaFootprint
                        .indicators[indic].value,
                      props.session.financialData.aggregates.intermediateConsumption.footprint.getIndicator(
                        indic
                      ).value,
                      comparativeData.intermediateConsumption.divisionFootprint
                        .indicators[indic].value,
                    ]}
                    targetData={[
                      comparativeData.intermediateConsumption
                        .targetAreaFootprint.indicators[indic].value,
                      null,
                      comparativeData.intermediateConsumption.targetDivisionFootprint.indicators[
                        indic
                      ].data.at(-1).value,
                    ]}
                    indic={indic}
                  />
                </Col>
                <Col sm={3} xl={3} lg={3} md={3}>
                  <ComparativeGraphs
                    id={"capitalConsumption-" + indic}
                    graphDataset={[
                      comparativeData.fixedCapitalConsumption.areaFootprint
                        .indicators[indic].value,
                      props.session.financialData.aggregates.capitalConsumption.footprint.getIndicator(
                        indic
                      ).value,
                      comparativeData.fixedCapitalConsumption.divisionFootprint
                        .indicators[indic].value,
                    ]}
                    targetData={[
                      comparativeData.fixedCapitalConsumption
                        .targetAreaFootprint.indicators[indic].value,
                      null,
                      comparativeData.fixedCapitalConsumption.targetDivisionFootprint.indicators[
                        indic
                      ].data.at(-1).value,
                    ]}
                    indic={indic}
                  />
                </Col>
                <Col sm={3} xl={3} lg={3} md={3}>
                  <ComparativeGraphs
                    id={"netValueAdded-" + indic}
                    graphDataset={[
                      comparativeData.netValueAdded.areaFootprint.indicators[
                        indic
                      ].value,
                      props.session.financialData.aggregates.netValueAdded.footprint.getIndicator(
                        indic
                      ).value,
                      comparativeData.netValueAdded.divisionFootprint
                        .indicators[indic].value,
                    ]}
                    targetData={[
                      comparativeData.netValueAdded.targetAreaFootprint
                        .indicators[indic].value,
                      null,
                      comparativeData.netValueAdded.targetDivisionFootprint.indicators[
                        indic
                      ].data.at(-1).value,
                    ]}
                    indic={indic}
                  />
                </Col>
              </Row>
              {environmentalFootprint.includes(indic) && (
                <PieGraphRow
                  indic={indic}
                  aggregates={props.session.financialData.aggregates}
                />
              )}
            </>
          ))}
        </div>
      )}

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
                      {notAvailableIndics.includes(key) && (
                        <i className="ms-1 bi bi-exclamation-circle warning"></i>
                      )}
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
                      case "idr":
                        return (
                          <>
                            <StatementIDR
                              impactsData={props.impactsData}
                              disableStatement={notAvailableIndics.includes(
                                key
                              )}
                              onUpdate={willNetValueAddedIndicator.bind("idr")}
                              onValidate={() => validateIndicator("idr")}
                              toAssessment={() => triggerPopup("idr")}
                              toImportDSN={() => triggerPopup("dsn")}
                            />
                            <ModalAssesment
                              indic="idr"
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("idr")}
                              onValidate={() => validateIndicator("idr")}
                              onGoBack={handleClose}
                              popUp={popUp}
                              handleClose={handleClose}
                              title="Données Sociales"
                            />
                            <ModalAssesment
                              indic="dsn"
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("idr")}
                              onValidate={() => validateIndicator("idr")}
                              onGoBack={handleClose}
                              popUp={popUp}
                              handleClose={handleClose}
                              title="Déclarations Sociales Nominatives"
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
                              toImportDSN={() => triggerPopup("dsn")}
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
                            <ModalAssesment
                              indic="dsn"
                              impactsData={props.impactsData}
                              onUpdate={willNetValueAddedIndicator.bind("geq")}
                              onValidate={() => validateIndicator("geq")}
                              onGoBack={handleClose}
                              popUp={popUp}
                              handleClose={handleClose}
                              title="Déclarations Sociales Nominatives"
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
                        validations.includes("nrg") &&
                        !validations.includes("ghg") && <IconWarning />}
                      {key == "nrg" &&
                        props.impactsData.energyConsumption != 0 &&
                        validations.includes("ghg") &&
                        !validations.includes("nrg") && <IconWarning />}
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
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(() => {
          switch (props.indic) {
            case "idr":
              return <AssessmentDIS {...props} />;
            case "geq":
              return <AssessmentDIS {...props} />;
            case "knw":
              return <AssessmentKNW {...props} />;
            case "ghg":
              return <AssessmentGHG {...props} />;
            case "nrg":
              return <AssessmentNRG {...props} />;
            case "dsn":
              return <ImportDSN {...props} />;
            default:
              return <div></div>;
          }
        })()}
      </Modal.Body>
    </Modal>
  );
}
export default IndicatorsList;
