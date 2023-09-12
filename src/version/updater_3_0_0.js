// La Société Nouvelle

// Updater for version 3.0.0
export const updater_3_0_0 = async (session) => 
{ 
  // ----------------------------------------------------------------------------------------------------
  // Changes in Session props

  //  - .progression -> obsolete
  //  - .year -> obsolete
  //  - .indics -> obsolete
  
  //  - .id added (15 integers)

  session.id = buildRandomId();

  // ----------------------------------------------------------------------------------------------------
  // Changes in Legal Unit

  // no channge

  // ----------------------------------------------------------------------------------------------------
  // Changes in Financial data

  
  const financialData = session.financialData;
  
  //  - .status added

  financialData.status = {};
  session.availablePeriods.forEach(({ periodKey }) => {
    financialData.status[periodKey] = {
      isLoaded: financialData.isFinancialDataLoaded,
      isValidated: session.progression > 1
    }
  });

  // ----------------------------------------------------------------------------------------------------
  // Changes in Impacts data
  
  for (let period of session.availablePeriods) 
  {
    const impactsData = session.impactsData[period.periodKey];
    
    // - Changed values for isAllActivitiesinFrance and isValueAddedCrafted: true/false/null -> true/false/partially.
    // - Updater handles transition from null to "partially" for isAllActivitiesinFrance based on domesticProduction value.
    // - Updater handles transition for isValueAddedCrafted based on isValueAddedCrafted value.

    // isAllActivitiesInFrance
    if (impactsData.isAllActivitiesInFrance == null 
     && impactsData.domesticProduction != null) {
      impactsData.isAllActivitiesInFrance = "partially";
    }
  
    // isValueAddedCrafted
    if (impactsData.isValueAddedCrafted == null 
     && impactsData.craftedProduction != null) {
      impactsData.isValueAddedCrafted = "partially";
    }

    // - Rename ghg variables
    impactsData.greenhouseGasEmissions =  impactsData.greenhousesGazEmissions;
    impactsData.greenhouseGasEmissionsUncertainty =  impactsData.greenhousesGazEmissionsUncertainty;
    impactsData.greenhouseGasEmissionsUnit = impactsData.greenhousesGazEmissionsUnit;

    // - Rename haz variables
    impactsData.hazardousSubstancesUse = impactsData.hazardousSubstancesConsumption;
    impactsData.hazardousSubstancesUseUnit = impactsData.hazardousSubstancesConsumptionUnit;
    impactsData.hazardousSubstancesUseUncertainty = impactsData.hazardousSubstancesConsumptionUncertainty;

    // - Rename gas -> gaz
    Object.entries(session.impactsData.ghgDetails)
        .forEach(([_, itemData]) => {
      itemData.gas = itemData.gaz;
    });
  }

  // ----------------------------------------------------------------------------------------------------
  // Changes in Validations

  // no changes

  // ----------------------------------------------------------------------------------------------------
  // Changes in Comparative data

  const comparativeData = session.comparativeData;

  const comparativeDataAggregates = [
    "production",
    "intermediateConsumptions",
    "fixedCapitalConsumptions",
    "netValueAdded"
  ];

  for (let aggregateKey of comparativeDataAggregates) 
  {
    // history data
    comparativeData[aggregateKey]?.area?.history = comparativeData[aggregateKey]?.area?.macroData;
    comparativeData[aggregateKey]?.division?.history = comparativeData[aggregateKey]?.division?.macroData;
  }

  // ----------------------------------------------------------------------------------------------------
  // Changes in Analysis

  session.analysis = {};
  for (let period of session.availablePeriods) 
  {
    for (let indic of session.validations[period.periodKey]) {
      session.analysis[period.periodKey][indic]= {
        analysis: "",
        isAvailable: false
      }
    }
  }

  // ----------------------------------------------------------------------------------------------------
}

/* ----------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- UTILS -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------- */

const buildRandomId = () => {
  const id = "";
  for (let n = 0; n < 15; n++) {
    let int = Math.floor(Math.random() * 9) + 1;
    id = id+int
  }
  return id;
}