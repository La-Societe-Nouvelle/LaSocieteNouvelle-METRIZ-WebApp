import React from "react";

import { Col, Row, Tab, Tabs } from "react-bootstrap";

// Tables
import { IndicatorMainAggregatesTable } from "../tables/IndicatorMainAggregatesTable";
import { ExpensesTable } from "../tables/ExpensesTable";
import { ComparativeTable } from "../tables/ComparativeTable";
// Charts
import GrossImpactChart from "../charts/GrossImpactChart";

// Child components
import Analyse from "../components/AnalyseNote";
import ComparativeDataContainer from "../components/ComparativeDataContainer";
import SigFootprintsContainer from "../components/SigFootprintsContainer";
import TrendContainer from "../components/TrendContainer";

// Lib
import indicators from "/lib/indics";

/* ---------- INDICATOR VIEW ---------- */

/** Standard view for each indicator
 *  
 *  Props :
 *    - session
 *    - period
 * 
 *  Args :
 *    - indic (code)
 * 
 *  Structure :
 *    - SIG/External expenses tables
 *    - SIG Footprints diagramm
 *    - Comparative diagrams & table
 *    - Graphic with historical, trend & target
 *    - Analysis note
 * 
 */

export const IndicatorView = ({
  session,
  period,
  indic
}) => {

  const {
    impactsData,
    financialData,
    comparativeData
  } = session;

  const prevPeriod = null;

  const {
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded,
  } = financialData.mainAggregates;

  const metaIndic = indicators[indic];
  const intensityType = metaIndic.type === "intensité";
  const proportionType = metaIndic.type === "proportion";

  return (
    <>
      {/* SIG and external expenses table */}
      <Row>
        <Col>
          <div id="rapport" className="box p-4">
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
                <IndicatorMainAggregatesTable
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
        {intensityType && (
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

      {proportionType && (
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

      {/* ---------Comparative data charts & Table ----------  */}
      <div id="comparaisons" className="box">
        <ComparativeDataContainer
          indic={indic}
          comparativeData={comparativeData}
          financialData={financialData.mainAggregates}
          period={period}
          prevPeriod={prevPeriod}
        />
        <ComparativeTable
          financialData={financialData.mainAggregates}
          indic={indic}
          comparativeData={comparativeData}
          period={period}
          prevPeriod={prevPeriod}
        />
      </div>

      {/* ---------- Trend Line Chart ----------  */}
      <TrendContainer
        aggregates={financialData.mainAggregates}
        comparativeData={comparativeData}
        indic={indic}
        unit={metaIndic.unit}
        division={session.comparativeData.activityCode}
      />

      {/* ---------- Analyse Note  ----------  */}
      <div className="box" id="analyse">
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
}