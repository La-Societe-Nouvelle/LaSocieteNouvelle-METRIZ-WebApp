import axios from "axios";
import { updateComparativeFootprint } from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const getMacroSerieData = async (indic, code,comparativeData,serie) => {

    let netValueAddedFootprint;
    let productionFootprint;
    let intermediateConsumptionsFootprint;
    let fixedCapitalConsumptionsFootprint;
    
    const getNetValueAdded = SerieDataService.getMacroData(indic.toUpperCase(), code, "NVA");
    const getProduction = SerieDataService.getMacroData(indic.toUpperCase(), code, "PRD");
    const getIntermediateConsumptions = SerieDataService.getMacroData(indic.toUpperCase(),code, "IC");
    const getFixedCapitalConsumptions = SerieDataService.getMacroData(indic.toUpperCase(), code, "CFC");

    await axios
      .all([getNetValueAdded, getProduction, getIntermediateConsumptions, getFixedCapitalConsumptions])
      .then(
        axios.spread((...responses) => {
          const netValueAdded = responses[0];
          const production = responses[1];
          const intermediateConsumptions = responses[2];
          const fixedCapitalConsumptions = responses[3];
          if (netValueAdded.data.header.code == 200) {
            netValueAddedFootprint = netValueAdded.data.data.at(-1);
          }
          if (production.data.header.code == 200) {
            productionFootprint = production.data.data.at(-1);
          }
     
          if (intermediateConsumptions.data.header.code == 200) {
          
            intermediateConsumptionsFootprint = intermediateConsumptions.data.data.at(-1);
          }

          if (fixedCapitalConsumptions.data.header.code == 200) {
            fixedCapitalConsumptionsFootprint = fixedCapitalConsumptions.data.data.at(-1);
          }
        })
      )
      .catch((errors) => {
        console.log(errors);
      });
  

      const newComparativeData = {
        fixedCapitalConsumptions : fixedCapitalConsumptionsFootprint,
        intermediateConsumptions : intermediateConsumptionsFootprint, 
        production : productionFootprint, 
        netValueAdded : netValueAddedFootprint}
      const divisionFootprint = await updateComparativeFootprint(indic,comparativeData, newComparativeData, serie)

      return divisionFootprint;
  };

export default getMacroSerieData