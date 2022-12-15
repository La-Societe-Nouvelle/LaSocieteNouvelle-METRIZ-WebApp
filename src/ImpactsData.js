
export class ImpactsData  {

  constructor(props) 
  {
    if (props==undefined) props = {};
  // ---------------------------------------------------------------------------------------------------- //

    this.netValueAdded = props.netValueAdded || null;

    /* --- Value Creation --- */

    this.isAllActivitiesInFrance = props.isAllActivitiesInFrance !== undefined ? props.isAllActivitiesInFrance : null;
    this.domesticProduction = props.domesticProduction !== undefined ? props.domesticProduction : null;

    this.isValueAddedCrafted = props.isValueAddedCrafted !== undefined ? props.isValueAddedCrafted : null;
    this.craftedProduction =  props.craftedProduction !== undefined ? props.craftedProduction : null;

    this.hasSocialPurpose = props.hasSocialPurpose !== undefined ? props.hasSocialPurpose : null;

    /* --- Social Data --- */

    this.hasEmployees = props.hasEmployees !== undefined ? props.hasEmployees : null;
    this.employees = props.employees || [];
    this.socialStatements = props.socialStatements || [];
    this.individualsData = props.individualsData || [];

    this.indexGini = props.indexGini !== undefined ? props.indexGini : null;
    this.interdecileRange = props.interdecileRange !== undefined ? props.interdecileRange : null;
    this.wageGap =  props.wageGap !== undefined ? props.wageGap : null;
    this.researchAndTrainingContribution = props.researchAndTrainingContribution !== undefined ? props.researchAndTrainingContribution : null;

    this.knwDetails = props.knwDetails || {};

    /* --- Environnemental Data */

    this.greenhousesGazEmissions =  props.greenhousesGazEmissions !== undefined ? props.greenhousesGazEmissions : null;
    this.greenhousesGazEmissionsUncertainty =  props.greenhousesGazEmissionsUncertainty !== undefined ? props.greenhousesGazEmissionsUncertainty : null;
    this.ghgDetails = props.ghgDetails || {};
    this.ghgTotal = props.ghgTotal || false;

    this.hazardousSubstancesConsumption = props.hazardousSubstancesConsumption !== undefined ? props.hazardousSubstancesConsumption : null;
    this.hazardousSubstancesConsumptionUncertainty = props.hazardousSubstancesConsumptionUncertainty !== undefined ? props.hazardousSubstancesConsumptionUncertainty : null;

    this.isExtractiveActivities = props.isExtractiveActivities !== undefined ? props.isExtractiveActivities : null;
    this.materialsExtraction =  props.materialsExtraction !== undefined ? props.materialsExtraction : null;
    this.materialsExtractionUncertainty = props.materialsExtractionUncertainty !== undefined ? props.materialsExtractionUncertainty : null;

    this.energyConsumption = props.energyConsumption !== undefined ? props.energyConsumption : null;
    this.energyConsumptionUncertainty = props.energyConsumptionUncertainty !== undefined ? props.energyConsumptionUncertainty : null;
    this.nrgDetails = props.nrgDetails || {};
    this.nrgTotal = props.nrgTotal || false;


    this.wasteProduction = props.wasteProduction !== undefined ? props.wasteProduction : null;
    this.wasteProductionUncertainty = props.wasteProductionUncertainty !== undefined ? props.wasteProductionUncertainty : null;

    this.waterConsumption =  props.waterConsumption !== undefined ? props.waterConsumption : null;
    this.waterConsumptionUncertainty =  props.waterConsumptionUncertainty !== undefined ? props.waterConsumptionUncertainty : null;

    /* --- Commentaires --- */

    this.comments = props.comments || {};


    
  // ---------------------------------------------------------------------------------------------------- //
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
    this.employees = backUp.employees || [];
    this.indexGini = backUp.indexGini;
    this.wageGap = backUp.wageGap;

    this.researchAndTrainingContribution = backUp.researchAndTrainingContribution;
    this.knwDetails = backUp.knwDetails || {};
    
    this.greenhousesGazEmissions = backUp.greenhousesGazEmissions;
    this.greenhousesGazEmissionsUncertainty = backUp.greenhousesGazEmissionsUncertainty;
    this.ghgDetails = backUp.ghgDetails || {};

    this.hazardousSubstancesConsumption = backUp.hazardousSubstancesConsumption;
    this.hazardousSubstancesConsumptionUncertainty = backUp.hazardousSubstancesConsumptionUncertainty;
    this.isExtractiveActivities = backUp.isExtractiveActivities;
    this.materialsExtraction = backUp.materialsExtraction;
    this.materialsExtractionUncertainty = backUp.materialsExtractionUncertainty;

    this.energyConsumption = backUp.energyConsumption;
    this.energyConsumptionUncertainty = backUp.energyConsumptionUncertainty;
    this.nrgDetails = backUp.nrgDetails || {};

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
