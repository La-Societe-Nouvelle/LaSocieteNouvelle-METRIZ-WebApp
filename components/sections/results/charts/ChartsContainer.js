import React from "react";
import indicators from "/lib/indics";

import ComparativeChart from "./ComparativeChart";
import TrendsChart from "./TrendsChart";
import SigPieChart from "./SigPieChart";
import DeviationChart from "./HorizontalBarChart";
import { printValue } from "../../../../src/utils/Utils";
import GrossImpactChart from "./GrossImpactChart";

export const ChartsContainer = ({
  validations,
  comparativeData,
  aggregates,
  period,
  prevPeriod,
  unit,
}) => {
  const {
    production,
    fixedCapitalConsumptions,
    intermediateConsumptions,
    netValueAdded,
  } = aggregates;

  const renderCharts = () => {
    return validations.map((indic) => (
      <div key={"chart-" + indic}>
        <div className="comparative-chart-container">
          <ComparativeChart
            id={`comparative-chart-production-${indic}-print`}
            isPrinting={true}
            firstDataset={[
              comparativeData.production.areaFootprint.indicators[indic].value,
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
        </div>
        <div className="comparative-chart-container">
          <ComparativeChart
            id={`comparative-chart-intermediateConsumptions-${indic}-print`}
            isPrinting={true}
            firstDataset={[
              comparativeData.intermediateConsumptions.areaFootprint.indicators[
                indic
              ].value,
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
          />
        </div>

        <div className="comparative-chart-container">
          <ComparativeChart
            id={`comparative-chart-fixedCapitalConsumptions-${indic}-print`}
            isPrinting={true}
            firstDataset={[
              comparativeData.fixedCapitalConsumptions.areaFootprint.indicators[
                indic
              ].value,
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
          />
        </div>

        <div className="comparative-chart-container">
          <ComparativeChart
            id={`comparative-chart-netValueAdded-${indic}-print`}
            isPrinting={true}
            firstDataset={[
              comparativeData.netValueAdded.areaFootprint.indicators[indic]
                .value,
              prevPeriod &&
                netValueAdded.periodsData[
                  prevPeriod.periodKey
                ].footprint.getIndicator(indic).value,
              comparativeData.netValueAdded.divisionFootprint.indicators[indic]
                .value,
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
          />
        </div>
        {console.log(indicators[indic].type)}
        {indicators[indic].type == "proportion" && (
          <>
            {/* --------- SIG Footprints charts ----------  */}
            <div className="doughnut-chart-container">
              <SigPieChart
                value={printValue(
                  production.periodsData[period.periodKey].footprint.indicators[
                    indic
                  ].value,
                  indicators[indic].nbDecimals
                )}
                title={"Production"}
                id={`sig-chart-production-${indic}-print`}
                isPrinting={true}
              />
            </div>
            <div className="doughnut-chart-container">
              <SigPieChart
                value={printValue(
                  intermediateConsumptions.periodsData[period.periodKey]
                    .footprint.indicators[indic].value,
                  indicators[indic].nbDecimals
                )}
                title={"Consommations intermédiaires"}
                id={`sig-chart-intermediateConsumptions-${indic}-print`}
                isPrinting={true}
              />
            </div>
            <div className="doughnut-chart-container">
              <SigPieChart
                value={printValue(
                  fixedCapitalConsumptions.periodsData[period.periodKey]
                    .footprint.indicators[indic].value,
                  indicators[indic].nbDecimals
                )}
                title={"Consommation de capital fixe"}
                id={`sig-chart-fixedCapitalConsumptions-${indic}-print`}
                isPrinting={true}
              />
            </div>
            <div className="doughnut-chart-container">
              <SigPieChart
                value={printValue(
                  netValueAdded.periodsData[
                    period.periodKey
                  ].footprint.indicators[indic].getValue(),
                  indicators[indic].nbDecimals
                )}
                title={"Valeur ajoutée nette"}
                id={`sig-chart-netValueAdded-${indic}-print`}
                isPrinting={true}
              />
            </div>
          </>
        )}

        {indicators[indic].type == "intensité" && (
          <div className="deviation-chart-container">
            <DeviationChart
              id={`deviation-chart-${indic}-print`}
              legalUnitData={[
                aggregates.production.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                aggregates.intermediateConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                aggregates.fixedCapitalConsumptions.periodsData[
                  period.periodKey
                ].footprint.getIndicator(indic).value,
                aggregates.netValueAdded.periodsData[
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
              isPrinting={true}
            />
          </div>
        )}

        {/* ---------- Target and Trend Line Chart ----------  */}
        <div className="trend-chart-container">
          <TrendsChart
            id={`trend-chart-${indic}-print`}
            unit={indicators[indic].unit}
            trends={
              comparativeData.production.trendsFootprint.indicators[indic]
            }
            target={
              comparativeData.production.targetDivisionFootprint.indicators[
                indic
              ]
            }
            aggregate={production.periodsData}
            indic={indic}
            isPrinting={true}
          />
        </div>
        {/* ----------Gross Impact Chart ----------  */}
        {indicators[indic].type == "intensité" && (
          <div className="impact-chart-container">
            <GrossImpactChart
              id={`gross-impact-chart-${indic}-print`}
              isPrinting={true}
              intermediateConsumptions={intermediateConsumptions.periodsData[
                period.periodKey
              ].footprint.indicators[indic].getGrossImpact(
                intermediateConsumptions.periodsData[period.periodKey].amount
              )}
              fixedCapitalConsumptions={fixedCapitalConsumptions.periodsData[
                period.periodKey
              ].footprint.indicators[indic].getGrossImpact(
                fixedCapitalConsumptions.periodsData[period.periodKey].amount
              )}
              netValueAdded={netValueAdded.periodsData[
                period.periodKey
              ].footprint.indicators[indic].getGrossImpact(
                netValueAdded.periodsData[period.periodKey].amount
              )}
            />
          </div>
        )}
      </div>
    ));
  };

  return (
    <div
      className="charts-container"
      style={{ position: "absolute", left: "-9999px", top: "-99999px" }}
    >
      {renderCharts()}
    </div>
  );
};
