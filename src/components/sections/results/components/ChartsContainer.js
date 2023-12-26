// La Société Nouvelle

// React
import React from "react";
import { Row } from "react-bootstrap";

// Lib
import indicators from "/lib/indics";

// Charts
import TrendChart from "../charts/TrendChart";
import SigPieChart from "../charts/SigPieChart";
import HorizontalBarChart from "../charts/HorizontalBarChart";

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

    // Prev period

    const prevDateEnd = getPrevDate(period.dateStart);
    const prevPeriod =
      session.availablePeriods.find((period) => period.dateEnd == prevDateEnd) ||
      false;

      
  return (
    <div
      className={"charts-container " + indic}
      // style={{ position: "absolute", left: "-9999px", top: "-99999px" }}
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
             mainAggregates[aggregate],
              indic,
              period,
              prevPeriod,
              `sig-chart-${aggregate}-${indic}-print`,
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
            indic={indic}
            printMode={true}
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
              period={period}
              indic={indic}
              printMode={true}
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
            printMode={true}/>
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
                // id={`${aggregate}-${indic}`}
                session={session}
                period={period}
                aggregate={aggregate}
                indic={indic}
                printMode={true}
                showDivisionData={true}
                showAreaData={false}
                showTargetData={true}
                showPreviousData={false}
                useIndicColors={false}
                label={"Production"}
              />

  
    </div>
  );
};
{
  /* --------- SIG Footprints charts ----------  */
}

const renderSigCharts = (aggregate, indic, period, prevPeriod, id) => {
  return (
    <>
      {indicators[indic].type == "proportion" && (
        <div key={id} className="doughnut-chart-container">
          <SigPieChart
            aggregate={aggregate}
            indic={indic}
            period={period}
            prevPeriod={prevPeriod}
            id={id}
            showPreviousData={false}
            printMode={true}
          />
        </div>
      )}
    </>
  );
};

