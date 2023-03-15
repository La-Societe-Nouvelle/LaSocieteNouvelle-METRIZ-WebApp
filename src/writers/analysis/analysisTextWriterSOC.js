// La Société Nouvelle

import { printValue } from "../../utils/Utils";

export const analysisTextWriterSOC = (props) => {
  const { impactsData, financialData, period } = props;
  const { mainAggregates, productionAggregates } = financialData;
  const { revenue, storedProduction, immobilisedProduction} = productionAggregates;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'indicateur informe sur la part de la valeur produite par des entreprises de l'ESS ou ayant défini une raison d'être."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "Le taux de contribution de la valeur produite est de " +
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.soc.value, 0) +
      " %."
  );

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.hasSocialPurpose) {
    currentParagraph.push("L'entreprise est dotée d'une raison d'être.");
    currentParagraph.push(
      "La valeur ajoutée est donc entièrement contributrice aux acteurs d'intérêt social et représente " +
        printValue(
          (mainAggregates.netValueAdded.periodsData[period.periodKey].amount /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.soc.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
            )) *
            100,
          0
        ) +
        " % de la contribution brute totale."
    );
  } else {
    currentParagraph.push(
      "L'entreprise n'est pas dotée d'une raison d'être. L'ensemble des contributions est donc indirect."
    );
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    printValue(
      mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.soc.value,
      0
    ) +
      " % du volume des consommations intermédiaires contribue aux acteurs d'intérêt social," +
      " soit un montant de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.soc.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " €" +
      " et " +
      printValue(
        (mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.soc.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.footprint.indicators.soc.getGrossImpact(
            mainAggregates.production.amount
          )) *
          100,
        0
      ) +
      " % de la contribution brute totale."
  );

  analysis.push(currentParagraph);

  // comparaison branche

  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'amortissement des immobilisations contribue à hauteur de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.soc.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " €, soit " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.soc.value,
        0
      ) +
      " % du volume des dotations aux amortissements."
  );

  analysis.push(currentParagraph);

  return analysis;
};
