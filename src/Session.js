// La Société Nouvelle

// Libraries
import metaIndics from "../lib/indics.json";

// Objects
import { Indicator } from "/src/footprintObjects/Indicator";

// Children
import { LegalUnit } from "/src/LegalUnit.js";
import { FinancialData } from "/src/FinancialData.js";
import { ImpactsData } from "/src/ImpactsData.js";
import { ComparativeData } from "./ComparativeData";

// Formulas
import { buildNetValueAddedIndicator } from "./formulas/netValueAddedFootprintFormulas";
import {
  updateMainAggregatesFootprints,
  updateProductionItemsFootprints,
  updateIntermediateConsumptionsFootprints,
  updateFixedCapitalConsumptionsFootprints
} from "./formulas/aggregatesFootprintFormulas";

// Utils
import { buildRegexFinancialPeriod } from "./utils/periodsUtils";
import { getAnalysisFromChatGPT } from "./writers/analysis/analysis";
import { SocialFootprint } from "./footprintObjects/SocialFootprint";

// ################################################## SESSION OBJECT ##################################################

// current version
const currentVersion = "3.0.4";

export class Session 
{
  constructor(props) 
  {
    if (props == undefined) props = {};

    // ---------------------------------------------------------------------------------------------------- //

    // Version
    this.version = currentVersion;

    // Identifier
    this.id = props.id || "";

    // Options
    this.useChatGPT = props.useChatGPT ?? true ;
    this.sendStatReport = props.sendStatReport ?? false ;

    // Periods
    this.availablePeriods = props.availablePeriods || [];
    this.availablePeriods.forEach((period) => {
      period.regex = buildRegexFinancialPeriod(
        period.dateStart,
        period.dateEnd
        );
      });
    
    // Legal Unit data
    this.legalUnit = new LegalUnit(props.legalUnit);

    // Financial data
    this.financialData = new FinancialData(props.financialData);

    // Impacts data
    this.impactsData = {};
    this.availablePeriods.forEach((period) => {
      this.impactsData[period.periodKey] = new ImpactsData(
        props.impactsData[period.periodKey]
      );
    });

    // Validations
    this.validations = {};
    this.availablePeriods.forEach((period) => {
      this.validations[period.periodKey] = props.validations[period.periodKey];
    });

    // Comparative data
    this.comparativeData = new ComparativeData(props.comparativeData);

    // Analysis
    this.analysis = {};
    this.availablePeriods.forEach((period) => {
      this.analysis[period.periodKey] = props.analysis[period.periodKey];
    });

    // ---------------------------------------------------------------------------------------------------- //
  }

  /* -------------------- MANAGE DATA -------------------- */

  // Load session
  loadSessionFromBackup = async (loadedSession) => 
  {
    // Periods
    this.availablePeriods.push(...loadedSession.availablePeriods);

    // Legal Unit
    // to do -> merge data ?

    // Financial data
    await this.financialData.loadFinancialDataFromBackUp(loadedSession.financialData);

    // Impacts data
    this.impactsData = {
      ...this.impactsData,
      ...loadedSession.impactsData
    }

    // Validations
    this.validations = {
      ...this.validations,
      ...loadedSession.validations
    }

    // Comparative data
    // to do -> ignored ?

    // Analysis
    this.analysis = {
      ...this.analysis,
      ...loadedSession.analysis
    }
  }

  // add periods
  addPeriods = (periods) => 
  {
    periods.forEach((period) => 
    {
      // periods
      this.availablePeriods.push(period);
      
      // impacts data
      this.impactsData[period.periodKey] = new ImpactsData();

      // validations
      this.validations[period.periodKey] = [];

      // analysis
      this.analysis[period.periodKey] = {};
      Object.entries(metaIndics)
        .filter(([_,metaIndic]) => metaIndic.isAvailable)
        .forEach(([indic,_]) => {
          this.analysis[period.periodKey][indic] = {
            analysis: ""
          };
        })
    });
  }

  /* ---------------------------------------------------------------------------------------------------- */
  /* ---------------------------------------- FOOTPRINTS PROCESS ---------------------------------------- */
  /* ---------------------------------------------------------------------------------------------------- */

  // Main footprints are stored in variables to avoid processing multiple times when render the results
  // ... and allows to have all the values directly in the json back up file

  // Update all footprints (after loading data : financial data, initial states, fetching companies data)
  // Fonction calls :
  //    - Before accessing to the results
  //    - When updating data after loading a backup file (to continue session)
  //    - When updating data after loading a backup file (as initial states)

  updateFootprints = async (period) => 
  {
    console.log("Mise à jour des empreintes pour la période : " + period.periodKey);

    // Net Value Added
    await this.updateNetValueAddedFootprint(period);
    console.log(" Mise à jour de l'empreinte de la valeur ajoutée nette");

    // Intermediate Consumptions
    await updateIntermediateConsumptionsFootprints(this.financialData, period);
    console.log(" Mise à jour de l'empreinte des consommations intermédiaires");

    // Fixed Capital Consumptions
    await updateFixedCapitalConsumptionsFootprints(this.financialData, period);
    console.log(" Mise à jour de l'empreinte des consommations de capital fixe");

    // Main Aggregates
    await updateMainAggregatesFootprints(this.financialData, period)
    console.log(" Mise à jour de l'empreinte des principaux agrégats");

    // Production items
    await updateProductionItemsFootprints(this.financialData, period)
    console.log(" Mise à jour de l'empreinte des agrégats de la production");

    console.log("Données à jour :");
    console.log(this.financialData);

    return;
  }

  buildAnalysis = async (period) =>
  {
    // Analysis (IA)
    await Promise.all(this.validations[period.periodKey]
      .map(async (indic) => {
        const analysis = await getAnalysisFromChatGPT({
          session: this,
          period,
          indic
        });
      if (this.analysis[period.periodKey][indic]==undefined) {
        this.analysis[period.periodKey][indic] = {};
      }
      this.analysis[period.periodKey][indic] = analysis;
      })
    );
  }

  /* -------------------- RESET FOOTPRINT -------------------- */

  resetAggregatesFootprints = (period) => 
  {
    // reset production footprint
    this.financialData.mainAggregates.production.periodsData[period.periodKey].footprint = new SocialFootprint();

    // reset production aggregates footprint
    Object.values(this.financialData.productionAggregates)
      .forEach((aggregate) => aggregate.periodsData[period.periodKey] = new SocialFootprint());
  }

  /* -------------------- NET VALUE ADDED FOOTPRINT -------------------- */

  updateNetValueAddedFootprint = async (period) => 
  {
    const netValueAddedAmount = this.financialData.mainAggregates.netValueAdded.periodsData[period.periodKey].amount;
    this.impactsData[period.periodKey].setNetValueAdded(netValueAddedAmount);

    await Promise.all(Object.entries(metaIndics)
      .filter(([_,metaIndic]) => metaIndic.isAvailable)
      .map(([indic,_]) =>
        this.updateNetValueAddedIndicator(indic, period.periodKey)
      )
    );
  }

  updateNetValueAddedIndicator = (indic, periodKey) => 
  {
    const impactsData = this.impactsData[periodKey];
    let indicator = this.validations[periodKey].includes(indic) ? 
        buildNetValueAddedIndicator(indic, impactsData)
      : new Indicator({ indic });
    
    this.financialData.mainAggregates.netValueAdded.periodsData[periodKey].footprint.indicators[indic] = indicator;
  }

  initNetValueAddedFootprint = (period) => {
    Object.entries(metaIndics)
      .filter(([_,metaIndic]) => metaIndic.isAvailable)
      .forEach(([indic,_]) =>
        this.financialData.mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators[indic] = new Indicator(indic)
    );
  }
  
  initNetValueAddedIndicator = (indic,period) => {
    this.financialData.mainAggregates.netValueAdded.periodsData[period.periodKey].footprint.indicators[indic] = new Indicator(indic)
  }
}