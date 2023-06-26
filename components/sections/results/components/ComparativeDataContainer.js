// ComparativeDataCharts.js
import React from "react";
import { Row, Col } from "react-bootstrap";
import ComparativeChart from "../charts/ComparativeChart";

const ComparativeDataContainer = ({
  indic,
  comparativeData,
  production,
  intermediateConsumptions,
  fixedCapitalConsumptions,
  netValueAdded,
  period,
  prevPeriod,
}) => {
  const renderChart = (title, chartId, firstDataset, secondDataset, indic) => (
    <Col sm={3} xl={3} lg={3} md={3}>
      <h5 className="mb-4">{title}</h5>
      <ComparativeChart
        id={chartId}
        firstDataset={firstDataset}
        secondDataset={secondDataset}
        indic={indic}
        isPrinting={false}
      />
    </Col>
  );

  return (
    <div className="box charts-container">
      <h4>Comparaison par activité</h4>

      <Row className="charts">
        {renderChart(
          "Production",
          "production-" + indic,
          [
            comparativeData.production.areaFootprint.indicators[indic].value,
            prevPeriod &&
              production.periodsData[prevPeriod.periodKey].footprint.getIndicator(
                indic
              ).value,
            comparativeData.production.divisionFootprint.indicators[indic]
              .value,
          ],
          [
            comparativeData.production.targetAreaFootprint.indicators[indic]
              .value,
            production.periodsData[period.periodKey].footprint.getIndicator(
              indic
            ).value,
            comparativeData.production.targetDivisionFootprint.indicators[
              indic
            ].data.at(-1).value,
          ],
          indic
        )}

        {renderChart(
          "Consommations intermédiaires",
          "intermediateConsumptions-" + indic,
          [
            comparativeData.intermediateConsumptions.areaFootprint.indicators[
              indic
            ].value,
            prevPeriod &&
              intermediateConsumptions.periodsData[
                prevPeriod.periodKey
              ].footprint.getIndicator(indic).value,
            comparativeData.intermediateConsumptions.divisionFootprint.indicators[
              indic
            ].value,
          ],
          [
            comparativeData.intermediateConsumptions.targetAreaFootprint.indicators[
              indic
            ].value,
            intermediateConsumptions.periodsData[period.periodKey].footprint.getIndicator(
              indic
            ).value,
            comparativeData.intermediateConsumptions.targetDivisionFootprint.indicators[
              indic
            ].data.at(-1).value,
          ],
          indic
        )}

        {renderChart(
          "Consommations de capital fixe",
          "fixedCapitalConsumptions-" + indic,
          [
            comparativeData.fixedCapitalConsumptions.areaFootprint.indicators[
              indic
            ].value,
            prevPeriod &&
              fixedCapitalConsumptions.periodsData[
                prevPeriod.periodKey
              ].footprint.getIndicator(indic).value,
            comparativeData.fixedCapitalConsumptions.divisionFootprint.indicators[
              indic
            ].value,
          ],
          [
            comparativeData.fixedCapitalConsumptions.targetAreaFootprint.indicators[
              indic
            ].value,
            fixedCapitalConsumptions.periodsData[period.periodKey].footprint.getIndicator(
              indic
            ).value,
            comparativeData.fixedCapitalConsumptions.targetDivisionFootprint.indicators[
              indic
            ].data.at(-1).value,
          ],
          indic
        )}

        {renderChart(
          "Valeur ajoutée nette",
          "netValueAdded-" + indic,
          [
            comparativeData.netValueAdded.areaFootprint.indicators[indic].value,
            prevPeriod &&
              netValueAdded.periodsData[prevPeriod.periodKey].footprint.getIndicator(
                indic
              ).value,
            comparativeData.netValueAdded.divisionFootprint.indicators[indic]
              .value,
          ],
          [
            comparativeData.netValueAdded.targetAreaFootprint.indicators[indic]
              .value,
            netValueAdded.periodsData[period.periodKey].footprint.getIndicator(
              indic
            ).value,
            comparativeData.netValueAdded.targetDivisionFootprint.indicators[
              indic
            ].data.at(-1).value,
          ],
          indic
        )}
      </Row>
    </div>
  );
};

export default ComparativeDataContainer;
