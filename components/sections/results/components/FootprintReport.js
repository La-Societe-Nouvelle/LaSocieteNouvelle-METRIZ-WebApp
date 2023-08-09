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

  const showEnvironmentalChart = Object.values(environmentalFootprint).some(
    (value) => value != null
  );
  const showProportionalChart = Object.values(proportionFootprint).some(
    (value) => value != null
  );
  const showSocialChart = Object.values(socialFootprint).some(
    (value) => value != null
  );

  

  return (
    <Row>
      {showEnvironmentalChart && (
        <Col lg={6}>
          <div className="box">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">Empreinte environnementale</h3>
              <Button
                className="btn-light btn-rounded"
                size="sm"
                onClick={() =>
                  downloadChartImage(
                    "environmentalChart",
                    "empreinte_environnementale.png"
                  )
                }
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
            <RadarChart
              labels={environnementalIndic}
              divisionFootprint={divisionEnvironmentalFootprint}
              productionFootprint={environmentalFootprint}
            />
          </div>
        </Col>
      )}
      {showProportionalChart && (
        <Col lg={6}>
          <div className="box">
          <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">Empreinte économique</h3>
              <Button
                className="btn-light btn-rounded"
                size="sm"
                onClick={() =>
                  downloadChartImage(
                    "proportionalChart",
                    "empreinte_economique.png"
                  )
                }
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
  
            <ProportionalRingChart
              metaIndicators={proportionsIndicsMeta}
              productionFootprint={proportionFootprint}
              divisionFootprint={proportionDivisionFootprint}
            />
          </div>
        </Col>
      )}
      {showSocialChart && (
        <Col lg={6}>
          <div className="box">
          <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0">Empreinte sociale</h3>
              <Button
                className="btn-light btn-rounded"
                size="sm"
                onClick={() =>
                  downloadChartImage(
                    "socialChart",
                    "empreinte_sociale.png"
                  )
                }
              >
                <i className="bi bi-download"></i>
              </Button>
            </div>
    
            <SocialBarChart
              metaIndicators={socialIndic}
              productionFootprint={socialFootprint}
              divisionFootprint={divisionSocialFootprint}
            />
          </div>
        </Col>
      )}
    </Row>
  );
};

export default FootprintReport;
