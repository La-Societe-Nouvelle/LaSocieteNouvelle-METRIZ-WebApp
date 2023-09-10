// La Société Nouvelle

import { printValue } from "/src/utils/formatters";

export const analysisTextWriterGEQ = (props) => {
  const { impactsData, financialData, period } = props;
  const { mainAggregates} = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'indicateur correspond l'écart entre les taux horaires moyens des femmes et des hommes, en pourcentage du taux horaire moyen."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "L'écart de rémunération associé à la valeur produite est de " +
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.geq.getValue(), 0) +
      " %."
  );

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.hasEmployees) {
    currentParagraph.push(
      "L'entreprise n'étant pas employeuse, l'écart de rémunération Femmes/Hommes associé à la valeur ajoutée est de 0 %."
    );
  } else if (impactsData.employees == 1) {
    currentParagraph.push(
      "L'entreprise n'employant qu'une seule personne, l'écart de rémunération Femmes/Hommes associé à la valeur ajoutée est de 0 %."
    );
  } else {
    currentParagraph.push(
      "L'écart de rémunération Femmes/Hommes est de " +
        impactsData.wageGap +
        " % au sein de l'entreprise."
    );
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    "L'écart de rémunération Femmes/Hommes moyen associé des consommations intermédiaires est de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.geq.getValue(),
        0
      ) +
      " %."
  );

  analysis.push(currentParagraph);

  // comparaison branche

  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'écart de rémunération Femmes/Hommes moyen associé à l'amortissement des immobilisations est de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.geq.getValue(),
        0
      ) +
      " %."
  );

  analysis.push(currentParagraph);

  return analysis;
};
