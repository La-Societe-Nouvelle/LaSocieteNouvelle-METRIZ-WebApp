// La Société Nouvelle

import { printValue } from "../../utils/Utils";

export const analysisTextWriterART = (props) => {
  const { impactsData, financialData, period } = props;
  const { mainAggregates } = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'indicateur informe sur la part de la valeur produite par des entreprises artisanales ou dont le savoir-faire est reconnu."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "Le taux de contribution aux métiers d'art et aux savoir-faire de la production sur l'exercice est de " +
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.art.getValue(), 0) +
      "%."
  );
  currentParagraph.push(
    "Il correspond à un volume de " +
      printValue(
        mainAggregates.production.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
          mainAggregates.production.periodsData[period.periodKey].amount
        ),
        0
      ) +
      "€."
  );

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.isValueAddedCrafted) {
    currentParagraph.push(
      "Les activités de l'entreprise sont déclarées artisanales ou faisant appel à un savoir-faire reconnu."
    );
    currentParagraph.push(
      "La valeur ajoutée est donc entièrement contributrice aux métiers d'art et aux savoir-faire et représente " +
        printValue(
          (impactsData.craftedProduction /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
            )) *
            100,
          0
        ) +
        "% de la contribution brute totale."
    );
  } else if (impactsData.craftedProduction == 0) {
    currentParagraph.push(
      "Les activités de l'entreprise ne sont pas considérées comme artisanales."
    );
    currentParagraph.push(
      "Le taux de contribution pour la valeur ajoutée est donc de 0%."
    );
  } else {
    currentParagraph.push(
      printValue(
        (impactsData.craftedProduction / mainAggregates.netValueAdded.periodsData[period.periodKey].amount) * 100,
        0
      ) +
        " % de la valeur ajoutée nette de l'entreprise est considérée comme artisanale."
    );
    currentParagraph.push(
      "Elle représente " +
        printValue(
          (impactsData.craftedProduction /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
            )) *
            100,
          0
        ) +
        "% de la contribution brute totale."
    );
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    "La contribution indirecte via les consommations intermédiaires compte pour " +
      printValue(
        (mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
            mainAggregates.production.periodsData[period.periodKey].amount
          )) *
          100,
        0
      ) +
      "%."
  );
  currentParagraph.push(
    "Elle représente " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      "€, soit " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.art.getValue(),
        0
      ) +
      "% du montant total des consommations intermédiaires."
  );

  analysis.push(currentParagraph);

  // comparaison branche

  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "Enfin la contribution indirecte via l'amortissement des immobilisations est de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      "€, soit " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.art.getValue(),
        0
      ) +
      "% du volume des dotations aux amortissements et " +
      printValue(
        (mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.periodsData[period.periodKey].footprint.indicators.art.getGrossImpact(
            mainAggregates.production.periodsData[period.periodKey].amount
          )) *
          100,
        0
      ) +
      "% de la contribution brute totale."
  );

  analysis.push(currentParagraph);

  return analysis;
};
