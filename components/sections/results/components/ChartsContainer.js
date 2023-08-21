// La Société Nouvelle

import React from "react";
import { Row } from "react-bootstrap";

// Lib
import indicators from "/lib/indics";

// Charts
import ComparativeChart from "../charts/ComparativeChart";
import TrendChart from "../charts/TrendChart";
import SigPieChart from "../charts/SigPieChart";
import DeviationChart from "../charts/HorizontalBarChart";

import { printValue } from "../../../../src/utils/Utils";
import GrossImpactChart from "../charts/GrossImpactChart";
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
              period={session.financialPeriod}
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

  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const year = period.periodKey.slice(2);
  // Define the aggregates and their corresponding titles
  const mainAggregates = financialData.mainAggregates;
  const aggregates = {
    production: "Production",
    intermediateConsumptions: "Consommations intermédiaires",
    fixedCapitalConsumptions: "Consommations de capital fixe",
    netValueAdded: "Valeur ajoutée nette",
  };

  const datasets = {}; // macro datasets for each aggregate
  const targetDatasets = {}; //  target datasets for each aggregate

  Object.keys(aggregates).forEach((aggregate) => {
    datasets[aggregate] = {
      area: comparativeData[aggregate].area.macrodata.data[indic.toUpperCase()],
      division:
        comparativeData[aggregate].division.macrodata.data[indic.toUpperCase()],
    };

    targetDatasets[aggregate] = {
      area: comparativeData[aggregate].area.target.data[indic.toUpperCase()],
      division:
        comparativeData[aggregate].division.target.data[indic.toUpperCase()],
    };

    // Get the closest year data
    Object.keys(datasets[aggregate]).forEach((category) => {
      datasets[aggregate][category] = getClosestYearData(
        datasets[aggregate][category],
        year
      );
    });

    Object.keys(targetDatasets[aggregate]).forEach((category) => {
      targetDatasets[aggregate][category] = getClosestYearData(
        targetDatasets[aggregate][category],
        year
      );
    });
  });
  return (
    <div
      className={"charts-container " + indic}
      style={{ position: "absolute", left: "-9999px", top: "-99999px" }}
    >
      <Row className="charts">
        {Object.keys(aggregates).map((aggregate) => (
          <React.Fragment key={aggregate}>
            {renderComparativeCharts(
              `comparative-chart-${aggregate}-${indic}-print`,
              [
                datasets[aggregate].area,
                {
                  value:
                    mainAggregates[aggregate].periodsData[period.periodKey]
                      .footprint.indicators[indic].value,
                  year: year,
                },
                datasets[aggregate].division,
              ],
              [
                null,
                prevPeriod
                  ? mainAggregates[aggregate].periodsData[prevPeriod.periodKey]
                      .footprint.indicators[indic].value
                  : null,
                null,
              ],
              [
                targetDatasets[aggregate].area,
                null,
                targetDatasets[aggregate].division,
              ],
              indic
            )}
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
              comparativeData["production"].division.macrodata.data[
                indic.toUpperCase()
              ]
            }
            trend={
              comparativeData["production"].division.trend.data[
                indic.toUpperCase()
              ]
            }
            target={
              comparativeData["production"].division.trend.data[
                indic.toUpperCase()
              ]
            }
            aggregate={mainAggregates.production.periodsData}
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
              legalUnitData={[
                mainAggregates.production.periodsData[period.periodKey].footprint
                  .indicators[indic].value,
                mainAggregates.intermediateConsumptions.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].value,
                mainAggregates.fixedCapitalConsumptions.periodsData[
                  period.periodKey
                ].footprint.indicators[indic].value,
                mainAggregates.netValueAdded.periodsData[period.periodKey].footprint
                  .indicators[indic].value,
              ]}
              branchData={[
                datasets["production"].division,
                datasets["intermediateConsumptions"].division,
                datasets["fixedCapitalConsumptions"].division,
                datasets["netValueAdded"].division,
              ]}
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
            isPrinting={true}
            intermediateConsumptions={mainAggregates.intermediateConsumptions.periodsData[
              period.periodKey
            ].footprint.indicators[indic].getGrossImpact(
              mainAggregates.intermediateConsumptions.periodsData[
                period.periodKey
              ].amount
            )}
            fixedCapitalConsumptions={mainAggregates.fixedCapitalConsumptions.periodsData[
              period.periodKey
            ].footprint.indicators[indic].getGrossImpact(
              mainAggregates.fixedCapitalConsumptions.periodsData[
                period.periodKey
              ].amount
            )}
            netValueAdded={mainAggregates.netValueAdded.periodsData[
              period.periodKey
            ].footprint.indicators[indic].getGrossImpact(
              mainAggregates.netValueAdded.periodsData[period.periodKey].amount
            )}
          />
        </div>
      )}
    </div>
  );
}

const renderComparativeCharts = (
  chartId,
  datasets,
  prevFootprint,
  targetDatasets,
  indic
) => {
  return (
    <div key={chartId} className={"comparative-chart-container"}>
      <ComparativeChart
        id={chartId}
        footprintDataset={datasets}
        prevFootprint={prevFootprint}
        targetDataset={targetDatasets}
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

