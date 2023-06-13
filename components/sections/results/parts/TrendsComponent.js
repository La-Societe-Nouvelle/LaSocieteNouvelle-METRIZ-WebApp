import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import Select from "react-select";
import TrendsChart from "../charts/TrendsChart";
import divisions from "/lib/divisions";

const graphOptions = [
  { label: "Production", value: "prd" },
  { label: "Consommations intermédiaires", value: "ic" },
  { label: "Consommations de capital fixe", value: "cfc" },
  { label: "Valeur ajoutée nette", value: "nva" },
];

const TrendsComponent = ({
  aggregates,
  comparativeData,
  indic,
  unit,
  division,
}) => {
  const [trendGraphView, setTrendGraphView] = useState(graphOptions[0]);

  const trendData = {
    prd: {
      title:
        comparativeData.production.trendsFootprint.indicators[indic].meta.label,
      data: comparativeData.production.trendsFootprint.indicators[indic],
      target:
        comparativeData.production.targetDivisionFootprint.indicators[indic],
      aggregate: aggregates.production.periodsData,
    },
    ic: {
      title:
        comparativeData.intermediateConsumptions.trendsFootprint.indicators[
          indic
        ].meta.label,
      data: comparativeData.intermediateConsumptions.trendsFootprint.indicators[
        indic
      ],
      target:
        comparativeData.intermediateConsumptions.targetDivisionFootprint
          .indicators[indic],
      aggregate: aggregates.intermediateConsumptions.periodsData,
    },
    cfc: {
      title:
        comparativeData.fixedCapitalConsumptions.trendsFootprint.indicators[
          indic
        ].meta.label,
      data: comparativeData.fixedCapitalConsumptions.trendsFootprint.indicators[
        indic
      ],
      target:
        comparativeData.fixedCapitalConsumptions.targetDivisionFootprint
          .indicators[indic],
      aggregate: aggregates.fixedCapitalConsumptions.periodsData,
    },
    nva: {
      title:
        comparativeData.netValueAdded.trendsFootprint.indicators[indic].meta
          .label,
      data: comparativeData.netValueAdded.trendsFootprint.indicators[indic],
      target:
        comparativeData.netValueAdded.targetDivisionFootprint.indicators[indic],
      aggregate: aggregates.netValueAdded.periodsData,
    },
  };

  const changeTrendGraphView = (selectedOption) => {
    setTrendGraphView(selectedOption);
  };

  const renderTrendsChart = () => {
    const { title, data, target, aggregate } = trendData[trendGraphView.value];

    return (
      <div>
        <h5>{title}</h5>
        <TrendsChart
          id={`trend-${trendGraphView.value}-${indic}`}
          unit={unit}
          trends={data}
          target={target}
          aggregate={aggregate}
          indic={indic}
        />
      </div>
    );
  };

  return (
    <>
      <div>
        <Row>
          <Col lg={8}>
            <div className="step p-4">
              <h3>Courbes d'évolution</h3>

              <Select
                className="mb-4"
                defaultValue={trendGraphView}
                options={graphOptions}
                onChange={changeTrendGraphView}
              />

              {renderTrendsChart()}
            </div>
          </Col>
          <Col>
            <div className="step p-4">
              <h3>Notes</h3>
              <p className="small-text">
                Données pour la branche "{divisions[division]}"
              </p>
              <h5>Tendance de la branche :</h5>
              <p className="small-text">
                {
                  comparativeData.production.trendsFootprint.indicators[indic]
                    .meta.info
                }
              </p>

              {comparativeData.production.targetDivisionFootprint.indicators[
                indic
              ].meta.info && (
                <>
                  <h5>Objectif de la branche :</h5>
                  <p>
                    {
                      comparativeData.production.targetDivisionFootprint
                        .indicators[indic].meta.info
                    }
                  </p>
                </>
              )}
              <hr />
              <p>
                Source :&nbsp;
                {comparativeData.production.trendsFootprint.indicators[indic]
                  .meta.source + " (Tendance)"}
                {comparativeData.production.targetDivisionFootprint.indicators[
                  indic
                ].meta.source &&
                  ", " +
                    comparativeData.production.targetDivisionFootprint
                      .indicators[indic].meta.source +
                    " (Objectif)"}
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default TrendsComponent;
