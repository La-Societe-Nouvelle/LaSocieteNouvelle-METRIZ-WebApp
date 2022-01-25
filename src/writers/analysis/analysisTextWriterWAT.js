// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterWAT = (session) =>
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
  
  currentParagraph.push("L'indicateur exprime la quantité d'eau consommée pour produire un euro de l'agrégat considéré.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("L'intensité de consommation d'eau de la valeur produite est de "+printValue(aggregates.production.footprint.indicators.wat.getValue(),0)+" L/€.")
  if (aggregates.production.footprint.indicators.wat.getValue()!=aggregates.revenue.footprint.indicators.wat.getValue()) {
    currentParagraph.push("La valeur est de "+printValue(aggregates.revenue.footprint.indicators.wat.getValue(),0)+" L/€ pour le chiffre d'affaires, en prenant compte des stocks de production.")
  } else {
    currentParagraph.push("La valeur est identique pour le chiffre d'affaires.")
  }
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.waterConsumption)
  {
    currentParagraph.push("Aucune consommation directe d'eau n'est déclarée.")
  }
  else 
  {
    currentParagraph.push("La consommation directe d'eau est de "+printValue(impactsData.waterConsumption,0)+" m3,"
      + " soit une intensité de "+printValue(aggregates.netValueAdded.footprint.indicators.wat.getValue(),0)+" L/€ pour la valeur ajoutée.");
    currentParagraph.push("La consommation directe d'eau représente "+printValue(impactsData.waterConsumption/aggregates.production.footprint.indicators.wat.getGrossImpact(aggregates.production.amount)*100,0)+" % de la consommation d'eau à l'échelle de la production.");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Les consommations intermédiaires sont à l'orgine d'une consommation indirecte de "+printValue(aggregates.intermediateConsumption.footprint.indicators.wat.getGrossImpact(aggregates.intermediateConsumption.amount),0)+" m3 d'eau,"
    + " ce qui correspond à une intensité de "+printValue(aggregates.intermediateConsumption.footprint.indicators.wat.getValue(),0)+" L/€.");
  currentParagraph.push("La consommation indirecte d'eau des consommations intermédiaires représente "+printValue(aggregates.intermediateConsumption.footprint.indicators.wat.getGrossImpact(aggregates.intermediateConsumption.amount)/aggregates.production.footprint.indicators.wat.getGrossImpact(aggregates.production.amount)*100,0)+" % de la consommation totale liée à la production.");
    
  analysis.push(currentParagraph);

  // comparaison branche
  
  
  // comptes les plus impactants
  
  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("L'amortissement des immobilisations représente une consommation indirecte de "+printValue(aggregates.capitalConsumption.footprint.indicators.wat.getGrossImpact(aggregates.capitalConsumption.amount),0)+" m3.");

  analysis.push(currentParagraph);

  return analysis;
}