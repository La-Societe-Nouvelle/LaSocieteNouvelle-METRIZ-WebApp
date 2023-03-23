import axios from "axios";
import { updateComparativeFootprint } from "../../ComparativeData";
import SerieDataService from "../SerieDataService";

const getSerieData = async (id, code, indic, comparativeData, serie) => {
  let netValueAddedSerie;
  let productionSerie;
  let intermediateConsumptionsSerie;
  let fixedCapitalConsumptionsSerie;
  let serieFootprint;

  const getValueAddedSerie = SerieDataService.getSerieData(id, code, "NVA");
  const getProductionSerie = SerieDataService.getSerieData(id, code, "PRD");

  const getIntermediateConsumptionsSerie = SerieDataService.getSerieData(
    id,
    code,
    "IC"
  );

  const getFixedCapitalConsumptionsSerie = SerieDataService.getSerieData(
    id,
    code,
    "CFC"
  );

  await axios
    .all([
      getValueAddedSerie,
      getProductionSerie,
      getIntermediateConsumptionsSerie,
      getFixedCapitalConsumptionsSerie,
    ])
    .then(
      axios.spread((...responses) => {
        const netValueAdded = responses[0];
        const production = responses[1];
        const intermediateConsumptions = responses[2];
        const fixedCapitalConsumptions = responses[3];
        if (netValueAdded.data.header.code == 200) {
          netValueAddedSerie = netValueAdded.data.data.at(-1);
        }

        if (production.data.header.code == 200) {
          productionSerie = production.data.data.at(-1);
        }

        if (intermediateConsumptions.data.header.code == 200) {
          intermediateConsumptionsSerie =
            intermediateConsumptions.data.data.at(-1);
        }

        if (fixedCapitalConsumptions.data.header.code == 200) {
          fixedCapitalConsumptionsSerie =
            fixedCapitalConsumptions.data.data.at(-1);
        }
      })
    )
    .catch((error) => {
      console.log(error);
    });

  const newComparativeData = {
    fixedCapitalConsumptions: fixedCapitalConsumptionsSerie,
    intermediateConsumptions: intermediateConsumptionsSerie,
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
