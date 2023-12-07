// La Société Nouvelle

// API config
import apiStats from "../../config/api-stats";

const currentDate = new Date();

/* -------------------------------------------------- USER PROGRESS -------------------------------------------------- */

/** Params
 *    id: id de la session
 *    step: progresion
 *    validatedIndics: indicateurs évalués
 * 
 *  Called in Metriz.js
 * 
 */

export const logUserProgress = async (
  id,
  step,
  validatedindics
) => {

  // log data
  const logData = {
    id: id,
    step: step,
    datelasttreatment: currentDate,
    validatedindics: validatedindics,
    firm: "VERSION PUBLIQUE",
  };

  try {
    
    // post data
    const response = await apiStats.post(`/logs/partner/`, logData);

  } catch (error) {
    console.error("Error while logging user progress:", error);
    throw Error(error.message);
  }
};

/* -------------------------------------------------- ERROR LOGGER -------------------------------------------------- */

/** Params
 *    date: current date
 *    info: component
 *    errors: list of errors
 * 
 */

export const saveErrorLog = async (info, errors) => 
{
  // Create a Log
  const errorLog = {
    date: currentDate,
    info: info,
    errors: errors,
  };
  try {
    
    // post data
    await apiStats.post(`logs/error/`, errorLog);

  } catch (error) {
    console.error("Error while logging user error :", error);
    throw Error(error.message);
  }
};

// PARTNERS CODE ###################################################################################### //

import { buildLegalUnitProfile, buildStatReport } from "./utils";
import { getYearPeriod } from "../utils/periodsUtils";

/* -------------------------------------------------- STATISTIC REPORT -------------------------------------------------- */

/** Params
 *    id
 *    year
 *    legalUnitProfile
 *    stats 
 * 
 */

export const sendAnonymousStatReport = async (session, selectedPeriod) => 
{
  const {
    legalUnit
  } = session;

  // Legal unit profile
  const legalUnitProfile = await buildLegalUnitProfile(legalUnit);

  // Stat report
  const stats = await buildStatReport(
    session,
    selectedPeriod
  );

  // build stats report
  const statReport = {
    id: session.id,
    year: getYearPeriod(selectedPeriod),
    legalUnitProfile,
    stats,
  };

  try {
    // post stat report
    const response = await apiStats.post(`/reporting/`, statReport);
    console.log("Rapport stat envoyé (id "+session.id+") : ", statReport);

  } catch (error) {
    console.log(error);
  }
};

// #################################################################################################### //