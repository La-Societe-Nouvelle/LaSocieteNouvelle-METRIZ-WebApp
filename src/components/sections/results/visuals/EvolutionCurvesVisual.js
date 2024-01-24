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
  calculateSimilarEffortTarget,
  getClosestYearData,
  getPeriodFootprint,
  getLastBranchTargetData,
  getTrend,
  buildLinearPath,
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
  const defaultPeriod = getMoreRecentYearlyPeriod(availablePeriods);
  const periodYear = getYearPeriod(defaultPeriod);

  const { unit, nbDecimals } = metaIndics[indic];

  const [showedAggregate, setShowedAggregate] = useState("production");

  useEffect(() => {
    setShowedAggregate("production");
  }, [indic]);

  // --------------------------------------------------

  const changeShowedAggregate = (selectedOption) => {
    setShowedAggregate(selectedOption.value);
  };

  // --------------------------------------------------

  const title = "";
  const [showedTarget, setShowedTarget] = useState("target");
  const changeShowedTarget = (selectedOption) => {
    setShowedTarget(selectedOption.value);
  };
  const [showFormModal, setShowFormModal] = useState(false);

  const evolutionCurves = {
    historical: comparativeData[showedAggregate].division.history.data[indic],
    trend: comparativeData[showedAggregate].division.trend.data[indic],
    target: comparativeData[showedAggregate].division.target.data[indic],
    aggregate: financialData.mainAggregates[showedAggregate].periodsData,
    legalUnitTarget:
      comparativeData[showedAggregate].legalUnit.target.data[indic] ?? [],
  };

  const [evolutionCurvesData, setEvolutionCurvesData] =
    useState(evolutionCurves);

  const handleTargetFormSubmit = async (
    targetMode,
    targetYear,
    targetValue
  ) => {
    const periodFootprint = getPeriodFootprint(
      financialData,
      showedAggregate,
      defaultPeriod,
      indic
    );
    const currentFootprint = periodFootprint.value;

    if (targetMode === "personalTarget") {
      handlePersonnalTarget(targetValue, targetYear, currentFootprint, targetMode);
    } else if (targetMode === "industryTarget") {
      handleAlignedIndustryTarget(currentFootprint, periodYear, targetMode);
    } else if (targetMode === "alignedIndustryTarget") {
      handleAlignedTarget(currentFootprint, periodYear, targetMode);
    } else if (targetMode === "extendTarget") {
      handleExtendTarget(targetYear, targetMode);
    }

    setShowFormModal(false);
  };

  const handlePersonnalTarget = async (
    targetValue,
    targetYear,
    currentFootprint,
    targetMode
  ) => {
    const values = await buildLinearPath(
      periodYear,
      currentFootprint,
      targetYear,
      targetValue,
      targetMode
    );

    updateLegalUnitTarget(values);
  };

  const handleAlignedIndustryTarget = async (
    currentFootprint,
    periodYear,
    targetMode
  ) => {
    const { lastTargetValue, lastTargetYear } = getLastBranchTargetData(
      evolutionCurves.target
    );

    const values = await buildLinearPath(
      periodYear,
      currentFootprint,
      lastTargetYear,
      lastTargetValue,
      targetMode
    );

    updateLegalUnitTarget(values);
  };

  const handleAlignedTarget = async (
    currentFootprint,
    periodYear,
    targetMode
  ) => {
    const branchValue = getClosestYearData(
      evolutionCurves.historical,
      periodYear
    );

    const { lastTargetValue, lastTargetYear } = getLastBranchTargetData(
      evolutionCurves.target
    );

    const similarEffortTarget = calculateSimilarEffortTarget(
      currentFootprint,
      branchValue.value,
      lastTargetValue
    );

    const values = await buildLinearPath(
      periodYear,
      currentFootprint,
      lastTargetYear,
      similarEffortTarget,
      targetMode
    );

    updateLegalUnitTarget(values);
  };

  const handleExtendTarget = async (targetYear, targetMode) => {
    const footprints = [];

    availablePeriods.forEach((period) => {
      const footprint = getPeriodFootprint(
        financialData,
        showedAggregate,
        period,
        indic
      );
      footprint.year = getYearPeriod(period);

      footprints.push(footprint);
    });

    const projectedValues = await getTrend(footprints, targetYear, targetMode);
    updateLegalUnitTarget(projectedValues);
  };

  const updateLegalUnitTarget = (dataSeries) => {
    comparativeData[showedAggregate].legalUnit.target.data = {
      ...comparativeData[showedAggregate].legalUnit.target.data,
      [indic]: dataSeries,
    };

    const updatedEvolutionCurvesData = {
      ...evolutionCurvesData,
      legalUnitTarget: dataSeries,
    };

    setEvolutionCurvesData(updatedEvolutionCurvesData);
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
          <div className="text-end mt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFormModal(true)}
            >
              <i className="bi bi-graph-up-arrow"></i> Définir un objectif
              personnalisé
            </Button>
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
