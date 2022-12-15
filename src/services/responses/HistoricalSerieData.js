import axios from "axios";
import { updateHistoricalFootprint} from "../../ComparativeData";
import { getTargetSerieId } from "../../utils/Utils";
import SerieDataService from "../SerieDataService";

const getHistoricalSerieData = async (code,indic,comparativeData, serie) => {

    let netValueAddedHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};
    let productionHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};;
    let intermediateConsumptionHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};;
    let fixedCapitalConsumptionHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};;
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
            netValueAddedHistorical.data = netValueAdded.data.data;
            netValueAddedHistorical.meta =  netValueAdded.data.meta;

          }
      
          if (production.data.header.code == 200) {
            productionHistorical.data = production.data.data;
            productionHistorical.meta =  production.data.meta;
          }
     

          if (consumption.data.header.code == 200) {
            intermediateConsumptionHistorical.data = consumption.data.data;
            intermediateConsumptionHistorical.meta =  consumption.data.meta;

          }
     

          if (fixedCapitalConsumption.data.header.code == 200) {
            fixedCapitalConsumptionHistorical.data = fixedCapitalConsumption.data.data;
            fixedCapitalConsumptionHistorical.meta =  fixedCapitalConsumption.data.meta;
          }
    
        })
      )
      .catch((error) => {
        console.log(error)
      });

      const newComparativeData = {  fixedCapitalConsumption : fixedCapitalConsumptionHistorical,intermediateConsumption : intermediateConsumptionHistorical, production : productionHistorical, netValueAdded : netValueAddedHistorical}  
      const historicalFootprint = await updateHistoricalFootprint(indic,comparativeData, newComparativeData, serie)


  return historicalFootprint;
};

export default getHistoricalSerieData