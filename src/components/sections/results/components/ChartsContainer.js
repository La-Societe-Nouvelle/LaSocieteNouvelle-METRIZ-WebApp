// La Société Nouvelle

// React
import React from "react";
import { Row } from "react-bootstrap";

// Lib
import indicators from "/lib/indics";

// Charts
import { ComparativeChart } from "../charts/ComparativeChart";
import TrendChart from "../charts/TrendChart";
import SigPieChart from "../charts/SigPieChart";
import DeviationChart from "../charts/HorizontalBarChart";

import { printValue } from "/src/utils/formatters";
import { GrossImpactChart } from "../charts/GrossImpactChart";
import { getClosestYearData } from "../utils";

/* ---------- CHARTS CONTAINER ---------- */

/** Container for charts
 *  
 *  Props :
 *    - session
 *    - period
 * 
 *  Build charts for all indicators (to use in report)
 */

export const ChartsContainer = ({
  session,
  period,
}) => {
  return (
    <>
      {session.validations[period.periodKey].map(
        (indic) => 
        (
          <div key={indic}>
            <IndicatorCharts
              session={session}
              period={period}
              indic={indic}
            />
          </div>
        )
      )}
    </>
  );
}

const IndicatorCharts = ({
  session,
  period,
  indic
}) => {

  const {
    financialData,
    comparativeData
  } = session;

  // Define the aggregates and their corresponding titles
  const mainAggregates = financialData.mainAggregates;
  const aggregates = {
    production: "Production",
    intermediateConsumptions: "Consommations intermédiaires",
    fixedCapitalConsumptions: "Consommations de capital fixe",
    netValueAdded: "Valeur ajoutée nette",
  };

  return (
    <div
      className={"charts-container " + indic}
      style={{ position: "absolute", left: "-9999px", top: "-99999px" }}
    >
      <Row className="charts">
        {Object.keys(aggregates).map((aggregate) => (
          <React.Fragment key={aggregate}>
            {renderComparativeCharts({
              chartId: `comparative-chart-${aggregate}-${indic}-print`,
              session,
              period,
              aggregate,
              indic
            })}
            {renderSigCharts(
              `sig-chart-${aggregate}-${indic}-print`,
              indic,
              printValue(
                mainAggregates[aggregate].periodsData[period.periodKey]
                  .footprint.indicators[indic].value,
                indicators[indic].nbDecimals
              ),
              aggregates[aggregate]
            )}
          </React.Fragment>
        ))}
      </Row>
      <Row>
        <div className="trend-chart-container">
    
          <TrendChart
            id={`trend-chart-${indic}-print`}
            unit={indicators[indic].unit}
            historical={
              comparativeData["production"].division.history.data[indic]
            }
            trend={
              comparativeData["production"].division.trend.data[indic]
            }
            target={
              comparativeData["production"].division.target.data[indic]
            }
            aggregate={mainAggregates.production.periodsData}
            legalUnitTarget = {comparativeData["production"].legalUnit.target.data[indic] ?? []}
            indic={indic}
            isPrinting={true}
          />
        </div>
      </Row>
      {(indicators[indic].type == "intensité" ||
        indicators[indic].type == "indice") && (
        <Row>
          <div className="deviation-chart-container">
            <DeviationChart
              id={`deviation-chart-${indic}-print`}
              session={session}
              period={period}
              indic={indic}
              isPrinting={true}
            />
          </div>
        </Row>
      )}

      {/* ----------Gross Impact Chart ----------  */}
      {indicators[indic].type == "intensité" && (
        <div className="impact-chart-container">
          <GrossImpactChart
            id={`gross-impact-chart-${indic}-print`}
            session={session}
            period={period}
            indic={indic}
            isPrinting={true}/>
        </div>
      )}
    </div>
  );
}

const renderComparativeCharts = ({
  chartId,
  session,
  period,
  aggregate,
  indic
}) => {
  return (
    <div key={chartId} className={"comparative-chart-container"}>
      <ComparativeChart
        id={chartId}
        session={session}
        period={period}
        aggregate={aggregate}
        indic={indic}
        isPrinting={false}
      />
    </div>
  );
};
{
  /* --------- SIG Footprints charts ----------  */
}

const renderSigCharts = (chartId, indic, aggregateFootprint, title) => {
  return (
    <>
      {indicators[indic].type == "proportion" && (
        <div key={chartId} className="doughnut-chart-container">
          <SigPieChart
            value={aggregateFootprint}
            title={title}
            id={chartId}
            isPrinting={true}
          />
        </div>
      )}
    </>
  );
};

