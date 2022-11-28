import axios from "axios";
import { updateDivisionFootprint } from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const retrieveDivisionFootprint = async (indic, code,comparativeData) => {

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
  
      const divisionFootprint = await updateDivisionFootprint(indic,comparativeData,fixedCapitalConsumptionFootprint,intermediateConsumptionFootprint,productionFootprint,netValueAddedFootprint);

    return divisionFootprint;
  };

export default retrieveDivisionFootprint