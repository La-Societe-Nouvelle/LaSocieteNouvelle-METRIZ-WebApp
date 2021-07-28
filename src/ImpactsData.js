
export class ImpactsData  {

  constructor(props) {

    this.netValueAdded = null;

    /* --- Value Creation --- */

    this.isAllActivitiesInFrance = null;
    this.domesticProduction = null;

    this.isValueAddedCrafted = null;
    this.craftedProduction = null;

    this.hasSocialPurpose = null;

    /* --- Social Data --- */

    this.hasEmployees = null;

    this.indexGini = null;
    this.wageGap = null;
    this.researchAndTrainingContribution = null;

    /* --- Environnemental Data */

    this.greenhousesGazEmissions = null;
    this.greenhousesGazEmissionsUncertainty = null;

    this.hazardousSubstancesConsumption = null;
    this.hazardousSubstancesConsumptionUncertainty = null;

    this.isExtractiveActivities = null;
    this.materialsExtraction = null;
    this.materialsExtractionUncertainty = null;

    this.energyConsumption = null;
    this.energyConsumptionUncertainty = null;

    this.wasteProduction = null;
    this.wasteProductionUncertainty = null;

    this.waterConsumption = null;
    this.waterConsumptionUncertainty = null;

  }

  /* ----- BACK UP ----- */

  updateFromBackUp(backUp) 
  {
    this.netValueAdded = backUp.netValueAdded;
    this.isAllActivitiesInFrance = backUp.isAllActivitiesInFrance;
    this.domesticProduction = backUp.domesticProduction;
    this.isValueAddedCrafted = backUp.isValueAddedCrafted;
    this.craftedProduction = backUp.craftedProduction;
    this.hasSocialPurpose = backUp.hasSocialPurpose;
    this.hasEmployees = backUp.hasEmployees;
    this.indexGini = backUp.indexGini;
    this.wageGap = backUp.wageGap;
    this.researchAndTrainingContribution = backUp.researchAndTrainingContribution;
    this.greenhousesGazEmissions = backUp.greenhousesGazEmissions;
    this.greenhousesGazEmissionsUncertainty = backUp.greenhousesGazEmissionsUncertainty;
    this.hazardousSubstancesConsumption = backUp.hazardousSubstancesConsumption;
    this.hazardousSubstancesConsumptionUncertainty = backUp.hazardousSubstancesConsumptionUncertainty;
    this.isExtractiveActivities = backUp.isExtractiveActivities;
    this.materialsExtraction = backUp.materialsExtraction;
    this.materialsExtractionUncertainty = backUp.materialsExtractionUncertainty;
    this.energyConsumption = backUp.energyConsumption;
    this.energyConsumptionUncertainty = backUp.energyConsumptionUncertainty;
    this.wasteProduction = backUp.wasteProduction;
    this.wasteProductionUncertainty = backUp.wasteProductionUncertainty;
    this.waterConsumption = backUp.waterConsumption;
    this.waterConsumptionUncertainty = backUp.waterConsumptionUncertainty;
  }

  /* ---------- SETTERS ---------- */

  // Net Value Added

  setNetValueAdded(netValueAdded) {
    this.netValueAdded = netValueAdded;
    if (netValueAdded!=null) {
      if (this.isAllActivitiesInFrance) this.domesticProduction = netValueAdded;
      if (this.isValueAddedCrafted) this.craftedProduction = netValueAdded;
    } else {
      this.domesticProduction = null;
      this.craftedProduction = null;
    }
  }

  // Value Creation

  setIsAllActivitiesInFrance(isAllActivitiesInFrance) {
    this.isAllActivitiesInFrance = isAllActivitiesInFrance;
    if (isAllActivitiesInFrance === true) {
      this.domesticProduction = this.netValueAdded || 0;
    } else {
      this.domesticProduction = 0;
    }
  }

  // Social data

  setHasEmployees(hasEmployees) {
    this.hasEmployees = hasEmployees;
    if (!hasEmployees) {
      this.indexGini = 0;
      this.wageGap = 0;
    } else {
      this.indexGini = null;
      this.wageGap = null;
    }
  }

  // Environnemental data

  setGreenhousesGazEmissions(emissions) {
    this.greenhousesGazEmissions = emissions;
    this.greenhousesGazEmissionsUncertainty = getDefaultUncertainty(emissions)
  }

  setHazardousSubstancesConsumption(consumption) {
    this.hazardousSubstancesConsumption = consumption;
    this.hazardousSubstancesConsumptionUncertainty = getDefaultUncertainty(consumption)
  }

  setIsExtractiveActivities(isExtractiveActivities) {
    this.isExtractiveActivities = isExtractiveActivities;
    if (isExtractiveActivities) {
      this.materialsExtraction = null;
      this.materialsExtractionUncertainty = null;
    } else {
      this.materialsExtraction = 0;
      this.materialsExtractionUncertainty = 0;
    }
  }

  setMaterialsExtraction(extraction) {
    this.materialsExtraction = extraction;
    this.materialsExtractionUncertainty = getDefaultUncertainty(extraction);
  }

  setEnergyConsumption(consumption) {
    this.energyConsumption = consumption;
    this.energyConsumptionUncertainty = getDefaultUncertainty(consumption);
  }

  setWasteProduction(production) {
    this.wasteProduction = production;
    this.wasteProductionUncertainty = getDefaultUncertainty(production);
  }

  setWaterConsumption(consumption) {
    this.waterConsumption = consumption;
    this.waterConsumptionUncertainty = getDefaultUncertainty(consumption);
  }

}

function getDefaultUncertainty(measure) 
{
  if (measure == null) {return null}
  else if (measure == 0) {return 0}
  else {return 25}
}
