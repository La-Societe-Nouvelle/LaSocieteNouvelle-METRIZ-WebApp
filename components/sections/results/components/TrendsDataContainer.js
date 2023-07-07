import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import Select from "react-select";
import TrendsChart from "../charts/TrendsChart";
import targetMeta from "/lib/target";
import trendsMeta from "/lib/trends";

import { customSelectStyles } from "../../../../config/customStyles";

const graphOptions = [
  { label: "Production", value: "prd" },
  { label: "Consommations intermédiaires", value: "ic" },
  { label: "Consommations de capital fixe", value: "cfc" },
  { label: "Valeur ajoutée nette", value: "nva" },
];

const TrendsDataContainer = ({
  aggregates,
  comparativeData,
  indic,
  unit,
  division,
}) => {
  const [trendGraphView, setTrendGraphView] = useState(graphOptions[0]);

  const trendData = {
    prd: {
      title: "",
      data:
        comparativeData.production.division.trends.data[indic.toUpperCase()] ||
        [],
      target:
        comparativeData.production.division.target.data[indic.toUpperCase()] ||
        [],
      aggregate: aggregates.production.periodsData,
    },
    ic: {
      title: "",
      data:
        comparativeData.intermediateConsumptions.division.trends.data[
          indic.toUpperCase()
        ] || [],
      target:
        comparativeData.intermediateConsumptions.division.target.data[
          indic.toUpperCase()
        ] || [],
      aggregate: aggregates.intermediateConsumptions.periodsData,
    },
    cfc: {
      title: "",
      data:
        comparativeData.fixedCapitalConsumptions.division.trends.data[
          indic.toUpperCase()
        ] || [],
      target:
        comparativeData.fixedCapitalConsumptions.division.target.data[
          indic.toUpperCase()
        ] || [],
      aggregate: aggregates.fixedCapitalConsumptions.periodsData,
    },
    nva: {
      title: "",
      data:
        comparativeData.netValueAdded.division.trends.data[
          indic.toUpperCase()
        ] || [],
      target:
        comparativeData.netValueAdded.division.target.data[
          indic.toUpperCase()
        ] || [],
      aggregate: aggregates.netValueAdded.periodsData,
    },
  };

  console.log(trendData);
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
          isPrinting={false}
        />
      </div>
    );
  };

  return (
    <Row>
      <Col lg={8}>
        <div id="evolution" className="box ">
          <h4>Courbes d'évolution</h4>

          <Select
            styles={customSelectStyles}
            className="mb-4"
            defaultValue={trendGraphView}
            options={graphOptions}
            onChange={changeTrendGraphView}
          />

          {/* {renderTrendsChart()} */}
        </div>
      </Col>
      <Col>
        <div className="box ">
          <h4>Notes</h4>

          {comparativeData.production.division.trends.data[
            indic.toUpperCase()
          ] && (
            <>
              <h5>Tendance de la branche :</h5>
              <p className="small-text">
                La courbe de tendance correspond à une projection des empreintes
                observées sur les dix dernières années. Les valeurs actuelles
                s'appuient sur l’hypothèse d’une structure macroéconomique
                inchangée. Des travaux sont en cours pour proposer des valeurs
                tenant compte de l’évolution tendancielle de la structure de
                l'économie nationale, ses interactions avec l’extérieur et de la
                dynamique des prix par branche.
              </p>
            <p className="small mt-3">
              Source :  {trendsMeta[indic].source}
            </p>
            </>
          )}
          {comparativeData.production.division.target.data[
            indic.toUpperCase()
          ] && (
            <>

              <h5>Objectif de la branche :</h5> 
            {targetMeta[indic].info}
            <p className="small mt-3">
              Source :  {targetMeta[indic].source}
            </p>
            </>
          )}



        </div>
      </Col>
    </Row>
  );
};

export default TrendsDataContainer;
