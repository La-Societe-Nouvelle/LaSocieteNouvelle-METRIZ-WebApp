// La Société Nouvelle

// React
import React, { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Select from "react-select";

// Chart
import { TrendChart } from "../charts/TrendChart";

// Lib
import metaIndics from "/lib/indics";
import metaTargets from "/lib/target";
import metaTrends from "/lib/trend.json";

// Select Style
import { graphSelectStyles } from "/config/customStyles";

//
import TargetModeFormModal from "../components/TargetModeFormModal";

import {
  getMoreRecentYearlyPeriod,
  getYearPeriod,
} from "../../../../utils/periodsUtils";

import {
  determineAlignedTargetValue,
  getClosestYearData,
  getLastIndustryTargetData,
  projectTrendValues,
  interpolateLinearValues,
} from "../utils";

/* ---------- EVOLUTION CURVES CONTAINER ---------- */

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

export const EvolutionCurvesVisual = ({ session, indic }) => {

  const { financialData, comparativeData, availablePeriods } = session;
  const { unit, nbDecimals } = metaIndics[indic];

// Current Period
  const defaultPeriod = getMoreRecentYearlyPeriod(availablePeriods);
  const periodYear = getYearPeriod(defaultPeriod);

// Comparative Data -------------------------------------------------------------------

  const [showedAggregate, setShowedAggregate] = useState("production");

  const {
    division: {
      history: { data: historicalData },
      trend: { data: trendData },
      target: { data: targetData },
    },
    legalUnit : {
      target : {data : legalUnitTargetData}
    }
  } = comparativeData[showedAggregate];

//-- Aggregate
  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption.value);
  };

// Evolution Curves -------------------------------------------------------------------

  const evolutionCurves = {
   historical: historicalData[indic],
    trend: trendData[indic],
    target: targetData[indic],
    aggregate: financialData.mainAggregates[showedAggregate].periodsData,
    legalUnitTarget: legalUnitTargetData[indic] ?? [],
  };

  const [evolutionCurvesData, setEvolutionCurvesData] = useState(evolutionCurves);

// ------------------------------------------------------------------------------------

  const [showFormModal, setShowFormModal] = useState(false);

// Handle Legal Unit Custom Target Mode  ----------------------------------------------

  const handleTargetFormSubmit = async (
    targetMode,
    targetYear,
    targetValue
  ) => {

 
    const currentFootprint = evolutionCurvesData.aggregate[defaultPeriod.periodKey].footprint.indicators[indic].value;

  // Switch based on the selected target mode
    switch (targetMode) {
      case "personalTarget":
        await handlePersonnalTarget(targetValue, targetYear, targetMode, currentFootprint);
        break;
      case "industryTarget":
        await handleIndustryTarget(currentFootprint, periodYear, targetMode);
        break;
      case "alignedIndustryTarget":
        await handleAlignedIndustryTarget(currentFootprint, periodYear, targetMode);
        break;
      case "extendTarget":
        await handleExtendTarget(targetYear, targetMode);
        break;
      default:
        break;
    }
  
    setShowFormModal(false);
  };
//-- Target modes  

  const handlePersonnalTarget = async (
    targetValue,
    targetYear,
    targetMode,
    currentFootprint,
  ) => {

    const values = await interpolateLinearValues(
      periodYear,
      currentFootprint,
      targetYear,
      targetValue,
      targetMode,
      nbDecimals
    );

    updateLegalUnitTarget(values);
  };

  const handleIndustryTarget = async (
    currentFootprint,
    periodYear,
    targetMode
  ) => {

    const { lastTargetValue, lastTargetYear } = getLastIndustryTargetData(evolutionCurves.target);

    const values = await interpolateLinearValues(
      periodYear,
      currentFootprint,
      lastTargetYear,
      lastTargetValue,
      targetMode,
      nbDecimals
    );

    updateLegalUnitTarget(values);
  };

  const handleAlignedIndustryTarget = async (
    currentFootprint,
    periodYear,
    targetMode
  ) => {
    
    const industryHistorical = getClosestYearData(
      evolutionCurves.historical,
      periodYear
    );

    const { lastTargetValue, lastTargetYear } = getLastIndustryTargetData(
      evolutionCurves.target
    );

    const similarEffortTarget = determineAlignedTargetValue(
      currentFootprint,
      industryHistorical.value,
      lastTargetValue
    );

    const values = await interpolateLinearValues(
      periodYear,
      currentFootprint,
      lastTargetYear,
      similarEffortTarget,
      targetMode,
      nbDecimals
    );

    updateLegalUnitTarget(values);
  };

  const handleExtendTarget = async (targetYear, targetMode) => {
    
    const footprints = availablePeriods.map((period) => {
     
      let footprint = {};
      footprint.value = evolutionCurvesData.aggregate[period.periodKey].footprint.indicators[indic].value
      footprint.year = getYearPeriod(period);
      return footprint;
    });


    const values = await projectTrendValues(footprints, targetYear, targetMode, nbDecimals);

    updateLegalUnitTarget(values);

  };
// ------------------------------------------------------------------------------------

// Update legal unit target with the provided values
  const updateLegalUnitTarget = (targetValues) => {
    comparativeData[showedAggregate].legalUnit.target.data = {
      ...comparativeData[showedAggregate].legalUnit.target.data,
      [indic]: targetValues,
    };

    const updatedEvolutionCurvesData = {
      ...evolutionCurvesData,
      legalUnitTarget: targetValues,
    };

    setEvolutionCurvesData(updatedEvolutionCurvesData);
  };
// ------------------------------------------------------------------------------------

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

          <TargetModeFormModal
            showModal={showFormModal}
            showIndustryMode={evolutionCurves.target.length > 0}
            legalUnitTarget={evolutionCurves.legalUnitTarget}
            onClose={() => setShowFormModal(false)}
            currentPeriod={periodYear}
            indic={indic}
            onSubmit={handleTargetFormSubmit}
          />

          <TrendChart
            id={`trend-${showedAggregate}-${indic}`}
            session={session}
            datasetOptions={{
              aggregate: showedAggregate,
              indic,
            }}
            printOptions={{
              printMode: false,
            }}
          ></TrendChart>
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
