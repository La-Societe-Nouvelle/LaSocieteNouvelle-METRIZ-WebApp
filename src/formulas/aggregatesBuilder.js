// La Société Nouvelle

// Objects
import { Aggregate } from "../accountingObjects/Aggregate";
import { SocialFootprint } from "../footprintObjects/SocialFootprint";

// Utils
import { getAmountItems, getAmountItemsForPeriod, roundValue } from "../utils/Utils";
import { buildAggregatePeriodFootprint } from "./footprintFormulas";

/* ---------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- AGGREGATES BUILDER ---------------------------------------- */
/* ---------------------------------------------------------------------------------------------------- */

/* ---------------------------------------- PRODUCTION AGGREGATES ---------------------------------------- */

const metaProductionAggregates = {
  "revenue":                  {   label: "Production vendue"},      // #70
  "storedProduction":         {   label: "Production stockée"},     // #71
  "immobilisedProduction":    {   label: "Production immobilisée"}  // #72
}

export const buildProductionAggregates = async (FECData, periods) => 
{
  // Revenue
  const revenue = new Aggregate({
    id: "revenue",
    label: metaProductionAggregates.revenue.label,
  });
  for (const period of periods) {
    const { periodKey, regex } = period;
    revenue.periodsData[periodKey] = {
      periodKey,
      amount: getAmountItems(
        FECData.revenue.filter(item => regex.test(item.date))
        , 2),
      footprint: new SocialFootprint(),
    };
  };

  // Stored production
  const storedProduction = new Aggregate({
    id: "storedProduction",
    label: metaProductionAggregates.storedProduction.label,
  });
  for (const period of periods) {
    const { periodKey, regex } = period;
    storedProduction.periodsData[periodKey] = {
      periodKey,
      amount: getAmountItems(
        FECData.storedProduction.filter(item => regex.test(item.date))
        , 2),
      footprint: new SocialFootprint(),
    };
  };

  // Immobilised Production
  const immobilisedProduction = new Aggregate({
    id: "immobilisedProduction",
    label: metaProductionAggregates.immobilisedProduction.label,
  });
  for (const period of periods) {
    const { periodKey, regex } = period;
    immobilisedProduction.periodsData[periodKey] = {
      periodKey,
      amount: getAmountItems(
        FECData.immobilisedProduction.filter(item => regex.test(item.date))
        , 2),
      footprint: new SocialFootprint(),
    };
  };

  return({
    revenue,
    storedProduction,
    immobilisedProduction
  })
}

/* ---------------------------------------- MAIN AGGREGATES ---------------------------------------- */

const metaMainAggregates = {
  "production":               {   label: "Production"},
  "intermediateConsumptions": {   label: "Consommations intermédiaires"},
  "fixedCapitalConsumptions": {   label: "Consomamtions de capital fixe"},
  "netValueAdded":            {   label: "Valeur ajoutée nette"},
}

export const buildMainAggregates = async (financialData, periods) => 
{
  const {
    productionAggregates,
    externalExpensesAccounts,
    stockVariationsAccounts,
    amortisationExpensesAccounts
  } = financialData;

  const periodKeys = periods.map((period) => period.periodKey);

  // Production
  const production = new Aggregate({
    id: "production",
    label: metaMainAggregates.production.label,
  });
  for (let periodKey of periodKeys) {
    production.periodsData[periodKey] = {
      periodKey,
      amount: roundValue(
        productionAggregates.revenue.periodsData[periodKey].amount +
        productionAggregates.storedProduction.periodsData[periodKey].amount +
        productionAggregates.immobilisedProduction.periodsData[periodKey].amount
        , 2),
      footprint: new SocialFootprint(),
    };
  }

  // Intermediate consumptions
  const intermediateConsumptions = new Aggregate({
    id: "intermediateConsumptions",
    label: metaMainAggregates.intermediateConsumptions.label,
  });
  for (let periodKey of periodKeys) {
    intermediateConsumptions.periodsData[periodKey] = {
      periodKey,
      amount: getAmountItemsForPeriod(
        [...externalExpensesAccounts, ...stockVariationsAccounts], 
        periodKey, 
        2),
      footprint: new SocialFootprint()
    }
  }
      
  // Fixed capital consumptions
 const fixedCapitalConsumptions = new Aggregate({
    id: "fixedCapitalConsumptions",
    label: metaMainAggregates.fixedCapitalConsumptions.label,
  });
  for (let periodKey of periodKeys) {
    fixedCapitalConsumptions.periodsData[periodKey] = {
      periodKey,
      amount: getAmountItemsForPeriod(
        amortisationExpensesAccounts, 
        periodKey, 
        2),
      footprint: new SocialFootprint()
    }
  }

  // Net value added
  const netValueAdded = new Aggregate({
    id: "netValueAdded",
    label: metaMainAggregates.netValueAdded.label,
  });
  for (let periodKey of periodKeys) {
    netValueAdded.periodsData[periodKey] = {
      periodKey,
      amount: roundValue(
          production.periodsData[periodKey].amount
        - intermediateConsumptions.periodsData[periodKey].amount
        - fixedCapitalConsumptions.periodsData[periodKey].amount
        , 2),
      footprint: new SocialFootprint(),
    }
  };

  // add to financial data
  return({
    production,
    intermediateConsumptions,
    fixedCapitalConsumptions,
    netValueAdded
  });
}

/* ---------------------------------------- MERGING DATA ---------------------------------------- */

export const mergeAggregatesPeriodsData = (current, loaded) => 
{
  // Create a new object and copy the properties from both current and previous objects
  const mergedAggregates = Object.assign({}, current, loaded);
  
  // Loop through each aggregate property in the object and merge the periodsData
  for (let aggregateKey of Object.keys(mergedAggregates)) {
    mergedAggregates[aggregateKey].periodsData = Object.assign(
      current[aggregateKey].periodsData,
      loaded[aggregateKey].periodsData
    );
  }

  return mergedAggregates;
};


/* ---------------------------------------- INTERMEDIATE CONSUMPTIONS AGGREGATES ---------------------------------------- */

/** Aggrégats - Consommations intermédiaires :
 *      601,6091,602,6092                       Achats de matières premières et autres approvisionnements
 *      607,6097                                Achats de marchandises
 *      6037                                    Variation des stocks de marchandises
 *      6031,6032                               Variations de stocks de matières premières et autres approvisionnements
 *      604,6094,605,6095,606,6096,608,6098     Autres achats
 *      61,62                                   Autres charges externes
 * 
 */

const metaIntermediateConsumptionsAggregates = [
  { label: "Matières premières",          regex: "^60(1|91)"                  },
  { label: "Autres approvisionnements",   regex: "^60(2|92)"                  },
  { label: "Marchandises",                regex: "^60(7|97)"                  },
  { label: "Variation des stocks",        regex: "^603"                       },
  { label: "Autres achats",               regex: "^60([4|5|6|8]|9[4|5|6|8])"  },
  { label: "Autres charges externes",     regex: "^6(1|2)"                    }
]

export const buildIntermediateConsumptionsAggregates = async (financialData, availablePeriods) =>
{
  const periodKeys = availablePeriods.map((period) => period.periodKey);
  const expensesAccounts = [
    ...financialData.externalExpensesAccounts,
    ...financialData.stockVariationsAccounts
  ]

  const aggregates = [];

  // build aggregates
  for (const metaAggregate of metaIntermediateConsumptionsAggregates)
  {
    const { label, regex } = metaAggregate;

    // filter accounts
    let accounts = expensesAccounts.filter((account) => new RegExp(regex).test(account.accountNum))
    if (accounts.length>0) 
    {
      // init aggregate
      let aggregate = {
        label: label,
        periodsData: {}
      }
      // build periods data
      for (let periodKey of periodKeys) {
        if (accounts.some(account => account.periodsData.hasOwnProperty(periodKey))) {
          aggregate.periodsData[periodKey] = {
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
          }
        }
      }
      // push
      aggregates.push(aggregate);
    }
  } 

  return aggregates;
}
    
/* ---------------------------------------- FIXED CAPITAL CONSUMPTIONS AGGREGATES ---------------------------------------- */

/** Aggrégats - Consommations de capital fixe :
 *      68111                                   Dotations aux amortissements sur immobilisations incorporelles
 *      68112                                   Dotations aux amortissements sur immobilisations corporelles
 *      6871                                    Dotations aux amortissements exceptionnels des immobilisations
 * 
 */

const metaFixedCapitalConsumptionsAggregates = [
  { label: "Dotations aux amortissements sur immobilisations incorporelles",  regex: "^68111"         },
  { label: "Dotations aux amortissements sur immobilisations corporelles",    regex: "^68112"         },
  { label: "Dotations aux amortissements sur immobilisations",                regex: "^6811[^(1|2)]"  },
  { label: "Dotations aux amortissements exceptionnels des immobilisations",  regex: "^6871"          }
]

export const buildFixedCapitalConsumptionsAggregates = async (financialData, availablePeriods) =>
{
  const periodKeys = availablePeriods.map((period) => period.periodKey);
  const expensesAccounts = financialData.amortisationExpensesAccounts;
  
  const aggregates = [];

  // build aggregates
  for (const metaAggregate of metaFixedCapitalConsumptionsAggregates)
  {
    const { label, regex } = metaAggregate;

    // filter accounts
    let accounts = expensesAccounts.filter((account) => new RegExp(regex).test(account.accountNum))
    if (accounts.length>0) 
    {
      // init aggregate
      let aggregate = {
        label: label,
        periodsData: {}
      }
      // build periods data
      for (let periodKey of periodKeys) {
        if (accounts.some(account => account.periodsData.hasOwnProperty(periodKey))) {
          aggregate.periodsData[periodKey] = {
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
          }
        }
      }
      // push
      aggregates.push(aggregate);
    }
  } 

  return aggregates;
}