// La Société Nouvelle

// React
import React, { useState } from "react";
import { Col,  Row } from "react-bootstrap";
import Select from "react-select";

// Chart
import TrendChart from "../charts/TrendChart";

// Lib
import metaIndics from "/lib/indics";
import metaTargets from "/lib/target";
import metaTrends from "/lib/trend.json";


// Select Style 
import { customSelectStyles,graphSelectStyles } from "/config/customStyles";

//
import CustomTargetForm from "../components/CustomTargetForm";



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

const targetOptions = [
  { label: "Performance de la branche", value: "target" },
  { label: "Effort similaire à la branche", value: "" },
  { label: "Objectif personnalisé", value: "customTarget" },
];

export const EvolutionCurvesVisual = ({ session, indic }) => {
  const { financialData, comparativeData, availablePeriods } = session;

  const { unit } = metaIndics[indic];

  const [showedAggregate, setShowedAggregate] = useState("production");
  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption.value);
  };

  const [showedTarget, setShowedTarget] = useState("target");
  const changeShowedTarget = (selectedOption) => {
    setShowedTarget(selectedOption.value);
  };

  const evolutionCurvesData = {
    historical: comparativeData[showedAggregate].division.history.data[indic],
    trend: comparativeData[showedAggregate].division.trend.data[indic],
    target: comparativeData[showedAggregate].division.target.data[indic],
    aggregate: financialData.mainAggregates[showedAggregate].periodsData,
  };

  return (
    <Row>
      <Col lg={8}>
        <div id="evolution" className="box">
          <h4>Evolution de la Performance</h4>
          <div className="chart-title">
            <label className="graph-label">Sélectionner la vue : </label>
            <Select
              styles={graphSelectStyles()}
              defaultValue={graphOptions.find(
                (option) => option.value == showedAggregate
              )}
              options={graphOptions}
              onChange={changeShowedAggregate}
            />
          </div>

          <div className="d-flex flex-column my-4">
            <label className="graph-label mb-2">
              Selectionner un objectif pour l'unité légale :{" "}
            </label>
            <Select
              styles={customSelectStyles("250px")}
              defaultValue={targetOptions.find(
                (option) => option.value == showedTarget
              )}
              options={targetOptions}
              onChange={changeShowedTarget}
            />
          </div>
      
          <CustomTargetForm
            aggregate={evolutionCurvesData.aggregate}
            target={comparativeData[showedAggregate].legalUnit.target}
            periods={availablePeriods}
            indic={indic}
          />

          <TrendChart
            id={`trend-${showedAggregate}-${indic}`}
            unit={unit}
            {...evolutionCurvesData}
            indic={indic}
            isPrinting={false}
          />
        </div>
      </Col>

      <Col>
        <div className="box">
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
              <p className="small mt-3">Source : {metaTrends[indic].source}</p>
            </>
          )}
          {comparativeData.production.division.target.data[indic].length >
            0 && (
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
};
