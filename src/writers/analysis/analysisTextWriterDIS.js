// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterDIS = (session) =>
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
  
  currentParagraph.push("L'indicateur correspond l'indice de GINI des taux horaires bruts, il informe sur la répartition des revenus.");
  currentParagraph.push("L'indicateur est en version beta : des travaux sont en cours.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("L'indice de GINI associé à la valeur produite est de "+printValue(aggregates.production.footprint.indicators.dis.getValue(),0)+"/100.")
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.hasEmployees) 
  {
    currentParagraph.push("L'entreprise n'étant pas employeuse, l'indice de GINI associé à la valeur ajoutée est de 0/100.");
  }
  else if (impactsData.employees==1)
  {
    currentParagraph.push("L'entreprise n'employant qu'une seule personne, l'indice de GINI associé à la valeur ajoutée est donc de 0/100.")
  }
  else 
  {
    currentParagraph.push("L'indice de GINI associé à la valeur ajoutée est de "+impactsData.indexGini+"/100.");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("L'indice de GINI associé aux consommations intermédiaires est de "+printValue(aggregates.intermediateConsumption.footprint.indicators.dis.getValue(),0)+"/100.");
  
  analysis.push(currentParagraph);

  // comparaison branche
  
  
  // comptes les plus impactants
  

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("L'indice de GINI associé à l'amortissement des immobilisations est de "+printValue(aggregates.capitalConsumption.footprint.indicators.dis.getValue(),0)+"/100.");

  analysis.push(currentParagraph);

  return analysis;
}