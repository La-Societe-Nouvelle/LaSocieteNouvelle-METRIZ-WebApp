// La Société Nouvelle

import { printValue } from "/src/utils/formatters";

export const analysisTextWriterKNW = (props) => {
  const { impactsData, financialData, period } = props;
  const { mainAggregates } = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'indicateur informe sur la part de la valeur fléchée vers de la formation ou de la recherche."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "Le taux de contribution de la valeur produite pour l'évolution des compétences et des connaissances est de " +
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.knw.value, 0) +
      " %," +
      " soit un montant total de " +
      printValue(
        mainAggregates.production.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
          mainAggregates.production.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " €."
  );

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.researchAndTrainingContribution == 0) {
    currentParagraph.push(
      "Aucune charge interne n'est considérée comme contributrice à l'évolution des compétences et des connaissances."
    );
  } else {
    currentParagraph.push(
      printValue(mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.knw.value, 0) +
        " % des charges internes contribuent à la formation ou à la recherche," +
        " soit une contribution directe de " +
        printValue(impactsData.researchAndTrainingContribution, 0) +
        " €."
    );
    currentParagraph.push(
      "La contribution directe compte pour " +
        printValue(
          (mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
            mainAggregates.netValueAdded.periodsData[period.periodKey].amount
          ) /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
            )) *
            100,
          0
        ) +
        " % de la contributon brute totale."
    );
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    "Au niveau des consommations intermédiaires, " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.knw.value,
        0
      ) +
      " % de la valeur est contributrice," +
      "soit un volume de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " €."
  );
  currentParagraph.push(
    "Les consommations intermédiaires sont à l'origine de " +
      printValue(
        (mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
            mainAggregates.production.periodsData[period.periodKey].amount
          )) *
          100,
        0
      ) +
      " % de la contributon brute totale."
  );

  analysis.push(currentParagraph);

  // comparaison branche

  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "Enfin, l'amortissement des immobilisations contribue à hauteur de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " €," +
      " soit " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.knw.value,
        0
      ) +
      " % du volume des dotations aux amortissements" +
      " et " +
      printValue(
        (mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.periodsData[period.periodKey].footprint.indicators.knw.getGrossImpact(
            mainAggregates.production.periodsData[period.periodKey].amount
          )) *
          100,
        0
      ) +
      " % de la contribution brute total."
  );

  analysis.push(currentParagraph);

  return analysis;
};
