// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
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
  interpolateGeometricValues,
  buildTrend,
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
 *  Other features :
 *    - set custom target
 *    - build trend data
 *
 */

const graphOptions = [
  { label: "Production", value: "production" },
  { label: "Consommations intermédiaires", value: "intermediateConsumptions" },
  { label: "Consommations de capital fixe", value: "fixedCapitalConsumptions" },
  { label: "Valeur ajoutée nette", value: "netValueAdded" },
];

export const EvolutionCurvesVisual = ({ session, indic }) => 
{
  const { 
    financialData, 
    comparativeData, 
    availablePeriods 
  } = session;
  const { nbDecimals } = metaIndics[indic];

  // Current Period
  const defaultPeriod = getMoreRecentYearlyPeriod(availablePeriods);
  const periodYear = getYearPeriod(defaultPeriod);

  // Aggregate
  const [showedAggregate, setShowedAggregate] = useState("production");

  // Modal
  const [showFormModal, setShowFormModal] = useState(false);

  // Comparative Data -------------------------------------------------------------------

  const {
    division: {
      history: { data: historicalData },
      trend: { data: trendData },
      target: { data: targetData },
    },
    legalUnit: {
      target: { data: legalUnitTargetData },
      trend: { data: legalUnitTrendData }
    },
  } = comparativeData[showedAggregate];

  // Evolution Curves -------------------------------------------------------------------

  const curves = {
    historical: historicalData[indic],
    trend: trendData[indic],
    target: targetData[indic],
    aggregate: financialData.mainAggregates[showedAggregate].periodsData,
    legalUnitTarget: legalUnitTargetData[indic] ?? [],
    legalUnitTrend: legalUnitTrendData[indic] ?? []
  };

  // ------------------------------------------------------------------------------------

  // Showed aggregate changes
  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption.value);
  };

  // Handle Legal Unit Custom Target Mode
  const handleTargetFormSubmit = async (
    targetMode,
    targetYear,
    targetValue
  ) => {
    
    // Build target data
    const targetValues = await buildTargetData(
      targetMode,
      targetYear,
      targetValue
    );

    // update target values for indic
    comparativeData[showedAggregate].legalUnit.target.data = {
      ...comparativeData[showedAggregate].legalUnit.target.data,
      [indic]: targetValues,
    };

    setShowFormModal(false);
  };

  const buildTargetData = async (
    targetMode,
    targetYear,
    targetValue
  ) => {
    // current footprint
    const currentFootprint =
      financialData.mainAggregates[showedAggregate]
        .periodsData[defaultPeriod.periodKey]
        .footprint.indicators[indic]
        .value;

    // Switch based on the selected target mode
    switch (targetMode) {
      case "personalisedTarget":
        return await handlePersonalisedTarget(
          periodYear,
          currentFootprint,
          targetYear,
          targetValue,
          targetMode,
          nbDecimals
        );
      case "divisionTarget":
        return await handleDivisionTarget(
          periodYear,
          currentFootprint,
          targetMode,
          curves,
          nbDecimals
        );
      case "divisionEffortBasedTarget":
        return await handleDivisionEffortBasedTarget(
          periodYear,
          currentFootprint,
          targetMode,
          curves,
          nbDecimals
        );
      default:
        return null;
    }
  };

  // ------------------------------------------------------------------------------------

  useEffect(async () => 
  {
    const historicalFootprints = availablePeriods.map((period) => {
      let footprint = {};
      footprint.value = curves
        .aggregate[period.periodKey]
        .footprint.indicators[indic]
        .value;
      footprint.year = getYearPeriod(period);
      return footprint;
    });
    console.log(historicalFootprints);

    const trendValues =  await buildTrend(
      historicalFootprints,
      "2030",
      nbDecimals
    );
    console.log(trendValues);

    // update target values for indic
    comparativeData[showedAggregate].legalUnit.trend.data = {
      ...comparativeData[showedAggregate].legalUnit.trend.data,
      [indic]: trendValues,
    };

    // update state

  }, [showedAggregate,indic]);

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
            showIndustryMode={curves.target.length > 0}
            legalUnitTarget={curves.legalUnitTarget}
            showExtendTargetMode={availablePeriods.length > 1}
            onClose={() => setShowFormModal(false)}
            currentPeriod={periodYear}
            indic={indic}
            onSubmit={handleTargetFormSubmit}
          />
          <div className="text-end mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFormModal(true)}
            >
              <i className="bi bi-graph-up-arrow"></i> Définir un objectif
              personnalisé
            </Button>
          </div>

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

// ################################################## UTILS - TARGET VALUES BUILDER ##################################################

//-- Target modes

// target values based on personnalised input
const handlePersonalisedTarget = async (
  periodYear,
  currentFootprint,
  targetYear,
  targetValue,
  targetMode,
  nbDecimals
) => {
  const values = await interpolateGeometricValues(
    periodYear,
    currentFootprint,
    targetYear,
    targetValue,
    targetMode,
    nbDecimals
  );

  return values;
};

// target of the division
const handleDivisionTarget = async (
  periodYear,
  currentFootprint,
  targetMode,
  curves,
  nbDecimals
) => {

  const targetData = curves.target.filter((item) => item.path == "GEO");
  const { lastTargetValue, lastTargetYear } = getLastIndustryTargetData(targetData);

  const values = await interpolateGeometricValues(
    periodYear,
    currentFootprint,
    lastTargetYear,
    lastTargetValue,
    targetMode,
    nbDecimals
  );

  return values;
};

// target aligned with effort for the division 
const handleDivisionEffortBasedTarget = async (
  periodYear,
  currentFootprint,
  targetMode,
  curves,
  nbDecimals
) => {

  const industryHistorical = getClosestYearData(curves.historical, periodYear);
  const targetData = curves.target.filter((item) => item.path == "GEO");

  const { lastTargetValue, lastTargetYear } = getLastIndustryTargetData(targetData);

  const similarEffortTarget = determineAlignedTargetValue(
    currentFootprint,
    industryHistorical.value,
    lastTargetValue
  );

  const values = await interpolateGeometricValues(
    periodYear,
    currentFootprint,
    lastTargetYear,
    similarEffortTarget,
    targetMode,
    nbDecimals
  );

  return values;
};