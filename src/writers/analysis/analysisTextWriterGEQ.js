// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterGEQ = (session) =>
{
  const {impactsData,
         legalUnit,
         financialData} = session;
  const {aggregates,
         expenseAccounts} = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Intro ----------------------------------------------------------------------------------------- //

  currentParagraph = [];
  
  currentParagraph.push("L'indicateur correspond l'écart entre les taux horaires moyens des femmes et des hommes, en pourcentage du taux horaire moyen.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("L'écart de rémunération associé à la valeur produite est de "+printValue(aggregates.production.footprint.indicators.geq.getValue(),0)+" %.")
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.hasEmployees) 
  {
    currentParagraph.push("L'entreprise n'étant pas employeuse, l'écart de rémunération F/H associé à la valeur ajoutée est de 0 %.");
  }
  else if (impactsData.employees==1)
  {
    currentParagraph.push("L'entreprise n'employant qu'une seule personne, l'écart de rémunération F/H associé à la valeur ajoutée est de 0 %.")
  }
  else 
  {
    currentParagraph.push("L'écart de rémunération F/H est de "+impactsData.wageGap+" % au sein de l'entreprise.");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("L'écart de rémunération F/H moyen associé des consommations intermédiaires est de "+printValue(aggregates.intermediateConsumption.footprint.indicators.geq.getValue(),0)+" %.");
  
  analysis.push(currentParagraph);

  // comparaison branche
  
  
  // comptes les plus impactants
  

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("L'écart de rémunération F/H moyen associé à l'amortissement des immobilisations est de "+printValue(aggregates.capitalConsumption.footprint.indicators.geq.getValue(),0)+" %.");

  analysis.push(currentParagraph);

  return analysis;
}