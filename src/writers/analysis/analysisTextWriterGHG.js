// La Société Nouvelle

import { getClosestYearData } from "../../../src/components/sections/results/utils";
import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterGHG = (props) => {
  const { impactsData, comparativeData, financialData, period } = props;
  const { mainAggregates, productionAggregates } = financialData;
  const { revenue} = productionAggregates;
  const year = period.periodKey.slice(2);

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'intensité d'émissions de gaz à effet de serre informe sur la quantité de gaz à effet de serre émis pour un euro de l'agrégat considéré."
  );

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph = [];

  currentParagraph.push(
    "L'intensité carbone de la valeur produite sur l'exercice est de " +
      printValue(mainAggregates.production.periodsData[period.periodKey].footprint.indicators.ghg.value, 0) +
      " gCO2e/€."
  );
  if (
    mainAggregates.production.periodsData[period.periodKey].footprint.indicators.ghg.value !=
    revenue.periodsData[period.periodKey].footprint.indicators.ghg.value
  ) {
    currentParagraph.push(
      "La valeur est de " +
        printValue(revenue.periodsData[period.periodKey].footprint.indicators.ghg.value, 0) +
        " gCO2e/€ pour le chiffre d'affaires, en prenant compte des stocks de production."
    );
  }
  currentParagraph.push(
    "En valeur brute, les émissions liées à la production s'élèvent à " +
      printValue(
        mainAggregates.production.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
          mainAggregates.production.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " kgCO2e."
  );

  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  const netValueAddedComparativeData = getClosestYearData(
    comparativeData.intermediateConsumptions.division.macrodata.data["GHG"],
    year
  );

  if (impactsData.greenhousesGazEmissions == 0) {
    currentParagraph.push(
      "Les activités de l'entreprise ne génère aucune émission directe de gaz à effet de serre. L'intensité liée à la valeur ajoutée nette est donc de 0 gCO2e/€."
    );
  } else {
    // valeur brute
    currentParagraph.push(
      "Les émissions directes de l'entreprise représentent " +
        printValue(impactsData.greenhousesGazEmissions, 0) +
        " kgCO2e, soit " +
        printValue(
          (impactsData.greenhousesGazEmissions /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
            )) *
            100,
          0
        ) +
        " % des émissions liées à la production."
    );
    // intensité & comparaison
    if (
      netValueAddedComparativeData.value !=
      null
    ) {
      let comparison = compareToReference(
        mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.ghg.value,
        netValueAddedComparativeData.value,
        10
      );
      if (comparison == 0) {
        currentParagraph.push(
          "L'intensité d'émissions de la valeur ajoutée est donc de " +
            printValue(
              mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.ghg.value,
              0
            ) +
            " gCO2e/€, soit un niveau équivalent à la branche d'activités."
        );
      } else if (comparison < 0) {
        currentParagraph.push(
          "L'intensité d'émissions de la valeur ajoutée est donc de " +
            printValue(
              mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.ghg.value,
              0
            ) +
            " gCO2e/€, soit un niveau inférieur à la branche d'activités."
        );
      } else {
        currentParagraph.push(
          "L'intensité d'émissions de la valeur ajoutée est donc de " +
            printValue(
              mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.ghg.value,
              0
            ) +
            " gCO2e/€, soit un niveau supérieur à la branche d'activités."
        );
      }
    } else {
      currentParagraph.push(
        "L'intensité d'émissions de la valeur ajoutée est donc de " +
          printValue(
            mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.ghg.value,
            0
          ) +
          " gCO2e/€"
      );
    }
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];

  // résultat
  currentParagraph.push(
    "Les émissions indirectes des consommations intermédiaires s'élèvent à " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
          mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " kgCO2e, soit une intensité de " +
      printValue(
        mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.value,
        0
      ) +
      " gCO2e/€."
  );
  if (
    mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
      mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
    ) >
      mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
        mainAggregates.netValueAdded.periodsData[period.periodKey].amount
      ) &&
    mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
      mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
    ) >
      mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
      )
  ) {
    currentParagraph.push(
      "Elles représentent les émissions les plus importantes sur le périmètre de la production (" +
        printValue(
          (mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
            mainAggregates.intermediateConsumptions.periodsData[period.periodKey].amount
          ) /
            mainAggregates.production.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
              mainAggregates.production.periodsData[period.periodKey].amount
            )) *
            100,
          0
        ) +
        " % des émissions totales)."
    );
  }

  analysis.push(currentParagraph);

  // comparaison branche

  const intermediateConsumptionsComparativeData = getClosestYearData(
    comparativeData.intermediateConsumptions.division.macrodata.data["GHG"],
    year
  );

  if (
    intermediateConsumptionsComparativeData
      .value != null
  ) {
    let comparison = compareToReference(
      mainAggregates.intermediateConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.value,
      intermediateConsumptionsComparativeData.value,
      10
    );
    if (comparison == 0) {
      currentParagraph.push(
        "L'intensité se situe à un niveau équivalent à l'intensité carbone des consommations intermédiaires de la branche d'activités."
      );
    } else if (comparison < 0) {
      currentParagraph.push(
        "L'intensité se situe à un niveau inférieur à l'intensité carbone des consommations intermédiaires de la branche d'activités."
      );
    } else {
      currentParagraph.push(
        "L'intensité se situe à un niveau supérieur à l'intensité carbone des consommations intermédiaires de la branche d'activités."
      );
    }
  }

  // comptes les plus impactants
  currentParagraph = [];
  let worstAccount = financialData.externalExpensesAccounts
    .filter((account) => account.periodsData.hasOwnProperty(period.periodKey))
    .sort((a, b) =>
      b.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(b.periodsData[period.periodKey].amount) -
      a.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(a.periodsData[period.periodKey].amount)
  )[0];
  currentParagraph.push(
    'Le compte de charges "' +
      worstAccount.accountLib.charAt(0) +
      worstAccount.accountLib.substring(1).toLowerCase() +
      '" est le plus émetteur (' +
      printValue(
        (worstAccount.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
          worstAccount.periodsData[period.periodKey].amount
        ) /
          mainAggregates.production.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
            mainAggregates.production.periodsData[period.periodKey].amount
          )) *
          100,
        0
      ) +
      " % des émissions totales) avec une intensité de " +
      printValue(worstAccount.periodsData[period.periodKey].footprint.indicators.ghg.value, 0) +
      " gCO2e/€ et un montant de " +
      printValue(worstAccount.periodsData[period.periodKey].amount, 0) +
      " €."
  );

  analysis.push(currentParagraph);

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push(
    "L'amortissement des immobilisations est à l'origine de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.getGrossImpact(
          mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].amount
        ),
        0
      ) +
      " kgCO2e émis, de part une intensité carbone de " +
      printValue(
        mainAggregates.fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators.ghg.value,
        0
      ) +
      " gCO2e/€."
  );

  analysis.push(currentParagraph);

  return analysis;
};
