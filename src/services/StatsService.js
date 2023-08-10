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

export const saveErrorLog = async (
date,
info,
errors,
) => {
  // Create a Log
  const errorLog = {
    date: date,
    info: info,
    errors: errors,
  };
  try {
  await stat.post(`logs/error/`, errorLog);
  } catch (error) {
    console.error("Error while logging user error :", error);
  }
};


// REPORTING
// const createReporting = (data) => {
//   return stat.post(`/reporting/`, data);
// };

