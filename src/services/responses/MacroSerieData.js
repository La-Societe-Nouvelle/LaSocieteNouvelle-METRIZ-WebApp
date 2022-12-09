import axios from "axios";
import { updateAggregatesFootprint } from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const getMacroSerieData = async (indic, code,comparativeData,serie) => {

    let netValueAddedFootprint;
    let productionFootprint;
    let intermediateConsumptionFootprint;
    let fixedCapitalConsumptionFootprint;
    
    const getNetValueAdded = SerieDataService.getMacroData(indic.toUpperCase(), code, "NVA");
    const getProduction = SerieDataService.getMacroData(indic.toUpperCase(), code, "PRD");
    const getIntermediateConsumption = SerieDataService.getMacroData(indic.toUpperCase(),code, "IC");
    const getFixedCapitalConsumption = SerieDataService.getMacroData(indic.toUpperCase(), code, "CFC");

    await axios
      .all([getNetValueAdded, getProduction, getIntermediateConsumption, getFixedCapitalConsumption])
      .then(
        axios.spread((...responses) => {
          const netValueAdded = responses[0];
          const production = responses[1];
          const intermediateConsumption = responses[2];
          const fixedCapitalConsumption = responses[3];
          if (netValueAdded.data.header.code == 200) {
            netValueAddedFootprint = netValueAdded.data.data.at(-1);
          }
          if (production.data.header.code == 200) {
            productionFootprint = production.data.data.at(-1);
          }
  
          if (intermediateConsumption.data.header.code == 200) {
            intermediateConsumptionFootprint = intermediateConsumption.data.data.at(-1);
          }

          if (fixedCapitalConsumption.data.header.code == 200) {
            fixedCapitalConsumptionFootprint = fixedCapitalConsumption.data.data.at(-1);
          }
        })
      )
      .catch((errors) => {
        console.log(errors);
      });
  


      const newComparativeData = {fixedCapitalConsumption : fixedCapitalConsumptionFootprint,intermediateConsumption : intermediateConsumptionFootprint, production : productionFootprint, netValueAdded : netValueAddedFootprint}
      const divisionFootprint = await updateAggregatesFootprint(indic,comparativeData, newComparativeData, serie)

      return divisionFootprint;
  };

export default getMacroSerieData