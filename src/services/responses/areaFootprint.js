import axios from "axios";
import { ComparativeData, updateAreaFootprint, updateComparativeData } from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const retrieveAreaFootprint = async (indic,comparativeData) => {

    let netValueAddedFootprint;
    let productionFootprint;
    let intermediateConsumptionFootprint;
    let fixedCapitalConsumptionFootprint;
  
    const getnetValueAdded = SerieDataService.getMacroData(indic.toUpperCase(), "00", "NVA");
  
    const getProduction = SerieDataService.getMacroData(indic.toUpperCase(), "00", "PRD");
  
    const getIntermediateConsumption = SerieDataService.getMacroData(indic.toUpperCase(), "00", "IC");

    const getFixedCapitalConsumption = SerieDataService.getMacroData(indic.toUpperCase(), "00", "CFC");

  
    await axios
      .all([getnetValueAdded, getProduction, getIntermediateConsumption, getFixedCapitalConsumption])
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

  const areaFootprint = await updateAreaFootprint(indic,comparativeData,fixedCapitalConsumptionFootprint,intermediateConsumptionFootprint,productionFootprint,netValueAddedFootprint);



    return areaFootprint;
  };
  
export default retrieveAreaFootprint