// La Société Nouvelle

import { printValue } from "../../utils/Utils";

export const analysisTextWriterECO = (session) =>
{
  const {impactsData,
         financialData} = session;
  const {aggregates} = financialData;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.isAllActivitiesInFrance) {
    currentParagraph.push("Les activités de l'entreprise sont localisées en France et contribuent, de ce fait, entièrement à l'économie nationale.");
  } else if (!impactsData.isAllActivitiesInFrance) {
    currentParagraph.push("Les activités de l'entreprise sont localisées hors de France.");
  } else {
    currentParagraph.push("Le volume des activités localisées en France s'élève à "+impactsData.domesticProduction+" €, soit "+aggregates.netValueAdded.footprint.indicators.eco.getValue()+" % de la valeur ajoutée.");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Les consommations intermédiaires contribuent indirectement et à hauteur de "+aggregates.intermediateConsumption.footprint.indicators.eco.getValue()+" % à l'économie nationale, soit un volume de "+printValue(aggregates.intermediateConsumption.footprint.indicators.eco.getGrossImpact(aggregates.intermediateConsumption.amount),0)+" €.");
  
  analysis.push(currentParagraph);

  // comparaison branche
  /*
  if (aggregates.intermediateConsumption.footprint.indicators.eco.getValue() > 50) {
    currentParagraph.push("Le taux de contribution se situe à un niveau supérieur à la branche d'activités ("+branche+").")
  } else {
    currentParagraph.push("Le taux de contribution se situe à un niveau inférieur à la branche d'activités ("+branche+").")
  }
  */

  // comptes les plus impactants
  //let maxCompany = financialData.accounts.sort((a,b) => b.amount - a.amount)[0];
  //currentParagraph.push("Les charges "+maxCompany+" impactent le plus négativement la performance de l'entreprise, avec un taux de contribution de "+""+" pour un volume de "+""+" €.");

  // Investissements ------------------------------------------------------------------------------- //

  // 
  //currentParagraph.push("La contribution des immobilisations de l'entreprise est de "+"");

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("Le taux de contribution de la production sur l'exercice est de "+aggregates.production.footprint.indicators.eco.getValue()+" %.")
  if (aggregates.production.footprint.indicators.eco.getValue()!=aggregates.revenue.footprint.indicators.eco.getValue()) {
    currentParagraph.push("La valeur est de "+aggregates.revenue.footprint.indicators.eco.getValue()+"% pour le chiffre d'affaires, en prenant compte des stocks de production.")
  } else {
    currentParagraph.push("La valeur est identique pour le chiffre d'affaires.")
  }
  
  analysis.push(currentParagraph);

  return analysis;
}