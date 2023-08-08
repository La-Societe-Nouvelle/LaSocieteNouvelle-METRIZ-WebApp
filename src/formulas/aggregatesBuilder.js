// La Société Nouvelle

import { getAmountItemsForPeriod } from "../utils/Utils";
import { buildAggregatePeriodFootprint } from "./footprintFormulas";

/* ---------------------------------------------------------------------------------------------------- */
/* ---------------------------------------- AGGREGATES BUILDER ---------------------------------------- */
/* ---------------------------------------------------------------------------------------------------- */

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