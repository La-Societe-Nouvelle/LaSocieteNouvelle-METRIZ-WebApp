import axios from "axios";
import { updateAggregatesFootprint} from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const retrieveSerieFootprint = async (id,code,indic,comparativeData, serie) => {

    let netValueAddedTarget;
    let productionTarget;
    let intermediateConsumptionTarget;
    let fixedCapitalConsumptionTarget;

    const getValueAdded = SerieDataService.getSerieData(id, code, "NVA");
    const getProduction = SerieDataService.getSerieData(id, code, "PRD");
    const getConsumption = SerieDataService.getSerieData(id, code, "IC");
    const getCapitalConsumption = SerieDataService.getSerieData(id, code, "CFC");
    await axios
      .all([getValueAdded, getProduction, getConsumption, getCapitalConsumption])
      .then(
        axios.spread((...responses) => {
          const netValueAdded = responses[0];
          const production = responses[1];
          const consumption = responses[2];
          const fixedCapitalConsumption = responses[3];

          if (netValueAdded.data.header.code == 200) {
            netValueAddedTarget = netValueAdded.data.data.at(-1);
          }

          if (production.data.header.code == 200) {
            productionTarget = production.data.data.at(-1);
          }

          if (consumption.data.header.code == 200) {
            intermediateConsumptionTarget = consumption.data.data.at(-1);
          }

          if (fixedCapitalConsumption.data.header.code == 200) {
            fixedCapitalConsumptionTarget = fixedCapitalConsumption.data.data.at(-1);
          }
        })
      )
      .catch(() => {
        setError(true);
      });
      const newComparativeData = {fixedCapitalConsumption : fixedCapitalConsumptionTarget,intermediateConsumption : intermediateConsumptionTarget, production : productionTarget, netValueAdded : netValueAddedTarget}
      

      const serieFootprint = await updateAggregatesFootprint(indic,comparativeData, newComparativeData, serie)


  return serieFootprint;
};

export default retrieveSerieFootprint