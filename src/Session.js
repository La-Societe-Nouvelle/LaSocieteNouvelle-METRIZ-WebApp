// La Société Nouvelle

// Components
import { LegalUnit } from '/src/LegalUnit.js';
import { FinancialData } from '/src/FinancialData.js';
import { ImpactsData } from '/src/ImpactsData.js';

import { SocialFootprint } from '/src/footprintObjects/SocialFootprint.js';
import { Indicator } from '/src/footprintObjects/Indicator';

// Libraries
import indics from '../lib/indics.json';

// Formulas
import { buildIndicatorAggregate, buildIndicatorMerge } from './footprintFormulas';

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
        this.validations = props.validations || [];

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

    // Final States
    getFinalStatesFootprints = () => 
    {
        let finalStates = {};
        this.financialData.stocks.concat(this.financialData.immobilisations)
                                 .concat(this.financialData.depreciations)
                                 .forEach(({account,footprint}) => finalStates[account] = footprint);
        return finalStates;
    }
    
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
        console.log("update indicator : "+indic);
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

        // Depreciations
        await Promise.all(this.financialData.depreciations.map(async (depreciation) =>
        {
            if (depreciation.initialState=="currentFootprint") {
                let immobilisation = this.financialData.getImmobilisationByAccount(depreciation.accountAux);
                depreciation.prevFootprint.indicators[indic] = immobilisation.footprint.indicators[indic];
            }
        }));

        // Depreciation expenses
        await Promise.all(this.financialData.depreciationExpenses.map(async (expense) => 
        {
            // retrieve depreciations & immobilisations concerned by the depreciation expense
            let depreciations = this.financialData.depreciations.filter(depreciation => depreciation.account.startsWith(expense.accountAux));
            let immobilisations = depreciations.map(depreciation => this.financialData.getImmobilisationByAccount(depreciation.accountAux));
            
            // build indicator for immobilisations
            let indicatorImmobilisations = await buildIndicatorAggregate(indic,immobilisations);
            let amountImmobilisations = immobilisations.map(immobilisation => immobilisation.amount).reduce((a,b) => a+b,0);
            
            // build indicator for depreciations (before current period)
            let usePrev = true;
            let indicatorDepreciations = await buildIndicatorAggregate(indic,depreciations,usePrev);
            let prevAmountDepreciations = depreciations.map(depreciation => depreciation.prevAmount).reduce((a,b) => a+b,0);

            expense.footprint.indicators[indic] = await buildIndicatorMerge(
                indicatorImmobilisations, amountImmobilisations,
                indicatorDepreciations, -prevAmountDepreciations);
            
            return;
        }));

        return;
    }

    /* -------------------- NET VALUE ADDED FOOTPRINT -------------------- */

    updateValueAddedFootprint = (indic) => this.netValueAddedFootprint.indicators[indic] = this.validations.indexOf(indic) >= 0 ? this.getValueAddedIndicator(indic) : new Indicator({indic})

    getValueAddedIndicator = (indic) =>
    {
        console.log("check");
        let indicator = new Indicator({indic: indic});
        
        const netValueAdded = this.financialData.getNetValueAdded();
        if (this.financialData.isFinancialDataLoaded && netValueAdded > 0)
        {
            const impactsData = this.impactsData;
            impactsData.setNetValueAdded(netValueAdded);

            switch(indic)
            {
                case "art": setValueART(indicator,impactsData); break;
                case "dis": setValueDIS(indicator,impactsData); break;
                case "eco": setValueECO(indicator,impactsData); break;
                case "geq": setValueGEQ(indicator,impactsData); break;
                case "ghg": setValueGHG(indicator,impactsData); break;
                case "haz": setValueHAZ(indicator,impactsData); break;
                case "knw": setValueKNW(indicator,impactsData); break;
                case "mat": setValueMAT(indicator,impactsData); break;
                case "nrg": setValueNRG(indicator,impactsData); break;
                case "soc": setValueSOC(indicator,impactsData); break;
                case "was": setValueWAS(indicator,impactsData); break;
                case "wat": setValueWAT(indicator,impactsData); break;
            }
        }

       return indicator; 
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

/* ---------------------------------------------------------------------------- */
/* -------------------- NET VALUE ADDED INDICATORS SETTERS -------------------- */
/* ---------------------------------------------------------------------------- */

const setValueART = (indicator,impactsData) => 
{
    if (impactsData.craftedProduction!=null) {
        indicator.setValue(impactsData.craftedProduction/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const setValueDIS = (indicator,impactsData) => 
{
    if (impactsData.indexGini!=null) {
        indicator.setValue(impactsData.indexGini);
        indicator.setUncertainty(0);
    }
}

const setValueECO = (indicator,impactsData) => 
{
    if (impactsData.domesticProduction!=null) {
        indicator.setValue(impactsData.domesticProduction/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const setValueGEQ = (indicator,impactsData) => 
{
    if (impactsData.wageGap!=null) {
        indicator.setValue(impactsData.wageGap);
        indicator.setUncertainty(0);
    }
}

const setValueGHG = (indicator,impactsData) => 
{
    if (impactsData.greenhousesGazEmissions!=null) {
        indicator.setValue(impactsData.greenhousesGazEmissions/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.greenhousesGazEmissionsUncertainty);
    }
}

const setValueHAZ = (indicator,impactsData) => 
{
    if (impactsData.hazardousSubstancesConsumption!=null) {
        indicator.setValue(impactsData.hazardousSubstancesConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.hazardousSubstancesConsumptionUncertainty);
    }
}

const setValueKNW = (indicator,impactsData) => 
{
    if (impactsData.researchAndTrainingContribution!=null) {
        indicator.setValue(impactsData.researchAndTrainingContribution/impactsData.netValueAdded *100);
        indicator.setUncertainty(0);
    }
}

const setValueMAT = (indicator,impactsData) => 
{
    if (impactsData.materialsExtraction!=null) {
        indicator.setValue(impactsData.materialsExtraction/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.materialsExtractionUncertainty);
    }
}

const setValueNRG = (indicator,impactsData) => 
{
    if (impactsData.energyConsumption!=null) {
        indicator.setValue(impactsData.energyConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.energyConsumptionUncertainty);
    }
}

const setValueSOC = (indicator,impactsData) => 
{
    if (impactsData.hasSocialPurpose!=null) {
        indicator.setValue(impactsData.hasSocialPurpose ? 100 : 0);
        indicator.setUncertainty(0);
    }
}

const setValueWAS = (indicator,impactsData) => 
{
    if (impactsData.wasteProduction!=null) {
        indicator.setValue(impactsData.wasteProduction/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.wasteProductionUncertainty);
    }
}

const setValueWAT = (indicator,impactsData) => 
{
    if (impactsData.waterConsumption!=null) {
        indicator.setValue(impactsData.waterConsumption/impactsData.netValueAdded *1000);
        indicator.setUncertainty(impactsData.waterConsumptionUncertainty);
    }
}