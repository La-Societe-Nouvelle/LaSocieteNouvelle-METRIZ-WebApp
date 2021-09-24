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
      name: contentItem.nom || "",
      sex: contentItem.sexe || "",
      wage: contentItem.remuneration || null,
      workingHours: contentItem.heuresTravail || null,
      hourlyRate: contentItem.tauxHoraire || null,
      trainingContract: contentItem.contratFormation || false,
      trainingHours: contentItem.heuresFormation || 0
    }
    employees.push(employeeData);
  })

  return {employees};
}