// La Société Nouvelle

import { isValidInput, isValidNumber } from "../../../../utils/Utils";

// Check statement in impacts data for ART
export const checkStatementART = (impactsData) => 
{
  const {
    netValueAdded,
    isValueAddedCrafted,
    craftedProduction
  } = impactsData;

  if (isValueAddedCrafted === true) {
    if (isValidNumber(craftedProduction,netValueAdded,netValueAdded)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({ status: "error", errorMessage: "Erreur application" });
    }
  } else if (isValueAddedCrafted === false) {
    if (isValidNumber(craftedProduction,0,0)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({ status: "error", errorMessage: "Erreur application" });
    }
  } else if (isValueAddedCrafted === "partially") {
    if (craftedProduction=="") {
      return({ status: "incomplete", errorMessage: null });
    } else if (isValidNumber(craftedProduction,0,netValueAdded)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({
        status: "error",
        errorMessage: isValidNumber(craftedProduction) ?
          "Valeur saisie incorrecte (négative ou supérieur à la valeur ajoutée nette de l'entreprise)"
          : "Veuillez saisir une valeur numérique"
      });
    }
  } else if (isValueAddedCrafted === null) {
    return({ status: "incomplete", errorMessage: null });
  } else {
    return({ status: "error", errorMessage: "Erreur application" });
  }
}

// Check statement in impacts data for ECO
export const checkStatementECO = (impactsData) => 
{
  const {
    netValueAdded,
    isAllActivitiesInFrance,
    domesticProduction
  } = impactsData;

  if (isAllActivitiesInFrance === true) {
    if (isValidNumber(domesticProduction,netValueAdded,netValueAdded)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({ status: "error", errorMessage: "Erreur application" });
    }
  } else if (isAllActivitiesInFrance === false) {
    if (isValidNumber(domesticProduction,0,0)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({ status: "error", errorMessage: "Erreur application" });
    }
  } else if (isAllActivitiesInFrance === "partially") {
    if (domesticProduction=="") {
      return({ status: "incomplete", errorMessage: null });
    } else if (isValidNumber(domesticProduction,0,netValueAdded)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({
        status: "error",
        errorMessage: isValidNumber(domesticProduction) ?
          "Valeur saisie incorrecte (négative ou supérieur à la valeur ajoutée nette de l'entreprise)"
          : "Veuillez saisir une valeur numérique"
      });
    }
  } else if (isAllActivitiesInFrance === null) {
    return({ status: "incomplete", errorMessage: null });
  } else {
    return({ status: "error", errorMessage: "Erreur application" });
  }
}

// Check statement in impacts data for GEQ
export const checkStatementGEQ = (impactsData) => {
  const {
    hasEmployees,
    wageGap
  } = impactsData;

  if (hasEmployees === true) {
    if (wageGap === "" || wageGap === null) {
      return ({ status: "incomplete", errorMessage: null });
    } else if (isValidNumber(wageGap, 0)) {
      return ({ status: "ok", errorMessage: null });
    } else {
      return ({ status: "error", errorMessage: "Erreur application" });
    }
  } else if (hasEmployees === false) {
    if (isValidNumber(wageGap, 0, 0)) {
      return ({ status: "ok", errorMessage: null });
    } else {
      return ({ status: "error", errorMessage: "Erreur application" });
    }
  } else if (hasEmployees === null) {
    // & wage gap not null or empty string
    return ({ status: "incomplete", errorMessage: null });
  } else {
    return ({ status: "error", errorMessage: "Erreur application" });
  }
}

// Check statement GHG
export const checkStatementGHG = (impactsData) => 
{
  const {
    greenhouseGasEmissions,
    greenhouseGasEmissionsUncertainty,
  } = impactsData;

  // ok
  if (isValidNumber(greenhouseGasEmissions,0) && isValidNumber(greenhouseGasEmissionsUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // incomplete
  else if (greenhouseGasEmissions=="" || greenhouseGasEmissionsUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  } 
  // error
  else if (greenhouseGasEmissions!="" && !isValidNumber(greenhouseGasEmissions,0)) {
    return({
      status: "error",
      errorMessage: isValidNumber(greenhouseGasEmissions) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  } else if (greenhouseGasEmissionsUncertainty!="" && !isValidNumber(greenhouseGasEmissionsUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: isValidNumber(greenhouseGasEmissionsUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  } else {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
}

// Check statement for HAZ
export const checkStatementHAZ = (impactsData) => 
{
  const {
    hazardousSubstancesUse,
    hazardousSubstancesUseUncertainty,
  } = impactsData;

  // ok
  if (isValidNumber(hazardousSubstancesUse,0) && isValidNumber(hazardousSubstancesUseUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // valid value (empty or correct)
  else if (!isValidInput(hazardousSubstancesUse,0) && !isValidInput(hazardousSubstancesUseUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
  // error value for energy consumption
  else if (!isValidInput(hazardousSubstancesUse,0)) {
    return({
      status: "error",
      errorMessage: isValidNumber(hazardousSubstancesUse) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  }
  // error value for uncertainty
  else if (!isValidInput(hazardousSubstancesUseUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: isValidNumber(hazardousSubstancesUseUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  }
  // incomplete statement
  else if (hazardousSubstancesUse=="" || hazardousSubstancesUseUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  }
  // other
  else {
    return({ status: "error", errorMessage: "Erreur Application" });
  }
}

// Check statement in impacts data for IDR
export const checkStatementIDR = (impactsData) => 
{
  const {
    hasEmployees,
    interdecileRange
  } = impactsData;

  if (hasEmployees === true) 
  {
    // ok
    if (isValidNumber(interdecileRange,1)) {
      return({ status: "ok", errorMessage: null });
    } 
    // incomplete
    else if (interdecileRange=="" || interdecileRange==null) {
      return({ status: "incomplete", errorMessage: null });
    } 
    else if (isValidNumber(interdecileRange)) {
      return({ 
        status: "error", 
        errorMessage: "Valeur saisie incorrecte (inférieure à 1)"
      });
    } else {
      return({ 
        status: "error", 
        errorMessage: "Veuillez saisir une valeur numérique"
      });
    }
  } 
  else if (hasEmployees === false) {
    if (isValidNumber(interdecileRange,1,1)) {
      return({ status: "ok", errorMessage: null });
    } else {
      return({ status: "error", errorMessage: "Erreur application" });
    }
  } 
  else if (hasEmployees === null) {
    // & wage gap not null or empty string
    return({ status: "incomplete", errorMessage: null });
  } 
  else {
    return({ status: "error", errorMessage: "Erreur application" });
  }
}

// Check statement in impacts data for KNW
export const checkStatementKNW = (impactsData) => 
{
  const {
    netValueAdded,
    researchAndTrainingContribution,
  } = impactsData;

  if (researchAndTrainingContribution=="" || researchAndTrainingContribution==null) {
    return({ status: "incomplete", errorMessage: null });
  } else if (isValidNumber(researchAndTrainingContribution,0,netValueAdded)) {
    return({ status: "ok", errorMessage: null });
  } else {
    return({
      status: "error",
      errorMessage: isValidNumber(researchAndTrainingContribution) ?
        "Valeur saisie incorrecte (négative ou supérieur à la valeur ajoutée nette de l'entreprise)"
        : "Veuillez saisir une valeur numérique"
    });
  }
}

// Check statement MAT
export const checkStatementMAT = (impactsData) => 
{
  const {
    isExtractiveActivities,
    materialsExtraction,
    materialsExtractionUncertainty,
  } = impactsData;

  // extractive activities
  if (isExtractiveActivities === true) 
  {
    // ok
    if (isValidNumber(materialsExtraction,0) && isValidNumber(materialsExtractionUncertainty,0,100)) {
      return({ status: "ok", errorMessage: null });
    } 
    // valid value (empty or correct)
    else if (!isValidInput(materialsExtraction,0) && !isValidInput(materialsExtractionUncertainty,0,100)) {
      return({
        status: "error",
        errorMessage: "Valeurs saisies incorrectes"
      });
    }
    // error value for materials extraction
    else if (!isValidInput(materialsExtraction,0)) {
      return({
        status: "error",
        errorMessage: isValidNumber(materialsExtraction) ?
          "Valeur saisie incorrecte (négative)"
          : "Veuillez saisir une valeur numérique"
      });
    }
    // error value for uncertainty
    else if (!isValidInput(materialsExtractionUncertainty,0,100)) {
      return({
        status: "error",
        errorMessage: isValidNumber(materialsExtractionUncertainty) ?
          "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
          : "Veuillez saisir une valeur numérique pour l'incertitude"
      });
    }
    // incomplete statement
    else if (materialsExtraction=="" || materialsExtractionUncertainty=="") {
      return({ status: "incomplete", errorMessage: null });
    }
    // other
    else {
      return({ status: "error", errorMessage: "Erreur Application" });
    }
  }
  // not extractive activities
  else if (isExtractiveActivities === false)
  {
    // ok
    if (isValidNumber(materialsExtraction,0,0) && isValidNumber(materialsExtractionUncertainty,0,0)) {
      return({ status: "ok", errorMessage: null });
    } 
    // error
    else {
      return({
        status: "error",
        errorMessage: "Erreur Application"
      });
    }
  }
  // unselect extractive activities
  else if (isExtractiveActivities === "" || isExtractiveActivities === null)
  {
    // incomplete
    return({
      status: "incomplete",
      errorMessage: null
    });
  }
  // other value for isExtractiveActivities
  else {
    return({
      status: "error",
      errorMessage: "Erreur Application"
    });
  }
}

// Check statement for NRG
export const checkStatementNRG = (impactsData) => 
{
  const {
    energyConsumption,
    energyConsumptionUncertainty,
  } = impactsData;

  // ok
  if (isValidNumber(energyConsumption,0) && isValidNumber(energyConsumptionUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // valid value (empty or correct)
  else if (!isValidInput(energyConsumption,0) && !isValidInput(energyConsumptionUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
  // error value for energy consumption
  else if (!isValidInput(energyConsumption,0)) {
    return({
      status: "error",
      errorMessage: isValidNumber(energyConsumption) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  }
  // error value for uncertainty
  else if (!isValidInput(energyConsumptionUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: isValidNumber(energyConsumptionUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  }
  // incomplete statement
  else if (energyConsumption=="" || energyConsumptionUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  }
  // other
  else {
    return({ status: "error", errorMessage: "Erreur Application" });
  }
}

// Check statement in impacts data for SOC
export const checkStatementSOC = (impactsData) => 
{
  const {
    hasSocialPurpose,
  } = impactsData;

  if (hasSocialPurpose === true || hasSocialPurpose === false) {
    return({ status: "ok", errorMessage: null });
  } else {
    return({ status: "incomplete", errorMessage: null });
  }
}

// Check statement for WAS
export const checkStatementWAS = (impactsData) => 
{
  const {
    wasteProduction,
    wasteProductionUncertainty,
  } = impactsData;

  // ok
  if (isValidNumber(wasteProduction,0) && isValidNumber(wasteProductionUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // valid value (empty or correct)
  else if (!isValidInput(wasteProduction,0) && !isValidInput(wasteProductionUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
  // error value for waste production
  else if (!isValidInput(wasteProduction,0)) {
    return({
      status: "error",
      errorMessage: isValidNumber(wasteProduction) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  }
  // error value for uncertainty
  else if (!isValidInput(wasteProductionUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: isValidNumber(wasteProductionUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  }
  // incomplete statement
  else if (wasteProduction=="" || wasteProductionUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  }
  // other
  else {
    return({ status: "error", errorMessage: "Erreur Application" });
  }
}

// Check statement WAT
export const checkStatementWAT = (impactsData) => 
{
  const {
    waterConsumption,
    waterConsumptionUncertainty,
  } = impactsData;

  // ok
  if (isValidNumber(waterConsumption,0) && isValidNumber(waterConsumptionUncertainty,0,100)) {
    return({ status: "ok", errorMessage: null });
  } 
  // valid value (empty or correct)
  else if (!isValidInput(waterConsumption,0) && !isValidInput(waterConsumptionUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: "Valeurs saisies incorrectes"
    });
  }
  // error value for water consumption
  else if (!isValidInput(waterConsumption,0)) {
    return({
      status: "error",
      errorMessage: isValidNumber(waterConsumption) ?
        "Valeur saisie incorrecte (négative)"
        : "Veuillez saisir une valeur numérique"
    });
  }
  // error value for uncertainty
  else if (!isValidInput(waterConsumptionUncertainty,0,100)) {
    return({
      status: "error",
      errorMessage: isValidNumber(waterConsumptionUncertainty) ?
        "Incertitude saisie incorrecte (négative ou supérieur à 100%)"
        : "Veuillez saisir une valeur numérique pour l'incertitude"
    });
  }
  // incomplete statement
  else if (waterConsumption=="" || waterConsumptionUncertainty=="") {
    return({ status: "incomplete", errorMessage: null });
  }
  // other
  else {
    return({ status: "error", errorMessage: "Erreur Application" });
  }
}