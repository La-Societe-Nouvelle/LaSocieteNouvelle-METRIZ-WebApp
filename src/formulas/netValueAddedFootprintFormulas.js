// La Société Nouvelle

// Objects
import { Indicator } from "/src/footprintObjects/Indicator";

// Utils
import { isValidNumber, roundValue } from "../utils/Utils";

// Librairies
import metaIndics from "/lib/indics";

/* --------------------------------------------------------------------------------------- */
/* ------------------------- NET VALUE ADDED INDICATORS FORMULAS ------------------------- */
/* --------------------------------------------------------------------------------------- */

export function buildNetValueAddedIndicator (indic, impactsData) 
{
  const indicator = new Indicator({ indic });

  if (isValidNumber(impactsData.netValueAdded,0) 
   && impactsData.netValueAdded>0)
  {
    switch (indic) {
      case "art": return buildValueART(indicator, impactsData);
      case "idr": return buildValueIDR(indicator, impactsData);
      case "eco": return buildValueECO(indicator, impactsData);
      case "geq": return buildValueGEQ(indicator, impactsData);
      case "ghg": return buildValueGHG(indicator, impactsData);
      case "haz": return buildValueHAZ(indicator, impactsData);
      case "knw": return buildValueKNW(indicator, impactsData);
      case "mat": return buildValueMAT(indicator, impactsData);
      case "nrg": return buildValueNRG(indicator, impactsData);
      case "soc": return buildValueSOC(indicator, impactsData);
      case "was": return buildValueWAS(indicator, impactsData);
      case "wat": return buildValueWAT(indicator, impactsData);
      default   : return indicator;
    }
  } 
  else {
    return indicator;
  }
}

const buildValueART = (indicator, impactsData) => 
{
  const { nbDecimals } = metaIndics.art;
  const { 
    craftedProduction, 
    netValueAdded
  } = impactsData;

  if (isValidNumber(craftedProduction,0,netValueAdded)) 
  {
    let value = roundValue((parseFloat(craftedProduction)/netValueAdded)*100, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(0);
  }

  return indicator;
}

const buildValueIDR = (indicator, impactsData) => 
{
  const { nbDecimals } = metaIndics.idr;
  const { interdecileRange} = impactsData;

  if (isValidNumber(interdecileRange,1)) 
  {
    let value = roundValue(parseFloat(interdecileRange), nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(0);
  }

  return indicator;
}

const buildValueECO = (indicator, impactsData) => 
{
  const { nbDecimals } = metaIndics.art;
  const { 
    domesticProduction, 
    netValueAdded
  } = impactsData;

  if (isValidNumber(domesticProduction,0,netValueAdded)) 
  {
    let value = roundValue((parseFloat(domesticProduction)/netValueAdded)*100, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(0);
  }

  return indicator;
}

const buildValueGEQ = (indicator, impactsData) => 
{
  const { nbDecimals } = metaIndics.geq;
  const { wageGap} = impactsData;

  if (isValidNumber(wageGap,0)) 
  {
    let value = roundValue(parseFloat(wageGap), nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(0);
  }

  return indicator;
}

const buildValueGHG = (indicator, impactsData) => 
{
  const { nbDecimals, statementUnits } = metaIndics.ghg;
  const { 
    greenhousesGazEmissions, 
    greenhousesGazEmissionsUncertainty, 
    greenhousesGazEmissionsUnit,
    netValueAdded
  } = impactsData;

  if (isValidNumber(greenhousesGazEmissions,0) 
   && isValidNumber(greenhousesGazEmissionsUncertainty,0,100)
   && Object.keys(statementUnits).includes(greenhousesGazEmissionsUnit)) 
  {
    let grossImpact = parseFloat(greenhousesGazEmissions)*statementUnits[greenhousesGazEmissionsUnit].coef;
    let value = roundValue((grossImpact/netValueAdded)*1000, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(parseInt(greenhousesGazEmissionsUncertainty));
  }

  return indicator;
}

const buildValueHAZ = (indicator, impactsData) => 
{
  const { nbDecimals, statementUnits } = metaIndics.haz;
  const { 
    hazardousSubstancesConsumption, 
    hazardousSubstancesConsumptionUncertainty,
    hazardousSubstancesConsumptionUnit,
    netValueAdded
  } = impactsData;

  if (isValidNumber(hazardousSubstancesConsumption,0)
   && isValidNumber(hazardousSubstancesConsumptionUncertainty,0,100)
   && Object.keys(statementUnits).includes(hazardousSubstancesConsumptionUnit)) 
  {
    let grossImpact = parseFloat(hazardousSubstancesConsumption)*statementUnits[hazardousSubstancesConsumptionUnit].coef;
    let value = roundValue((grossImpact/netValueAdded)*1000, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(hazardousSubstancesConsumptionUncertainty);
  }

  return indicator;
}

const buildValueKNW = (indicator, impactsData) => 
{
  const { nbDecimals } = metaIndics.knw;
  const { 
    researchAndTrainingContribution, 
    netValueAdded
  } = impactsData;

  if (isValidNumber(researchAndTrainingContribution,0,netValueAdded)) {
    let value = roundValue((researchAndTrainingContribution/netValueAdded)*100, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(0);
  }

  return indicator;
}

const buildValueMAT = (indicator, impactsData) => 
{
  const { nbDecimals, statementUnits } = metaIndics.mat;
  const { 
    materialsExtraction, 
    materialsExtractionUncertainty,
    materialsExtractionUnit,
    netValueAdded
  } = impactsData;

  if (isValidNumber(materialsExtraction,0)
   && isValidNumber(materialsExtractionUncertainty,0,100)
   && Object.keys(statementUnits).includes(materialsExtractionUnit)) 
  {
    let grossImpact = parseFloat(materialsExtraction)*statementUnits[materialsExtractionUnit].coef;
    let value = roundValue((grossImpact/netValueAdded)*1000, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(materialsExtractionUncertainty);
  }

  return indicator;
}

const buildValueNRG = (indicator, impactsData) => 
{
  const { nbDecimals, statementUnits } = metaIndics.nrg;
  const { 
    energyConsumption,
    energyConsumptionUncertainty,
    energyConsumptionUnit, 
    netValueAdded
  } = impactsData;
  
  if (isValidNumber(energyConsumption,0)
   && isValidNumber(energyConsumptionUncertainty,0,100)
   && Object.keys(statementUnits).includes(energyConsumptionUnit)) 
  {
    let grossImpact = parseFloat(energyConsumption)*statementUnits[energyConsumptionUnit].coef;
    let value = roundValue((grossImpact/netValueAdded)*1000, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(energyConsumptionUncertainty);
  }

  return indicator;
}

const buildValueSOC = (indicator, impactsData) => 
{
  const { nbDecimals } = metaIndics.soc;
  const { hasSocialPurpose } = impactsData;

  if (hasSocialPurpose !== null) {
    let value = roundValue(impactsData.hasSocialPurpose ? 100.0 : 0.0, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(0);
  }

  return indicator;
}

const buildValueWAS = (indicator, impactsData) => 
{
  const { nbDecimals, statementUnits } = metaIndics.was;
  const { 
    wasteProduction, 
    wasteProductionUncertainty,
    wasteProductionUnit, 
    netValueAdded
  } = impactsData;

  if (isValidNumber(wasteProduction,0)
   && isValidNumber(wasteProductionUncertainty,0,100)
   && Object.keys(statementUnits).includes(wasteProductionUnit)) 
  {
    let grossImpact = parseFloat(wasteProduction)*statementUnits[wasteProductionUnit].coef;
    let value = roundValue((grossImpact/netValueAdded)*1000, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(wasteProductionUncertainty);
  }

  return indicator;
}

const buildValueWAT = (indicator, impactsData) => 
{
  const { nbDecimals, statementUnits } = metaIndics.wat;
  const { 
    waterConsumption, 
    waterConsumptionUncertainty,
    waterConsumptionUnit,
    netValueAdded
  } = impactsData;

  if (isValidNumber(waterConsumption,0)
   && isValidNumber(waterConsumptionUncertainty,0,100)
   && Object.kets(statementUnits).includes(waterConsumptionUnit)) 
  {
    let grossImpact = parseFloat(waterConsumption)*statementUnits[waterConsumptionUnit].coef;
    let value = roundValue((grossImpact/netValueAdded)*1000, nbDecimals);
    indicator.setValue(value);
    indicator.setUncertainty(waterConsumptionUncertainty);
  }

  return indicator;
}
