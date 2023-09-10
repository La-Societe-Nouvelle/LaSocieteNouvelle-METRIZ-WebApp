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

export const mergeAggregatesPeriodsData = (current, previous) => 
{
  // Create a new object and copy the properties from both current and previous objects
  const mergedAggregates = Object.assign(current, previous);
  
  // Loop through each aggregate property in the object and merge the periodsData
  for (let aggregate in mergedAggregates) {
    mergedAggregates[aggregate].periodsData = Object.assign(
      current[aggregate].periodsData,
      previous[aggregate].periodsData
    );
  }

  return mergedAggregates;
};


/* ---------------------------------------- Aggrégats - Soldes Intermédiaires de Gestion ---------------------------------------- */

/** Aggrégats - Consommations intermédiaires :
 *      607,6097                                Achats de marchandises
 *      6037                                    Variation des stocks de marchandises
 *      601,6091,602,6092                       Achats de matières premières et autres approvisionnements
 *      6031,6032                               Variations de stocks de matières premières et autres approvisionnements
 *      604,6094,605,6095,606,6096,608,6098     Autres achats
 *      61,62                                   Autres charges externes
 * 
 *  Aggrégats - Consommations de capital fixe :
 *      68111                                   Dotations aux amortissements sur immobilisations incorporelles
 *      68112                                   Dotations aux amortissements sur immobilisations corporelles
 *      6871                                    Dotations aux amortissements exceptionnels des immobilisations
 */


export const buildIntermediateConsumptionsAggregates = async (financialData, availablePeriods) =>
{
    let aggregates = [];
    let accounts = [];

    // Achats stockés - Matières premières
    accounts = financialData.externalExpensesAccounts.filter(account => /^60(1|91)/.test(account.accountNum));
    if (accounts.length>0) {
        let aggregate = {
            label: "Matières premières",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    }

    // Achats stockés - Autres approvisionnements
    accounts = financialData.externalExpensesAccounts.filter(account => /^60(2|92)/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Autres approvisionnements",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };
    
    // Achats de marchandises
    accounts = financialData.externalExpensesAccounts.filter(account => /^60(7|97)/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Marchandises",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };

    // Variation des stocks
    accounts = financialData.stockVariationsAccounts.filter(account => /^603/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Variation des stocks",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };

    // Autres achats
    accounts = financialData.externalExpensesAccounts.filter(account => /^60([4|5|6|8]|9[4|5|6|8])/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Autres achats",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };

    // Autres charges externes
    accounts = financialData.externalExpensesAccounts.filter(account => /^6(1|2)/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Autres charges externes",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };  

    return aggregates;
}
    

export const buildFixedCapitalConsumptionsAggregates = async (financialData, availablePeriods) =>
{
    let aggregates = [];
    let accounts = []

    // Dotations aux amortissements sur immobilisations incorporelles
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^68111/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Dotations aux amortissements sur immobilisations incorporelles",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };

    // Dotations aux amortissements sur immobilisations corporelles
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^68112/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Dotations aux amortissements sur immobilisations corporelles",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };

    // Dotations aux amortissements sur immobilisations incorporelles
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^6811[^(1|2)]/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Dotations aux amortissements sur immobilisations",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };

    // Dotations aux amortissements exceptionnels des immobilisations
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^6871/.test(account.accountNum));
    if (accounts.length > 0) {
        let aggregate = {
            label: "Dotations aux amortissements exceptionnels des immobilisations",
            periodsData: {}
        };
        for (let period of availablePeriods) {
            if (accounts.some(account => account.periodsData.hasOwnProperty(period.periodKey))) {
                aggregate.periodsData[period.periodKey] = {
                    amount: getAmountItemsForPeriod(accounts, period.periodKey, 2),
                    footprint: await buildAggregatePeriodFootprint(accounts, period.periodKey)
                }
            }
        };
        aggregates.push(aggregate);
    };       

    return aggregates;
}