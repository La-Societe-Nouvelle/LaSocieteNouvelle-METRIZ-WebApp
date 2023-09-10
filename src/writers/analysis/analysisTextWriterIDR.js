// La Société Nouvelle

import { printValue } from "/src/utils/formatters";

export const analysisTextWriterIDR = (props) => {
  const { impactsData, financialData, period } = props;
  const { mainAggregates } = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'indicateur correspond au rapport interdécile D9/D1 des taux horaires bruts, il informe sur l'écart des revenus."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "Le rapport interdécile associé à la valeur produite est de " +
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.idr.value, 1) +
      "."
  );

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.hasEmployees) {
    currentParagraph.push(
      "L'entreprise n'étant pas employeuse, le rapport interdécile associé à la valeur ajoutée est de 1."
    );
  } else if (impactsData.employees.length == 1) {
    currentParagraph.push(
      "L'entreprise n'employant qu'une seule personne, le rapport interdécile associé à la valeur ajoutée est donc de 1."
    );
  } else {
    currentParagraph.push(
      "Le rapport interdécile associé à la valeur ajoutée est de " +
        impactsData.interdecileRange +
        "."
    );
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    "Le rapport interdécile associé aux consommations intermédiaires est de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.idr.value,
        1
      ) +
      "."
  );

  analysis.push(currentParagraph);

  // comparaison branche

  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "La rapport interdécile associé à l'amortissement des immobilisations est de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.idr.value,
        1
      ) +
      "."
  );

  analysis.push(currentParagraph);

  return analysis;
};
