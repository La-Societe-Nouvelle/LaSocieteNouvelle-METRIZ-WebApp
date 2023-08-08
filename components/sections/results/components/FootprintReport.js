import React from "react";
import { Col, Row } from "react-bootstrap";
import indicators from "../../../../lib/indics.json";
import {
  getIndicatorValuesByCategory,
  getIndicatorValuesByType,
  getIndicatorsMetaByCategory,
  getIndicatorsMetaByType,
} from "../utils";
import RadarChart from "../charts/RadarChart";
import ProportionalRingChart from "../charts/ProportionalRingChart";
import SocialBarChart from "../charts/SocialBarChart";

const FootprintReport = ({ comparativeData, financialData, period }) => {
  const year = period.periodKey.slice(2);

  // Indicateur Sociaux

  const socialIndic = getIndicatorsMetaByType(indicators, "indice");

  const divisionSocialFootprint = getIndicatorValuesByType(
    comparativeData.production.division.macrodata.data,
    "indice",
    year
  );

  const socialFootprint = getIndicatorValuesByType(
    financialData.production.periodsData[period.periodKey].footprint.indicators,
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
    financialData.production.periodsData[period.periodKey].footprint.indicators,
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
    financialData.production.periodsData[period.periodKey].footprint.indicators,
    "proportion"
  );

  return (
    <Row>

      <Col lg={6}>
        <div className="box">
          <div className="text-center  rounded-pill ">
            <h3 className="mb-0">Empreinte environnementale</h3>
          </div>
          <RadarChart
            labels={environnementalIndic}
            divisionFootprint={divisionEnvironmentalFootprint}
            productionFootprint={environmentalFootprint}
          />
        </div>
      </Col>
      <Col lg={6}>
        <div className="box">
          <div className="text-center rounded-pill ">
            <h3 className="mb-0">Empreinte économique</h3>
          </div>
          <ProportionalRingChart
            metaIndicators={proportionsIndicsMeta}
            productionFootprint={proportionFootprint}
            divisionFootprint={proportionDivisionFootprint}
          />
        </div>
      </Col>
      <Col lg={6}>
        <div className="box">
          <div className="text-center rounded-pill ">
            <h3 className="mb-0">Empreinte sociale</h3>
          </div>
          <SocialBarChart
            metaIndicators={socialIndic}
            productionFootprint={socialFootprint}
            divisionFootprint={divisionSocialFootprint}
          ></SocialBarChart>
        </div>
      </Col>
    </Row>
    
  );
};

export default FootprintReport;
