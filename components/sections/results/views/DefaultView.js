import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import indicators from "../../../../lib/indics.json";
import {
  downloadChartImage,
  getIndicatorValuesByCategory,
  getIndicatorValuesByType,
  getIndicatorsMetaByCategory,
  getIndicatorsMetaByType,
} from "../utils";
import RadarChart from "../charts/RadarChart";
import ProportionalRingChart from "../charts/ProportionalRingChart";
import SocialBarChart from "../charts/SocialBarChart";
import { ComparativeHorizontalBarChartVisual } from "../visuals/ComparativeHorizontalBarChartVisual";
import { ValueCreationFootprintsVisual } from "../visuals/ValueCreationFootprintsVisual";
import { SocialFootprintMainVisual } from "../visuals/SocialFootprintsVisual";

export const DefaultView = ({
  session,
  period
}) => {

  const {
    financialData,
    comparativeData
  } = session;

  const year = period.periodKey.slice(2);

  // Indicateur Sociaux

  const socialIndic = getIndicatorsMetaByType(indicators, "indice");

  const divisionSocialFootprint = getIndicatorValuesByType(
    comparativeData.production.division.macrodata.data,
    "indice",
    year
  );

  const socialFootprint = getIndicatorValuesByType(
    financialData.mainAggregates.production.periodsData[period.periodKey].footprint.indicators,
    "indice"
  );

  // Indicateur Environementaux

  const environnementalIndic = getIndicatorsMetaByCategory(
    indicators,
    "Empreinte environnementale"
  );

  const divisionEnvironmentalFootprint = getIndicatorValuesByCategory(
    comparativeData.production.division.macrodata.data,
    "Empreinte environnementale",
    year
  );

  const environmentalFootprint = getIndicatorValuesByCategory(
    financialData.mainAggregates.production.periodsData[period.periodKey].footprint.indicators,
    "Empreinte environnementale"
  );

  // Indicateur Proportions
  const proportionsIndicsMeta = getIndicatorsMetaByType(
    indicators,
    "proportion"
  );
  const proportionDivisionFootprint = getIndicatorValuesByType(
    comparativeData.production.division.macrodata.data,
    "proportion",
    year
  );
  const proportionFootprint = getIndicatorValuesByType(
    financialData.mainAggregates.production.periodsData[period.periodKey].footprint.indicators,
    "proportion"
  );

  // Social footprint
  const socialFootprintIndics = Object.entries(indicators).filter(([_,meta]) => meta.category=="Empreinte sociale").map(([indic,_]) => indic);

  const showEnvironmentalChart = Object.values(environmentalFootprint).some(
    (value) => value != null
  );
  const showValueCreationVisual = Object.values(proportionFootprint).some(
    (value) => value != null
  );
  const showSocialFootprintVisual = socialFootprintIndics.length>0;

  return (
    <>
      <Row>
        {showEnvironmentalChart && (
          <Col lg={6}>
            <ComparativeHorizontalBarChartVisual
              session={session}
              period={period}
            />
          </Col>
        )}
        {(showValueCreationVisual || showSocialFootprintVisual) && (
          <Col lg={6}>
            {showValueCreationVisual && <ValueCreationFootprintsVisual
              session={session}
              period={period}
            />}
            {showSocialFootprintVisual && <SocialFootprintMainVisual
              session={session}
              period={period}
            />}
          </Col>
        )}
        {showSocialFootprintVisual && (
          <Col lg={6}>
          </Col>
        )}
      </Row>
    </>
  );
}