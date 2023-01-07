// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterHAZ = (session) =>
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
  
  currentParagraph.push("L'indicateur exprime la quantité de produits dangereux utilisés pour produire un euro de l'agrégat considéré.");
  currentParagraph.push("L'indicateur est en version beta : des travaux sont en cours.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("L'intensité d'utilisation de produits dangereux de la production est de "+printValue(aggregates.production.footprint.indicators.haz.value,0)+" g/€.")
  if (aggregates.production.footprint.indicators.haz.value!=aggregates.revenue.footprint.indicators.haz.value) {
    currentParagraph.push("La valeur est de "+printValue(aggregates.revenue.footprint.indicators.haz.value,0)+" g/€ pour le chiffre d'affaires, en prenant compte des stocks de production.")
  } else {
    currentParagraph.push("La valeur est identique pour le chiffre d'affaires.")
  }
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.hazardousSubstancesConsumption==0) 
  {
    currentParagraph.push("Aucun produit dangereux n'est utilisé pour les activités de l'entreprise. L'intensité associée à la valeur ajoutée est donc de 0 g/€.");
  }
  else 
  {
    currentParagraph.push("La consommation de produits dangereux s'élève à hauteur de "+printValue(impactsData.hazardousSubstancesConsumption,0)+" kg,"
      + " soit une intensité de "+printValue(aggregates.netValueAdded.footprint.indicators.haz.value,0)+" g/€ pour la valeur ajoutée.");
    currentParagraph.push("L'utilisation directe de produits dangereux compte pour "+printValue(impactsData.hazardousSubstancesConsumption/aggregates.production.footprint.indicators.haz.getGrossImpact(aggregates.production.amount)*100,0)+" % de l'utilisation totale liée à la production.");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Les consommations intermédiaires sont à l'orgine d'une consommation de "+printValue(aggregates.intermediateConsumption.footprint.indicators.haz.getGrossImpact(aggregates.intermediateConsumption.amount),0)+" kg de produits dangereux,"
    + " ce qui correspond à une intensité de "+printValue(aggregates.intermediateConsumption.footprint.indicators.haz.value,0)+" g/€.");
  currentParagraph.push("La consommation indirecte représente "+printValue(aggregates.intermediateConsumption.footprint.indicators.was.getGrossImpact(aggregates.intermediateConsumption.amount)/aggregates.production.footprint.indicators.was.getGrossImpact(aggregates.production.amount)*100,0)+" % de l'utilisation totale de produits dangereux pour la production.");


  analysis.push(currentParagraph);

  // comparaison branche
  

  // comptes les plus impactants

  
  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("L'amortissement des immobilisations implique une consommation de "+printValue(aggregates.capitalConsumption.footprint.indicators.haz.getGrossImpact(aggregates.capitalConsumption.amount),0)+" kg.");

  analysis.push(currentParagraph);

  return analysis;
}