// La Société Nouvelle

// React
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import Select from "react-select";

// Chart
import TrendChart from "../charts/TrendChart";

// Lib
import targetMeta from "../../../../lib/target";
import trendMeta from "../../../../lib/trend.json";
import metaIndics from "/lib/indics";

import { customSelectStyles } from "../../../../config/customStyles";

const graphOptions = [
  { label: "Production", value: "prd" },
  { label: "Consommations intermédiaires", value: "ic" },
  { label: "Consommations de capital fixe", value: "cfc" },
  { label: "Valeur ajoutée nette", value: "nva" },
];

/* ---------- EVOLUTION CURVES CONTAINER ---------- */

/** Component to visualize evolution of footprint over years (legal unit & comparative division)
 *  
 *  Props :
 *    - session
 * 
 *  Params :
 *    - aggregate
 * 
 */

export const EvolutionCurvesVisual = ({
  session,
  period,
  indic
}) => {

  const {
    financialData,
    comparativeData
  } = session;

  const aggregates = financialData.mainAggregates;
  const { unit } = metaIndics[indic];

  const [showedAggregate, setShowedAggregate] = useState(graphOptions[0]);
  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption);
  };

  const evolutionCurvesData = 
  {
    prd: {
      title: "",
      historical: comparativeData.production.division.macrodata.data[indic.toUpperCase()] || [],
      trend:      comparativeData.production.division.trend.data[indic.toUpperCase()] || [],
      target:     comparativeData.production.division.target.data[indic.toUpperCase()] || [],
      aggregate:  aggregates.production.periodsData,
    },
    ic: {
      title: "",
      historical: comparativeData.intermediateConsumptions.division.macrodata.data[indic.toUpperCase()] || [],
      trend:      comparativeData.intermediateConsumptions.division.trend.data[indic.toUpperCase()] || [],
      target:     comparativeData.intermediateConsumptions.division.target.data[indic.toUpperCase()] || [],
      aggregate:  aggregates.intermediateConsumptions.periodsData,
    },
    cfc: {
      title: "",
      historical: comparativeData.fixedCapitalConsumptions.division.macrodata.data[indic.toUpperCase()] || [],
      trend:      comparativeData.fixedCapitalConsumptions.division.trend.data[indic.toUpperCase()] || [],
      target:     comparativeData.fixedCapitalConsumptions.division.target.data[indic.toUpperCase()] || [],
      aggregate:  aggregates.fixedCapitalConsumptions.periodsData,
    },
    nva: {
      title: "",
      historical: comparativeData.netValueAdded.division.macrodata.data[indic.toUpperCase()] || [],
      trend:      comparativeData.netValueAdded.division.trend.data[indic.toUpperCase()] || [],
      target:     comparativeData.netValueAdded.division.target.data[indic.toUpperCase()] || [],
      aggregate:  aggregates.netValueAdded.periodsData,
    },
  };

  const { title, historical, trend, target, aggregate } = evolutionCurvesData[showedAggregate.value];
  return (
    <Row>
      <Col lg={8}>
        <div id="evolution" className="box ">
          <h4>Courbes d'évolution</h4>

          <Select
            styles={customSelectStyles}
            className="mb-4"
            defaultValue={showedAggregate}
            options={graphOptions}
            onChange={changeShowedAggregate}
          />

          <div>
            <h5>{title}</h5>
            <TrendChart
              id={`trend-${showedAggregate.value}-${indic}`}
              unit={unit}
              historical={historical}
              trend={trend}
              target={target}
              aggregate={aggregate}
              indic={indic}
              isPrinting={false}
            />
          </div>
        </div>
      </Col>
      
      <Col>
        <div className="box ">
          <h4>Notes</h4>

          {comparativeData.production.division.trend.data[
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
              <p className="small mt-3">Source : {trendMeta[indic].source}</p>
            </>
          )}
          {comparativeData.production.division.target.data[
            indic.toUpperCase()
          ] && (
            <>
              <h5>Objectif de la branche :</h5>
              {targetMeta[indic].info}
              <p className="small mt-3">Source : {targetMeta[indic].source}</p>
            </>
          )}
        </div>
      </Col>
    </Row>
  );
}