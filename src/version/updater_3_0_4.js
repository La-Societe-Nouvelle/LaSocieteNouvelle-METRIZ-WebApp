// La Société Nouvelle

// Updater from 3.0.0 to 3.0.4
export const updater_to_3_0_4 = async (session) => 
{ 
  // ----------------------------------------------------------------------------------------------------
  // Changes in Session props

  // no changes

  // ----------------------------------------------------------------------------------------------------
  // Changes in Legal Unit

  // no changes

  // ----------------------------------------------------------------------------------------------------
  // Changes in Financial data

  // no changes

  // ----------------------------------------------------------------------------------------------------
  // Changes in Impacts data
  
  for (let period of session.availablePeriods) 
  {
    const impactsData = session.impactsData[period.periodKey];
    
    // - Changes values for knwDetails

    impactsData.knwDetails.apprenticesRemunerations = impactsData.knwDetails.apprenticesRemunerations;
    impactsData.knwDetails.internshipsRemunerations = {};
    impactsData.knwDetails.employeesTrainingsCompensations.assessmentOption = "assessment_amount";
    impactsData.knwDetails.researchPersonnelRemunerations.assessmentOption = "assessment_amount";
  }

  // ----------------------------------------------------------------------------------------------------
  // Changes in Validations

  // no changes

  // ----------------------------------------------------------------------------------------------------
  // Changes in Comparative data

  // no changes

  // ----------------------------------------------------------------------------------------------------
  // Changes in Analysis

  // no changes

  // ----------------------------------------------------------------------------------------------------

  session.version = "3.0.4";
}

/* ----------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- UTILS -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------- */

// -