// La Société Nouvelle

const currentVersion = "3.0.0";

// Libraries
import metaIndics from "../lib/indics.json";

// Intern objects
import { LegalUnit } from "/src/LegalUnit.js";
import { FinancialData } from "/src/FinancialData.js";
import { ImpactsData } from "/src/ImpactsData.js";

// General objects
import { Indicator } from "/src/footprintObjects/Indicator";

// Formulas
import {
  updateMainAggregatesFootprints,
  updateProductionItemsFootprints,
  updateIntermediateConsumptionsFootprints,
  updateFixedCapitalConsumptionsFootprints
} from "./formulas/aggregatesFootprintFormulas";
import { 
  buildNetValueAddedIndicator 
} from "./formulas/netValueAddedFootprintFormulas";

import {
  getDatesEndMonths,
  getLastDateOfMonth,
  getPrevDate
} from "./utils/periodsUtils";

import { getAnalysisFromChatGPT } from "./writers/analysis/analysis";
import { ComparativeData } from "./ComparativeData";
import { SocialFootprint } from "./footprintObjects/SocialFootprint";

/* ---------- OBJECT SESSION ---------- */

export class Session 
{
  constructor(props) 
  {
    if (props == undefined) props = {};
    // ---------------------------------------------------------------------------------------------------- //

    // Version
    this.version = currentVersion;

    // Session
    this.progression = props.progression || 0;

    // Identifier
    this.id = props.id || "";

    // Year
    // this.year = props.year || ""; // obsolete

    this.availablePeriods = props.availablePeriods || [];
    this.availablePeriods.forEach((period) => {
      period.regex = buildRegexFinancialPeriod(
        period.dateStart,
        period.dateEnd
      );
    });

     // obsolete
    // this.financialPeriod = props.financialPeriod || {};

    // this.financialPeriod.regex = props.financialPeriod
    //   ? buildRegexFinancialPeriod(
    //       props.financialPeriod.dateStart,
    //       props.financialPeriod.dateEnd
    //     )
    //   : {};

    // Data
    this.legalUnit = new LegalUnit(props.legalUnit);
    this.financialData = new FinancialData(props.financialData);
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

    // comparative data
    this.comparativeData = new ComparativeData(props.comparativeData);

    // Indicators list
    this.indics = {};
    this.availablePeriods.forEach((period) => {
      this.indics[period.periodKey] = props.indics[period.periodKey] || [];
    });

    // Analysis -> in footprint object ?
    this.analysis = {};
    this.availablePeriods.forEach((period) => {
      this.analysis[period.periodKey] = {};
      Object.keys(metaIndics)
        .map((indic) => this.analysis[period.periodKey][indic] = {
          analysis: ""
        });
    });
  }

  addPeriods = (periods) => {
    let newPeriods = periods.filter(
      (period) => !this.availablePeriods.includes(period)
    );
    this.availablePeriods.push(...newPeriods);
    newPeriods.forEach((period) => {
      this.impactsData[period.periodKey] = new ImpactsData();
      this.validations[period.periodKey] = [];
      this.indics[period.periodKey] = Object.entries(metaIndics).filter(([_,meta]) => meta.isAvailable).filter(([indic,_]) => indic);
    });
  };

  loadSessionFromBackup = (prevSession) => 
  {
    // add previous periods
    this.addPeriods(prevSession.availablePeriods);

    // add previous validated indicators
    this.validations[prevSession.financialPeriod.periodKey] =
      prevSession.validations[prevSession.financialPeriod.periodKey];

    // add previsous impact data
    this.impactsData[prevSession.financialPeriod.periodKey] =
      prevSession.impactsData[prevSession.financialPeriod.periodKey];
  };

  /* -------------------- PROGRESSION -------------------- */

  getStepMax = () => {
    // if no siren
    if (!/[0-9]{9}/.test(this.legalUnit.siren)) return 1;
    // if no financial data
    else if (!this.financialData.isFinancialDataLoaded) return 2;
    // if data for initial states not fetched
    else if (
      this.financialData.immobilisations
        .concat(this.financialData.stocks)
        .some(
          (asset) =>
            asset.initialStateType == "defaultData" && !asset.dataFetched
        )
    )
      return 3;
    // if data for comppanies not fetched
    else if (
      this.financialData.providers.some(
        (provider) => provider.footprintStatus != 200
      )
    )
      return 4;
    // else
    else return 5;
  };

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
    await this.updateMainAggregatesFootprints(period);
    console.log(" Mise à jour de l'empreinte des principaux agrégats");

    // Production items
    await this.updateProductionItemsFootprints(period);
    console.log(" Mise à jour de l'empreinte des agrégats de la production");

    console.log("Données à jour :");
    console.log(this.financialData);

    // Analysis (IA)
    if (this.analysis==undefined) {
      this.analysis = {};
    }
    if (this.analysis[period.periodKey]==undefined) {
      this.analysis[period.periodKey] = {};
    }
    await Promise.all(this.validations[period.periodKey]
      //.filter((indic) => indic=="eco")
      .map(async (indic) => {
        const analysis = await getAnalysisFromChatGPT({
          session: this,
          period,
          indic
        });
        if (this.analysis[period.periodKey][indic]==undefined) {
          this.analysis[period.periodKey][indic] = {};
        }
        this.analysis[period.periodKey][indic].analysis = analysis;
      })
    );

    return;
  };

  /* -------------------- NET VALUE ADDED FOOTPRINT -------------------- */

  updateNetValueAddedFootprint = async (period) => 
  {
    await Promise.all(Object.keys(metaIndics)
      .map((indic) =>
        this.updateNetValueAddedIndicator(indic, period.periodKey)
      )
    );
  }

  updateNetValueAddedIndicator = (indic, periodKey) => 
  {
    let indicator = this.validations[periodKey].includes(indic) ? 
        this.getNetValueAddedIndicator(indic, periodKey)
      : new Indicator({ indic });
    this.financialData.mainAggregates.netValueAdded.periodsData[periodKey].footprint.indicators[indic] = indicator;
  };

  getNetValueAddedIndicator = (indic, periodKey) => 
  {
    const netValueAdded = this.financialData.mainAggregates.netValueAdded.periodsData[periodKey].amount;
    const impactsData = this.impactsData[periodKey];

    impactsData.setNetValueAdded(netValueAdded); // replace

    if (this.financialData.isFinancialDataLoaded && netValueAdded > 0) {
      return buildNetValueAddedIndicator(indic, impactsData);
    } else {
      return new Indicator({ indic: indic });
    }
  };

  initNetValueAddedFootprint = (period) => {
    this.financialData.mainAggregates.netValueAdded.periodsData[period.periodKey].footprint = new SocialFootprint();
  }

  /* -------------------- MAIN AGGREGATES FOOTPRINTS -------------------- */

  updateMainAggregatesFootprints = async (period) => 
  {
    await Promise.all(Object.keys(metaIndics)
      .map(async (indic) =>
        await updateMainAggregatesFootprints(indic, this.financialData, period)
      )
    );
  }

  /* -------------------- PRODUCTION ITEMS FOOTPRINTS -------------------- */

  updateProductionItemsFootprints = async (period) => 
  {
    await Promise.all(Object.keys(metaIndics)
      .map(async (indic) =>
        await updateProductionItemsFootprints(indic, this.financialData, period)
      )
    );
  }
}

// remove
export const buildRegexFinancialPeriod = (dateStart, dateEnd) => {
  // REVIEW
  let datesEndMonths = getDatesEndMonths(dateStart, dateEnd);
  let months = datesEndMonths.map((date) => date.substring(0, 6));

  let datesLastMonth = [];
  if (dateEnd != getLastDateOfMonth(dateEnd)) {
    let lastMonth = dateEnd.substring(0, 6);
    let prevDate = dateEnd;
    while (prevDate.startsWith(lastMonth)) {
      datesLastMonth.push(prevDate);
      prevDate = getPrevDate(prevDate);
    }
  }

  let regexString = "^(" + months.concat(datesLastMonth).join("|") + ")";
  return new RegExp(regexString);
}