// La Société Nouvelle

const currentVersion = "2.0.0";

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
  updateFixedCapitalConsumptionsFootprints,
} from "./formulas/aggregatesFootprintFormulas";
import { buildNetValueAddedIndicator } from "./formulas/netValueAddedFootprintFormulas";
import { ComparativeData } from "./ComparativeData";
import { getDatesEndMonths, getLastDateOfMonth, getPrevDate } from "./utils/Utils";

/* ---------- OBJECT SESSION ---------- */

export class Session {
  constructor(props) {
    if (props == undefined) props = {};
    // ---------------------------------------------------------------------------------------------------- //

    // Version
    this.version = currentVersion;

    // Session
    this.progression = props.progression || 0;

    // Year
    this.year = props.year || ""; // obsolete
    this.availablePeriods = props.availablePeriods || [];
    this.availablePeriods.forEach((period) => {
      period.regex = buildRegexFinancialPeriod(
        period.dateStart,
        period.dateEnd
      );
    });

    this.financialPeriod = props.financialPeriod || {};
    this.financialPeriod.regex = props.financialPeriod
      ? buildRegexFinancialPeriod(
          props.financialPeriod.dateStart,
          props.financialData.dateEnd
        )
      : {};

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
  
  }

  addPeriods = (periods) => {
    let newPeriods = periods.filter(
      (period) => !this.availablePeriods.includes(period)
    );
    this.availablePeriods.push(...newPeriods);
    newPeriods.forEach((period) => {
      this.impactsData[period.periodKey] = new ImpactsData();
      this.validations[period.periodKey] = [];
      this.indics[period.periodKey] = Object.keys(metaIndics);
    });
  };

  loadSessionFromBackup = (prevSession) => {
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

  /* ---------------------------------------- FOOTPRINTS PROCESS ---------------------------------------- */

  // Main footprints are stored in variables to avoid processing multiple times when render the results
  // ... and allows to have all the values directly in the json back up file

  // Update all footprints (after loading data : financial data, initial states, fetching companies data)
  updateFootprints = async (period) => {
    // Net Value Added
    await this.updateNetValueAddedFootprint(period);

    // Intermediate Consumptions
    await updateIntermediateConsumptionsFootprints(this.financialData, period);

    // Intermediate Consumptions
    await updateFixedCapitalConsumptionsFootprints(this.financialData, period);

    // Main Aggregates
    await this.updateMainAggregatesFootprints(period);

    // Production items
    await this.updateProductionItemsFootprints(period);

    return;
  };

  /* -------------------- NET VALUE ADDED FOOTPRINT -------------------- */

  updateNetValueAddedFootprint = async (period) => {
    await Promise.all(
      Object.keys(metaIndics).map((indic) =>
        this.updateNetValueAddedIndicator(indic, period.periodKey)
      )
    );
  };

  updateNetValueAddedIndicator = (indic, periodKey) => {
    this.financialData.mainAggregates.netValueAdded.periodsData[
      periodKey
    ].footprint.indicators[indic] =
      this.validations[periodKey].indexOf(indic) >= 0
        ? this.getNetValueAddedIndicator(indic, periodKey)
        : new Indicator({ indic });
  };

  getNetValueAddedIndicator = (indic, periodKey) => {
    const netValueAdded =
      this.financialData.mainAggregates.netValueAdded.periodsData[periodKey]
        .amount;
    const impactsData = this.impactsData[periodKey];

    impactsData.setNetValueAdded(netValueAdded);

    if (this.financialData.isFinancialDataLoaded && netValueAdded > 0) {
      return buildNetValueAddedIndicator(indic, impactsData);
    } else return new Indicator({ indic: indic });
  };

  updateMainAggregatesFootprints = async (period) => {
    await Promise.all(
      Object.keys(metaIndics).map(
        async (indic) =>
          await updateMainAggregatesFootprints(
            indic,
            this.financialData,
            period
          )
      )
    );
  };

  updateProductionItemsFootprints = async (period) => {
    await Promise.all(
      Object.keys(metaIndics).map(
        async (indic) =>
          await updateProductionItemsFootprints(
            indic,
            this.financialData,
            period
          )
      )
    );
  };
}

export const buildRegexFinancialPeriod = (dateStart, dateEnd) => 
{ // REVIEW
  let datesEndMonths = getDatesEndMonths(dateStart, dateEnd);
  let months = datesEndMonths.map((date) => date.substring(0, 6));

  let datesLastMonth = [];
  if (dateEnd!=getLastDateOfMonth(dateEnd)) {
    let lastMonth = dateEnd.substring(0,6);
    let prevDate = dateEnd;
    while (prevDate.startsWith(lastMonth)) {
      datesLastMonth.push(prevDate);
      prevDate = getPrevDate(prevDate);
    }
  };

  let regexString = "^(" + months.concat(datesLastMonth).join("|") + ")";
  return new RegExp(regexString);
};

export const getListMonthsFinancialPeriod = (dateStart, dateEnd) => {
  let datesEndMonths = getDatesEndMonths(dateStart, dateEnd);
  let months = datesEndMonths.map((date) => date.substring(0, 6));
  return months;
};
