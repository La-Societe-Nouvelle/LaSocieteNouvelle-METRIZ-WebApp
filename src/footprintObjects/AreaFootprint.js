import axios from "axios";
import SerieDataService from "../services/SerieDataService";

const retrieveAreaFootprint = async (indicator) => {

    let indic = indicator.toUpperCase();
    let valueAddedFootprint;
    let productionFootprint;
    let consumptionFootprint;
    let footprint = {};
  
  
    const getValueAdded = SerieDataService.getMacroData(indic, "00", "NVA");
  
    const getProduction = SerieDataService.getMacroData(indic, "00", "PRD");
  
    const getConsumption = SerieDataService.getMacroData(indic, "00", "IC");
  
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
        valueAddedAreaFootprint: valueAddedFootprint,
        productionAreaFootprint: productionFootprint,
        consumptionAreaFootprint: consumptionFootprint,
      },
    });
  
    return footprint;
  };
  
export default retrieveAreaFootprint