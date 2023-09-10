// La Société Nouvelle

// ################################################## IMPACTS DATA OBJECT ##################################################

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

    this.interdecileRange = props.interdecileRange !== undefined ? props.interdecileRange : null;
    this.wageGap =  props.wageGap !== undefined ? props.wageGap : null;
    this.researchAndTrainingContribution = props.researchAndTrainingContribution !== undefined ? props.researchAndTrainingContribution : null;

    this.knwDetails = props.knwDetails || {};

    /* --- Environnemental Data */

    this.greenhousesGazEmissions =  props.greenhousesGazEmissions !== undefined ? props.greenhousesGazEmissions : null;
    this.greenhousesGazEmissionsUncertainty =  props.greenhousesGazEmissionsUncertainty !== undefined ? props.greenhousesGazEmissionsUncertainty : null;
    this.greenhousesGazEmissionsUnit = props.greenhousesGazEmissionsUnit !== undefined ? props.greenhousesGazEmissionsUnit : "kgCO2e";

    this.ghgDetails = props.ghgDetails || {};
    this.ghgTotal = props.ghgTotal || false;

    this.hazardousSubstancesConsumption = props.hazardousSubstancesConsumption !== undefined ? props.hazardousSubstancesConsumption : null;
    this.hazardousSubstancesConsumptionUnit = props.hazardousSubstancesConsumptionUnit !== undefined ? props.hazardousSubstancesConsumptionUnit : "kg";
    this.hazardousSubstancesConsumptionUncertainty = props.hazardousSubstancesConsumptionUncertainty !== undefined ? props.hazardousSubstancesConsumptionUncertainty : null;

    this.isExtractiveActivities = props.isExtractiveActivities !== undefined ? props.isExtractiveActivities : null;
    this.materialsExtraction =  props.materialsExtraction !== undefined ? props.materialsExtraction : null;
    this.materialsExtractionUnit = props.materialsExtractionUnit !== undefined ? props.materialsExtractionUnit : "kg";
    this.materialsExtractionUncertainty = props.materialsExtractionUncertainty !== undefined ? props.materialsExtractionUncertainty : null;

    this.energyConsumption = props.energyConsumption !== undefined ? props.energyConsumption : null;
    this.energyConsumptionUnit = props.energyConsumptionUnit !== undefined ? props.energyConsumptionUnit : "MJ";
    this.energyConsumptionUncertainty = props.energyConsumptionUncertainty !== undefined ? props.energyConsumptionUncertainty : null;
    this.nrgDetails = props.nrgDetails || {};
    this.nrgTotal = props.nrgTotal || false;


    this.wasteProduction = props.wasteProduction !== undefined ? props.wasteProduction : null;
    this.wasteProductionUnit = props.wasteProductionUnit !== undefined ? props.wasteProductionUnit : "kg";
    this.wasteProductionUncertainty = props.wasteProductionUncertainty !== undefined ? props.wasteProductionUncertainty : null;

    this.waterConsumption =  props.waterConsumption !== undefined ? props.waterConsumption : null;
    this.waterConsumptionUnit = props.waterConsumptionUnit !== undefined ? props.waterConsumptionUnit : "m³";
    this.waterConsumptionUncertainty =  props.waterConsumptionUncertainty !== undefined ? props.waterConsumptionUncertainty : null;

    /* --- Commentaires --- */

    this.comments = props.comments || {};

    // ---------------------------------------------------------------------------------------------------- //
  }

  /* ---------- SETTERS ---------- */

  // Net Value Added
  setNetValueAdded(netValueAdded) {
    this.netValueAdded = netValueAdded;
  }

}