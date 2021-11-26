// La Société Nouvelle

// Components
import { Indicator } from '/src/footprintObjects/Indicator';

/* ------------------------------------------------------------ */
/* -------------------- FOOTPRINT FORMULAS -------------------- */
/* ------------------------------------------------------------ */


export function buildIndicatorAggregate(indic,elements,usePrev) 
{
    let indicator = new Indicator({indic});
    
    let totalAmount = 0.0;
    let grossImpact = 0.0;
    let grossImpactMax = 0.0;
    let grossImpactMin = 0.0;

    let missingData = false;
    
    elements.forEach((element) => 
    {
        let amount = usePrev ? element.prevAmount : element.amount;
        let indicatorElement = usePrev ? element.prevFootprint.indicators[indic] : element.footprint.indicators[indic];

        if (amount!=null && indicatorElement.getValue()!=null) 
        {
            grossImpact+= indicatorElement.getValue()*amount;
            grossImpactMax+= Math.max(indicatorElement.getValueMax()*amount,indicatorElement.getValueMin()*amount);
            grossImpactMin+= Math.min(indicatorElement.getValueMax()*amount,indicatorElement.getValueMin()*amount);
            totalAmount+= amount;
        } 
        else {missingData = true}
    })

    if (!missingData && totalAmount != 0) { 
        indicator.setValue(grossImpact/totalAmount);
        let uncertainty = Math.abs(grossImpact) > 0 ? Math.max( Math.abs(grossImpactMax-grossImpact) , Math.abs(grossImpact-grossImpactMin) )/Math.abs(grossImpact) *100 : 0;
        indicator.setUncertainty(uncertainty);
    } else if (elements.length == 0) {
        indicator.setValue(0); 
        indicator.setUncertainty(0);
    } else {
        indicator.setValue(null); 
        indicator.setUncertainty(null);
    }

    return indicator;
}

export function buildIndicatorMerge(indicatorA,amountA,
                                    indicatorB,amountB)
{
    let indicator = new Indicator({indic: indicatorA.getIndic()});

    if (indicatorA.getValue()!=null && amountA!=null
     && indicatorB.getValue()!=null && amountB!=null)
    {
        let totalAmount = amountA + amountB;
        let grossImpact = indicatorA.getValue()*amountA + indicatorB.getValue()*amountB;
        let grossImpactMax = Math.max(indicatorA.getValueMax()*amountA, indicatorA.getValueMin()*amountA) 
                           + Math.max(indicatorB.getValueMax()*amountB, indicatorB.getValueMin()*amountB);
        let grossImpactMin = Math.min(indicatorA.getValueMax()*amountA, indicatorA.getValueMin()*amountA)
                           + Math.min(indicatorB.getValueMax()*amountB, indicatorB.getValueMin()*amountB);

        if (totalAmount != 0) {
            indicator.setValue(grossImpact/totalAmount);
            let uncertainty = Math.abs(grossImpact) > 0 ? Math.max( Math.abs(grossImpactMax-grossImpact) , Math.abs(grossImpact-grossImpactMin) )/Math.abs(grossImpact) *100 : 0;
            indicator.setUncertainty(uncertainty);
        } else {
            indicator.setValue(null); 
            indicator.setUncertainty(null);
        }
    }
     
    return indicator;
}

/* ----------------------------------------------------------------------------- */
/* -------------------- FINANCIAL ITEMS INDICATORS FORMULAS -------------------- */
/* ----------------------------------------------------------------------------- */

/* ----- Empreintes des charges externes ----- */

// Affectation de l'empreinte du fournisseur (compte auxiliaire)

export const updateExternalExpensesIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.expenses.map(async (expense) => 
  {
    // fetch company
    let company = financialData.getCompanyByAccount(expense.accountAux);
    // assign indicator
    expense.footprint.indicators[indic] = company.footprint.indicators[indic];
    return;
  }));
  return;
}

/* ----- Empreintes des comptes de charges externes ----- */

// Agrégation des dépenses rattachées au compte

export const updateExternalExpensesAccountsIndicator = async (indic,financialData) =>
{
    await Promise.all(financialData.expenseAccounts.filter(account => /^6(0[^3]|1|2)/.test(account.accountNum))
                                                   .map(async ({accountNum,footprint}) => 
    {
        // filter expenses
        let expenses = financialData.expenses.filter(expense => expense.account == accountNum);
        // control uncertainty
        expenses.filter(expense => expense.amount < 0)
                .filter(expense => expenses.filter(item => item.amount > 0 && item.company == expense.company).length > 0)
                .forEach(expense => expense.footprint.indicators[indic].uncertainty = 0);
        // build indicator
        footprint.indicators[indic] = await buildIndicatorAggregate(indic,expenses);
        return;
    }));
    return;
}

/* ----- Empreinte des stocks d'achats ----- */

// Agrégation des comptes de charges rattachés au compte de stock

export const updatePurchasesStocksIndicator = async (indic,financialData) =>
{
  let stocks = financialData.stocks.filter(stock => !stock.isProductionStock);
  await Promise.all(stocks.map(async (stock) =>
  {
    let expensesRelatedToStock = getAccountsRelatedToStock(stock,financialData.expenseAccounts);
    if (expensesRelatedToStock.length > 0) stock.footprint.indicators[indic] = await buildIndicatorAggregate(indic, expensesRelatedToStock);
    else                                   stock.footprint.indicators[indic] = stock.prevFootprint.indicators[indic];
    return;
  }));
  return;
}

const getAccountsRelatedToStock = (stock,accounts) =>
{
  let accountsRelatedToStock = accounts.filter(account => account.accountNum.startsWith(stock.accountAux));
  // case - no expenses related to stock
  if (accountsRelatedToStock.length == 0) accountsRelatedToStock = expenses.filter(expense => expense.account.startsWith("60"+stock.account.charAt(1)));
  return accountsRelatedToStock;
}

/* ----- Empreinte des variations de stocks d'achats ----- */

// stock variation footprint is based on initial & final footprint of the stock account
// VS = SI - SF
// stock account appears in only one stock variation item

export const updatePurchasesStocksVariationsIndicator = async (indic,financialData) =>
{
  let stocksVariations = financialData.stockVariations.filter(stockVariation => /^6/.test(stockVariation.account));
  await Promise.all(stocksVariations.map(async (stockVariation) =>
  {
    let stock = financialData.getStockByAccount(stockVariation.accountAux);
    stockVariation.footprint.indicators[indic] = await buildIndicatorMerge(stock.prevFootprint.indicators[indic], stock.prevAmount,
                                                                           stock.footprint.indicators[indic], -stock.amount);
    return;
  }));
  return;
}

/* ----- Empreinte des comptes de variations de stocks d'achats ----- */

// stock variation footprint is based on initial & final footprint of the stock account

export const updatePurchasesStocksVariationsAccountsIndicator = async (indic,financialData) =>
{
    await Promise.all(financialData.expenseAccounts.filter(account => /^603/.test(account.accountNum))
                                                   .map(async ({accountNum,footprint}) => 
    {
        // filter expenses
        let stockVariations = financialData.stockVariations.filter(variation => variation.account == accountNum);
        // build indicator
        footprint.indicators[indic] = await buildIndicatorAggregate(indic,stockVariations);
        return;
    }));
    return;
}

/* ----- Investments footprints ----- */

// company footprint is assign to the investment

export const updateInvestmentsIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.investments.map(async (investment) => 
  {
    // fetch company
    let company = financialData.getCompanyByAccount(investment.accountAux);
    // assign indicator
    investment.footprint.indicators[indic] = company.footprint.indicators[indic];
    return;
  }));
  return;
}

/* ----- Depreciation expenses footprints ----- */

// footprint based on immobilisation footprint (before immobilised production) & previous depreciation footprint
/** Formules :
 *    Empreinte sociétale du reste à ammortir du compte d'immobilisation.
 *    Les investissements réalisés sur l'exercice sont pris en compte. La production immobilisée est exclue (empreinte dépendante de la production).
 *  3 étapes :
 *    - Empreinte des investissements réalisés sur l'exercice
 *    - Empreinte du compte d'immobilisation (hors production immobilisée)
 *    - Déduction de l'empreinte du compte d'amortissement
 */

export const updateDepreciationExpensesIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.depreciationExpenses.map(async (expense) =>
  {
    let depreciation = financialData.getDepreciationByAccount(expense.accountAux);
    let immobilisation = financialData.getImmobilisationByAccount(depreciation.accountAux);

    // Indicator of immobilisation before immobilised production
    let investments = financialData.investments.filter(investment => investment.account == immobilisation.account);
    let investmentsIndicator = await buildIndicatorAggregate(indic,investments);

    let amountInvestments = investments.map(investment => investment.amount)
                                       .reduce((a,b) => a+b,0);
    let amountImmobilisedProduction = financialData.immobilisationProductions.filter(immobilisationProduction => immobilisationProduction.account == immobilisation.account)
                                                                             .map(immobilisationProduction => immobilisationProduction.amount)
                                                                             .reduce((a,b) => a+b,0);
    
    let immobilisationIndicator = investments.length > 0 ? await buildIndicatorMerge(immobilisation.prevFootprint.indicators[indic], immobilisation.amount-amountInvestments-amountImmobilisedProduction,
                                                                                     investmentsIndicator, amountInvestments) 
                                                         : immobilisation.prevFootprint.indicators[indic];
    // Footprint (reste à amortir)
    expense.footprint.indicators[indic] = await buildIndicatorMerge(immobilisationIndicator, immobilisation.amount-amountImmobilisedProduction,
                                                                    depreciation.prevFootprint.indicators[indic], -(depreciation.amount-expense.amount));
    // Le calcul de l'incertitude peut entraîner des résultats erronés, les valeurs étant supposées décorrélées et l'impact brut restant à amortir pouvant être faible
    // L'incertitude associée est donc celle de la valeur associée à l'immobilisation
    expense.footprint.indicators[indic].setUncertainty(immobilisationIndicator.getUncertainty());
    return;
  }));
  return;
}

/* ----- Immoblisations footprints ----- */

/** Empreinte déduite à partir de l'empreinte initiale, des investissements et des immobilisations de production
 *  2 étapes :
 *    - Calcul de l'empreinte des investissements, et association à l'empreinte initiale
 *    - Calcul de l'empreinte des immobilisations de production, et association à l'empreinte précédement obtenue (intiale + investissements)
 */

export const updateImmobilisationsIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.immobilisations.map(async (immobilisation) => 
  {
    // Investments
    let investments = financialData.investments.filter(investment => investment.account == immobilisation.account);
    let amountInvestments = investments.map(investment => investment.amount)
                                       .reduce((a,b) => a+b,0);
    // Immobilised production
    let immobilisedProductions = financialData.immobilisationProductions.filter(immobilisationProduction => immobilisationProduction.account == immobilisation.account);
    let amountImmobilisedProduction = immobilisedProductions.map(immobilisationProduction => immobilisationProduction.amount)
                                                            .reduce((a,b) => a+b,0);
    
    // Merge investments indicator
    let investmentsIndicator = await buildIndicatorAggregate(indic,investments);
    let immobilisationIndicator = investments.length > 0 ? await buildIndicatorMerge(immobilisation.prevFootprint.indicators[indic], immobilisation.amount-amountInvestments-amountImmobilisedProduction,
                                                                                     investmentsIndicator, amountInvestments) 
                                                         : immobilisation.prevFootprint.indicators[indic];
    // Merge immobilised productions indicator
    let immobilisationProductionsIndicator = await buildIndicatorAggregate(indic,immobilisedProductions);
    immobilisationIndicator = immobilisedProductions.length > 0 ? await buildIndicatorMerge(immobilisationIndicator, immobilisation.amount-amountImmobilisedProduction,
                                                                                            immobilisationProductionsIndicator, amountImmobilisedProduction) 
                                                                : immobilisation.prevFootprint.indicators[indic];

    // Assign indicator
    immobilisation.footprint.indicators[indic] = immobilisationIndicator;
    return;
  }));
  return;
}

/* ----- Depreciations footprints ----- */

/** Empreinte déduite à partir de l'empreinte initiale et des dotations aux amortissements
 */

export const updateDepreciationsIndicator = async (indic,financialData) =>
{
  await Promise.all(financialData.depreciations.map(async (depreciation) => 
  {
    // Depreciation expenses
    let depreciationExpense = financialData.getDepreciationExpenseByAccountAux(depreciation.account);
    // Merge if expense defined
    depreciation.footprint.indicators[indic] = depreciationExpense!=undefined ? await buildIndicatorMerge(depreciation.prevFootprint.indicators[indic], depreciation.amount-depreciationExpense.amount,
                                                                                                          depreciationExpense.footprint.indicators[indic], depreciationExpense.amount)
                                                                              : depreciation.prevFootprint.indicators[indic];
    return;
  }));
  return;
}


/* ----------------------------------------------------------------------------- */
/* -------------------- NET VALUE ADDED INDICATORS FORMULAS -------------------- */
/* ----------------------------------------------------------------------------- */


export function buildNetValueAddedIndicator(indic,impactsData)
{
    let indicator = new Indicator({indic});
    switch(indic)
    {
        case "art": buildValueART(indicator,impactsData); break;
        case "dis": buildValueDIS(indicator,impactsData); break;
        case "eco": buildValueECO(indicator,impactsData); break;
        case "geq": buildValueGEQ(indicator,impactsData); break;
        case "ghg": buildValueGHG(indicator,impactsData); break;
        case "haz": buildValueHAZ(indicator,impactsData); break;
        case "knw": buildValueKNW(indicator,impactsData); break;
        case "mat": buildValueMAT(indicator,impactsData); break;
        case "nrg": buildValueNRG(indicator,impactsData); break;
        case "soc": buildValueSOC(indicator,impactsData); break;
        case "was": buildValueWAS(indicator,impactsData); break;
        case "wat": buildValueWAT(indicator,impactsData); break;
    }
    return indicator; 
}

const buildValueART = (indicator,impactsData) => 
{
    if (impactsData.craftedProduction!=null) {
        indicator.setValue(impactsData.craftedProduction/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const buildValueDIS = (indicator,impactsData) => 
{
    if (impactsData.indexGini!=null) {
        indicator.setValue(impactsData.indexGini);
        indicator.setUncertainty(0);
    }
}

const buildValueECO = (indicator,impactsData) => 
{
    if (impactsData.domesticProduction!=null) {
        indicator.setValue(impactsData.domesticProduction/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const buildValueGEQ = (indicator,impactsData) => 
{
    if (impactsData.wageGap!=null) {
        indicator.setValue(impactsData.wageGap);
        indicator.setUncertainty(0);
    }
}

const buildValueGHG = (indicator,impactsData) => 
{
    if (impactsData.greenhousesGazEmissions!=null) {
        indicator.setValue(impactsData.greenhousesGazEmissions/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.greenhousesGazEmissionsUncertainty);
    }
}

const buildValueHAZ = (indicator,impactsData) => 
{
    if (impactsData.hazardousSubstancesConsumption!=null) {
        indicator.setValue(impactsData.hazardousSubstancesConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.hazardousSubstancesConsumptionUncertainty);
    }
}

const buildValueKNW = (indicator,impactsData) => 
{
    if (impactsData.researchAndTrainingContribution!=null) {
        indicator.setValue(impactsData.researchAndTrainingContribution/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const buildValueMAT = (indicator,impactsData) => 
{
    if (impactsData.materialsExtraction!=null) {
        indicator.setValue(impactsData.materialsExtraction/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.materialsExtractionUncertainty);
    }
}

const buildValueNRG = (indicator,impactsData) => 
{
    if (impactsData.energyConsumption!=null) {
        indicator.setValue(impactsData.energyConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.energyConsumptionUncertainty);
    }
}

const buildValueSOC = (indicator,impactsData) => 
{
    if (impactsData.hasSocialPurpose!=null) {
        indicator.setValue(impactsData.hasSocialPurpose ? 100 : 0);
        indicator.setUncertainty(0);
    }
}

const buildValueWAS = (indicator,impactsData) => 
{
    if (impactsData.wasteProduction!=null) {
        indicator.setValue(impactsData.wasteProduction/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.wasteProductionUncertainty);
    }
}

const buildValueWAT = (indicator,impactsData) => 
{
    if (impactsData.waterConsumption!=null) {
        indicator.setValue(impactsData.waterConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.waterConsumptionUncertainty);
    }
}