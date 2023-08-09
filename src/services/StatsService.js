import stat from "../../config/api-stats";


export const logUserProgress = async (
  id,
  step,
  datelasttreatment,
  validatedindics,
) => {

  const logData = {
    id: id,
    step: step,
    datelasttreatment: datelasttreatment,
    validatedindics: validatedindics,
    firm: "Version Publique",
  };
  try {
   await stat.post(`/logs/partner/`, logData);
  } catch (error) {
    console.error("Error while logging user progress:", error);
  }
};


// REPORTING
// const createReporting = (data) => {
//   return stat.post(`/reporting/`, data);
// };

// LOGS

// const createErrorLog = (data) => {
//   return stat.post(`logs/error/`, data);
// };