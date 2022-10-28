// La Société Nouvelle

import { roundValue } from "../utils/Utils";

export { SocialDataContentReader, XLSXSocialDataBuilder, CSVSocialDataBuilder };

/* ---------- CONTENT READER ---------- */ 

const SocialDataContentReader = async (socialData) =>
// ...build data from JSON content
{
  let employees = [];
  
  socialData.forEach((employee) => 
  {

    let employeeData = 
    {
      id: employee.index,
      name: employee.name,
      sex: /^(F|H)$/.test(employee.sex.toUpperCase()) ? employee.sex : "",
      wage: parseFloat(employee.wage) ? parseFloat(employee.wage) : null,
      workingHours: parseFloat(employee.workingHours) ? parseFloat(employee.workingHours) : null,
      hourlyRate: parseFloat(employee.hourlyRate) ? parseFloat(employee.hourlyRate) : null,
      trainingContract: /^(O|N)$/.test(employee.trainingContract.toUpperCase()) ? employee.trainingContract=="O" : false,
      trainingHours: parseFloat(employee.trainingHours) ? parseFloat(employee.trainingHours) : 0
    }

    if (!employeeData.hourlyRate && employeeData.wage && employeeData.workingHours) {
      employeeData.hourlyRate = roundValue((employeeData.wage/employeeData.workingHours),2);
    }

    employees.push(employeeData);
  });

  return {employees};
}

const XLSXSocialDataBuilder = async (content) =>
{
  let socialData = [];
  
  Object.entries(content).forEach(([index,contentItem]) => 
  {
    let employeeData = 
    {
      id: index,
      name: contentItem['Nom - Prénom'] || "",
      sex: contentItem['Sexe (F/H)'] || "",
      wage: contentItem['Rémunérations brutes'] || null,
      workingHours: contentItem['Heures travaillées'] || null,
      hourlyRate: contentItem['Taux horaire'] || null,
      trainingContract: contentItem['Contrat de formation (O/N)'] || false,
      trainingHours: contentItem['Heures de formation'] || 0
    }
    socialData.push(employeeData);
  })

  return socialData;
}

const CSVSocialDataBuilder = async (content) =>
{
  let socialData = [];
  
  Object.entries(content).forEach(([index,contentItem]) => 
  {
    let employeeData = 
    {
      id: index,
      name: contentItem.name || "",
      sex: contentItem.sexe || "",
      wage: contentItem.remuneration || null,
      workingHours: contentItem.heuresTravail || null,
      hourlyRate: contentItem.tauxHoraire || null,
      trainingContract: contentItem.contratFormation || false,
      trainingHours: contentItem.heuresFormation || 0
    }
    socialData.push(employeeData);
  })

  return socialData;
}