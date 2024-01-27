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

// Styles
import { customSelectStyles } from "/config/customStyles";

/* ---------- EVOLUTION CURVES VISUAL ---------- */

/** Component to visualize evolution of footprint over years (legal unit & comparative division)
 *  
 *  Props :
 *    - session
 *    - indic
 *  (no period -> show on all year periods)
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
    comparativeData
  } = session;

  const [showedAggregate, setShowedAggregate] = useState("production");

  // --------------------------------------------------

  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption.value);
  };

  // --------------------------------------------------

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
              session={session}
              datasetOptions={{
                aggregate: "production",
                indic
              }}
              printOptions={{
                printMode: false
              }}
            />
          </div>
        </div>
      </Col>
      
      <Col>
        <div className="box ">
          <h4>Notes</h4>
          {comparativeData.production.division.trend.data[indic] && (
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
                Source : {metaTrends[indic].source}
              </p>
            </>
          )}
          {comparativeData.production.division.target.data[indic].length>0 && (
            <>
              <h5>Objectif de la branche :</h5>
              {metaTargets[indic].info}
              <p className="small mt-3">
                Source : {metaTargets[indic].source}
              </p>
            </>
          )}
        </div>
      </Col>

    </Row>
  );
}