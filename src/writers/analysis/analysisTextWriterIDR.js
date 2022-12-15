// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterIDR = (session) =>
{
  const {impactsData,
         comparativeData,
         financialData} = session;
  const {aggregates,
         expenseAccounts} = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];
  
  currentParagraph.push("L'indicateur correspond au rapport interdécile D9/D1 des taux horaires bruts, il informe sur l'écart des revenus.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("Le rapport interdécile associé à la valeur produite est de "+printValue(aggregates.production.footprint.indicators.idr.value,1)+".")
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.hasEmployees) 
  {
    currentParagraph.push("L'entreprise n'étant pas employeuse, le rapport interdécile associé à la valeur ajoutée est de 1.");
  }
  else if (impactsData.employees.length==1)
  {
    currentParagraph.push("L'entreprise n'employant qu'une seule personne, le rapport interdécile associé à la valeur ajoutée est donc de 1.")
  }
  else 
  {
    currentParagraph.push("Le rapport interdécile associé à la valeur ajoutée est de "+impactsData.interdecileRange+".");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Le rapport interdécile associé aux consommations intermédiaires est de "+printValue(aggregates.intermediateConsumption.footprint.indicators.idr.value,1)+".");
  
  analysis.push(currentParagraph);

  // comparaison branche
  
  
  // comptes les plus impactants
  

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("La rapport interdécile associé à l'amortissement des immobilisations est de "+printValue(aggregates.capitalConsumption.footprint.indicators.idr.value,1)+".");

  analysis.push(currentParagraph);

  return analysis;
}