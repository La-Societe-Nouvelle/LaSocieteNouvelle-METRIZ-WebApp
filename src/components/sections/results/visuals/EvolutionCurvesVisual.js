// La Société Nouvelle

// React
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import Select from "react-select";

// Chart
import TrendChart from "../charts/TrendChart";

// Lib
import metaIndics from "/lib/indics";
import metaTargets from "/lib/target";
import metaTrends from "/lib/trend.json";

import { customSelectStyles } from "/config/customStyles";

/* ---------- EVOLUTION CURVES CONTAINER ---------- */

/** Component to visualize evolution of footprint over years (legal unit & comparative division)
 *  
 *  Props :
 *    - session
 *    - indic
 * 
 *  (no period -> on all periods)
 * 
 *  Params (in component) :
 *    - aggregate
 * 
 */

const graphOptions = [
  { label: "Production", value: "production" },
  { label: "Consommations intermédiaires", value: "intermediateConsumptions" },
  { label: "Consommations de capital fixe", value: "fixedCapitalConsumptions" },
  { label: "Valeur ajoutée nette", value: "netValueAdded" },
];

export const EvolutionCurvesVisual = ({
  session,
  indic
}) => {

  const {
    financialData,
    comparativeData
  } = session;

  const { 
    unit 
  } = metaIndics[indic];


  const [showedAggregate, setShowedAggregate] = useState("production");
  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption.value);
  };

  const evolutionCurvesData = {
    historical: comparativeData[showedAggregate].division.macrodata.data[indic.toUpperCase()] || [],
    trend:      comparativeData[showedAggregate].division.trend.data[indic.toUpperCase()] || [],
    target:     comparativeData[showedAggregate].division.target.data[indic.toUpperCase()] || [],
    aggregate:  financialData.mainAggregates[showedAggregate].periodsData,
  };
  const title = "";

  return (
    <Row>
      <Col lg={8}>
        <div id="evolution" className="box ">
          <h4>Courbes d'évolution</h4>

          <Select
            styles={customSelectStyles}
            className="mb-4"
            defaultValue={graphOptions.find((option) => option.value==showedAggregate)}
            options={graphOptions}
            onChange={changeShowedAggregate}
          />

          <div>
            <h5>{title}</h5>
            <TrendChart
              id={`trend-${showedAggregate.value}-${indic}`}
              unit={unit}
              {...evolutionCurvesData}
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
              <p className="small mt-3">Source : {metaTrends[indic].source}</p>
            </>
          )}
          {comparativeData.production.division.target.data[
            indic.toUpperCase()
          ] && (
            <>
              <h5>Objectif de la branche :</h5>
              {metaTargets[indic].info}
              <p className="small mt-3">Source : {metaTargets[indic].source}</p>
            </>
          )}
        </div>
      </Col>
    </Row>
  );
}