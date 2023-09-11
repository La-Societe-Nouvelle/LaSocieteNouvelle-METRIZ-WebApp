import { printValue, printValueInput } from "/src/utils/formatters";

export const writeStatementECO = (impactsData) => {
  const textStatement = [
    {
      text:
        "Valeur ajoutée nette produite en France : " +
        printValue(impactsData.domesticProduction, 0) +
        " €" +
        (impactsData.isAllActivitiesInFrance ? "*" : ""),
    },
  ];

  if (impactsData.isAllActivitiesInFrance) {
    textStatement.push({
      text: "*Les activités de l'entreprise sont déclarées entièrement localisées en France",
      fontSize: 8,
      italics: true,
      margin:[0,10,0,10]
    });
  }
  return textStatement;
};

export const writeStatementART = (impactsData) => {
  const textStatement = [
    {
      text:
        "Valeur ajoutée artisanale : " +
        printValueInput(impactsData.craftedProduction, 0) +
        " €" +
        (impactsData.isValueAddedCrafted ? "*" : ""),
    },
  ];

  if (impactsData.isValueAddedCrafted) {
    textStatement.push({
      text: "*Les activités de l'entreprise sont déclarées artisanales / faisant appel à un savoir-faire reconnu",
      fontSize: 8,
      italics: true,
      margin:[0,10,0,10]
    });
  }

  return textStatement;
};

export const writeStatementGEQ = (impactsData) => {
  const textStatement = [
    {
      text:
        "Ecart interne de rémunérations Femmes/Hommes : " +
        printValue(impactsData.wageGap, 0) +
        " %" +
        (!impactsData.hasEmployees ? "*" : ""),
    },
  ];

  if (!impactsData.hasEmployees) {
    textStatement.push({
      text: "*L'entreprise est déclarée non-employeur",
      fontSize: 8,
      italics: true,
      margin:[0,10,0,10]
    });
  }
  return textStatement;
};

export const writeStatementGHG = (impactsData) => {
  const textStatement = [
    {
      text:
        "Emissions directes de gaz à effet de serre : " +
        printValue(impactsData.greenhouseGasEmissions, 0) +
        " kgCO2e +/- " +
        printValue(impactsData.greenhouseGasEmissionsUncertainty, 0) +
        " %",
    },
  ];

  return textStatement;
};

export const writeStatementHAZ = (impactsData) => {
  const textStatement = [
    {
      text:
        "Quantité utilisée de produits dangereux : " +
        printValue(impactsData.hazardousSubstancesUse, 0) +
        " kg +/- " +
        printValue(impactsData.hazardousSubstancesUseUncertainty, 0) +
        " %",
    },
  ];

  return textStatement;
};

export const writeStatementIDR = (impactsData) => {
  const textStatement = [
    {
      text:
        "Rapport interdécile D9/D1 interne : " +
        printValue(impactsData.interdecileRange, 2) +
        " " +
        (!impactsData.hasEmployees ? "*" : ""),
    },
  ];

  if (!impactsData.hasEmployees) {
    textStatement.push({
      text: "*L'entreprise est déclarée non-employeur",
      fontSize: 8,
      italics: true,
      margin:[0,10,0,10]
    });
  }

  return textStatement;
};

export const writeStatementKNW = (impactsData) => {
  const textStatement = [
    {
      text:
        "Contribution directe à l'évolution des compétences et des connaissances : " +
        printValue(impactsData.researchAndTrainingContribution, 0) +
        " €",
    },
  ];

  return textStatement;
};

export const writeStatementMAT = (impactsData) => {
  const textStatement = [
    {
      text:
        "Quantité extraite de matières premières : " +
        printValue(impactsData.materialsExtraction, 0) +
        " kg +/- " +
        printValue(impactsData.materialsExtractionUncertainty, 0) +
        " %",
    },
  ];

  return textStatement;
};

export const writeStatementNRG = (impactsData) => {
  const textStatement = [
    {
      text:
        "Consommation d'eau déclarée : " +
        printValue(impactsData.energyConsumption, 0) +
        " MJ +/- " +
        printValue(impactsData.energyConsumptionUncertainty, 0) +
        " %",
    },
  ];

  return textStatement;
};

export const writeStatementSOC = (impactsData) => {
  const textStatement = [
    {
      text:
        "Acteur doté d'une raison sociale : " +
        (impactsData.hasSocialPurpose ? "oui" : "non"),
    },
  ];

  return textStatement;
};

export const writeStatementWAS = (impactsData) => {
  const textStatement = [
    {
      text:
        "Production directe de déchets : " +
        printValue(impactsData.wasteProduction, 0) +
        " kg +/- " +
        printValue(impactsData.wasteProductionUncertainty, 0) +
        " %",
    },
  ];

  return textStatement;
};

export const writeStatementWAT = (impactsData) => {
  const textStatement = [
    {
      text:
        "Consommation d'eau déclarée : " +
        printValue(impactsData.waterConsumption, 0) +
        " m3 +/- " +
        printValue(impactsData.waterConsumptionUncertainty, 0) +
        " %",
    },
  ];
  return textStatement;
};
