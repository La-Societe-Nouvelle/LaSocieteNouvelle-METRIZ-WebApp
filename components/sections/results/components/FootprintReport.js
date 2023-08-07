import React from "react";
import { Col, Row } from "react-bootstrap";
import indicators from "../../../../lib/indics.json";
import { getClosestYearData } from "../utils";
import RadarChart from "../charts/RadarChart";

const FootprintReport = ({comparativeData,financialData, period}) => {

  const year = period.periodKey.slice(2);

  const getSocialsLabels = Object.entries(indicators)
  .filter(([, indicator]) => indicator.category === "Empreinte sociale" ||  indicator.category === "Création de la valeur")
  .reduce((result, [key, value]) => {
    result[key.toLowerCase()] = value;
    return result;
  }, {});

  const getEnvironmentalLabel = Object.entries(indicators)
  .filter(([, indicator]) => indicator.category ===  "Empreinte environnementale")
  .reduce((result, [key, value]) => {
    result[key.toLowerCase()] = value;
    return result;
  }, {});


  const getCategoryIndicatorDivisionValue = (data, category) =>
  Object.keys(data).reduce((filtered, indicator) => {
    const { value } = getClosestYearData(data[indicator], year) || {};
    if (indicators[indicator.toLowerCase()].category === category && value) {
      filtered[indicator.toLowerCase()] = value;
    }
    return filtered;
  }, {});

  const getCategoryIndicatorValue = (data, category) =>
  Object.keys(data).reduce((filtered, indicator) => {
    const { value } = data[indicator];
    if (
      indicators[indicator.toLowerCase()].category === category &&
      value !== undefined
    ) {
      filtered[indicator.toLowerCase()] = value;
    }
    return filtered;
  }, {});


  const divisionProductionSocialFootprint = getCategoryIndicatorDivisionValue(
    comparativeData.production.division.macrodata.data,
    "Empreinte sociale"
  );
  const divisionProductionEcoFootprint = getCategoryIndicatorDivisionValue(
    comparativeData.production.division.macrodata.data,
    "Création de la valeur"
  );

  const divisionProductionEnvironmentalFootprint = getCategoryIndicatorDivisionValue(
    comparativeData.production.division.macrodata.data,
    "Empreinte environnementale"
  );

  const productionEnvironmentalFootprint = getCategoryIndicatorValue(financialData.production.periodsData[period.periodKey].footprint.indicators,"Empreinte environnementale")
  const productionSocialFootprint = getCategoryIndicatorValue(financialData.production.periodsData[period.periodKey].footprint.indicators,"Empreinte sociale")
  const productionEcoFootprint = getCategoryIndicatorValue(financialData.production.periodsData[period.periodKey].footprint.indicators,"Création de la valeur")
  
  return (
      <Row>
        <Col>
        {/* TO DO : Afficher graphiques si il y a plus d'un indicateur déclaré ? */}
          <div className="box">
            <div className="text-center rounded-pill ">     
              <h3 className="mb-0">Empreinte économique et sociale</h3>
            </div>
            <RadarChart labels={getSocialsLabels} divisionFootprint={{...divisionProductionSocialFootprint, ...divisionProductionEcoFootprint}} productionFootprint={{...productionSocialFootprint,...productionEcoFootprint}} />
          </div>
        </Col>
        <Col>
          <div className="box">
            <div className="text-center  rounded-pill ">
              <h3 className="mb-0">Empreinte environnementale</h3>
            </div>
              <RadarChart labels={getEnvironmentalLabel} divisionFootprint={divisionProductionEnvironmentalFootprint} productionFootprint={productionEnvironmentalFootprint} />
          </div>
        </Col>
      </Row>
  );
};


  

export default FootprintReport;
