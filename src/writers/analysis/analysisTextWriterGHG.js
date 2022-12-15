// La Société Nouvelle

import { compareToReference, printValue } from "../../utils/Utils";

export const analysisTextWriterGHG = (session) =>
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
  
  currentParagraph.push("L'intensité d'émissions de gaz à effet de serre informe sur la quantité de gaz à effet de serre émis pour un euro de l'agrégat considéré.");
  
  //analysis.push(currentParagraph);

  // Production ------------------------------------------------------------------------------------ //
  
  currentParagraph = [];

  currentParagraph.push("L'intensité carbone de la valeur produite sur l'exercice est de "+printValue(aggregates.production.footprint.indicators.ghg.value,0)+" gCO2e/€.")
  if (aggregates.production.footprint.indicators.ghg.value!=aggregates.revenue.footprint.indicators.ghg.value) {
    currentParagraph.push("La valeur est de "+printValue(aggregates.revenue.footprint.indicators.ghg.value,0)+" gCO2e/€ pour le chiffre d'affaires, en prenant compte des stocks de production.")
  }
  currentParagraph.push("En valeur brute, les émissions liées à la production s'élèvent à "+printValue(aggregates.production.footprint.indicators.ghg.getGrossImpact(aggregates.production.amount),0)+" kgCO2e.");
  
  analysis.push(currentParagraph);

  // Impact direct --------------------------------------------------------------------------------- //

  currentParagraph = [];

  if (impactsData.greenhousesGazEmissions==0) 
  {
    currentParagraph.push("Les activités de l'entreprise ne génère aucune émission directe de gaz à effet de serre. L'intensité liée à la valeur ajoutée nette est donc de 0 gCO2e/€.");
  } 
  else 
  {
    // valeur brute
    currentParagraph.push("Les émissions directes de l'entreprise représentent "+printValue(impactsData.greenhousesGazEmissions,0)+" kgCO2e, soit "+printValue(impactsData.greenhousesGazEmissions/aggregates.production.footprint.indicators.ghg.getGrossImpact(aggregates.production.amount)*100,0)+" % des émissions liées à la production.");
    // intensité & comparaison
    if (comparativeData.netValueAdded.divisionFootprint.indicators.ghg.value!=null)
    {
      let comparison = compareToReference(aggregates.netValueAdded.footprint.indicators.ghg.value,comparativeData.netValueAdded.divisionFootprint.indicators.ghg.value,10);
      if (comparison==0) {
        currentParagraph.push("L'intensité d'émissions de la valeur ajoutée est donc de "+printValue(aggregates.netValueAdded.footprint.indicators.ghg.value,0)+" gCO2e/€, soit un niveau équivalent à la branche d'activités.");
      } else if (comparison < 0) {
        currentParagraph.push("L'intensité d'émissions de la valeur ajoutée est donc de "+printValue(aggregates.netValueAdded.footprint.indicators.ghg.value,0)+" gCO2e/€, soit un niveau inférieur à la branche d'activités.");
      } else {
        currentParagraph.push("L'intensité d'émissions de la valeur ajoutée est donc de "+printValue(aggregates.netValueAdded.footprint.indicators.ghg.value,0)+" gCO2e/€, soit un niveau supérieur à la branche d'activités.");
      }
    } else {
      currentParagraph.push("L'intensité d'émissions de la valeur ajoutée est donc de "+printValue(aggregates.netValueAdded.footprint.indicators.ghg.value,0)+" gCO2e/€");
    }
  }

  analysis.push(currentParagraph);

  // Consommations intermédiaires ------------------------------------------------------------------ //

  currentParagraph = [];
  
  // résultat
  currentParagraph.push("Les émissions indirectes des consommations intermédiaires s'élèvent à "+printValue(aggregates.intermediateConsumption.footprint.indicators.ghg.getGrossImpact(aggregates.intermediateConsumption.amount),0)+" kgCO2e, soit une intensité de "+printValue(aggregates.intermediateConsumption.footprint.indicators.ghg.value,0)+" gCO2e/€.");
  if (aggregates.intermediateConsumption.footprint.indicators.ghg.getGrossImpact(aggregates.intermediateConsumption.amount) > aggregates.netValueAdded.footprint.indicators.ghg.getGrossImpact(aggregates.netValueAdded.amount)
   && aggregates.intermediateConsumption.footprint.indicators.ghg.getGrossImpact(aggregates.intermediateConsumption.amount) > aggregates.capitalConsumption.footprint.indicators.ghg.getGrossImpact(aggregates.capitalConsumption.amount)) {
     currentParagraph.push("Elles représentent les émissions les plus importantes sur le périmètre de la production ("+printValue(aggregates.intermediateConsumption.footprint.indicators.ghg.getGrossImpact(aggregates.intermediateConsumption.amount)/aggregates.production.footprint.indicators.ghg.getGrossImpact(aggregates.production.amount)*100,0)+" % des émissions totales).")
   }
  
  analysis.push(currentParagraph);

  // comparaison branche
  
  if (comparativeData.intermediateConsumption.divisionFootprint.indicators.ghg.value!=null)
  {
    let comparison = compareToReference(aggregates.intermediateConsumption.footprint.indicators.ghg.value,comparativeData.intermediateConsumption.divisionFootprint.indicators.ghg.value,10);
    if (comparison==0) {
      currentParagraph.push("L'intensité se situe à un niveau équivalent à l'intensité carbone des consommations intermédiaires de la branche d'activités.");
    } else if (comparison < 0) {
      currentParagraph.push("L'intensité se situe à un niveau inférieur à l'intensité carbone des consommations intermédiaires de la branche d'activités.");    
    } else {
      currentParagraph.push("L'intensité se situe à un niveau supérieur à l'intensité carbone des consommations intermédiaires de la branche d'activités.");
    }
  }
  
  // comptes les plus impactants
  currentParagraph = [];
  let worstAccount = expenseAccounts.sort((a,b) => b.footprint.indicators.ghg.getGrossImpact(b.amount) - a.footprint.indicators.ghg.getGrossImpact(a.amount))[0];
  currentParagraph.push("Le compte de charges \""+worstAccount.accountLib.charAt(0)+worstAccount.accountLib.substring(1).toLowerCase()+"\" est le plus émetteur ("+printValue(worstAccount.footprint.indicators.ghg.getGrossImpact(worstAccount.amount)/aggregates.production.footprint.indicators.ghg.getGrossImpact(aggregates.production.amount)*100,0)+" % des émissions totales) avec une intensité de "+printValue(worstAccount.footprint.indicators.ghg.value,0)+" gCO2e/€ et un montant de "+printValue(worstAccount.amount,0)+" €.");

  analysis.push(currentParagraph);

  // Investissements ------------------------------------------------------------------------------- //

  currentParagraph = [];

  currentParagraph.push("L'amortissement des immobilisations est à l'origine de "+printValue(aggregates.capitalConsumption.footprint.indicators.ghg.getGrossImpact(aggregates.capitalConsumption.amount),0)+" kgCO2e émis, de part une intensité carbone de "+printValue(aggregates.capitalConsumption.footprint.indicators.ghg.value,0)+" gCO2e/€.");

  analysis.push(currentParagraph);

  return analysis;
}