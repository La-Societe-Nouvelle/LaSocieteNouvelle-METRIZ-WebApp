// La Société Nouvelle

import { printValue } from "../../utils/Utils";

export const analysisTextWriterWAT = (session,period) => {
  const { impactsData, financialData } = session;
  const { mainAggregates, revenue, storedProduction, immobilisedProduction } = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'indicateur exprime la quantité d'eau consommée pour produire un euro de l'agrégat considéré."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "L'intensité de consommation d'eau de la valeur produite est de " +
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.wat.value, 0) +
      " L/€."
  );
  if (
    mainAggregates.production.periodsData[period.periodKey].footprint.indicators.wat.value !=
    revenue.periodsData[period.periodKey].footprint.indicators.wat.value
  ) {
    currentParagraph.push(
      "La valeur est de " +
        printValue(revenue.periodsData[period.periodKey].footprint.indicators.wat.value, 0) +
        " L/€ pour le chiffre d'affaires, en prenant compte des stocks de production."
    );
  } else {
    currentParagraph.push(
      "La valeur est identique pour le chiffre d'affaires."
    );
  }

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.waterConsumption) {
    currentParagraph.push("Aucune consommation directe d'eau n'est déclarée.");
  } else {
    currentParagraph.push(
      "La consommation directe d'eau est de " +
        printValue(impactsData.waterConsumption, 0) +
        " m3," +
        " soit une intensité de " +
        printValue(mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.wat.value, 0) +
        " L/€ pour la valeur ajoutée."
    );
    currentParagraph.push(
      "La consommation directe d'eau représente " +
        printValue(
          (impactsData.waterConsumption /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.wat.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
            )) *
            100,
          0
        ) +
        " % de la consommation d'eau à l'échelle de la production."
    );
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    "Les consommations intermédiaires sont à l'orgine d'une consommation indirecte de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.wat.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " m3 d'eau," +
      " ce qui correspond à une intensité de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.wat.value,
        0
      ) +
      " L/€."
  );
  currentParagraph.push(
    "La consommation indirecte d'eau des consommations intermédiaires représente " +
      printValue(
        (mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.wat.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.periodsData[period.periodKey].footprint.indicators.wat.getGrossImpact(
            mainAggregates.production.periodsData[period.periodKey].amount
          )) *
          100,
        0
      ) +
      " % de la consommation totale liée à la production."
  );

  analysis.push(currentParagraph);

  // comparaison branche

  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'amortissement des immobilisations représente une consommation indirecte de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.wat.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " m3."
  );

  analysis.push(currentParagraph);

  return analysis;
};
