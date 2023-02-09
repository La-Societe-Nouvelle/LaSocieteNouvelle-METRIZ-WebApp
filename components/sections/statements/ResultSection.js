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
import ComparativeGraphs from "../../graphs/ComparativeGraphs";
import PieGraph from "../../graphs/PieGraph";
import TrendsGraph from "../../graphs/TrendsGraph";

// Tables
import { ComparativeTable } from "../../tables/ComparativeTable";
import { IndicatorExpensesTable } from "../../tables/IndicatorExpensesTable";
import { IndicatorMainAggregatesTable } from "../../tables/IndicatorMainAggregatesTable";

// Fetch API data
import getMacroSerieData from "/src/services/responses/MacroSerieData";
import getHistoricalSerieData from "/src/services/responses/HistoricalSerieData";

import { createIndicReport } from "../../../src/writers/deliverables/PDFGenerator";
import { getAnalyse } from "../../../src/utils/Writers";
import { CreateContribIndicatorPDF } from "../../../src/writers/deliverables/contribIndicPDF";
import { CreateIntensIndicatorPDF } from "../../../src/writers/deliverables/intensIndicPDF";

const ResultSection = (props) => {
  const [indic, setIndic] = useState(props.indic);
  const [session] = useState(props.session);
  const [error] = useState(false);

  const [divisionsOptions, setDivisionsOptions] = useState([]);

  useEffect(() => {
    let options = [];
    //Divisions select options
    Object.entries(divisions)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(([value, label]) => {
        if (value != "00") {
          options.push({ value: value, label: value + " - " + label });
        }
      });

    setDivisionsOptions(options);
  }, []);

  const { intermediateConsumption, capitalConsumption, netValueAdded } =
    props.session.financialData.aggregates;

  /* ----------  COMPARATIVE DATA ---------- */
  const [comparativeDivision, setComparativeDivision] = useState(
    props.session.comparativeData.activityCode
  );
  const [comparativeData, setComparativeData] = useState(
    props.session.comparativeData
  );

  /* ---------- Update Comparative division ---------- */

  const changeComparativeDivision = async (event) => {
    let division = event.value;

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
      //props.session.comparativeData.activityCode = comparativeDivision;

      let newComparativeData = comparativeData;

      for await (const indic of props.session.validations) {
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

  const handlePDFGenerator = () => {
    const type = metaIndics[indic].type;

    switch (type) {
      case "proportion":
        CreateContribIndicatorPDF(
          metaIndics[indic].libelle,
          session.year,
          session.legalUnit.corporateName,
          indic,
          metaIndics[indic].libelleGrandeur,
          session.financialData,
          session.comparativeData,
          true
        );
        break;
      case "intensité":
        CreateIntensIndicatorPDF(
          session.year,
          session.legalUnit.corporateName,
          indic,
          metaIndics[indic].libelle,
          metaIndics[indic].unit,
          session.financialData,
          session.comparativeData,
          comparativeData.netValueAdded.trendsFootprint.indicators[indic].meta
          .label,
          true
        );
        break;
      default:
        break;
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
          <Button variant="secondary" onClick={handlePDFGenerator}>
            Télécharger la fiche <i className="bi bi-download"></i>
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
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
                true
              )
            }
          >
            Télécharger le rapport <i className="bi bi-download"></i>
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
          {/* ----------Gross Impact Pie Chart ----------  */}

          {metaIndics[indic].type == "intensité" && (
            <Col sm={3}>
              <div className="border rounded mt-5 px-5 pb-4">
                <h3 className="text-center">
                  Répartition des impacts bruts (en %)
                </h3>
                <PieGraph
                  id={"part-" + indic}
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
            <Row className="graphs">
              <Col sm={3} xl={3} lg={3} md={3}>
                <h5 className="mb-4">▪ Production</h5>
                <ComparativeGraphs
                  id={"production-" + indic}
                  graphDataset={[
                    comparativeData.production.areaFootprint.indicators[indic]
                      .value,
                    session.financialData.aggregates.production.footprint.getIndicator(
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
                  indic={indic}
                  year={session.year}
                />
              </Col>
              <Col sm={3} xl={3} lg={3} md={3}>
                <h5 className="mb-4">▪ Consommations intermédiaires</h5>
                <ComparativeGraphs
                  id={"intermediateConsumption-" + indic}
                  graphDataset={[
                    comparativeData.intermediateConsumption.areaFootprint
                      .indicators[indic].value,
                    session.financialData.aggregates.intermediateConsumption.footprint.getIndicator(
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
                  year={session.year}
                />
              </Col>
              <Col sm={3} xl={3} lg={3} md={3}>
                <h5 className="mb-4">▪ Consommation de capital fixe</h5>
                <ComparativeGraphs
                  id={"capitalConsumption-" + indic}
                  graphDataset={[
                    comparativeData.fixedCapitalConsumption.areaFootprint
                      .indicators[indic].value,
                    session.financialData.aggregates.capitalConsumption.footprint.getIndicator(
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
                    session.financialData.aggregates.netValueAdded.footprint.getIndicator(
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
                  year={session.year}
                />
              </Col>
            </Row>
          </div>
        </div>

        <ComparativeTable
          financialData={session.financialData}
          indic={indic}
          comparativeData={comparativeData}
        />
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
                <p className="text-primary fw-bold text-center">
                  {
                    comparativeData.production.trendsFootprint.indicators[indic]
                      .meta.label
                  }
                </p>
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
                    session.financialData.aggregates.production.footprint.getIndicator(
                      indic
                    ).value
                  }
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
                    comparativeData.intermediateConsumption.trendsFootprint
                      .indicators[indic].meta.label
                  }
                </p>
                <TrendsGraph
                  id={"trend-ci-" + indic}
                  unit={metaIndics[indic].unit}
                  code={comparativeDivision}
                  trends={
                    comparativeData.intermediateConsumption.trendsFootprint
                      .indicators[indic]
                  }
                  target={
                    comparativeData.intermediateConsumption
                      .targetDivisionFootprint.indicators[indic]
                  }
                  current={
                    session.financialData.aggregates.intermediateConsumption.footprint.getIndicator(
                      indic
                    ).value
                  }
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
                    comparativeData.fixedCapitalConsumption.trendsFootprint
                      .indicators[indic].meta.label
                  }
                </p>
                <TrendsGraph
                  id={"trend-cfc-" + indic}
                  unit={metaIndics[indic].unit}
                  code={comparativeDivision}
                  trends={
                    comparativeData.fixedCapitalConsumption.trendsFootprint
                      .indicators[indic]
                  }
                  target={
                    comparativeData.fixedCapitalConsumption
                      .targetDivisionFootprint.indicators[indic]
                  }
                  current={
                    session.financialData.aggregates.capitalConsumption.footprint.getIndicator(
                      indic
                    ).value
                  }
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
                    session.financialData.aggregates.netValueAdded.footprint.getIndicator(
                      indic
                    ).value
                  }
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
          <Analyse indic={indic} session={session} />
        </div>
      </section>
      {/* ---------- Footer section ----------  */}

      <section className="step">
        <div className="d-flex justify-content-end">
          <Button variant="light" onClick={props.goBack}>
            <i className="bi bi-chevron-left"></i> Retour
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              createIndicReport(
                session.year,
                session.legalUnit.corporateName,
                indic,
                metaIndics[indic].libelle,
                metaIndics[indic].unit,
                session.financialData,
                session.impactsData,
                session.comparativeData,
                true
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

const Analyse = ({ indic, session }) => {
  let analyse = getAnalyse(
    session.impactsData,
    session.financialData,
    session.comparativeData,
    indic
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
