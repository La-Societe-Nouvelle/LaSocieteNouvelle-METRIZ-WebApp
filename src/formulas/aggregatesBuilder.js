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

export const buildIntermediateConsumptionsAggregates = async (financialData, periodKey) =>
{
    let aggregates = [];
    let accounts = [];

    // Achats stockés - Matières premières
    accounts = financialData.externalExpensesAccounts.filter(account => /^60(1|91)/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Matières premières",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };

    // Achats stockés - Autres approvisionnements
    accounts = financialData.externalExpensesAccounts.filter(account => /^60(2|92)/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Autres approvisionnements",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };
    
    // Achats de marchandises
    accounts = financialData.externalExpensesAccounts.filter(account => /^60(7|97)/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Marchandises",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };

    // Variation des stocks
    accounts = financialData.stockVariationsAccounts.filter(account => /^603/.test(account.accountNum));
    console.log(accounts);
    if (accounts.length > 0) {
        aggregates.push({
            label: "Variation des stocks",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };

    // Autres achats
    accounts = financialData.externalExpensesAccounts.filter(account => /^60([4|5|6|8]|9[4|5|6|8])/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Autres achats",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };

    // Autres charges externes
    accounts = financialData.externalExpensesAccounts.filter(account => /^6(1|2)/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Autres charges externes",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };  

    return aggregates;
}
    

export const buildFixedCapitalConsumptionsAggregates = async (financialData, periodKey) =>
{
    let aggregates = [];
    let accounts = []

    // Dotations aux amortissements sur immobilisations incorporelles
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^68111/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Dotations aux amortissements sur immobilisations incorporelles",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };

    // Dotations aux amortissements sur immobilisations corporelles
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^68112/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Dotations aux amortissements sur immobilisations corporelles",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };

    // Dotations aux amortissements sur immobilisations incorporelles
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^6811[^(1|2)]/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Dotations aux amortissements sur immobilisations",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };

    // Dotations aux amortissements exceptionnels des immobilisations
    accounts = financialData.amortisationExpensesAccounts.filter(account => /^6871/.test(account.accountNum));
    if (accounts.length > 0) {
        aggregates.push({
            label: "Dotations aux amortissements exceptionnels des immobilisations",
            amount: getAmountItemsForPeriod(accounts, periodKey, 2),
            footprint: await buildAggregatePeriodFootprint(accounts, periodKey)
        });
    };       

    return aggregates;
}