import axios from "axios";
import SerieDataService from "../services/SerieDataService";

const retrieveDivisionFootprint = async (indicator, code) => {

    let indic = indicator.toUpperCase();
    let valueAddedFootprint;
    let productionFootprint;
    let consumptionFootprint;
    let footprint = {};
  
  
    const getValueAdded = SerieDataService.getMacroData(indic, code, "NVA");

    const getProduction = SerieDataService.getMacroData(indic, code, "PRD");
  
    const getConsumption = SerieDataService.getMacroData(indic,code, "IC");
  
  
    await axios
      .all([getValueAdded, getProduction, getConsumption])
      .then(
        axios.spread((...responses) => {
          const valueAdded = responses[0];
          const production = responses[1];
          const consumption = responses[2];
  
          if (valueAdded.data.header.code == 200) {
            valueAddedFootprint = valueAdded.data.data.at(-1);
          }
          if (production.data.header.code == 200) {
            productionFootprint = production.data.data.at(-1);
          }
  
          if (consumption.data.header.code == 200) {
            consumptionFootprint = consumption.data.data.at(-1);
          }
        })
      )
      .catch((errors) => {
        console.log(errors);
      });
  
    Object.assign(footprint, {
      [indic]: {
        valueAddedDivisionFootprint: valueAddedFootprint,
        productionDivisionFootprint: productionFootprint,
        consumptionDivisionFootprint: consumptionFootprint,
      },
    });
  
    return footprint;
  };

export default retrieveDivisionFootprint