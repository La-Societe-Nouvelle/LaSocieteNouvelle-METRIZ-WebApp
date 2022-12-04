import axios from "axios";
import SerieDataService from "../SerieDataService";

const retrieveDivisionFootprint = async (indicator, code) => {

    let indic = indicator.toUpperCase();
    let valueAddedFootprint;
    let productionFootprint;
    let consumptionFootprint;
    let capitalConsumptionFootprint;
    let footprint = {};
  
    const getValueAdded = SerieDataService.getMacroData(indic, code, "NVA");
    const getProduction = SerieDataService.getMacroData(indic, code, "PRD");
    const getConsumption = SerieDataService.getMacroData(indic,code, "IC");
    const getCapitalConsumption = SerieDataService.getMacroData(indic, code, "CFC");
    await axios
      .all([getValueAdded, getProduction, getConsumption, getCapitalConsumption])
      .then(
        axios.spread((...responses) => {
          const valueAdded = responses[0];
          const production = responses[1];
          const consumption = responses[2];
          const capitalConsumption = responses[3];
          if (valueAdded.data.header.code == 200) {
            valueAddedFootprint = valueAdded.data.data.at(-1);
          }
          if (production.data.header.code == 200) {
            productionFootprint = production.data.data.at(-1);
          }
  
          if (consumption.data.header.code == 200) {
            consumptionFootprint = consumption.data.data.at(-1);
          }

          if (capitalConsumption.data.header.code == 200) {
            capitalConsumptionFootprint = capitalConsumption.data.data.at(-1);
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
        capitalConsumptionDivisionFootprint : capitalConsumptionFootprint || {value : null}
      },
    });
  
    return footprint;
  };

export default retrieveDivisionFootprint