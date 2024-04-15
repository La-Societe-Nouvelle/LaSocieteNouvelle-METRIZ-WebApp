// La Société Nouvelle

// API config
import apiStats from "../../config/api-stats";

// Utils
import { buildLegalUnitProfile, buildStatReport } from "./utils";
import { getYearPeriod } from "../utils/periodsUtils";

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
    firm: process.env.NEXT_PUBLIC_VERSION_NAME,
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
 * @property {string} info - Informations supplémentaires sur l'erreur.
 * @property {Array<string>} errors - Liste des erreurs.
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

/* -------------------------------------------------- APPLICATION LOGGER -------------------------------------------- */

/** Params
 * @property {string} id - ID de la session.
 * @property {string} type - Type de log.
 * @property {string} message - Message associé au log.
 */

export const saveApplicationLog = async (id, type, message) => {
  // Create a Log
  const applicationLog = {
    version: process.env.NEXT_PUBLIC_VERSION_NAME,
    id,
    date: currentDate,
    type,
    message,
  };

  try {
    // post data
    await apiStats.post(`logs/application/`, applicationLog);
  } catch (error) {
    console.error("Error while logging user error :", error);
    throw Error(error.message);
  }
};

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