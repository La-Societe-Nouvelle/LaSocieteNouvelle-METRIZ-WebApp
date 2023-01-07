// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterKNW = (session) =>
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
  
  currentParagraph.push("L'indicateur informe sur la part de la valeur fléchée vers de la formation ou de la recherche.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("Le taux de contribution de la valeur produite pour l'évolution des compétences et des connaissances est de "+printValue(aggregates.production.footprint.indicators.knw.value,0)+" %,"
    + " soit un montant total de "+printValue(aggregates.production.footprint.indicators.knw.getGrossImpact(aggregates.production.amount),0)+" €.")
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.researchAndTrainingContribution==0) 
  {
    currentParagraph.push("Aucune charge interne n'est considérée comme contributrice à l'évolution des compétences et des connaissances.");
  }
  else 
  {
    currentParagraph.push(printValue(aggregates.netValueAdded.footprint.indicators.knw.value,0)+" % des charges internes contribuent à la formation ou à la recherche,"
      + " soit une contribution directe de "+printValue(impactsData.researchAndTrainingContribution,0)+" €.");
    currentParagraph.push("La contribution directe compte pour "+printValue(aggregates.netValueAdded.footprint.indicators.knw.getGrossImpact(aggregates.netValueAdded.amount)/aggregates.production.footprint.indicators.knw.getGrossImpact(aggregates.production.amount)*100,0)+" % de la contributon brute totale.")
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Au niveau des consommations intermédiaires, "+printValue(aggregates.intermediateConsumption.footprint.indicators.knw.value,0)+" % de la valeur est contributrice,"
    + "soit un volume de "+printValue(aggregates.intermediateConsumption.footprint.indicators.knw.getGrossImpact(aggregates.intermediateConsumption.amount),0)+" €.");
  currentParagraph.push("Les consommations intermédiaires sont à l'origine de "+printValue(aggregates.intermediateConsumption.footprint.indicators.knw.getGrossImpact(aggregates.intermediateConsumption.amount)/aggregates.production.footprint.indicators.knw.getGrossImpact(aggregates.production.amount)*100,0)+" % de la contributon brute totale.")

  analysis.push(currentParagraph);

  // comparaison branche
  
  // comptes les plus impactants
  
  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("Enfin, l'amortissement des immobilisations contribue à hauteur de "+printValue(aggregates.capitalConsumption.footprint.indicators.knw.getGrossImpact(aggregates.capitalConsumption.amount),0)+" €,"
    + " soit "+printValue(aggregates.capitalConsumption.footprint.indicators.knw.value,0)+" % du volume des dotations aux amortissements"
    + " et "+printValue(aggregates.capitalConsumption.footprint.indicators.knw.getGrossImpact(aggregates.capitalConsumption.amount)/aggregates.production.footprint.indicators.knw.getGrossImpact(aggregates.production.amount)*100,0)+" % de la contribution brute total.");

  analysis.push(currentParagraph);

  return analysis;
}