// La Société Nouvelle

export { SocialDataContentReader };

/* ---------- CONTENT READER ---------- */ 

const SocialDataContentReader = async (content) =>
// ...build data from JSON content
{
  let employees = [];
  
  Object.entries(content).forEach(([index,contentItem]) => 
  {
    let employeeData = 
    {
      id: index,
      name: contentItem['Nom - Prénom'] || contentItem.nom || "",
      sex: contentItem['Sexe (F/H)'] || contentItem.sexe || "",
      wage: contentItem['Rémunérations brutes'] || contentItem.remuneration || null,
      workingHours: contentItem['Heures travaillées'] || contentItem.heuresTravail || null,
      hourlyRate: contentItem['Taux horaire'] || contentItem.tauxHoraire || null,
      trainingContract: contentItem['Contrat de formation (O/N)'] || contentItem.contratFormation || false,
      trainingHours: contentItem['Heures de formation'] || contentItem.heuresFormation || 0
    }
    employees.push(employeeData);
  })

  return {employees};
}