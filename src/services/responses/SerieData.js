import axios from "axios";
import { updateComparativeFootprint } from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const getSerieData = async (id, code, indic, comparativeData, serie) => {
  let netValueAddedSerie;
  let productionSerie;
  let intermediateConsumptionSerie;
  let fixedCapitalConsumptionSerie;
  let serieFootprint;

  const getValueAddedSerie = SerieDataService.getSerieData(id, code, "NVA");
  const getProductionSerie = SerieDataService.getSerieData(id, code, "PRD");

  const getIntermediateConsumptionSerie = SerieDataService.getSerieData(
    id,
    code,
    "IC"
  );

  const getCapitalConsumptionSerie = SerieDataService.getSerieData(
    id,
    code,
    "CFC"
  );

  await axios
    .all([
      getValueAddedSerie,
      getProductionSerie,
      getIntermediateConsumptionSerie,
      getCapitalConsumptionSerie,
    ])
    .then(
      axios.spread((...responses) => {
        const netValueAdded = responses[0];
        const production = responses[1];
        const intermediateConsumption = responses[2];
        const fixedCapitalConsumption = responses[3];
        if (netValueAdded.data.header.code == 200) {
          netValueAddedSerie = netValueAdded.data.data.at(-1);
        }

        if (production.data.header.code == 200) {
          productionSerie = production.data.data.at(-1);
        }

        if (intermediateConsumption.data.header.code == 200) {
          intermediateConsumptionSerie =
            intermediateConsumption.data.data.at(-1);
        }

        if (fixedCapitalConsumption.data.header.code == 200) {
          fixedCapitalConsumptionSerie =
            fixedCapitalConsumption.data.data.at(-1);
        }
      })
    )
    .catch(() => {
      console.log(errors);
    });

  const newComparativeData = {
    fixedCapitalConsumption: fixedCapitalConsumptionSerie,
    intermediateConsumption: intermediateConsumptionSerie,
    production: productionSerie,
    netValueAdded: netValueAddedSerie,
  };

  serieFootprint = await updateComparativeFootprint(
    indic,
    comparativeData,
    newComparativeData,
    serie
  );

  return serieFootprint;
};

export default getSerieData;
