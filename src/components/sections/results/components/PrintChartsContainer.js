// La Société Nouvelle

// React
import React from "react";
import { Row } from "react-bootstrap";

// Lib
import indicators from "/lib/indics";

// Charts
import { TrendChart } from "../charts/TrendChart";
import { SigPieChart } from "../charts/SigPieChart";
import { HorizontalBarChart } from "../charts/HorizontalBarChart";

import { GrossImpactChart } from "../charts/GrossImpactChart";
import { getPrevDate } from "../../../../utils/periodsUtils";
import { VerticalBarChart } from "../charts/VerticalBarChart";

/* ---------- CHARTS CONTAINER ---------- */

/** Container for charts
 *  
 *  Props :
 *    - session
 *    - period
 * 
 *  Build charts for all indicators (to use in report)
 */

export const PrintChartsContainer = ({
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
  } = session;

  // Define the aggregates and their corresponding titles
  const mainAggregates = financialData.mainAggregates;
  const aggregates = {
    production: "Production",
    intermediateConsumptions: "Consommations intermédiaires",
    fixedCapitalConsumptions: "Consommations de capital fixe",
    netValueAdded: "Valeur ajoutée nette",
  };

    // Prev period

    const prevDateEnd = getPrevDate(period.dateStart);
    const prevPeriod =
      session.availablePeriods.find((period) => period.dateEnd == prevDateEnd) ||
      false;

      
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
              session,
              aggregate,
              indic,
              period,
              `sig-chart-${aggregate}-${indic}-print`,
            )}
          </React.Fragment>
        ))}
      </Row>
      <Row>
        <div className="trend-chart-container">
          <TrendChart
            id={`trend-chart-${indic}-print`}
            session={session}
            datasetOptions={{
              aggregate: "production",
              indic
            }}
            printOptions={{
              printMode: true
            }}
          />
        </div>
      </Row>
      {(indicators[indic].type == "intensité" ||
        indicators[indic].type == "indice") && (
        <Row>
          <div className="deviation-chart-container">
            <HorizontalBarChart
              id={`deviation-chart-${indic}-print`}
              session={session}
              datasetOptions={{
                period,
                indic
              }}
              printOptions={{
                printMode: true
              }}
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
            datasetOptions={{
              period,
              indic
            }}
            printOptions={{
              printMode: true
            }}
          />
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
      <VerticalBarChart
        id={chartId}
        session={session}
        datasetOptions={{
          period,
          aggregate,
          indic
        }}
        printOptions={{
          printMode: true,
          showDivisionData: true,
          showAreaData: true,
          showTargetData: true,
          useIndicColors: false,
          aspectRatio : 1,
          label: "Production"
        }}
      />
    </div>
  );
};
{
  /* --------- SIG Footprints charts ----------  */
}

const renderSigCharts = (session, aggregate, indic, period, id) => {
  return (
    <>
      {indicators[indic].type == "proportion" && (
        <div key={id} className="doughnut-chart-container">
          <SigPieChart
            id={id}
            session={session}
            datasetOptions={{
              aggregate,
              indic,
              period
            }}
            printOptions={{
              showPreviousData: false,
              printMode: true
            }}
          />
        </div>
      )}
    </>
  );
};

