import { printValue } from "../../utils/Utils";

const writeStatementECO = (impactsData) => {

    const textStatement = [{ text: "Valeur ajoutée nette produite en France : " 
    + printValue(impactsData.domesticProduction, 0) + " €" + (impactsData.isAllActivitiesInFrance ? "*" : "" ), style:"bordered"}]

    if (impactsData.isAllActivitiesInFrance) {

        textStatement.push({text : "*Les activités de l'entreprise sont déclarées entièrement localisées en France", fontSize : 8, italics : true, alignment : "right"})
    }
    return textStatement;
  }


  export {
    writeStatementECO
  };
  