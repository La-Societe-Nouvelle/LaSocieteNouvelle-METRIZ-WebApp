import apiStats from "../../config/api-stats";


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
    firm: process.env.NEXT_PUBLIC_VERSION_NAME,
  };
  try {
    await apiStats.post(`/logs/partner/`, logData);
  } catch (error) {
    console.error("Error while logging user progress:", error);
    throw Error(error.message)
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
  await apiStats.post(`logs/error/`, errorLog);
  } catch (error) {
    console.error("Error while logging user error :", error);
    throw Error(error.message)
  }
};


// REPORTING
// const createReporting = (data) => {
//   return stat.post(`/reporting/`, data);
// };

