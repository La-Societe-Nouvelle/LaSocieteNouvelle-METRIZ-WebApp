// ComparativeDataCharts.js
import React from "react";
import { Row, Col } from "react-bootstrap";
import ComparativeChart from "../charts/ComparativeChart";
import { getClosestYearData } from "../utils";

const ComparativeDataContainer = ({
  session,
  period,
  indic
}) => {

  const {
    financialData,
    comparativeData
  } = session;

  const prevDateEnd = period.dateEnd;
  const prevPeriod = session.availablePeriods.find(
    (period) => period.dateEnd == prevDateEnd
  );

  const renderChart = (
    title,
    chartId,
    datasets,
    prevFootprint,
    targetDatasets,
    indic
  ) => (
    <Col sm={3} xl={3} lg={3} md={3}>
      <h5 className="mb-4">{title}</h5>

      <ComparativeChart
        id={chartId}
        footprintDataset={datasets}
        prevFootprint={prevFootprint}
        targetDataset={targetDatasets}
        indic={indic}
        isPrinting={false}
      />
    </Col>
  );

  const year = period.periodKey.slice(2);
  // Define the aggregates and their corresponding titles
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
    <div className="charts-container">
      <h4>Comparaison par activité</h4>

      <Row className="charts">
        {Object.keys(aggregates).map((aggregate) => (
          <React.Fragment key={aggregate}>
            {renderChart(
              aggregates[aggregate],
              `${aggregate}-${indic}`,
              [
                datasets[aggregate].area,
                {
                  value:
                    financialData.mainAggregates[aggregate].periodsData[period.periodKey]
                      .footprint.indicators[indic].value,
                  year: year,
                },
                datasets[aggregate].division,
              ],
              [
                null,
                prevPeriod
                  ? financialData.mainAggregates[aggregate].periodsData[prevPeriod.periodKey]
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
          </React.Fragment>
        ))}
      </Row>
    </div>
  );
};

export default ComparativeDataContainer;
