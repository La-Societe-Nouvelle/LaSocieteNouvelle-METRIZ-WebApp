import { analysisTextWriterART } from "./analysisTextWriterART";
import { analysisTextWriterECO } from "./analysisTextWriterECO";
import { analysisTextWriterGEQ } from "./analysisTextWriterGEQ";
import { analysisTextWriterGHG } from "./analysisTextWriterGHG";
import { analysisTextWriterHAZ } from "./analysisTextWriterHAZ";
import { analysisTextWriterIDR } from "./analysisTextWriterIDR";
import { analysisTextWriterKNW } from "./analysisTextWriterKNW";
import { analysisTextWriterMAT } from "./analysisTextWriterMAT";
import { analysisTextWriterNRG } from "./analysisTextWriterNRG";
import { analysisTextWriterSOC } from "./analysisTextWriterSOC";
import { analysisTextWriterWAS } from "./analysisTextWriterWAS";
import { analysisTextWriterWAT } from "./analysisTextWriterWAT";

import metaIndics from "../../../lib/indics.json";
import divisions from "/lib/divisions";

export {
    analysisTextWriterART,
    analysisTextWriterECO,
    analysisTextWriterGEQ,
    analysisTextWriterGHG,
    analysisTextWriterHAZ,
    analysisTextWriterIDR,
    analysisTextWriterKNW,
    analysisTextWriterMAT,
    analysisTextWriterNRG,
    analysisTextWriterSOC,
    analysisTextWriterWAS,
    analysisTextWriterWAT
}


const apiUrl = 'https://api.openai.com/v1/chat/completions';
const apiKey = "";

import axios from 'axios';

export const getAnalysisFromChatGPT = async ({
    session,
    period,
    indic
}) => {
    // build request
    const request = buildRequestOpenAI({
        session,
        period,
        indic
    });
    console.log(request);

    // open ai
    try 
    {
        console.log("ask chat GPT");
        const response = await axios.post(apiUrl, {
            model: "gpt-3.5-turbo-0301",
            messages: [{"role": "user", "content": request}],
            max_tokens: 500,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        });
    
        console.log(response);
        const analysisOpenIA = response.data.choices[0].message;
        console.log(analysisOpenIA);
        return analysisOpenIA;
    } 
    catch (error) {
        console.error('Error generating code:', error.message);
    }

    return "";
}

const buildRequestOpenAI = ({
    session,
    period,
    indic
}) => {
    // v0
    const data = buildMainAggratesTable({session,period,indic});
    const request = 
          "Concernant "+metaIndics[indic].libelle+","+"\n"
        + "Pour une entreprise de la division économique \""+divisions[session.comparativeData.activityCode]+"\","+"\n"
        + "Avec les résultats suivants : "+"\n"
        + data
        + "Quelles conclusions ?";
    return request;
}

/** Leads to improve response
 *      -> Builder table in markdown
 * 
 */

const buildMainAggratesTable = ({session,period,indic}) =>
{
    const mainAggregates = session.financialData.mainAggregates;
    const {
        production,
        intermediateConsumptions,
        fixedCapitalConsumptions,
        netValueAdded
    } = mainAggregates;

    const data = 
          "| Agrégat | Montant | Empreinte |"+"\n"
        + "|---------|---------|-----------|"+"\n"
        + "| Production | "+production.periodsData[period.periodKey].amount+" € | "+"75"+" % |"+"\n"
        + "| Consommations intermédiaires | "+intermediateConsumptions.periodsData[period.periodKey].amount+" € | "+intermediateConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value+" % |"+"\n"
        + "| Consommations de capital fixe | "+fixedCapitalConsumptions.periodsData[period.periodKey].amount+" € | "+fixedCapitalConsumptions.periodsData[period.periodKey].footprint.indicators[indic].value+" % |"+"\n"
        + "| Valeur ajoutée nette | "+netValueAdded.periodsData[period.periodKey].amount+" € | "+"100"+" % |"+"\n"
        + "(La colonne \"Empreinte\" désigne la part de la valeur issue de la production intérieure française)"+"\n";

    console.log(data);
    return data;
}

// production.periodsData[period.periodKey].footprint.indicators[indic].value