import axios from "axios";
import { updateTargetAreaFootprint, updateTargetDivisionFootprint } from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const retrieveTargetFootprint = async (code,indic,comparativeData) => {

    let netValueAddedTarget;
    let productionTarget;
    let intermediateConsumptionTarget;
    let fixedCapitalConsumptionTarget;
    let id;
    
  switch (indic) {
    case "dis":
      id = "MACRO_TARGET_DIS_LSN_FRA_DIVISION";
      break;
    case "geq":
      id = "MACRO_TARGET_GEQ_LSN_FRA_DIVISION";
      break;
    case "ghg":
      id = "MACRO_TARGET_GHG_SNBC_FRA_DIVISION";
      break;
    case "knw":
      id = "MACRO_TARGET_KNW_LSN_FRA_DIVISION";
      break;
    case "mat":
      id = "MACRO_TARGET_MAT_LSN_FRA_DIVISION";
      break;
    case "nrg":
      id = "MACRO_TARGET_NRG_PPE_FRA_DIVISION";
      break;
    case "soc":
      id = "MACRO_TARGET_SOC_LSN_FRA_DIVISION";
      break;
    case "was":
      id = "MACRO_TARGET_WAS_PNPD_FRA_DIVISION";
      break;
    case "wat":
      id = "MACRO_TARGET_WAT_LSN_FRA_DIVISION";
      break;
    default:
      break;
  }

  if(!id) {
    return comparativeData;
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

      let targetFootprint;
      if(code == '00') {
        targetFootprint = await updateTargetAreaFootprint(indic,comparativeData,fixedCapitalConsumptionTarget,intermediateConsumptionTarget,productionTarget,netValueAddedTarget);
      }
      else 
      {
          targetFootprint = await updateTargetDivisionFootprint(indic,comparativeData,fixedCapitalConsumptionTarget,intermediateConsumptionTarget,productionTarget,netValueAddedTarget);
      
      }


  return targetFootprint;
};

export default retrieveTargetFootprint