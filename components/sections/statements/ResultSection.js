import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Dropdown,
  DropdownButton,
  Image,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";

import Select from "react-select";

// Meta
import metaIndics from "/lib/indics";
import divisions from "/lib/divisions";

// Texts imports
import { analysisTextWriterART } from "../../../src/writers/analysis/analysisTextWriterART";
import { analysisTextWriterDIS } from "../../../src/writers/analysis/analysisTextWriterDIS";
import { analysisTextWriterECO } from "../../../src/writers/analysis/analysisTextWriterECO";
import { analysisTextWriterGEQ } from "../../../src/writers/analysis/analysisTextWriterGEQ";
import { analysisTextWriterGHG } from "../../../src/writers/analysis/analysisTextWriterGHG";
import { analysisTextWriterHAZ } from "../../../src/writers/analysis/analysisTextWriterHAZ";
import { analysisTextWriterKNW } from "../../../src/writers/analysis/analysisTextWriterKNW";
import { analysisTextWriterMAT } from "../../../src/writers/analysis/analysisTextWriterMAT";
import { analysisTextWriterNRG } from "../../../src/writers/analysis/analysisTextWriterNRG";
import { analysisTextWriterSOC } from "../../../src/writers/analysis/analysisTextWriterSOC";
import { analysisTextWriterWAS } from "../../../src/writers/analysis/analysisTextWriterWAS";
import { analysisTextWriterWAT } from "../../../src/writers/analysis/analysisTextWriterWAT";
import { exportIndicPDF } from "../../../src/writers/Export";

// API
import { ErrorApi } from "../../ErrorAPI";

// Graphs
import ComparativeGraphs from "../../graphs/ComparativeGraphs";
import PieGraph from "../../graphs/PieGraph";

// Tables
import { ComparativeTable } from "../../tables/ComparativeTable";
import { IndicatorExpensesTable } from "../../tables/IndicatorExpensesTable";
import { IndicatorMainAggregatesTable } from "../../tables/IndicatorMainAggregatesTable";
import retrieveTargetFootprint from "/src/services/responses/targetFootprint";
import retrieveDivisionFootprint from "/src/services/responses/divisionFootprint";

const ResultSection = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [indic, setIndic] = useState(props.indic);
  const [session] = useState(props.session);
  const [error] = useState(false);
  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeDivision || "00"
  );
  const [allSectorFootprint] = useState(
    props.session.comparativeAreaFootprints[props.indic.toUpperCase()]
  );
  const [divisionFootprint, setDivisionFootprint] = useState(
    props.session.comparativeDivisionFootprints[props.indic.toUpperCase()]
  );

  const [targetSNBCbranch, setTargetSNBCbranch] = useState(
    props.session.targetSNBCbranch
  );
  const [targetSNBCarea, setTargetSNBCarea] = useState(
    props.session.targetSNBCarea
  );

  const [printGrossImpact] = useState([
    "ghg",
    "haz",
    "mat",
    "nrg",
    "was",
    "wat",
  ]);
  const divisionsOptions = [];

  //Divisions select options
  Object.entries(divisions)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(([value, label]) =>
      divisionsOptions.push({ value: value, label: value + " - " + label })
    );

  const { intermediateConsumption, capitalConsumption, netValueAdded } =
    props.session.financialData.aggregates;

  const changeComparativeDivision = async (event) => {
    let division = event.value;
    setComparativeDivision(division);
    // update session
    props.session.comparativeDivision = division;
  };

  useEffect(async () => {


    await getComparativeValues();

    setIsLoading(false);

  }, [comparativeDivision, indic]);

  const getComparativeValues = async() => {
    setIsLoading(true);
    if (comparativeDivision != "00") {
      await getComparativeDivisionFootprint();
    } else {
      props.session.comparativeDivisionFootprints[indic.toUpperCase()] = {
        valueAddedDivisionFootprint: { value: null },
        productionDivisionFootprint: { value: null },
        consumptionDivisionFootprint: { value: null },
      };

      setDivisionFootprint({
        valueAddedDivisionFootprint: { value: null },
        productionDivisionFootprint: { value: null },
        consumptionDivisionFootprint: { value: null },
      });
    }
    // GET TARGET SNCB 2030 VALUE
    if (indic == "ghg" && comparativeDivision != "00") {
      const target = await retrieveTargetFootprint(comparativeDivision);
      setTargetSNBCbranch(target);
      props.session.targetSNBCbranch = target;
    } else {
      setTargetSNBCbranch({
        valueAddedTarget: { value: null },
        productionTarget: { value: null },
        consumptionTarget: { value: null },
      });
    }

    // GET TARGET SNCB 2030 VALUE
    if (indic == "ghg") {
      // TARGET SNCB 2030 FOR ALL SECTORS
      const targetArea = await retrieveTargetFootprint("00");
      setTargetSNBCarea(targetArea);

      props.session.targetSNBCarea = targetArea;
    } else {
      setTargetSNBCarea({
        valueAddedTarget: { value: null },
        productionTarget: { value: null },
        consumptionTarget: { value: null },
      });
    }
  }
  const getComparativeDivisionFootprint = async () => {
    const divisionFootprint = await retrieveDivisionFootprint(
      indic,
      comparativeDivision
    );

    let valueAddedFootprint =
      divisionFootprint[indic.toUpperCase()].valueAddedDivisionFootprint;
    let productionFootprint =
      divisionFootprint[indic.toUpperCase()].productionDivisionFootprint;
    let consumptionFootprint =
      divisionFootprint[indic.toUpperCase()].consumptionDivisionFootprint;

    props.session.comparativeDivisionFootprints[indic.toUpperCase()] = {
      valueAddedDivisionFootprint: valueAddedFootprint,
      productionDivisionFootprint: productionFootprint,
      consumptionDivisionFootprint: consumptionFootprint,
    };

    setDivisionFootprint({
      valueAddedDivisionFootprint: valueAddedFootprint,
      productionDivisionFootprint: productionFootprint,
      consumptionDivisionFootprint: consumptionFootprint,
    });
  };

  return (
    <>
      <div className="step d-flex  align-items-center justify-content-between">
        <h2>
          <i className="bi bi-clipboard-data"></i> Rapport - Analyse
          extra-financière
        </h2>
        <div className="d-flex">
          <Button variant="light" onClick={props.goBack}>
            <i className="bi bi-chevron-left"></i> Retour
          </Button>

          {session.validations.length > 1 ? (
            <DropdownButton id="indic-button" title="Autres résultats">
              {Object.entries(metaIndics).map(([key, value]) => {
                if (session.validations.includes(key) && key != indic) {
                  return (
                    <Dropdown.Item
                      className="small-text"
                      key={key}
                      onClick={() => setIndic(key)}
                    >
                      {value.libelle}
                    </Dropdown.Item>
                  );
                }
              })}
            </DropdownButton>
          ) : (
            <Button id="indic-button" disabled>
              {metaIndics[indic].libelle}
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() =>
              exportIndicPDF(
                indic,
                session,
                comparativeDivision,
                "#Production",
                "#Consumption",
                "#Value",
                printGrossImpact.includes(indic) ? "#PieChart" : ""
              )
            }
          >
            Télécharger le rapport <i className="bi bi-download"></i>
          </Button>
        </div>
      </div>
      <section className="step">
        <Row>
          <Col lg={printGrossImpact.includes(indic) ? "8" : "12"}>
            <div className="d-flex align-items-center mb-4 rapport-indic">
              <Image
                src={"/resources/icon-ese-bleues/" + indic + ".png"}
                className="icon-ese me-2"
              />
              <h3>{metaIndics[indic].libelle}</h3>
            </div>

            <Tabs
              defaultActiveKey="mainAggregates"
              transition={false}
              id="noanim-tab-example"
              className="mb-3"
            >
              <Tab
                eventKey="mainAggregates"
                title=" Soldes intermédiaires de gestion"
              >
                <IndicatorMainAggregatesTable session={session} indic={indic} />
              </Tab>
              <Tab
                eventKey="expensesAccounts"
                title=" Détails - Comptes de charges"
              >
                <IndicatorExpensesTable session={session} indic={indic} />
              </Tab>
            </Tabs>
          </Col>
          {printGrossImpact.includes(indic) && (
            <Col sm={4}>
              <h3 className="text-center">
                Répartition des impacts bruts (en %)
              </h3>

              <div className="p-5">
                <PieGraph
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
            </Col>
          )}
        </Row>
      </section>
      <section className="step">
        <h3>Comparaison par activité</h3>

        <Select
          className="mb-3 small-text"
          defaultValue={{
            label: comparativeDivision + " - " + divisions[comparativeDivision],
            value: comparativeDivision,
          }}
          placeholder={"Choisissez un secteur d'activité"}
          options={divisionsOptions}
          onChange={changeComparativeDivision}
        />

        {error && <ErrorApi />}
        {!isLoading && <>
          <div className="mt-5">
          <Row className="graphs">
            <Col sm={4} xl={4} lg={4} md={4}>
              <h5 className="mb-4">▪ Production</h5>
              <ComparativeGraphs
                id="Production"
                sectorData={allSectorFootprint.productionAreaFootprint.value}
                legalunitData={
                  session.financialData.aggregates.production.footprint.getIndicator(
                    indic
                  ).value
                }
                divisionData={
                  divisionFootprint.productionDivisionFootprint.value
                }
                titleChart="Production"
                indic={indic}
                targetBranchData={targetSNBCbranch.productionTarget.value}
                targetAreaData={targetSNBCarea.productionTarget.value}
              />
            </Col>
            <Col sm={4} xl={4} lg={4} md={4}>
              <h5 className="mb-4">▪ Consommations intermédiaires</h5>
              <ComparativeGraphs
                id="Consumption"
                sectorData={allSectorFootprint.consumptionAreaFootprint.value}
                legalunitData={
                  session.financialData.aggregates.intermediateConsumption.footprint.getIndicator(
                    indic
                  ).value
                }
                divisionData={
                  divisionFootprint.consumptionDivisionFootprint.value
                }
                titleChart="Consommations intérmédiaires"
                indic={indic}
                targetBranchData={targetSNBCbranch.consumptionTarget.value}
                targetAreaData={targetSNBCarea.consumptionTarget.value}
              />
            </Col>
            <Col sm={4} xl={4} lg={4} md={4}>
              <h5 className="mb-4">▪ Valeur ajoutée</h5>
              <ComparativeGraphs
                id="Value"
                sectorData={allSectorFootprint.valueAddedAreaFootprint.value}
                legalunitData={
                  session.financialData.aggregates.netValueAdded.footprint.getIndicator(
                    indic
                  ).value
                }
                divisionData={
                  divisionFootprint.valueAddedDivisionFootprint.value
                }
                titleChart="Valeur ajoutée nette"
                indic={indic}
                targetBranchData={targetSNBCbranch.valueAddedTarget.value}
                targetAreaData={targetSNBCarea.valueAddedTarget.value}
              />
            </Col>
          </Row>
        </div>
        <ComparativeTable
          financialData={session.financialData}
          indic={indic}
          allSectorFootprint={allSectorFootprint}
          comparativeDivisionFootprint={divisionFootprint}
          targetSNBCbranch={targetSNBCbranch}
          targetSNBCarea={targetSNBCarea}
        />
        </>}
   
      </section>
      <section className="step">
        <h3>Note d'analyse</h3>
        <div id="analyse">
          <Analyse indic={indic} session={session} />
        </div>
      </section>
      <section className="step">
        <div className="d-flex justify-content-end">
          <Button variant="light" onClick={props.goBack}>
            <i className="bi bi-chevron-left"></i> Retour
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              exportIndicPDF(
                indic,
                session,
                comparativeDivision,
                "#Production",
                "#Consumption",
                "#Value",
                printGrossImpact.includes(indic) ? "#PieChart" : ""
              )
            }
          >
            Télécharger le rapport <i className="bi bi-download"></i>
          </Button>
        </div>
      </section>
    </>
  );
};

/* ----- STATEMENTS / ASSESSMENTS COMPONENTS ----- */

const Analyse = (indic, session) => {
  let analyse = getAnalyse(indic, session);

  return (
    <>
      {analyse.map((paragraph, index) => (
        <p key={index}>{paragraph.reduce((a, b) => a + " " + b)}</p>
      ))}
    </>
  );
};

// Display the correct statement view according to the indicator
function getAnalyse(props) {
  switch (props.indic) {
    case "art":
      return analysisTextWriterART(props.session);
    case "dis":
      return analysisTextWriterDIS(props.session);
    case "eco":
      return analysisTextWriterECO(props.session);
    case "geq":
      return analysisTextWriterGEQ(props.session);
    case "ghg":
      return analysisTextWriterGHG(props.session);
    case "haz":
      return analysisTextWriterHAZ(props.session);
    case "knw":
      return analysisTextWriterKNW(props.session);
    case "mat":
      return analysisTextWriterMAT(props.session);
    case "nrg":
      return analysisTextWriterNRG(props.session);
    case "soc":
      return analysisTextWriterSOC(props.session);
    case "was":
      return analysisTextWriterWAS(props.session);
    case "wat":
      return analysisTextWriterWAT(props.session);
  }
}

export default ResultSection;
