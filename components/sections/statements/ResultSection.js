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

// Errors
import { ErrorApi } from "../../ErrorAPI";

// Graphs
import ComparativeGraphs from "../../charts/ComparativeGraphs";
import GrossImpactChart from "../../charts/GrossImpactChart";
import TrendsGraph from "../../charts/TrendsGraph";
import DeviationChart from "../../charts/HorizontalBarChart";

// Tables
import { ComparativeTable } from "../../tables/ComparativeTable";
import { IndicatorExpensesTable } from "../../tables/IndicatorExpensesTable";
import { IndicatorMainAggregatesTable } from "../../tables/IndicatorMainAggregatesTable";

// Fetch API data
import getMacroSerieData from "/src/services/responses/MacroSerieData";
import getHistoricalSerieData from "/src/services/responses/HistoricalSerieData";

import { getAnalyse } from "../../../src/utils/Writers";

import { createIndicReport } from "../../../src/writers/deliverables/indicReportPDF";
import { createContribIndicatorPDF } from "../../../src/writers/deliverables/contribIndicPDF";
import { createIntensIndicatorPDF } from "../../../src/writers/deliverables/intensIndicPDF";
import { createIndiceIndicatorPDF } from "../../../src/writers/deliverables/indiceIndicPDF";
import ChangeDivision from "../../popups/ChangeDivision";
import { getPrevDate } from "../../../src/utils/Utils";

const indicsWithGrossImpacts = ["ghg", "haz", "mat", "nrg", "was", "wat"];

const divisionsOptions = Object.entries(divisions)
  .sort((a, b) => parseInt(a) - parseInt(b))
  .map(([value, label]) => {
    return { value: value, label: value + " - " + label };
  });

const ResultSection = (props) => {
  const [period, setPeriod] = useState(props.period);
  const [indic, setIndic] = useState(props.indic);
  const [session] = useState(props.session);
  const [error] = useState(false);
  const [popUp, setPopUp] = useState();

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = props.session.financialData.mainAggregates;

  /* ----------  COMPARATIVE DATA ---------- */
  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeData.activityCode
  );
  const [comparativeData, setComparativeData] = useState(
    props.session.comparativeData
  );

  // Prev Period

  const prevDateEnd = getPrevDate(props.session.financialPeriod.dateStart);
  const prevPeriod = props.session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  // CLOSE POP-UP
  const handleClose = () => setPopUp("");

  /* ---------- Update Comparative division ---------- */

  const changeComparativeDivision = async (event) => {
    let division = event.value ? event.value : event;

    const newComparativeData = await updateComparativeData(
      indic,
      division,
      comparativeData
    );
    setComparativeData(newComparativeData);
    setComparativeDivision(division);
  };
  /* ---------- Update comparative data according to comparative division ---------- */

  useEffect(async () => {
    if (comparativeDivision != props.session.comparativeData.activityCode) {
      let newComparativeData = comparativeData;

      for await (const indic of props.session.validations[
        props.session.financialPeriod.periodKey
      ]) {
        // update comparative data for each  indicators
        const updatedData = await updateComparativeData(
          indic,
          comparativeDivision,
          newComparativeData
        );

        newComparativeData = updatedData;
      }
      // Update session with comparative data for all validated indicators

      props.session.comparativeData = newComparativeData;
      props.session.comparativeData.activityCode = comparativeDivision;
    }
  }, [comparativeDivision]);

  const updateComparativeData = async (indic, code, newComparativeData) => {
    newComparativeData = await getMacroSerieData(
      indic,
      code,
      newComparativeData,
      "divisionFootprint"
    );

    newComparativeData = await getHistoricalSerieData(
      code,
      indic,
      newComparativeData,
      "trendsFootprint"
    );

    newComparativeData = await getHistoricalSerieData(
      code,
      indic,
      newComparativeData,
      "targetDivisionFootprint"
    );

    return newComparativeData;
  };

  /* ---------- Display trend graph by aggregate ---------- */

  const [trendGraphView, setTrendGraphView] = useState({
    value: "prd",
    label: "Production",
  });
  // select view options
  const graphViewOptions = [
    { value: "prd", label: "Production" },
    { value: "ic", label: "Consommations intermédiaires" },
    { value: "cfc", label: "Consommations de capital fixe" },
    { value: "nva", label: "Valeur ajoutée nette" },
  ];

  const changeTrendGraphView = (option) => {
    setTrendGraphView(option);
  };

  const handleindicReportPDF = () => {
    const type = metaIndics[indic].type;
    // Display pop up to choose a comparative division
    if (comparativeDivision == "00") {
      setPopUp("division");
    } else {
      setPopUp();
      switch (type) {
        case "proportion":
          createContribIndicatorPDF(
            metaIndics[indic].libelle,
            session.legalUnit.corporateName,
            indic,
            session.financialData,
            session.comparativeData,
            true,
            period
          );
          break;
        case "intensité":
          createIntensIndicatorPDF(
            session.legalUnit.corporateName,
            indic,
            metaIndics[indic].libelle,
            metaIndics[indic].unit,
            session.financialData,
            session.comparativeData,
            true,
            period
          );
          break;
        case "indice":
          createIndiceIndicatorPDF(
            metaIndics[indic].libelle,
            metaIndics[indic].libelleGrandeur,
            session.legalUnit.corporateName,
            indic,
            metaIndics[indic].unit,
            session.financialData,
            session.comparativeData,
            comparativeData.netValueAdded.trendsFootprint.indicators[indic].meta
              .label,
            true,
            period
          );
          break;
        default:
          break;
      }
    }
  };
  return (
    <>
      {/* Head Section */}
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
                      className="small"
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
          <Button variant="secondary" onClick={handleindicReportPDF}>
            Plaquette <i className="bi bi-download"></i>
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              createIndicReport(
                session.legalUnit.corporateName,
                indic,
                metaIndics[indic].libelle,
                metaIndics[indic].unit,
                session.financialData,
                session.impactsData,
                session.comparativeData,
                true,
                period
              )
            }
          >
            Rapport <i className="bi bi-download"></i>
          </Button>
        </div>
      </div>
      {/* ---------- Main aggregate and expenses table ----------  */}
      <section className="step">
        <div className="d-flex align-items-center mb-4 rapport-indic">
          <Image
            src={"/resources/icon-ese-bleues/" + indic + ".png"}
            className="icon-ese me-2"
          />
          <h3>{metaIndics[indic].libelle}</h3>
        </div>
        <Row>
          <Col>
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
                <IndicatorMainAggregatesTable
                  session={session}
                  indic={indic}
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </Tab>
              <Tab
                eventKey="expensesAccounts"
                title=" Détails - Comptes de charges"
              >
                <IndicatorExpensesTable
                  session={session}
                  indic={indic}
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </Tab>
            </Tabs>
          </Col>
          {/* ----------Gross Impact Chart ----------  */}

          {metaIndics[indic].type == "intensité" && (
            <Col sm={3}>
              <div className="border rounded mt-5 px-5 pb-4">
                <h3 className="text-center">Répartition des impacts bruts</h3>
                <GrossImpactChart
                  id={"part-" + indic}
                  intermediateConsumptions={intermediateConsumptions.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getGrossImpact(
                    intermediateConsumptions.periodsData[period.periodKey]
                      .amount
                  )}
                  fixedCapitalConsumptions={fixedCapitalConsumptions.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getGrossImpact(
                    fixedCapitalConsumptions.periodsData[period.periodKey]
                      .amount
                  )}
                  netValueAdded={netValueAdded.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getGrossImpact(
                    netValueAdded.periodsData[period.periodKey].amount
                  )}
                />
              </div>
            </Col>
          )}
        </Row>
      </section>
      {/* ---------- Comparative charts and table ----------  */}

      <section className="step">
        <h3>Comparaison par activité</h3>
        <Select
          className="mb-3 small"
          defaultValue={{
            label: comparativeDivision + " - " + divisions[comparativeDivision],
            value: comparativeDivision,
          }}
          placeholder={"Choisissez un secteur d'activité"}
          options={divisionsOptions}
          onChange={changeComparativeDivision}
        />
        {error && <ErrorApi />}
        <div className="graph-container">
          <div className="mt-5">
            <Row className="charts">
              <Col sm={3} xl={3} lg={3} md={3}>
                <h5 className="mb-4">▪ Production</h5>
                <ComparativeGraphs
                  id={"production-" + indic}
                  graphDataset={[
                    comparativeData.production.areaFootprint.indicators[indic]
                      .value,
                    production.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    comparativeData.production.divisionFootprint.indicators[
                      indic
                    ].value,
                  ]}
                  targetData={[
                    comparativeData.production.targetAreaFootprint.indicators[
                      indic
                    ].value,
                    prevPeriod &&
                      production.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                    comparativeData.production.targetDivisionFootprint.indicators[
                      indic
                    ].data.at(-1).value,
                  ]}
                  indic={indic}
                />
              </Col>
              <Col sm={3} xl={3} lg={3} md={3}>
                <h5 className="mb-4">▪ Consommations intermédiaires</h5>
                <ComparativeGraphs
                  id={"intermediateConsumptions-" + indic}
                  graphDataset={[
                    comparativeData.intermediateConsumptions.areaFootprint
                      .indicators[indic].value,
                    intermediateConsumptions.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    comparativeData.intermediateConsumptions.divisionFootprint
                      .indicators[indic].value,
                  ]}
                  targetData={[
                    comparativeData.intermediateConsumptions.targetAreaFootprint
                      .indicators[indic].value,
                    prevPeriod &&
                      intermediateConsumptions.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                    comparativeData.intermediateConsumptions.targetDivisionFootprint.indicators[
                      indic
                    ].data.at(-1).value,
                  ]}
                  indic={indic}
                  year={session.year}
                />
              </Col>
              <Col sm={3} xl={3} lg={3} md={3}>
                <h5 className="mb-4">▪ Consommations de capital fixe</h5>
                <ComparativeGraphs
                  id={"fixedCapitalConsumptions-" + indic}
                  graphDataset={[
                    comparativeData.fixedCapitalConsumptions.areaFootprint
                      .indicators[indic].value,
                    fixedCapitalConsumptions.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    comparativeData.fixedCapitalConsumptions.divisionFootprint
                      .indicators[indic].value,
                  ]}
                  targetData={[
                    comparativeData.fixedCapitalConsumptions.targetAreaFootprint
                      .indicators[indic].value,
                    prevPeriod &&
                      fixedCapitalConsumptions.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                    comparativeData.fixedCapitalConsumptions.targetDivisionFootprint.indicators[
                      indic
                    ].data.at(-1).value,
                  ]}
                  indic={indic}
                  year={session.year}
                />
              </Col>

              <Col sm={3} xl={3} lg={3} md={3}>
                <h5 className="mb-4">▪ Valeur ajoutée nette</h5>
                <ComparativeGraphs
                  id={"netValueAdded-" + indic}
                  graphDataset={[
                    comparativeData.netValueAdded.areaFootprint.indicators[
                      indic
                    ].value,
                    netValueAdded.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value,
                    comparativeData.netValueAdded.divisionFootprint.indicators[
                      indic
                    ].value,
                  ]}
                  targetData={[
                    comparativeData.netValueAdded.targetAreaFootprint
                      .indicators[indic].value,
                    prevPeriod &&
                      netValueAdded.periodsData[
                        prevPeriod.periodKey
                      ].footprint.getIndicator(indic).value,
                    comparativeData.netValueAdded.targetDivisionFootprint.indicators[
                      indic
                    ].data.at(-1).value,
                  ]}
                  indic={indic}
                  year={session.year}
                />
              </Col>
            </Row>
          </div>
        </div>
        <hr></hr>
        <Row>
          <Col lg={12}>
            <ComparativeTable
              financialData={session.financialData}
              indic={indic}
              comparativeData={comparativeData}
              period={period}
              prevPeriod={prevPeriod}
            />
          </Col>
          <Col lg={4} className="hidden">
            <DeviationChart
              id={"deviationChart-" + indic}
              legalUnitData={[
                session.financialData.mainAggregates.production.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                session.financialData.mainAggregates.intermediateConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                session.financialData.mainAggregates.fixedCapitalConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                session.financialData.mainAggregates.netValueAdded.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
              ]}
              branchData={[
                comparativeData.production.divisionFootprint.indicators[indic]
                  .value,
                comparativeData.intermediateConsumptions.divisionFootprint
                  .indicators[indic].value,
                comparativeData.fixedCapitalConsumptions.divisionFootprint
                  .indicators[indic].value,
                comparativeData.netValueAdded.divisionFootprint.indicators[
                  indic
                ].value,
              ]}
              indic={indic}
            />
          </Col>
        </Row>
      </section>
      {/* ---------- Trend Line Chart ----------  */}
      {comparativeDivision != "00" && (
        <section className="step">
          <h3>Courbes d'évolution</h3>
          <div style={{ width: "300px" }}>
            <Select
              className="mb-3 small"
              defaultValue={{
                label: trendGraphView.label,
                value: trendGraphView.value,
              }}
              options={graphViewOptions}
              onChange={changeTrendGraphView}
            />
          </div>
          <Row>
            <Col lg={8} sm={8} xs={8} className="charts-container ">
              <div
                className={
                  trendGraphView.value != "prd"
                    ? "hidden rounded p-4"
                    : "border rounded p-4"
                }
              >
                <h5 className="text-center">
                  Evolution de la performance de la branche
                </h5>
                <TrendsGraph
                  id={"trend-prd-" + indic}
                  unit={metaIndics[indic].unit}
                  code={comparativeDivision}
                  trends={
                    comparativeData.production.trendsFootprint.indicators[indic]
                  }
                  target={
                    comparativeData.production.targetDivisionFootprint
                      .indicators[indic]
                  }
                  current={
                    production.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  prev={
                    prevPeriod &&
                    production.periodsData[
                      prevPeriod.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </div>
              <div
                className={
                  trendGraphView.value != "ic"
                    ? "hidden rounded p-4"
                    : "border rounded p-4"
                }
              >
                <p className="text-primary fw-bold text-center">
                  {
                    comparativeData.intermediateConsumptions.trendsFootprint
                      .indicators[indic].meta.label
                  }
                </p>
                <TrendsGraph
                  id={"trend-ci-" + indic}
                  unit={metaIndics[indic].unit}
                  code={comparativeDivision}
                  trends={
                    comparativeData.intermediateConsumptions.trendsFootprint
                      .indicators[indic]
                  }
                  target={
                    comparativeData.intermediateConsumptions
                      .targetDivisionFootprint.indicators[indic]
                  }
                  current={
                    intermediateConsumptions.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  prev={
                    prevPeriod &&
                    intermediateConsumptions.periodsData[
                      prevPeriod.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </div>
              <div
                className={
                  trendGraphView.value != "cfc"
                    ? "hidden rounded p-4"
                    : "border rounded p-4"
                }
              >
                <p className="text-primary fw-bold text-center">
                  {
                    comparativeData.fixedCapitalConsumptions.trendsFootprint
                      .indicators[indic].meta.label
                  }
                </p>
                <TrendsGraph
                  id={"trend-cfc-" + indic}
                  unit={metaIndics[indic].unit}
                  code={comparativeDivision}
                  trends={
                    comparativeData.fixedCapitalConsumptions.trendsFootprint
                      .indicators[indic]
                  }
                  target={
                    comparativeData.fixedCapitalConsumptions
                      .targetDivisionFootprint.indicators[indic]
                  }
                  current={
                    fixedCapitalConsumptions.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  prev={
                    prevPeriod &&
                    fixedCapitalConsumptions.periodsData[
                      prevPeriod.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </div>
              <div
                className={
                  trendGraphView.value != "nva"
                    ? "hidden rounded p-4"
                    : "border rounded p-4"
                }
              >
                <p className="text-primary fw-bold text-center">
                  {
                    comparativeData.netValueAdded.trendsFootprint.indicators[
                      indic
                    ].meta.label
                  }
                </p>
                <TrendsGraph
                  id={"trend-nva-" + indic}
                  unit={metaIndics[indic].unit}
                  code={comparativeDivision}
                  trends={
                    comparativeData.netValueAdded.trendsFootprint.indicators[
                      indic
                    ]
                  }
                  target={
                    comparativeData.netValueAdded.targetDivisionFootprint
                      .indicators[indic]
                  }
                  current={
                    netValueAdded.periodsData[
                      period.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  prev={
                    prevPeriod &&
                    netValueAdded.periodsData[
                      prevPeriod.periodKey
                    ].footprint.getIndicator(indic).value
                  }
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </div>
            </Col>
            <Col lg={4} sm={4} xs={4}>
              <div className="border rounded  p-4">
                <h4 className="h5">Notes</h4>
                <p className="small-text">
                  Données pour la branche "{divisions[comparativeDivision]}"
                </p>
                <h5>Tendance de la branche :</h5>
                <p className="small-text">
                  {
                    comparativeData.production.trendsFootprint.indicators[indic]
                      .meta.info
                  }
                </p>

                {comparativeData.production.targetDivisionFootprint.indicators[
                  indic
                ].meta.info && (
                  <>
                    <h5>Objectif de la branche :</h5>
                    <p className="small">
                      {
                        comparativeData.production.targetDivisionFootprint
                          .indicators[indic].meta.info
                      }
                    </p>
                  </>
                )}
                <hr />
                <p className="small">
                  Source :&nbsp;
                  {comparativeData.production.trendsFootprint.indicators[indic]
                    .meta.source + " (Tendance)"}
                  {comparativeData.production.targetDivisionFootprint
                    .indicators[indic].meta.source &&
                    ", " +
                      comparativeData.production.targetDivisionFootprint
                        .indicators[indic].meta.source +
                      " (Objectif)"}
                </p>
              </div>
            </Col>
          </Row>
        </section>
      )}
      {/* ---------- Analyse Note  ----------  */}

      <section className="step">
        <h3>Note d'analyse</h3>
        <div id="analyse">
          <Analyse indic={indic} session={session} period={period} />
        </div>
      </section>
      {/* ---------- Footer section ----------  */}

      <section className="step">
        <div className="d-flex justify-content-end">
          <Button variant="light" onClick={props.goBack}>
            <i className="bi bi-chevron-left"></i> Retour
          </Button>
          <Button variant="secondary" onClick={handleindicReportPDF}>
            Plaquette <i className="bi bi-download"></i>
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              createIndicReport(
                session.legalUnit.corporateName,
                indic,
                metaIndics[indic].libelle,
                metaIndics[indic].unit,
                session.financialData,
                session.impactsData,
                session.comparativeData,
                true,
                period
              )
            }
          >
            Rapport <i className="bi bi-download"></i>
          </Button>
        </div>
      </section>
      {popUp == "division" && (
        <ChangeDivision
          indic={indic}
          session={props.session}
          handleDivision={changeComparativeDivision}
          onGoBack={handleClose}
          handleClose={handleClose}
          handleDownload={handleindicReportPDF}
        ></ChangeDivision>
      )}
    </>
  );
};

/* ----- STATEMENTS / ASSESSMENTS COMPONENTS ----- */

const Analyse = ({ indic, session, period }) => {
  let analyse = getAnalyse(
    session.impactsData,
    session.financialData,
    session.comparativeData,
    indic,
    period
  );

  return (
    <>
      {analyse.map((paragraph, index) => (
        <p key={index}>{paragraph.reduce((a, b) => a + " " + b)}</p>
      ))}
    </>
  );
};

export default ResultSection;
