// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterWAS = (session) =>
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
  
  currentParagraph.push("L'indicateur exprime la quantité produite de déchets pour produire un euro de l'agrégat considéré.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("L'intensité de production de déchets de la valeur produite est de "+printValue(aggregates.production.footprint.indicators.was.getValue(),0)+" g/€.")
  if (aggregates.production.footprint.indicators.was.getValue()!=aggregates.revenue.footprint.indicators.was.getValue()) {
    currentParagraph.push("La valeur est de "+printValue(aggregates.revenue.footprint.indicators.was.getValue(),0)+" g/€ pour le chiffre d'affaires, en prenant compte des stocks de production.")
  } else {
    currentParagraph.push("La valeur est identique pour le chiffre d'affaires.")
  }
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.wasteProduction==0)
  {
    currentParagraph.push("Les activités de l'entreprise ne produisent pas de déchets.")
  }
  else 
  {
    currentParagraph.push("La production directe de déchets est de "+printValue(impactsData.wasteProduction,0)+" kg,"
      + " soit une intensité de "+printValue(aggregates.netValueAdded.footprint.indicators.was.getValue(),0)+" g/€ pour la valeur ajoutée.");
    currentParagraph.push("Ils représentent "+printValue(impactsData.wasteProduction/aggregates.production.footprint.indicators.was.getGrossImpact(aggregates.production.amount)*100,0)+" % de la production de déchets liée à la production (économique).");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Les consommations intermédiaires sont à l'orgine de "+printValue(aggregates.intermediateConsumption.footprint.indicators.was.getGrossImpact(aggregates.intermediateConsumption.amount),0)+" kg de déchets,"
    + " ce qui correspond à une intensité de "+printValue(aggregates.intermediateConsumption.footprint.indicators.was.getValue(),0)+" g/€.");
  currentParagraph.push("Les déchets produits indirectement représentent "+printValue(aggregates.intermediateConsumption.footprint.indicators.was.getGrossImpact(aggregates.intermediateConsumption.amount)/aggregates.production.footprint.indicators.was.getGrossImpact(aggregates.production.amount)*100,0)+" % de l'empreinte déchets liée à la production.");
  
  analysis.push(currentParagraph);

  // comparaison branche
  
  
  // comptes les plus impactants

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("L'amortissement des immobilisations induit une production indirecte de déchets de l'ordre de "+printValue(aggregates.capitalConsumption.footprint.indicators.was.getGrossImpact(aggregates.capitalConsumption.amount),0)+" kg.");

  analysis.push(currentParagraph);

  return analysis;
}