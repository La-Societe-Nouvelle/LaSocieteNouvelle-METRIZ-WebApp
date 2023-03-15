// La Société Nouvelle

import { printValue } from "../../utils/Utils";

export const analysisTextWriterMAT = (props) => {
  const { impactsData, financialData, period } = props;
  const { mainAggregates, productionAggregates } = financialData;
  const { revenue, storedProduction, immobilisedProduction} = productionAggregates;

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
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.mat.value, 0) +
      " g/€."
  );
  if (
    mainAggregates.production.periodsData[period.periodKey].footprint.indicators.mat.value !=
    revenue.periodsData[period.periodKey].footprint.indicators.mat.value
  ) {
    currentParagraph.push(
      "La valeur est de " +
        printValue(revenue.periodsData[period.periodKey].footprint.indicators.mat.value, 0) +
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
        printValue(mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.mat.value, 0) +
        " g/€ pour la valeur ajoutée."
    );
    currentParagraph.push(
      "La quantité extraite par l'entreprise représente " +
        printValue(
          (impactsData.materialsExtraction /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.mat.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
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
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.mat.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " kg de matières premières," +
      " ce qui correspond à une intensité de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.mat.value,
        0
      ) +
      " g/€."
  );
  currentParagraph.push(
    "L'extraction indirecte liée aux consommations intermédiaires représente " +
      printValue(
        (mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.mat.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.periodsData[period.periodKey].footprint.indicators.mat.getGrossImpact(
            mainAggregates.productions.periodsData[period.periodKey].amount
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
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.mat.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " kg."
  );

  analysis.push(currentParagraph);

  return analysis;
};
