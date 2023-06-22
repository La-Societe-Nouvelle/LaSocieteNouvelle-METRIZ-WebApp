import React from "react";

import { Button, Col, Image, Row, Tab, Tabs } from "react-bootstrap";

//
import { printValue } from "/src/utils/Utils";

import { MainAggregatesTable } from "../tables/MainAggregatesTable";
import { ExpensesTable } from "../tables/ExpensesTable";
import { ComparativeTable } from "../tables/ComparativeTable";

import GrossImpactChart from "../charts/GrossImpactChart";
import ComparativeChart from "../charts/ComparativeChart";
import SigPieChart from "../charts/SigPieChart";
import TrendsComponent from "./TrendsComponent";
import DeviationChart from "../charts/HorizontalBarChart";
import Analyse from "./AnalyseComponent";
import { createContribIndicatorPDF } from "/src/writers/deliverables/contribIndicPDF";
import { createIntensIndicatorPDF } from "/src/writers/deliverables/intensIndicPDF";
import { createIndiceIndicatorPDF } from "/src/writers/deliverables/indiceIndicPDF";

const ExtraFinancialReport = ({
  indic,
  division,
  metaIndic,
  financialData,
  impactsData,
  comparativeData,
  period,
  prevPeriod,
  legalUnit,
}) => {
  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  const handleDownload = () => {
    const reportType = metaIndic.type;
    const libelle = metaIndic.libelle;
    const unit = metaIndic.unit;

    switch (reportType) {
      case "proportion":
        createContribIndicatorPDF(
          reportType,
          legalUnit.corporateName,
          indic,
          financialData,
          comparativeData,
          true,
          period
        );
        break;
      case "intensité":
        createIntensIndicatorPDF(
          legalUnit.corporateName,
          indic,
          libelle,
          unit,
          financialData,
          comparativeData,
          true,
          period
        );
        break;
      case "indice":
        createIndiceIndicatorPDF(
          libelle,
          legalUnit.corporateName,
          indic,
          unit,
          financialData,
          comparativeData,
          true,
          period
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="box">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Image
              className="me-2"
              src={"icons-ese/" + indic + ".svg"}
              alt={indic}
              height={60}
            />

            <h3 className="text-secondary m-0">{metaIndic.libelle}</h3>
          </div>
          <div>
            <Button variant="download" onClick={handleDownload}>
              <i className="bi bi-download"></i> Rapport sur l'indicateur
            </Button>
          </div>
        </div>
      </div>

      {/* SIG and external expenses table */}
      <Row>
        <Col>
          <div className="box p-4">
            <h4>Rapport - Analyse extra-financière</h4>
            <Tabs
              defaultActiveKey="mainAggregates"
              transition={false}
              id="noanim-tab-example"
            >
              <Tab
                eventKey="mainAggregates"
                title=" Soldes intermédiaires de gestion"
              >
                <MainAggregatesTable
                  financialData={financialData}
                  indic={indic}
                  metaIndic={metaIndic}
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </Tab>
              <Tab
                eventKey="expensesAccounts"
                title=" Détails - Comptes de charges"
              >
                <ExpensesTable
                  externalExpensesAccounts={
                    financialData.externalExpensesAccounts
                  }
                  indic={indic}
                  metaIndic={metaIndic}
                  period={period}
                  prevPeriod={prevPeriod}
                />
              </Tab>
            </Tabs>
          </div>
        </Col>
        {/* ----------Gross Impact Chart ----------  */}

        {metaIndic.type == "intensité" && (
          <Col lg={4}>
            <div className="box">
              <h4>Répartition des impacts bruts</h4>
              <div className="px-5">
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
                  isPrinting={false}
                />
              </div>
            </div>
          </Col>
        )}
      </Row>

      {/* --------- SIG Footprints charts ----------  */}
      {metaIndic.type == "proportion" && (
        <div className="box ">
          <Row>
            <h4>Empreintes des Soldes Intermédiaires de Gestion</h4>
            <Col lg={3}>
              <h5 className="mb-4 text-center">▪ Production</h5>
              <div className="sig-piechart-container">
                <SigPieChart
                  value={printValue(
                    production.periodsData[period.periodKey].footprint
                      .indicators[indic].value,
                    metaIndic.nbDecimals
                  )}
                  title={"Production"}
                  id={"prd-" + indic}
                  isPrinting={false}
                />
              </div>
            </Col>
            <Col lg={3}>
              <h5 className="mb-4 text-center">
                ▪ Consommations intermédiaires
              </h5>
              <div className="sig-piechart-container">
                <SigPieChart
                  value={printValue(
                    intermediateConsumptions.periodsData[period.periodKey]
                      .footprint.indicators[indic].value,
                    metaIndic.nbDecimals
                  )}
                  title={"Consommations intermédiaires"}
                  id={"ic-" + indic}
                  isPrinting={false}
                />
              </div>
            </Col>
            <Col lg={3}>
              <h5 className="mb-4 text-center">
                ▪ Consommations de capital fixe
              </h5>
              <div className="sig-piechart-container">
                <SigPieChart
                  value={printValue(
                    fixedCapitalConsumptions.periodsData[period.periodKey]
                      .footprint.indicators[indic].value,
                    metaIndic.nbDecimals
                  )}
                  title={"Consommation de capital fixe"}
                  id={"ccf-" + indic}
                  isPrinting={false}
                />
              </div>
            </Col>
            <Col lg={3}>
              <h5 className="mb-4 text-center">▪ Valeur ajoutée nette</h5>
              <div className="sig-piechart-container">
                <SigPieChart
                  value={printValue(
                    netValueAdded.periodsData[
                      period.periodKey
                    ].footprint.indicators[indic].getValue(),
                    metaIndic.nbDecimals
                  )}
                  title={"Valeur ajoutée nette"}
                  id={"nva-" + indic}
                  isPrinting={false}
                />
              </div>
            </Col>
          </Row>
        </div>
      )}
      {/* ---------Comparative data charts ----------  */}

      <div className="box charts-container">
        <h4>Comparaison par activité</h4>

        <Row className="charts">
          <Col sm={3} xl={3} lg={3} md={3}>
            <h5 className="mb-4">▪ Production</h5>
            <ComparativeChart
              id={"production-" + indic}
              isPrinting={false}
              firstDataset={[
                comparativeData.production.areaFootprint.indicators[indic]
                  .value,
                prevPeriod &&
                  production.periodsData[
                    prevPeriod.periodKey
                  ].footprint.getIndicator(indic).value,
                comparativeData.production.divisionFootprint.indicators[indic]
                  .value,
              ]}
              secondDataset={[
                comparativeData.production.targetAreaFootprint.indicators[indic]
                  .value,
                production.periodsData[period.periodKey].footprint.getIndicator(
                  indic
                ).value,

                comparativeData.production.targetDivisionFootprint.indicators[
                  indic
                ].data.at(-1).value,
              ]}
              indic={indic}
            />
          </Col>
          <Col sm={3} xl={3} lg={3} md={3}>
            <h5 className="mb-4">▪ Consommations intermédiaires</h5>
            <ComparativeChart
              id={"intermediateConsumptions-" + indic}
              firstDataset={[
                comparativeData.intermediateConsumptions.areaFootprint
                  .indicators[indic].value,
                prevPeriod &&
                  intermediateConsumptions.periodsData[
                    prevPeriod.periodKey
                  ].footprint.getIndicator(indic).value,
                comparativeData.intermediateConsumptions.divisionFootprint
                  .indicators[indic].value,
              ]}
              secondDataset={[
                comparativeData.intermediateConsumptions.targetAreaFootprint
                  .indicators[indic].value,
                intermediateConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,

                comparativeData.intermediateConsumptions.targetDivisionFootprint.indicators[
                  indic
                ].data.at(-1).value,
              ]}
              indic={indic}
              isPrinting={false}
            />
          </Col>
          <Col sm={3} xl={3} lg={3} md={3}>
            <h5 className="mb-4">▪ Consommations de capital fixe</h5>
            <ComparativeChart
              id={"fixedCapitalConsumptions-" + indic}
              firstDataset={[
                comparativeData.fixedCapitalConsumptions.areaFootprint
                  .indicators[indic].value,
                prevPeriod &&
                  fixedCapitalConsumptions.periodsData[
                    prevPeriod.periodKey
                  ].footprint.getIndicator(indic).value,
                comparativeData.fixedCapitalConsumptions.divisionFootprint
                  .indicators[indic].value,
              ]}
              secondDataset={[
                comparativeData.fixedCapitalConsumptions.targetAreaFootprint
                  .indicators[indic].value,
                fixedCapitalConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,

                comparativeData.fixedCapitalConsumptions.targetDivisionFootprint.indicators[
                  indic
                ].data.at(-1).value,
              ]}
              indic={indic}
              isPrinting={false}
            />
          </Col>

          <Col sm={3} xl={3} lg={3} md={3}>
            <h5 className="mb-4">▪ Valeur ajoutée nette</h5>
            <ComparativeChart
              id={"netValueAdded-" + indic}
              firstDataset={[
                comparativeData.netValueAdded.areaFootprint.indicators[indic]
                  .value,
                prevPeriod &&
                  netValueAdded.periodsData[
                    prevPeriod.periodKey
                  ].footprint.getIndicator(indic).value,
                comparativeData.netValueAdded.divisionFootprint.indicators[
                  indic
                ].value,
              ]}
              secondDataset={[
                comparativeData.netValueAdded.targetAreaFootprint.indicators[
                  indic
                ].value,
                netValueAdded.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                comparativeData.netValueAdded.targetDivisionFootprint.indicators[
                  indic
                ].data.at(-1).value,
              ]}
              indic={indic}
              isPrinting={false}
            />
          </Col>
        </Row>
      </div>
      {/* ---------Comparative data Table ----------  */}
      <Row>
        <Col>
          <div className="box ">
            <ComparativeTable
              financialData={financialData}
              indic={indic}
              comparativeData={comparativeData}
              period={period}
              prevPeriod={prevPeriod}
            />
          </div>
        </Col>
        <Col lg={4}>
          <div className="box ">
            <h5 className="h6 mb-4">
              ▪ Ecart par rapport à la moyenne de la branche
            </h5>
            <DeviationChart
              id={"deviationChart-" + indic}
              legalUnitData={[
                financialData.mainAggregates.production.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                financialData.mainAggregates.intermediateConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                financialData.mainAggregates.fixedCapitalConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                financialData.mainAggregates.netValueAdded.periodsData[
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
              isPrinting={false}
            />
          </div>
        </Col>
      </Row>

      {/* ---------- Trend Line Chart ----------  */}
      <TrendsComponent
        aggregates={financialData.mainAggregates}
        comparativeData={comparativeData}
        indic={indic}
        unit={metaIndic.unit}
        division={division}
      />

      {/* ---------- Analyse Note  ----------  */}

      <div className="box">
        <h4>Note d'analyse</h4>
        <Analyse
          indic={indic}
          impactsData={impactsData}
          financialData={financialData}
          comparativeData={comparativeData}
          period={period}
        />
      </div>
    </>
  );
};

export default ExtraFinancialReport;
