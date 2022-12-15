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

import { exportIndicPDF } from "../../../../src/writers/Export";
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

import { AssessmentDIS } from "/components/assessments/AssessmentDIS";
import { AssessmentKNW } from "/components/assessments/AssessmentKNW";
import { AssessmentNRG } from "/components/assessments/AssessmentNRG";
import { AssessmentGHG } from "/components/assessments/AssessmentGHG";
import { ImportDSN } from "../../../assessments/ImportDSN";

import ChangeDivision from "../../../popups/ChangeDivision";

import ComparativeGraphs from "../../../graphs/ComparativeGraphs";
import PieGraph from "../../../graphs/PieGraph";
import retrieveAreaFootprint from "/src/services/responses/areaFootprint";
import retrieveDivisionFootprint from "/src/services/responses/divisionFootprint";
import retrieveTargetFootprint from "/src/services/responses/targetFootprint";

const IndicatorsList = (props) => {
  const [validations, SetValidations] = useState(props.session.validations);
  const [updatedIndic, setUpdatedIndic] = useState("");
  const [popUp, setPopUp] = useState();
  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeDivision
  );
  const [indicToExport, setIndicToExport] = useState();
  const [allSectorFootprint, setAllSectorFootprint] = useState(
    props.session.comparativeAreaFootprints
  );
  const [divisionFootprint, setDivisionFootprint] = useState(
    props.session.comparativeDivisionFootprints
  );

  const [targetSNBCbranch, setTargetSNBCbranch] = useState(
    props.session.targetSNBCbranch
  );
  const [targetSNBCarea, setTargetSNBCarea] = useState(
    props.session.targetSNBCarea
  );

  useEffect(async () => {
    if (validations.length > 0) {
      props.publish();
    }
    // Update fooprints in session
    if (props.session.comparativeAreaFootprints != allSectorFootprint) {
      props.session.comparativeAreaFootprints = allSectorFootprint;
    }
    if (props.session.comparativeDivisionFootprints != divisionFootprint) {
      props.session.comparativeDivisionFootprints = divisionFootprint;
    }
    if (props.session.comparativeDivision != comparativeDivision) {
      props.session.comparativeDivision = comparativeDivision;
    }
    if (props.session.targetSNBCbranch != targetSNBCbranch) {
      props.session.targetSNBCbranch = targetSNBCbranch;
    }
    if (props.session.targetSNBCarea != targetSNBCarea) {
      props.session.targetSNBCarea = targetSNBCarea;
    }
  }, [validations, comparativeDivision]);

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
      let indicsAreaFootprint = allSectorFootprint;
      // Get footprint for all sectors
      const areaFootprint = await retrieveAreaFootprint(indic);

      Object.assign(indicsAreaFootprint, areaFootprint);

      setAllSectorFootprint(indicsAreaFootprint);

      if (comparativeDivision != "00") {
        let indicsDivisionFootprint = divisionFootprint;
        // Get footprint of selected division

        divisionFootprint = await retrieveDivisionFootprint(
          indic,
          comparativeDivision
        );

        Object.assign(indicsDivisionFootprint, divisionFootprint);

        setDivisionFootprint(indicsDivisionFootprint);

        // Get Target SNCB for GHG indic

        if (indic == "ghg") {
          const target = await retrieveTargetFootprint(comparativeDivision);
          setTargetSNBCbranch(target);

          // TARGET SNCB 2030 FOR ALL SECTORS
          const targetArea = await retrieveTargetFootprint("00");
          setTargetSNBCarea(targetArea);
        }
      } else {
        // Assign null value for all other indicators
        let footprint = divisionFootprint;
        Object.assign(footprint, {
          [indic.toUpperCase()]: {
            valueAddedDivisionFootprint: { value: null },
            productionDivisionFootprint: { value: null },
            consumptionDivisionFootprint: { value: null },
            capitalConsumptionDivisionFootprint: { value: null },

          },
        });
        setDivisionFootprint(footprint);
      }
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

  // Update comparative division
  const updateDivision = async (division) => {
    // Set TARGET 2030 for GHG indic
    if (indicToExport == "ghg") {
      const target = await retrieveTargetFootprint(division);
      setTargetSNBCbranch(target);

      // TARGET SNCB 2030 FOR ALL SECTORS
      const targetArea = await retrieveTargetFootprint("00");
      setTargetSNBCarea(targetArea);
    }

    let indicsDivisionFootprint = divisionFootprint;

    // Get footprint of selected division
    divisionFootprint = await retrieveDivisionFootprint(
      indicToExport,
      division
    );
    Object.assign(indicsDivisionFootprint, divisionFootprint);

    setDivisionFootprint(indicsDivisionFootprint);
    setComparativeDivision(division);
  };

  // Export pdf on click
  const handleDownloadPDF = async (key, comparativeDivision) => {
    // Display pop up to choose a comparative division
    if (comparativeDivision == "00") {
      // Pass indic to export to download PDF directly from PopUp
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
        "#print-CapitalConsumption-" + key,
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
      {/* Display all graphs by indicator to print them in PDF*/}
      {validations.length > 0 &&
        comparativeDivision != "00" &&
        validations.map(
          (indic, key) =>
            allSectorFootprint[indic.toUpperCase()] &&
            divisionFootprint[indic.toUpperCase()] && (
              <div className="hidden" key={key}>
                <Row className="graphs">
                  {/* Production Graph */}

                  <Col sm={4} xl={4} lg={4} md={4}>
                    <ComparativeGraphs
                      id={"print-Production-" + indic}
                      sectorData={
                        allSectorFootprint[indic.toUpperCase()]
                          .productionAreaFootprint.value
                      }
                      legalunitData={
                        props.session.financialData.aggregates.production.footprint.getIndicator(
                          indic
                        ).value
                      }
                      divisionData={
                        divisionFootprint[indic.toUpperCase()]
                          .productionDivisionFootprint.value
                      }
                      titleChart="Production"
                      indic={indic}
                      targetBranchData={
                        indic == "ghg"
                          ? targetSNBCbranch.productionTarget.value
                          : null
                      }
                      targetAreaData={
                        indic == "ghg"
                          ? targetSNBCarea.productionTarget.value
                          : null
                      }
                    />
                  </Col>
                  {/* Intermediate Consumption Graph */}

                  <Col sm={4} xl={4} lg={4} md={4}>
                    <ComparativeGraphs
                      id={"print-Consumption-" + indic}
                      sectorData={
                        allSectorFootprint[indic.toUpperCase()]
                          .consumptionAreaFootprint.value
                      }
                      legalunitData={
                        props.session.financialData.aggregates.intermediateConsumption.footprint.getIndicator(
                          indic
                        ).value
                      }
                      divisionData={
                        divisionFootprint[indic.toUpperCase()]
                          .consumptionDivisionFootprint.value
                      }
                      titleChart="Consommations intérmédiaires"
                      indic={indic}
                      targetBranchData={
                        indic == "ghg"
                          ? targetSNBCbranch.consumptionTarget.value
                          : null
                      }
                      targetAreaData={
                        indic == "ghg"
                          ? targetSNBCarea.consumptionTarget.value
                          : null
                      }
                    />
                  </Col>
                  {/* Net Value Added Graph */}

                  <Col sm={4} xl={4} lg={4} md={4}>
                    <ComparativeGraphs
                      id={"print-Value-" + indic}
                      sectorData={
                        allSectorFootprint[indic.toUpperCase()]
                          .valueAddedAreaFootprint.value
                      }
                      legalunitData={
                        props.session.financialData.aggregates.netValueAdded.footprint.getIndicator(
                          indic
                        ).value
                      }
                      divisionData={
                        divisionFootprint[indic.toUpperCase()]
                          .valueAddedDivisionFootprint.value
                      }
                      titleChart="Valeur ajoutée nette"
                      indic={indic}
                      targetBranchData={
                        indic == "ghg"
                          ? targetSNBCbranch.valueAddedTarget.value
                          : null
                      }
                      targetAreaData={
                        indic == "ghg"
                          ? targetSNBCarea.valueAddedTarget.value
                          : null
                      }
                    />
                  </Col>

                       {/* Capital Consumtion Graph */}

                       <Col sm={4} xl={4} lg={4} md={4}>
                    <ComparativeGraphs
                      id={"print-CapitalConsumption-" + indic}
                      sectorData={
                        allSectorFootprint[indic.toUpperCase()]
                          .capitalConsumptionAreaFootprint.value
                      }
                      legalunitData={
                        props.session.financialData.aggregates.capitalConsumption.footprint.getIndicator(
                          indic
                        ).value
                      }
                      divisionData={
                        divisionFootprint[indic.toUpperCase()]
                          .capitalConsumptionDivisionFootprint.value
                      }
                      titleChart="Valeur ajoutée nette"
                      indic={indic}
                      targetBranchData={
                        indic == "ghg"
                          ? targetSNBCbranch.capitalConsumptionTarget.value
                          : null
                      }
                      targetAreaData={
                        indic == "ghg"
                          ? targetSNBCarea.capitalConsumptionTarget.value
                          : null
                      }
                    />
                  </Col>
                </Row>
                {/* Distribution of gross impacts Graph for environnemental indicators*/}
                {environmentalFootprint.includes(indic) && (
                  <PieGraphRow
                    indic={indic}
                    aggregates={props.session.financialData.aggregates}
                  />
                )}
              </div>
            )
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
                              onUpdate     = {willNetValueAddedIndicator.bind("idr")}
                              onValidate   = {() => validateIndicator("idr")}
                              toAssessment = {() => triggerPopup("idr")}
                              toImportDSN  = {() => triggerPopup("dsn")}
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
      fullscreen
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
