import axios from "axios";
import { updateHistoricalFootprint} from "../../ComparativeData";
import { getTargetSerieId } from "../../utils/Utils";
import SerieDataService from "../SerieDataService";

const getHistoricalSerieData = async (code,indic,comparativeData, serie) => {

    let netValueAddedHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};
    let productionHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};;
    let intermediateConsumptionsHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};;
    let fixedCapitalConsumptionsHistorical = {data : [{year: null, value: null, flag: null}], meta : {}};;
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
    const getIntermediateConsumptions = SerieDataService.getSerieData(id, code, "IC");
    const getFixedCapitalConsumptions = SerieDataService.getSerieData(id, code, "CFC");
    await axios
      .all([getValueAdded, getProduction, getIntermediateConsumptions, getFixedCapitalConsumptions])
      .then(
        axios.spread((...responses) => {
          const netValueAdded = responses[0];
          const production = responses[1];
          const intermediateConsumptions = responses[2];
          const fixedCapitalConsumptions = responses[3];

          if (netValueAdded.data.header.code == 200) {
            netValueAddedHistorical.data = netValueAdded.data.data;
            netValueAddedHistorical.meta =  netValueAdded.data.meta;

          }
      
          if (production.data.header.code == 200) {
            productionHistorical.data = production.data.data;
            productionHistorical.meta =  production.data.meta;
          }
     

          if (intermediateConsumptions.data.header.code == 200) {
            intermediateConsumptionsHistorical.data = intermediateConsumptions.data.data;
            intermediateConsumptionsHistorical.meta =  intermediateConsumptions.data.meta;

          }
     

          if (fixedCapitalConsumptions.data.header.code == 200) {
            fixedCapitalConsumptionsHistorical.data = fixedCapitalConsumptions.data.data;
            fixedCapitalConsumptionsHistorical.meta =  fixedCapitalConsumptions.data.meta;
          }
    
        })
      )
      .catch((error) => {
        console.log(error)
      });

      const newComparativeData = {  
        fixedCapitalConsumptions : fixedCapitalConsumptionsHistorical,
        intermediateConsumptions : intermediateConsumptionsHistorical,
        production : productionHistorical,
        netValueAdded : netValueAddedHistorical}  
      const historicalFootprint = await updateHistoricalFootprint(indic,comparativeData, newComparativeData, serie)


  return historicalFootprint;
};

export default getHistoricalSerieData