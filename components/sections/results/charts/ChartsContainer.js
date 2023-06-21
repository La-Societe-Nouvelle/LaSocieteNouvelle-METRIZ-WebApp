import React from "react";
import { Col, Row } from "react-bootstrap";
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
      <Row key={"chart-" + indic}>
        <Col>
          <ComparativeChart
            id={"production-" + indic}
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
        </Col>
        <Col>
          <ComparativeChart
            id={"intermediateConsumptions-" + indic}
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
        </Col>

        <Col>
          <ComparativeChart
            id={"fixedCapitalConsumptions-" + indic}
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
        </Col>

        <Col>
          <ComparativeChart
            id={"netValueAdded-" + indic}
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
        </Col>
        {/* SIG Pie chart */}
        <Col>
          <SigPieChart
            value={printValue(
              production.periodsData[period.periodKey].footprint.indicators[
                indic
              ].value,
              indicators[indic].nbDecimals
            )}
            title={"Production"}
            id={"prd-" + indic}
          />
        </Col>
        <Col>
          <SigPieChart
            value={printValue(
              intermediateConsumptions.periodsData[period.periodKey].footprint
                .indicators[indic].value,
              indicators[indic].nbDecimals
            )}
            title={"Consommations intermédiaires"}
            id={"ic-" + indic}
          />
        </Col>
        <Col>
          <SigPieChart
            value={printValue(
              fixedCapitalConsumptions.periodsData[period.periodKey].footprint
                .indicators[indic].value,
              indicators[indic].nbDecimals
            )}
            title={"Consommation de capital fixe"}
            id={"ccf-" + indic}
          />
        </Col>
        <Col>
          <SigPieChart
            value={printValue(
              netValueAdded.periodsData[period.periodKey].footprint.indicators[
                indic
              ].getValue(),
              indicators[indic].nbDecimals
            )}
            title={"Valeur ajoutée nette"}
            id={"nva-" + indic}
          />
        </Col>
        <Col>
          <DeviationChart
            id={"deviationChart-" + indic}
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
              comparativeData.netValueAdded.divisionFootprint.indicators[indic]
                .value,
            ]}
            indic={indic}
          />
        </Col>
        {/* Target/Trends charts */}
        <Col lg={4} sm={4}>
          <TrendsChart
            id={`trend-prd-${indic}`}
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
          />
        </Col>
        <Col>
          <GrossImpactChart
            id={"part-" + indic}
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
        </Col>
      </Row>
    ));
  };

  return (
    <div
      id="chartContainer"
      style={{ position: "absolute", left: "-9999px", top: "-99999px" }}
    >
      {renderCharts()}
    </div>
  );
};
