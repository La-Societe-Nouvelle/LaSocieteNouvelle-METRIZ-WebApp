import React from "react";

import { Button, Col, Image, Row, Tab, Tabs } from "react-bootstrap";

// PDF Generation
import { generateContributionIndicatorSheet } from "/src/utils/deliverables/generateContributionIndicatorSheet";
import { generateIntensityIndicatorSheet } from "/src/utils/deliverables/generateIntensityIndicatorSheet";
import { generateIndiceIndicatorSheet } from "/src/utils/deliverables/generateIndiceIndicatorSheet";
// Tables
import { MainAggregatesTable } from "../tables/MainAggregatesTable";
import { ExpensesTable } from "../tables/ExpensesTable";
import { ComparativeTable } from "../tables/ComparativeTable";
// Charts
import GrossImpactChart from "../charts/GrossImpactChart";

// Child components
import Analyse from "./AnalyseNote";
import ComparativeDataContainer from "./ComparativeDataContainer";
import TrendsDataContainer from "./TrendsDataContainer";
import SigFootprintsContainer from "./SigFootprintsContainer";

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
  isLoading,
}) => {
  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  const handleDownload = async () => {
    const reportType = metaIndic.type;
    const libelle = metaIndic.libelle;
    const unit = metaIndic.unit;

    switch (reportType) {
      case "proportion":
        generateContributionIndicatorSheet(
          libelle,
          legalUnit.corporateName,
          indic,
          financialData,
          comparativeData,
          true,
          period
        );
        break;
      case "intensité":
        generateIntensityIndicatorSheet(
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
        generateIndiceIndicatorSheet(
          libelle,
          libelleGrandeur,
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

      {metaIndic.type === "proportion" && (
        <SigFootprintsContainer
          production={production}
          intermediateConsumptions={intermediateConsumptions}
          fixedCapitalConsumptions={fixedCapitalConsumptions}
          netValueAdded={netValueAdded}
          period={period}
          indic={indic}
          metaIndic={metaIndic}
        />
      )}
      {/* ---------Comparative data charts ----------  */}
      <ComparativeDataContainer
        indic={indic}
        comparativeData={comparativeData}
        production={production}
        intermediateConsumptions={intermediateConsumptions}
        fixedCapitalConsumptions={fixedCapitalConsumptions}
        netValueAdded={netValueAdded}
        period={period}
        prevPeriod={prevPeriod}
      />

      {/* ---------Comparative data Table ----------  */}

      <ComparativeTable
        financialData={financialData}
        indic={indic}
        comparativeData={comparativeData}
        period={period}
        prevPeriod={prevPeriod}
      />

      {/* ---------- Trend Line Chart ----------  */}
      <TrendsDataContainer
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
