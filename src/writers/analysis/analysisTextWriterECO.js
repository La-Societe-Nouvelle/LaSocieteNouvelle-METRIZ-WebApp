// La Société Nouvelle

export const analysisTextWriterECO = (session) =>
{
  const {impactData,
         netValueAddedFootprint,
         intermediateConsumptionFootprint} = session;

  // array of paragraphs
  let analysis = [];
  let currentParagraph = [];

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactData.isAllActivitiesInFrance) {
    currentParagraph.push("Les activités de l'entreprise sont localisées en France et contribuent, de ce fait, entièrement à l'économie nationale.");
  } else if (!impactData.isAllActivitiesInFrance) {
    currentParagraph.push("Les activités de l'entreprise sont localisées hors de France.");
  } else {
    currentParagraph.push("Le volume des activités localisées en France s'élève à "+impactData.domesticProduction+" €, soit "+netValueAddedFootprint.indicators.eco.getValue()+" % de la valeur ajoutée.");
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Les consommations intermédiaires contribuent à hauteur de "+intermediateConsumptionFootprint.indicators.eco+" % à l'économie nationale, soit un volume de "+(intermediateConsumptionFootprint.indicators.eco.getGrossImpact(financialData.getAmountIntermediateConsumption()))+" €.");
  
  // comparaison branche
  if (intermediateConsumptionFootprint.indicators.eco.value > 50) {
    currentParagraph.push("Le taux de contribution se situe à un niveau supérieur à la branche d'activités ("+branche+").")
  } else {
    currentParagraph.push("Le taux de contribution se situe à un niveau inférieur à la branche d'activités ("+branche+").")
  }

  // comptes les plus impactants
  //let maxCompany = financialData.accounts.sort((a,b) => b.amount - a.amount)[0];
  //currentParagraph.push("Les charges "+maxCompany+" impactent le plus négativement la performance de l'entreprise, avec un taux de contribution de "+""+" pour un volume de "+""+" €.");

  // Investissements ------------------------------------------------------------------------------- //

  // 
  //currentParagraph.push("La contribution des immobilisations de l'entreprise est de "+"");

  // Production ------------------------------------------------------------------------------------ //

  currentParagraph.push("Le taux de contribution de la production sur l'exercice est de "+session.productionFootprint.indicators.eco.getValue()+" % ( % pour le chiffre d'affaires).")

  return analysis;
}