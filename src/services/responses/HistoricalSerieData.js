import axios from "axios";
import { updateAggregatesHistoricalFootprint} from "../../ComparativeData";
import { getTargetSerieId } from "../../utils/Utils";
import SerieDataService from "../SerieDataService";

const getHistoricalSerieData = async (code,indic,comparativeData, serie) => {

    let netValueAddedHistorical;
    let productionHistorical;
    let intermediateConsumptionHistorical;
    let fixedCapitalConsumptionHistorical;
    let id;

    if(serie == 'trendsFootprint') {
      id = "MACRO_HISTORICALDATA_TREND_"+indic.toUpperCase()+"_FRA_DIVISION";
    }
    else 
    {

      id = getTargetSerieId(indic);
    }
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
            netValueAddedHistorical.meta =  netValueAdded.data.meta;

          }
          else{
            netValueAddedHistorical = [{year: null, value: null, flag: null}]
          }

          if (production.data.header.code == 200) {
            productionHistorical = production.data.data;
            productionHistorical.meta =  production.data.meta;
          }
          else{
            productionHistorical = [{year: null, value: null, flag: null}]

          }

          if (consumption.data.header.code == 200) {
            intermediateConsumptionHistorical = consumption.data.data;
            intermediateConsumptionHistorical.meta =  consumption.data.meta;

          }
          else{
            intermediateConsumptionHistorical = [{year: null, value: null, flag: null}]
          }

          if (fixedCapitalConsumption.data.header.code == 200) {
            fixedCapitalConsumptionHistorical = fixedCapitalConsumption.data.data;
            fixedCapitalConsumptionHistorical.meta =  fixedCapitalConsumption.data.meta;
          }
          else{
            fixedCapitalConsumptionHistorical = [{year: null, value: null, flag: null}]
          }
        })
      )
      .catch(() => {
        setError(true);
      });


      const newComparativeData = {  fixedCapitalConsumption : fixedCapitalConsumptionHistorical,intermediateConsumption : intermediateConsumptionHistorical, production : productionHistorical, netValueAdded : netValueAddedHistorical}  
      const historicalFootprint = await updateAggregatesHistoricalFootprint(indic,comparativeData, newComparativeData, serie)


  return historicalFootprint;
};

export default getHistoricalSerieData