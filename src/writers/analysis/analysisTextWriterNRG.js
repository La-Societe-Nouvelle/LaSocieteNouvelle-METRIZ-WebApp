// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterNRG = (session) =>
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
  
  currentParagraph.push("L'indicateur exprime la quantité d'énergie consommée pour produire un euro de l'agrégat considéré.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("L'intensité énergétique de la valeur produite est de "+printValue(aggregates.production.footprint.indicators.nrg.value,0)+" kJ/€.")
  if (aggregates.production.footprint.indicators.nrg.value!=aggregates.revenue.footprint.indicators.nrg.value) {
    currentParagraph.push("La valeur est de "+printValue(aggregates.revenue.footprint.indicators.nrg.value,0)+" kJ/€ pour le chiffre d'affaires, en prenant compte des stocks de production.")
  } else {
    currentParagraph.push("La valeur est identique pour le chiffre d'affaires.")
  }
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (!impactsData.energyConsumption)
  {
    currentParagraph.push("Aucune consommation directe d'énergie n'est déclarée.")
  }
  else 
  {
    currentParagraph.push("La consommation directe d'énergie est de "+printValue(impactsData.energyConsumption,0)+" MJ,"
      + " soit une intensité de "+printValue(aggregates.netValueAdded.footprint.indicators.nrg.value,0)+" kJ/€ pour la valeur ajoutée.");
    currentParagraph.push("La consommation directe d'énergie représente "+printValue(impactsData.energyConsumption/aggregates.production.footprint.indicators.nrg.getGrossImpact(aggregates.production.amount)*100,0)+" % de la consommation totale d'énergie liée à la production.");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Les consommations intermédiaires sont à l'orgine d'une consommation indirecte de "+printValue(aggregates.intermediateConsumption.footprint.indicators.nrg.getGrossImpact(aggregates.intermediateConsumption.amount),0)+" MJ,"
    + " ce qui correspond à une intensité de "+printValue(aggregates.intermediateConsumption.footprint.indicators.nrg.value,0)+" kJ/€.");
  currentParagraph.push("La consommation indirecte d'énergie des consommations intermédiaires représente "+printValue(aggregates.intermediateConsumption.footprint.indicators.nrg.getGrossImpact(aggregates.intermediateConsumption.amount)/aggregates.production.footprint.indicators.nrg.getGrossImpact(aggregates.production.amount)*100,0)+" % de la consommation totale liée à la production.");
  
  analysis.push(currentParagraph);

  // comparaison branche
  
  
  // comptes les plus impactants
  
  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("L'amortissement des immobilisations représente une consommation indirecte de "+printValue(aggregates.capitalConsumption.footprint.indicators.nrg.getGrossImpact(aggregates.capitalConsumption.amount),0)+" MJ,"
    + " soit "+printValue(aggregates.capitalConsumption.footprint.indicators.nrg.getGrossImpact(aggregates.capitalConsumption.amount)/aggregates.production.footprint.indicators.nrg.getGrossImpact(aggregates.production.amount)*100,0)+" % de la consommation totale liée à la production.");

  analysis.push(currentParagraph);

  return analysis;
}