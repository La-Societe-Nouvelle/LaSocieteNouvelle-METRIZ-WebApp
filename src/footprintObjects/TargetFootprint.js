import axios from "axios";
import SerieDataService from "../services/SerieDataService";

const retrieveTargetFootprint = async (code) => {

  console.log(code);
  
    let valueAddedTarget;
    let productionTarget;
    let consumptionTarget;
    let target = {};

    const id = 'TARGET_GHG_SNBC_FRA_DIV';

    const getValueAdded = SerieDataService.getSerieData(id, code, "NVA");
    const getProduction = SerieDataService.getSerieData(id, code, "PRD");
    const getConsumption = SerieDataService.getSerieData(id, code, "IC");

    await axios
      .all([getValueAdded, getProduction, getConsumption])
      .then(
        axios.spread((...responses) => {
          const valueAdded = responses[0];
          const production = responses[1];
          const consumption = responses[2];

          if (valueAdded.data.header.code == 200) {
            valueAddedTarget = valueAdded.data.data.at(-1);
          }

          if (production.data.header.code == 200) {
            productionTarget = production.data.data.at(-1);
          }

          if (consumption.data.header.code == 200) {
            consumptionTarget = consumption.data.data.at(-1);
          }
        })
      )
      .catch(() => {
        setError(true);
      });

      Object.assign(target, {
        
          valueAddedTarget: valueAddedTarget,
          productionTarget: productionTarget,
          consumptionTarget: consumptionTarget,
        
      });


  return target;
};

export default retrieveTargetFootprint