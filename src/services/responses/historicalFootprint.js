import axios from "axios";
import { updateAggregatesFootprint, updateAggregatesHistoricalFootprint} from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const retrieveHistoricalSerie = async (code,indic,comparativeData, serie) => {

    let netValueAddedHistorical;
    let productionHistorical;
    let intermediateConsumptionHistorical;
    let fixedCapitalConsumptionHistorical;
    let id = "MACRO_HISTORICALDATA_TREND_"+indic.toUpperCase()+"_FRA_DIVISION";

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
            netValueAddedHistorical = netValueAdded.data.data;
          }

          if (production.data.header.code == 200) {
            productionHistorical = production.data.data;
          }

          if (consumption.data.header.code == 200) {
            intermediateConsumptionHistorical = consumption.data.data;
          }

          if (fixedCapitalConsumption.data.header.code == 200) {
            fixedCapitalConsumptionHistorical = fixedCapitalConsumption.data.data;
          }
        })
      )
      .catch(() => {
        setError(true);
      });
      const newComparativeData = {fixedCapitalConsumption : fixedCapitalConsumptionHistorical,intermediateConsumption : intermediateConsumptionHistorical, production : productionHistorical, netValueAdded : netValueAddedHistorical}
      

      const historicalFootprint = await updateAggregatesHistoricalFootprint(indic,comparativeData, newComparativeData, serie)


  return historicalFootprint;
};

export default retrieveHistoricalSerie