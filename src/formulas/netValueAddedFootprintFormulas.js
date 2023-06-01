// La Société Nouvelle

// Objects
import { Indicator } from '/src/footprintObjects/Indicator';

/* ----------------------------------------------------------------------------- */
/* -------------------- NET VALUE ADDED INDICATORS FORMULAS -------------------- */
/* ----------------------------------------------------------------------------- */


export function buildNetValueAddedIndicator(indic,impactsData)
{
    let indicator = new Indicator({indic});
    switch(indic)
    {
        case "art": buildValueART(indicator,impactsData); break;
        case "idr": buildValueIDR(indicator,impactsData); break;
        case "eco": buildValueECO(indicator,impactsData); break;
        case "geq": buildValueGEQ(indicator,impactsData); break;
        case "ghg": buildValueGHG(indicator,impactsData); break;
        case "haz": buildValueHAZ(indicator,impactsData); break;
        case "knw": buildValueKNW(indicator,impactsData); break;
        case "mat": buildValueMAT(indicator,impactsData); break;
        case "nrg": buildValueNRG(indicator,impactsData); break;
        case "soc": buildValueSOC(indicator,impactsData); break;
        case "was": buildValueWAS(indicator,impactsData); break;
        case "wat": buildValueWAT(indicator,impactsData); break;
    }
    return indicator; 
}

const buildValueART = (indicator,impactsData) => 
{
    if (impactsData.craftedProduction!=null) {
        indicator.setValue(impactsData.craftedProduction/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const buildValueIDR = (indicator,impactsData) => 
{
    if (impactsData.interdecileRange!=null) {
        indicator.setValue(impactsData.interdecileRange);
        indicator.setUncertainty(0);
    }
}

const buildValueECO = (indicator,impactsData) => 
{
    if (impactsData.domesticProduction!=null) {
        indicator.setValue(impactsData.domesticProduction/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const buildValueGEQ = (indicator,impactsData) => 
{
    if (impactsData.wageGap!=null) {
        indicator.setValue(impactsData.wageGap);
        indicator.setUncertainty(0);
    }
}

const buildValueGHG = (indicator,impactsData) => 
{
    if (impactsData.greenhousesGazEmissions!=null) {
      // Convert greenhouses gas emissions to kilograms if the unit is 'tCO2e'
      const greenhousesGazEmissions =
        impactsData.greenhousesGazEmissionsUnit == "tCO2e"
          ? impactsData.greenhousesGazEmissions * 1000
          : impactsData.greenhousesGazEmissions;

      indicator.setValue(
        (greenhousesGazEmissions / impactsData.netValueAdded) * 1000
      );
      indicator.setUncertainty(impactsData.greenhousesGazEmissionsUncertainty);
    }
}

const buildValueHAZ = (indicator,impactsData) => 
{
    if (impactsData.hazardousSubstancesConsumption!=null) {
        indicator.setValue(impactsData.hazardousSubstancesConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.hazardousSubstancesConsumptionUncertainty);
    }
}

const buildValueKNW = (indicator,impactsData) => 
{
    if (impactsData.researchAndTrainingContribution!=null) {
        indicator.setValue(impactsData.researchAndTrainingContribution/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const buildValueMAT = (indicator,impactsData) => 
{
    if (impactsData.materialsExtraction!=null) {

        const materialsExtraction =
        impactsData.materialsExtractionUnit == "t"
          ? impactsData.materialsExtraction * 1000
          : impactsData.materialsExtraction;


        indicator.setValue(materialsExtraction/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.materialsExtractionUncertainty);
    }
}

const buildValueNRG = (indicator,impactsData) => 
{
    if (impactsData.energyConsumption!=null) {
        indicator.setValue(impactsData.energyConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.energyConsumptionUncertainty);
    }
}

const buildValueSOC = (indicator,impactsData) => 
{
    if (impactsData.hasSocialPurpose!=null) {
        indicator.setValue(impactsData.hasSocialPurpose ? 100 : 0);
        indicator.setUncertainty(0);
    }
}

const buildValueWAS = (indicator,impactsData) => 
{
    if (impactsData.wasteProduction!=null) {
        indicator.setValue(impactsData.wasteProduction/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.wasteProductionUncertainty);
    }
}

const buildValueWAT = (indicator,impactsData) => 
{
    if (impactsData.waterConsumption!=null) {
        indicator.setValue(impactsData.waterConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.waterConsumptionUncertainty);
    }
}