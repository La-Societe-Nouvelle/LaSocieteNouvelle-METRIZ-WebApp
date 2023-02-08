// La Société Nouvelle

import { printValue } from "../../utils/Utils";

export const analysisTextWriterMAT = (session) => {
  const { impactsData, financialData } = session;
  const { aggregates } = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'indicateur exprime la quantité de matières extraites pour produire un euro de l'agrégat considéré."
  );
  currentParagraph.push(
    "L'indicateur est en version beta : des travaux sont en cours."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "L'intensité d'extraction de matières premières de la valeur produite est de " +
      printValue(aggregates.production.footprint.indicators.mat.value, 0) +
      " g/€."
  );
  if (
    aggregates.production.footprint.indicators.mat.value !=
    aggregates.revenue.footprint.indicators.mat.value
  ) {
    currentParagraph.push(
      "La valeur est de " +
        printValue(aggregates.revenue.footprint.indicators.mat.value, 0) +
        " g/€ pour le chiffre d'affaires, en prenant compte des stocks de production."
    );
  } else {
    currentParagraph.push(
      "La valeur est identique pour le chiffre d'affaires."
    );
  }

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (
    !impactsData.isExtractiveActivities ||
    impactsData.materialsExtraction == 0
  ) {
    currentParagraph.push(
      "L'entreprise ne réalise aucune activité extractive ou agricole."
    );
  } else {
    currentParagraph.push(
      "La quantité de matière extraite est de " +
        printValue(impactsData.materialsExtraction, 0) +
        " kg, soit une intensité de " +
        printValue(aggregates.netValueAdded.footprint.indicators.mat.value, 0) +
        " g/€ pour la valeur ajoutée."
    );
    currentParagraph.push(
      "La quantité extraite par l'entreprise représente " +
        printValue(
          (impactsData.materialsExtraction /
            aggregates.production.footprint.indicators.mat.getGrossImpact(
              aggregates.production.amount
            )) *
            100,
          0
        ) +
        " % de l'empreinte matière de la production."
    );
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    "Les consommations intermédiaires sont à l'orgine d'une extraction de " +
      printValue(
        aggregates.intermediateConsumption.footprint.indicators.mat.getGrossImpact(
          aggregates.intermediateConsumption.amount
        ),
        0
      ) +
      " kg de matières premières," +
      " ce qui correspond à une intensité de " +
      printValue(
        aggregates.intermediateConsumption.footprint.indicators.mat.value,
        0
      ) +
      " g/€."
  );
  currentParagraph.push(
    "L'extraction indirecte liée aux consommations intermédiaires représente " +
      printValue(
        (aggregates.intermediateConsumption.footprint.indicators.mat.getGrossImpact(
          aggregates.intermediateConsumption.amount
        ) /
          aggregates.production.footprint.indicators.mat.getGrossImpact(
            aggregates.production.amount
          )) *
          100,
        0
      ) +
      " % de l'empreinte matière pour la production."
  );

  analysis.push(currentParagraph);

  // comparaison branche

  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'amortissement des immobilisations est à l'origine d'une extraction de " +
      printValue(
        aggregates.capitalConsumption.footprint.indicators.mat.getGrossImpact(
          aggregates.capitalConsumption.amount
        ),
        0
      ) +
      " kg."
  );

  analysis.push(currentParagraph);

  return analysis;
};
