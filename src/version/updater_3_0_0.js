// La Société Nouvelle

// Updater for version 3.0.0
export const updater_3_0_0 = async (sessionData) => 
{  
  // ----------------------------------------------------------------------------------------------------
  // Changes in impacts data

  // - Changed values for isAllActivitiesinFrance and isValueAddedCrafted: true/false/null -> true/false/partially.
  // - Updater handles transition from null to "partially" for isAllActivitiesinFrance based on domesticProduction value.
  // - Updater handles transition for isValueAddedCrafted based on isValueAddedCrafted value.

  if (sessionData.impactsData.isAllActivitiesinFrance == null 
   && sessionData.impactsData.domesticProduction != null) {
    sessionData.impactsData.isAllActivitiesinFrance = "partially";
  }

  if (sessionData.impactsData.isValueAddedCrafted == null 
   && sessionData.impactsData.isValueAddedCrafted != null) {
    sessionData.impactsData.isValueAddedCrafted = "partially";
  }

  // ----------------------------------------------------------------------------------------------------
  // Changes in comparative data

  // - Utilizes new ComparativeData class and fetches data for declared indicators.
  // - Updates sessionData structure for comparative data.

  for (let aggregate of [
    "production",
    "intermediateConsumptions",
    "fixedCapitalConsumptions",
    "netValueAdded"]) {
      sessionData.comparativeData[aggregate].history = sessionData.comparativeData[aggregate].macroData;
  }

  // ----------------------------------------------------------------------------------------------------
  // Changes in financial data

  // - Adds status object

  sessionData.financialData.status = {};
  for (let period of sessionData.availablePeriods) {
    sessionData.financialData.status[period.periodKey] = {
      isLoaded: true,
      isValidated: sessionData.progression>1
    };
  }

};
