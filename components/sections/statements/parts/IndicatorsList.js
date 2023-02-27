import React, { useContext, useEffect, useState } from "react";

import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import {
  Accordion,
  AccordionContext,
  Card,
  Col,
  Modal,
  Row,
  useAccordionButton,
} from "react-bootstrap";

// Libs
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";

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

import { AssessmentDIS } from "/components/assessments/AssessmentDIS";
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentGHG } from "/components/assessments/AssessmentGHG";
import { ImportDSN } from "../../../assessments/ImportDSN";

import ChangeDivision from "../../../popups/ChangeDivision";

// Charts

import ComparativeGraphs from "../../../charts/ComparativeGraphs";
import DeviationChart from "../../../charts/HorizontalBarChart";
import SigPieChart from "../../../charts/SigPieChart";
import GrossImpactChart from "../../../charts/GrossImpactChart";
import TrendsGraph from "../../../charts/TrendsGraph";

// Services
import getSerieData from "/src/services/responses/SerieData";
import getMacroSerieData from "/src/services/responses/MacroSerieData";
import getHistoricalSerieData from "/src/services/responses/HistoricalSerieData";

import { getTargetSerieId } from "/src/utils/Utils";
import { printValue } from "../../../../src/utils/Utils";

// PDF Generation
import { createIndicReport } from "../../../../src/writers/deliverables/indicReportPDF";
import { createContribIndicatorPDF } from "../../../../src/writers/deliverables/contribIndicPDF";
import { createIntensIndicatorPDF } from "../../../../src/writers/deliverables/intensIndicPDF";
import { createIndiceIndicatorPDF } from "../../../../src/writers/deliverables/indiceIndicPDF";

const IndicatorsList = (props) => {
  const [prevIndics] = useState(props.session.indics);
  const [notAvailableIndics, setnotAvailableIndics] = useState([]);

  const [validations, SetValidations] = useState(props.session.validations);
  const [updatedIndic, setUpdatedIndic] = useState("");
  const [popUp, setPopUp] = useState();
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
    if (!validations.includes(indic)) {
      // Get footprint for all sectors
      // To do : Condition pour vérifier si on possède déjà les données comparatives
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

      // Update parent State

      props.onValidation(indic);
    }
    // add validation
    if (!props.session.validations.includes(indic)) {
      props.session.validations.push(indic);
    }
    // update footprint
    await props.session.updateIndicator(indic);
    setUpdatedIndic(indic);
  };

  // Update comparative division
  const updateDivision = async (division) => {
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
  };

  // Export pdf on click
  const handleDownloadPDF = async (key, comparativeDivision) => {
    
    props.updateVisibleGraphs(true);

    // Display pop up to choose a comparative division
    if (comparativeDivision == "00") {
      // Pass indic to export to download PDF directly from PopUp
      setIndicToExport(key);
      setPopUp("division");
    } else {
      // Wait for visibleGraphs to be updated
      await new Promise((resolve) => setTimeout(resolve, 0));

      await generateIndicatorReportPDF(
        props.session,
        key,
        divisions[comparativeDivision]
      );

      setPopUp("");
    }
    props.updateVisibleGraphs(false);
  };

  // Resusable Components

  const SuccessMessage = () => {
    return (
      <p className="mt-4 small alert alert-success">
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

  return (
    <>
      {/* Charts generation */}

      {validations.length > 0 &&
        validations.map((indic, key) => (
          <div key={key} className="hidden charts-container">
            <Row>
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
                  year={props.session.year}
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
                    comparativeData.intermediateConsumption.targetAreaFootprint
                      .indicators[indic].value,
                    null,
                    comparativeData.intermediateConsumption.targetDivisionFootprint.indicators[
                      indic
                    ].data.at(-1).value,
                  ]}
                  indic={indic}
                  year={props.session.year}
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
                    comparativeData.fixedCapitalConsumption.targetAreaFootprint
                      .indicators[indic].value,
                    null,
                    comparativeData.fixedCapitalConsumption.targetDivisionFootprint.indicators[
                      indic
                    ].data.at(-1).value,
                  ]}
                  indic={indic}
                  year={props.session.year}
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
                    comparativeData.netValueAdded.divisionFootprint.indicators[
                      indic
                    ].value,
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
                  year={props.session.year}
                />
              </Col>
            </Row>
            {metaIndics[indic].type == "proportion" && (
              <Row>
                <Col>
                  <div className="doughtnut-chart-container">
                    <SigPieChart
                      value={printValue(
                        props.session.financialData.aggregates.production
                          .footprint.indicators[indic].value,
                        metaIndics[indic].nbDecimals
                      )}
                      title={"Production"}
                      id={"prd-" + indic}
                    />
                  </div>
                </Col>
                <Col>
                  <div className="doughtnut-chart-container">
                    <SigPieChart
                      value={printValue(
                        props.session.financialData.aggregates
                          .intermediateConsumption.footprint.indicators[indic]
                          .value,
                        metaIndics[indic].nbDecimals
                      )}
                      title={"Consommations intermédiaires"}
                      id={"ic-" + indic}
                    />
                  </div>
                </Col>
                <Col>
                  <div className="doughtnut-chart-container">
                    <SigPieChart
                      value={printValue(
                        props.session.financialData.aggregates
                          .capitalConsumption.footprint.indicators[indic].value,
                        metaIndics[indic].nbDecimals
                      )}
                      title={"Consommation de capital fixe"}
                      id={"ccf-" + indic}
                    />
                  </div>
                </Col>
                <Col>
                  <div className="doughtnut-chart-container">
                    <SigPieChart
                      value={printValue(
                        props.session.financialData.aggregates.netValueAdded.footprint.indicators[
                          indic
                        ].getValue(),
                        metaIndics[indic].nbDecimals
                      )}
                      title={"Valeur ajoutée nette"}
                      id={"nva-" + indic}
                    />
                  </div>
                </Col>
              </Row>
            )}
            {(metaIndics[indic].type == "intensité" ||
              metaIndics[indic].type == "indice") && (
              <>
                <Row>
                  <Col sm={3}>
                    <GrossImpactChart
                      id={"part-" + indic}
                      intermediateConsumption={props.session.financialData.aggregates.intermediateConsumption.footprint.indicators[
                        indic
                      ].getGrossImpact(
                        props.session.financialData.aggregates
                          .intermediateConsumption.amount
                      )}
                      capitalConsumption={props.session.financialData.aggregates.capitalConsumption.footprint.indicators[
                        indic
                      ].getGrossImpact(
                        props.session.financialData.aggregates
                          .capitalConsumption.amount
                      )}
                      netValueAdded={props.session.financialData.aggregates.netValueAdded.footprint.indicators[
                        indic
                      ].getGrossImpact(
                        props.session.financialData.aggregates.netValueAdded
                          .amount
                      )}
                    />
                  </Col>
                  <Col sm={4}>
                    <DeviationChart
                      id={"deviationChart-" + indic}
                      legalUnitData={[
                        props.session.financialData.aggregates.production.footprint.getIndicator(
                          indic
                        ).value,
                        props.session.financialData.aggregates.intermediateConsumption.footprint.getIndicator(
                          indic
                        ).value,
                        props.session.financialData.aggregates.capitalConsumption.footprint.getIndicator(
                          indic
                        ).value,
                        props.session.financialData.aggregates.netValueAdded.footprint.getIndicator(
                          indic
                        ).value,
                      ]}
                      branchData={[
                        comparativeData.production.divisionFootprint.indicators[
                          indic
                        ].value,
                        comparativeData.intermediateConsumption
                          .divisionFootprint.indicators[indic].value,
                        comparativeData.fixedCapitalConsumption
                          .divisionFootprint.indicators[indic].value,
                        comparativeData.netValueAdded.divisionFootprint
                          .indicators[indic].value,
                      ]}
                      indic={indic}
                      unit={metaIndics[indic].unit}
                      precision={metaIndics[indic].nbDecimal}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={8}>
                    <TrendsGraph
                      id={"trend-prd-" + indic}
                      unit={metaIndics[indic].unit}
                      code={comparativeDivision}
                      trends={
                        comparativeData.production.trendsFootprint.indicators[
                          indic
                        ]
                      }
                      target={
                        comparativeData.production.targetDivisionFootprint
                          .indicators[indic]
                      }
                      current={
                        props.session.financialData.aggregates.production.footprint.getIndicator(
                          indic
                        ).value
                      }
                    />
                  </Col>
                </Row>
              </>
            )}
          </div>
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
                      <i className="bi bi-download"></i> Livrables
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
                      <i className="bi bi-download"></i> Livrables
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
                      <i className="bi bi-download"></i> Livrables
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

      {/* // MODAL  */}
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

async function generateIndicatorReportPDF(session, indic, comparativeDivision) {
  // Create an array of promises for generating PDF files
  const pdfPromises = [];

  const documentTitle =
    "Rapport_" +
    session.year +
    "_" +
    session.legalUnit.corporateName.replaceAll(" ", "") +
    "-" +
    indic.toUpperCase();

  const type = metaIndics[indic].type;

  switch (type) {
    case "proportion":
      pdfPromises.push(
        createContribIndicatorPDF(
          metaIndics[indic].libelle,
          session.year,
          session.legalUnit.corporateName,
          indic,
          session.financialData,
          session.comparativeData,
          false
        )
      );
      break;
    case "intensité":
      pdfPromises.push(
        createIntensIndicatorPDF(
          session.year,
          session.legalUnit.corporateName,
          indic,
          metaIndics[indic].libelle,
          metaIndics[indic].unit,
          session.financialData,
          session.comparativeData,
          false
        )
      );
      break;
    case "indice":
      pdfPromises.push(
        createIndiceIndicatorPDF(
          metaIndics[indic].libelle,
          metaIndics[indic].libelleGrandeur,
          session.year,
          session.legalUnit.corporateName,
          indic,
          metaIndics[indic].unit,
          session.financialData,
          session.comparativeData,
          false
        )
      );
      break;
    default:
      break;
  }

  pdfPromises.push(
    createIndicReport(
      session.year,
      session.legalUnit.corporateName,
      indic,
      metaIndics[indic].libelle,
      metaIndics[indic].unit,
      session.financialData,
      session.impactsData,
      session.comparativeData,
      divisions[comparativeDivision],
      false
    )
  );
  Promise.all(pdfPromises).then(async (pdfs) => {
    // Create a new empty PDF document to merge PDFs together
    let mergedPdfDoc = await PDFDocument.create();
    const fontBytes = await fetch(
      "https://metriz.lasocietenouvelle.org/fonts/Raleway/Raleway-Regular.ttf"
    ).then((res) => res.arrayBuffer());

    // Register the `fontkit` instance
    mergedPdfDoc.registerFontkit(fontkit);

    // Add each PDF to the final PDF document
    for (const pdf of pdfs) {
      const pdfBytes = await pdf.arrayBuffer();

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdfDoc.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
    }

    // Get the number of pages in the merged PDF
    const pageCount = mergedPdfDoc.getPageCount();

    const ralewayFont = await mergedPdfDoc.embedFont(
      fontBytes,
      { subset: true, custom: true },
      fontkit
    );

    // Loop through each page and add the page number
    for (let i = 0; i < pageCount; i++) {
      const page = mergedPdfDoc.getPage(i);

      // Get the width and height of the page
      const { width, height } = page.getSize();

      // Add the page number as text in the bottom right corner
      const pageNumberText = `Page ${i + 1} sur ${pageCount}`;
      const fontSize = 7;
      const textWidth = ralewayFont.widthOfTextAtSize(pageNumberText, fontSize);
      const textHeight = ralewayFont.heightAtSize(fontSize);

      page.drawText(pageNumberText, {
        x: width - textWidth - 20,
        y: textHeight + 12,
        size: fontSize,
        font: ralewayFont,
        color: rgb(25 / 255, 21 / 255, 88 / 255),
      });
    }

    // Save the merged PDF document with page numbers

    const mergedPdfData = new Blob([await mergedPdfDoc.save()], {
      type: "application/pdf",
    });

    // Create a link to download the merged PDF
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(mergedPdfData);

    downloadLink.download = documentTitle + ".pdf";
    document.body.appendChild(downloadLink);

    // Simulate a click on the link to start the download
    downloadLink.click();

    // Remove the link after the download
    document.body.removeChild(downloadLink);
  });
}

export default IndicatorsList;
