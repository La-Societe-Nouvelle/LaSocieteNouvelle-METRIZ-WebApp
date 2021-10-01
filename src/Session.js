
// Components
import { LegalUnit } from '/src/LegalUnit.js';
import { FinancialData } from '/src/FinancialData.js';
import { ImpactsData } from '/src/ImpactsData.js';

import { SocialFootprint } from '/src/footprintObjects/SocialFootprint.js';
import { Indicator } from '/src/footprintObjects/Indicator';

// Libraries
import indics from '../lib/indics.json';

/* ---------- OBJECT SESSION ---------- */

export class Session {

    constructor(props) 
    {
        if (props==undefined) props = {};
    // ---------------------------------------------------------------------------------------------------- //
        // Data
        this.legalUnit = new LegalUnit(props.legalUnit);
        this.financialData = new FinancialData(props.financialData);
        this.impactsData = new ImpactsData(props.impactsData);
        
        // Footprints
        this.revenueFootprint = new SocialFootprint(props.revenueFootprint);
        this.productionFootprint = new SocialFootprint(props.productionFootprint);
        this.productionStocksVariationsFootprint = new SocialFootprint(props.productionStocksVariationsFootprint);
                
        this.intermediateConsumptionFootprint = new SocialFootprint(props.intermediateConsumptionFootprint);
        this.purchasesStocksVariationsFootprint = new SocialFootprint(props.purchasesStocksVariationsFootprint);
        this.expensesFootprint = new SocialFootprint(props.expensesFootprint);

        this.grossValueAddedFootprint = new SocialFootprint(props.grossValueAddedFootprint);
        this.depreciationExpensesFootprint = new SocialFootprint(props.depreciationExpensesFootprint);

        this.netValueAddedFootprint = new SocialFootprint(props.netValueAddedFootprint);

        // Validations
        this.validations = props.validations || Object.keys(indics).map((indic) => {return({[indic]: false})});
    // ---------------------------------------------------------------------------------------------------- //
    }

    /* -------------------- GETTERS -------------------- */

    /* ---------- GENERAL ---------- */

    getLibelle = () => this.libelle;
    getUniteLegale = () => this.legalUnit;
    getFinancialData = () => this.financialData;
    getImpactsData = () => this.impactsData;

    /* ---------- FOOTPRINTS ---------- */

    // Production
    getRevenueFootprint = () => this.revenueFootprint;
    getProductionStockVariationsFootprint = () => this.productionStocksVariationsFootprint;
    getProductionFootprint = () => this.productionFootprint;

    // Expenses
    getIntermediateConsumptionFootprint = () => this.intermediateConsumptionFootprint;
    getPurchasesStocksVariationsFootprint = () => this.purchasesStocksVariationsFootprint;
    getExpensesFootprint = () => this.expensesFootprint;

    // Gross Value Added
    getGrossValueAddedFootprint = () => this.grossValueAddedFootprint;
    getDepreciationsFootprint = () => this.depreciationExpensesFootprint;

    // Net Value Added
    getNetValueAddedFootprint = () => this.netValueAddedFootprint;
    
    /* ---------------------------------------- FOOTPRINTS PROCESS ---------------------------------------- */

    // Footprints are stored in variables to avoid processing multiple times when render the results
    // ... and allows to have all the values directly in the json back up file

    async updateFootprints() 
    {
        console.log("update footprints")
        await Promise.all(Object.keys(indics)
                                .map((indic) => this.updateIndicator(indic)))
    }

    /* -------------------- PRODUCTION -------------------- */

    /* ----- AVAILABLE PRODUCTION ----- */

    async updateIndicator(indic) 
    {
        await this.updateFinancialItemsFootprints(indic);
        await this.updateAggregatesFootprints(indic);
        await this.updateProductionFootprints(indic);
        return;
    }

    /* -------------------- PRODUCTION FOOTPRINTS -------------------- */

    updateProductionFootprints = async (indic) =>
    {       
        // Current production
        this.productionFootprint.indicators[indic] = await buildIndicatorMerge(
            this.intermediateConsumptionFootprint.indicators[indic], this.financialData.getAmountIntermediateConsumption(),
            this.grossValueAddedFootprint.indicators[indic], this.financialData.getGrossValueAdded())

        // Production stocks (items)
        let productionStocks = this.financialData.stocks.filter(stock => stock.isProductionStock);
        productionStocks.forEach(stock => {
            stock.footprint.indicators[indic] = this.productionFootprint.indicators[indic];
            if (stock.initialState=="currentFootprint") stock.prevFootprint.indicators[indic] = stock.footprint.indicators[indic];
        })

        // Production stock variations (items)
        let productionStockVariations = this.financialData.stockVariations.filter(stockVariation => stockVariation.account.charAt(0) == "7");
        await Promise.all(productionStockVariations.map(async (stockVariation) => {
            let stock = this.financialData.getStockByAccount(stockVariation.accountAux);
            stockVariation.footprint.indicators[indic] = await buildIndicatorMerge(
                stock.prevFootprint.indicators[indic], stock.prevAmount,
                stock.footprint.indicators[indic], -stock.amount);
            return;
        }));

        // stock variation and revenue footprints
        if (productionStockVariations.length > 0) {
            this.productionStocksVariationsFootprint.indicators[indic] = await buildIndicatorAggregate(indic,productionStockVariations);
            this.revenueFootprint.indicators[indic] = await buildIndicatorMerge(
                this.productionFootprint.indicators[indic], this.financialData.getProduction(),
                this.productionStocksVariationsFootprint.indicators[indic], this.financialData.getAmountProductionStockVariations())
        } else {
            this.revenueFootprint.indicators[indic] = this.productionFootprint.indicators[indic];
        }
        return;
    }

    /* -------------------- AGGREGATES FOOTPRINTS -------------------- */

    updateAggregatesFootprints = async (indic) =>
    {
        // Net value added
        await this.updateValueAddedFootprint(indic);

        // Dépreciation expenses
        this.depreciationExpensesFootprint.indicators[indic] = await buildIndicatorAggregate(indic, this.financialData.depreciationExpenses)

        // Gross value added
        this.grossValueAddedFootprint.indicators[indic] = await buildIndicatorMerge(
            this.netValueAddedFootprint.indicators[indic], this.financialData.getNetValueAdded(),
            this.depreciationExpensesFootprint.indicators[indic], this.financialData.getAmountDepreciationExpenses())

        // External expenses
        this.expensesFootprint.indicators[indic] = await buildIndicatorAggregate(indic,this.financialData.expenses);

        // Purchasing stock Variations
        let purchasingStockVariations = this.financialData.stockVariations.filter(stockVariation => stockVariation.account.charAt(0) == "6");
        this.purchasesStocksVariationsFootprint.indicators[indic] = await buildIndicatorAggregate(indic,purchasingStockVariations);
        
        // Intermediate consumption
        if (purchasingStockVariations > 0) {
            this.intermediateConsumptionFootprint.indicators[indic] = await buildIndicatorMerge(
                this.expensesFootprint.indicators[indic], this.financialData.getAmountExternalExpenses(),
                this.purchasesStocksVariationsFootprint.indicators[indic], this.financialData.getVariationPurchasesStocks())
        } else {
            this.intermediateConsumptionFootprint.indicators[indic] = this.expensesFootprint.indicators[indic];
        }
        return;
    }
    
    /* -------------------- FINANCIAL ITEMS FOOTPRINTS -------------------- */

    updateFinancialItemsFootprints = async (indic) =>
    {
        // External expenses & Investments
        await Promise.all(this.financialData.expenses.concat(this.financialData.investments)
                                                     .map(async (expense) => 
        {
            let company = this.financialData.getCompanyByAccount(expense.accountAux);
            expense.footprint.indicators[indic] = company.footprint.indicators[indic];
            return;
        }));

        // Purchasing stocks & variations
        await Promise.all(this.financialData.stockVariations.filter(stockVariation => stockVariation.account.charAt(0) == "6")
                                                            .map(async (stockVariation) => 
        {
            let stock = this.financialData.getStockByAccount(stockVariation.accountAux);
            
            if (this.financialData.expenses.filter(expense => expense.account==stock.accountAux).length > 0) {
                stock.footprint.indicators[indic] = await this.getExpensesAccountIndicator(stock.accountAux,indic);
            } else if (this.financialData.expenses.filter(expense => expense.account.substring(0,2)=="60").length > 0) {
                stock.footprint.indicators[indic] = await this.getExpensesAccountIndicator("60",indic);
            } else {
                stock.footprint.indicators[indic] = this.expensesFootprint.indicators[indic];
            }

            if (stock.initialState=="currentFootprint") stock.prevFootprint.indicators[indic] = stock.footprint.indicators[indic];

            stockVariation.footprint.indicators[indic] = await buildIndicatorMerge(
                stock.prevFootprint.indicators[indic], stock.prevAmount,
                stock.footprint.indicators[indic], -stock.amount);
            return;
        }));

        // Immobilisations
        await Promise.all(this.financialData.immobilisations.filter(immobilisation => immobilisation.isDepreciableImmobilisation)
                                                            .map(async (immobilisation) => 
            {
                let investments = this.financialData.investments.filter(investment => investment.account == immobilisation.account); 
                if (investments.length > 0) {
                    let indicatorInvestments = await buildIndicatorAggregate(indic, investments);
                    let amountInvestments = investments.map(investment => investment.amount).reduce((a, b) => a + b, 0);
                    
                    if (immobilisation.initialState=="currentFootprint") immobilisation.prevFootprint.indicators[indic] = indicatorInvestments;
                    
                    immobilisation.footprint.indicators[indic] = await buildIndicatorMerge(
                        immobilisation.prevFootprint.indicators[indic], immobilisation.prevAmount,
                        indicatorInvestments, amountInvestments);
                } else {
                    immobilisation.footprint.indicators[indic] = immobilisation.prevFootprint.indicators[indic];
                }
                return;
            }));

        // Depreciations & Depreciation expenses
        await Promise.all(this.financialData.depreciationExpenses.map(async (expense) => 
        {
            let depreciation = this.financialData.getDepreciationByAccount(expense.accountAux);
            let immobilisation = this.financialData.getImmobilisationByAccount(depreciation.accountAux);

            if (depreciation.initialState=="currentFootprint") depreciation.prevFootprint.indicators[indic] = immobilisation.footprint.indicators[indic];
            
            expense.footprint.indicators[indic] = await buildIndicatorMerge(
                immobilisation.footprint.indicators[indic], immobilisation.amount,
                depreciation.prevFootprint.indicators[indic], -depreciation.prevAmount)
            
            let amountDepreciationExpenses = this.financialData.getAmountDepreciationExpensesByAccountAux(depreciation.account);
            depreciation.footprint.indicators[indic] = await buildIndicatorMerge(
                depreciation.prevFootprint.indicators[indic], depreciation.prevAmount,
                expense.footprint.indicators[indic], amountDepreciationExpenses);
            return;
        }));

        return;
    }

    /* -------------------- NET VALUE ADDED FOOTPRINT -------------------- */

    updateValueAddedFootprint = async (indic) =>
    {
        const netValueAdded = this.financialData.getNetValueAdded();
        if (netValueAdded!=null)
        {
            const impactsData = this.impactsData;
            impactsData.setNetValueAdded(netValueAdded);
            switch(indic)
            {
                case "art": /* ----- ART ----- */

                    if (impactsData.craftedProduction!=null) {
                        this.netValueAddedFootprint.getIndicator("art").setValue(impactsData.craftedProduction/netValueAdded *100);
                        this.netValueAddedFootprint.getIndicator("art").setUncertainty(0);
                    }
                    else { this.netValueAddedFootprint.getIndicator("art").setValue(null) } 
                    break;
            
                case "dis": /* ----- DIS ----- */
                    
                    if (impactsData.indexGini!=null) {
                        this.netValueAddedFootprint.getIndicator("dis").setValue(impactsData.indexGini);
                        this.netValueAddedFootprint.getIndicator("dis").setUncertainty(0);
                    }
                    else { this.netValueAddedFootprint.getIndicator("dis").setValue(null) } 
                    break;
                    
                case "eco": /* ----- ECO ----- */
                    
                    if (impactsData.domesticProduction!=null) {
                        this.netValueAddedFootprint.getIndicator("eco").setValue(impactsData.domesticProduction/netValueAdded *100);
                        this.netValueAddedFootprint.getIndicator("eco").setUncertainty(0);
                    }
                    else { this.netValueAddedFootprint.getIndicator("eco").setValue(null) } 
                    break;
                    
                case "geq": /* ----- GEQ ----- */
                    
                    if (impactsData.wageGap!=null) {
                        this.netValueAddedFootprint.getIndicator("geq").setValue(impactsData.wageGap);
                        this.netValueAddedFootprint.getIndicator("geq").setUncertainty(0);
                    }
                    else { this.netValueAddedFootprint.getIndicator("geq").setValue(null) } 
                    break;

                case "ghg": /* ----- GHG ----- */

                    if (impactsData.greenhousesGazEmissions!=null) {
                        this.netValueAddedFootprint.getIndicator("ghg").setValue(impactsData.greenhousesGazEmissions/netValueAdded *1000);
                        this.netValueAddedFootprint.getIndicator("ghg").setUncertainty(impactsData.greenhousesGazEmissionsUncertainty);
                    }
                    else { this.netValueAddedFootprint.getIndicator("ghg").setValue(null) } 
                    break;

                case "haz": /* ----- HAZ ----- */

                    if (impactsData.hazardousSubstancesConsumption!=null) {
                        this.netValueAddedFootprint.getIndicator("haz").setValue(impactsData.hazardousSubstancesConsumption/netValueAdded *1000);
                        this.netValueAddedFootprint.getIndicator("haz").setUncertainty(impactsData.hazardousSubstancesConsumptionUncertainty);
                    }
                    else { this.netValueAddedFootprint.getIndicator("haz").setValue(null) } 
                    break;

                case "knw": /* ----- KNW ----- */

                    if (impactsData.researchAndTrainingContribution!=null) {
                        this.netValueAddedFootprint.getIndicator("knw").setValue(impactsData.researchAndTrainingContribution/netValueAdded *100);
                        this.netValueAddedFootprint.getIndicator("knw").setUncertainty(0);
                    }
                    else { this.netValueAddedFootprint.getIndicator("knw").setValue(null) } 
                    break;

                case "mat": /* ----- MAT ----- */

                    if (impactsData.materialsExtraction!=null) {
                        this.netValueAddedFootprint.getIndicator("mat").setValue(impactsData.materialsExtraction/netValueAdded *1000);
                        this.netValueAddedFootprint.getIndicator("mat").setUncertainty(impactsData.materialsExtractionUncertainty);
                    }
                    else { this.netValueAddedFootprint.getIndicator("mat").setValue(null) } 
                    break;

                case "nrg": /* ----- NRG ----- */

                    if (impactsData.energyConsumption!=null) {
                        this.netValueAddedFootprint.getIndicator("nrg").setValue(impactsData.energyConsumption/netValueAdded *1000);
                        this.netValueAddedFootprint.getIndicator("nrg").setUncertainty(impactsData.energyConsumptionUncertainty);
                    }
                    else { this.netValueAddedFootprint.getIndicator("nrg").setValue(null) } 
                    break;

                case "soc": /* ----- SOC ----- */

                    if (impactsData.hasSocialPurpose!=null) {
                        this.netValueAddedFootprint.getIndicator("soc").setValue(impactsData.hasSocialPurpose ? 100 : 0);
                        this.netValueAddedFootprint.getIndicator("soc").setUncertainty(0);
                    }
                    else { this.netValueAddedFootprint.getIndicator("soc").setValue(null) } 
                    break;

                case "was": /* ----- WAS ----- */

                    if (impactsData.wasteProduction!=null) {
                        this.netValueAddedFootprint.getIndicator("was").setValue(impactsData.wasteProduction/netValueAdded *1000);
                        this.netValueAddedFootprint.getIndicator("was").setUncertainty(impactsData.wasteProductionUncertainty);
                    }
                    else { this.netValueAddedFootprint.getIndicator("was").setValue(null) } 
                    break;

                case "wat": /* ----- WAT ----- */

                    if (impactsData.waterConsumption!=null) {
                        this.netValueAddedFootprint.getIndicator("wat").setValue(impactsData.waterConsumption/netValueAdded *1000);
                        this.netValueAddedFootprint.getIndicator("wat").setUncertainty(impactsData.waterConsumptionUncertainty);
                    }
                    else { this.netValueAddedFootprint.getIndicator("wat").setValue(null) } 
                    break;
            }
        }

        else { this.netValueAddedFootprint.getIndicator(indic).setValue(null) } 
    }

    /* ---------- ACCOUNTS ---------- */

    getExpensesAccountIndicator(accountPurchases,indic) 
    {
        return buildIndicatorAggregate(indic, this.financialData.expenses.filter(expense => expense.account.substring(0,accountPurchases.length)==accountPurchases))
    }

    getDepreciationsAccountIndicator(account,indic) 
    {
        return buildIndicatorAggregate(indic, this.financialData.depreciationExpenses.filter(expense => expense.account.substring(0,account.length) == account))
    }

    
}

/* ------------------------------------------------------------- */
/* -------------------- FOOTPRINTS FORMULAS -------------------- */
/* ------------------------------------------------------------- */


function buildIndicatorAggregate(indic,elements,usePrev) 
{
    let indicator = new Indicator({indic: indic});
    
    let totalAmount = 0.0;
    let absolute = 0.0;
    let absoluteMax = 0.0;
    let absoluteMin = 0.0;

    let missingData = false;
    
    elements.forEach((element) => 
    {
        let amount = usePrev ? element.prevAmount : element.amount;
        let indicatorElement = usePrev ? element.prevFootprint.indicators[indic] : element.footprint.indicators[indic];

        if (amount!=null && indicatorElement.getValue()!=null) 
        {
            absolute+= indicatorElement.getValue()*amount;
            absoluteMax+= indicatorElement.getValueMax()*amount;
            absoluteMin+= indicatorElement.getValueMin()*amount;
            totalAmount+= amount;
        } 
        else {missingData = true}
    })

    if (!missingData && totalAmount != 0) { 
        indicator.setValue(absolute/totalAmount);
        let uncertainty = Math.abs(absolute) > 0 ? Math.max( Math.abs(absoluteMax-absolute) , Math.abs(absolute-absoluteMin) )/Math.abs(absolute) *100 : 0;
        indicator.setUncertainty(uncertainty);
    } else {
        indicator.setValue(null); 
        indicator.setUncertainty(null);
    }

    return indicator;
}

function buildIndicatorMerge(indicatorA,amountA,
                             indicatorB,amountB)
{
    let indicator = new Indicator({indic: indicatorA.getIndic()});

    if (indicatorA.getValue()!=null && amountA!=null
     && indicatorB.getValue()!=null && amountB!=null)
    {
        let totalAmount = amountA + amountB;
        let absolute = indicatorA.getValue()*amountA + indicatorB.getValue()*amountB;
        let absoluteMax = indicatorA.getValueMax()*amountA + indicatorB.getValueMax()*amountB;
        let absoluteMin = indicatorA.getValueMin()*amountA + indicatorB.getValueMin()*amountB;

        if (totalAmount != 0) {
            indicator.setValue(absolute/totalAmount);
            let uncertainty = absolute > 0 ? Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100 : 0;
            indicator.setUncertainty(uncertainty);
        } else {
            indicator.setValue(null); 
            indicator.setUncertainty(null);
        }
    }
     
    return indicator;
}