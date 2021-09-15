
// Components
import { LegalUnit } from '/src/LegalUnit.js';
import { SocialFootprint } from '/src/SocialFootprint.js';
import { FinancialData } from '/src/FinancialData.js';
import { ImpactsData } from './ImpactsData.js';
import { Indicator } from './Indicator';

// Libraries
import indics from '../lib/indics.json';

/* ---------- OBJECT SESSION ---------- */

export class Session {

    constructor() 
    {
        this.legalUnit = new LegalUnit();
        this.financialData = new FinancialData();
        this.impactsData = new ImpactsData();
        
        // Footprints

        this.availableProductionFootprint = new SocialFootprint({});
        this.unstoredProductionFootprint = new SocialFootprint({});
        this.productionFootprint = new SocialFootprint({});
                
        this.intermediateConsumptionFootprint = new SocialFootprint({});
        this.purchasesStocksVariationsFootprint = new SocialFootprint({});
        this.purchasesStocksFootprint = new SocialFootprint({});
        this.purchasesStocksPrevFootprint = new SocialFootprint({});
        this.expensesFootprint = new SocialFootprint({});

        this.grossValueAddedFootprint = new SocialFootprint({});
        this.depreciationsFootprint = new SocialFootprint({});

        this.netValueAddedFootprint = new SocialFootprint({});
    }

    /* ---------- BACK UP ---------- */

    async updateFromBackUp(backUp) 
    {
        await this.legalUnit.updateFromBackUp(backUp.legalUnit);        
        await this.financialData.updateFromBackUp(backUp.financialData);
        await this.impactsData.updateFromBackUp(backUp.impactsData);
        
        // rebuild footprints
        Object.entries(backUp)
              .filter(([label,_]) => label.match(/Footprint/))
              .forEach(([label,footprint]) => this[label] = new SocialFootprint(footprint));
    }

    /* -------------------- GETTERS -------------------- */

    /* ---------- GENERAL ---------- */

    getLibelle = () => this.libelle;
    getUniteLegale = () => this.legalUnit;
    getFinancialData = () => this.financialData;
    getImpactsData = () => this.impactsData;

    /* ---------- FOOTPRINTS ---------- */

    // Production
    getAvailableProductionFootprint = () => this.availableProductionFootprint;
    getUnstoredProductionFootprint = () => this.unstoredProductionFootprint;
    getProductionFootprint = () => this.productionFootprint;

    // Expenses
    getIntermediateConsumptionFootprint = () => this.intermediateConsumptionFootprint;
    getPurchasesStocksVariationsFootprint = () => this.purchasesStocksVariationsFootprint;
    getPurchasesStocksFootprint = () => this.purchasesStocksFootprint;
    getPurchasesStocksPrevFootprint = () => this.purchasesStocksPrevFootprint;
    getExpensesFootprint = () => this.expensesFootprint;

    // Gross Value Added
    getGrossValueAddedFootprint = () => this.grossValueAddedFootprint;
    getDepreciationsFootprint = () => this.depreciationsFootprint;

    // Net Value Added
    getNetValueAddedFootprint = () => this.netValueAddedFootprint;
    
    /* -------------------- FOOTPRINTS PROCESS -------------------- */

    // Footprints are stored in variables to avoid processing multiple times when render the results
    // ... and allows to have all the values directly in the json back up file

    /* ----- REVENUE (SOLD PRODUCTION) ----- */

    async updateAvailableProductionFootprint() 
    {
        console.log("update footprints")
        await Promise.all(Object.keys(indics)
                     .map((indic) => this.updateAvailableProductionIndicFootprint(indic)))
    }

    async updateAvailableProductionIndicFootprint(indic) 
    {
        // update footprints
        await this.updateProductionIndicFootprint(indic);
        await this.updateUnstoredProductionIndicFootprint(indic);

        // merge footprints
        this.availableProductionFootprint.indicators[indic] = buildIndicatorMerge(
            this.productionFootprint.indicators[indic], this.financialData.getProduction(),
            this.unstoredProductionFootprint.indicators[indic], this.financialData.getUnstoredProduction())
        
        if (indic == "art") console.log(this.unstoredProductionFootprint.indicators[indic])
        if (indic == "art") console.log(this.availableProductionFootprint.indicators[indic])
        return this.availableProductionFootprint.indicators[indic];
    }
    
    /* ----- (CURRENT) PRODUCTION ----- */

    async updateProductionIndicFootprint(indic) 
    {
        // update footprints
        await this.updateIntermediateConsumptionIndicFootprint(indic);
        await this.updateGrossValueAddedIndicFootprint(indic);

        // merge footprints
        this.productionFootprint.indicators[indic] = buildIndicatorMerge(
            this.grossValueAddedFootprint.getIndicator(indic), this.financialData.getGrossValueAdded(),
            this.intermediateConsumptionFootprint.getIndicator(indic), this.financialData.getAmountIntermediateConsumption())
            
        return this.productionFootprint.indicators[indic];
    }

    /* ----- UNSTORED PRODUCTION ----- */
    
    async updateUnstoredProductionIndicFootprint(indic) 
    {
        // update footprints
        let productionStocks = this.financialData.stocks.filter(stock => stock.isProductionStock);
        
        await Promise.all(productionStocks.map(productionStock => this.updateProductionStockIndicFootprint(indic,productionStock)))
        if (indic == "art") console.log(productionStocks)
        let usePrev = true;
        this.unstoredProductionFootprint.indicators[indic] = buildIndicatorAggregate(indic, productionStocks, usePrev);
        return this.unstoredProductionFootprint.indicators[indic];

    }

    async updateProductionStockIndicFootprint(indic, productionStock)
    {
        if (productionStock.initialState == "currentFootprint")
        {
            productionStock.prevFootprint.indicators[indic] = this.productionFootprint.indicators[indic];
        }
    }

    /* ----- INTERMEDIATE CONSUMPTION ----- */

    async updateIntermediateConsumptionIndicFootprint(indic)
    {
        // Update footprints
        await this.updateExpensesIndicFootprint(indic);
        await this.updatePurchasesStocksVariationsIndicFootprint(indic);

        if (this.financialData.stocksVariations.length > 0) 
        {
            this.intermediateConsumptionFootprint.indicators[indic] = buildIndicatorMerge(
                this.expensesFootprint.indicators[indic], this.financialData.getAmountExpenses(),
                this.purchasesStocksVariationsFootprint.indicators[indic], this.financialData.getVariationPurchasesStocks())
        }
        else
        {
            this.intermediateConsumptionFootprint.indicators[indic] = this.expensesFootprint.indicators[indic];
        }
        
        return this.intermediateConsumptionFootprint.indicators[indic];
    }

    /* ----- PURCHASES STOCKS ----- */

    async updatePurchasesStocksVariationsIndicFootprint(indic)
    {
        // update footprints
        let purchasesStocksVariations = this.financialData.stocksVariations.filter(stockVariation => stockVariation.account.charAt() == "6");
        await Promise.all(purchasesStocksVariations.map((purchasesStockVariation) => this.updatePurchasesStockVariationIndicFootprint(indic,purchasesStockVariation)));
        
        this.purchasesStocksVariationsFootprint.indicators[indic] = buildIndicatorAggregate(indic,purchasesStocksVariations);
        return this.purchasesStocksVariationsFootprint.indicators[indic];
    }

    async updatePurchasesStockVariationIndicFootprint(indic, stockVariation) 
    {
        // update footprint
        let stock = this.financialData.getStockByAccount(stockVariation.accountAux);
        await this.updatePurchasesStockIndicFootprint(indic,stock);
        
        stockVariation.footprint.indicators[indic] = buildIndicatorMerge(
            stock.prevFootprint.indicators[indic], stock.prevAmount,
            stock.footprint.indicators[indic], -stock.amount)
        
        return stockVariation.footprint.indicators[indic];
    }

    async updatePurchasesStockIndicFootprint(indic, stock)
    {
        stock.footprint.indicators[indic] = this.getExpensesAccountIndicator(stock.accountAux,indic) 
                                         || this.getExpensesAccountIndicator("60",indic) 
                                         || this.expensesFootprint.getIndicator(indic);

        if (stock.initialState=="currentFootprint") 
        {
            stock.prevFootprint.indicators[indic] = stock.footprint.indicators[indic];
        }
        
        return stock.footprint.indicators[indic];
    }

    /* ----- REVENUE EXPENDITURES ----- */
    
    async updateExpensesIndicFootprint(indic) 
    {   
        // Update footprints
        await Promise.all(this.financialData.expenses.map((expense) => this.updateExpenseIndicFootprint(indic,expense)));
        
        this.expensesFootprint.indicators[indic] = buildIndicatorAggregate(indic,this.financialData.expenses);
        return this.expensesFootprint.indicators[indic];
    }

    // ...update the footprint of each expense based on the footprint of the company
    async updateExpenseIndicFootprint(indic, expense) 
    {
        let company = this.financialData.getCompanyByAccount(expense.accountAux);
        expense.footprint.indicators[indic] = company.footprint.indicators[indic];
        return expense.footprint.indicators[indic];
    }

    /* ----- GROSS VALUE ADDED ----- */

    // ...update the gross value added footprint based on the net value added footprint and the depreciations footprint
    async updateGrossValueAddedIndicFootprint(indic) 
    {
        // update footprints
        await this.updateDepreciationsIndicFootprint(indic);
        await this.updateValueAddedIndicFootprint(indic);
        
        this.grossValueAddedFootprint.indicators[indic] = buildIndicatorMerge(
            this.netValueAddedFootprint.indicators[indic], this.financialData.getNetValueAdded(),
            this.depreciationsFootprint.indicators[indic], this.financialData.getAmountDepreciations())
        
        return this.grossValueAddedFootprint.indicators[indic];
    }

    /* ----- CAPITAL EXPENDITURES ----- */

    // ...update the depreciations footprint based on each depreciation footprint
    async updateDepreciationsIndicFootprint(indic) 
    {
        // updates footprints
        await Promise.all(this.financialData.depreciations.map((depreciation) => this.updateDepreciationIndicFootprint(indic,depreciation)));
        
        this.depreciationsFootprint.indicators[indic] = buildIndicatorAggregate(indic, this.financialData.depreciations)
        return this.depreciationsFootprint.indicators[indic];
    }

    // ...update the footprint of each depreciation based on the previous footprint of the immobilisation account & the investments
    async updateDepreciationIndicFootprint(indic, depreciation) 
    {
        let immobilisation = this.financialData.getImmobilisationByAccount(depreciation.accountAux);
        // update footprints
        await this.updateImmobilisationIndicFootprint(indic,immobilisation);

        let amount = immobilisation.prevAmount;
        let indicatorDepreciation = immobilisation.prevFootprint.indicators[indic];

        // Acquisitions
        let investments = this.financialData.investments.filter(investment => investment.account == immobilisation.account); 
        if (investments.length > 0)
        {
            await Promise.all(investments.map(async (investment) => await this.updateInvestmentIndicFootprint(indic,investment)));
            let amountInvestments = investments.map(investment => investment.amount).reduce((a, b) => a + b, 0);
            let indicatorInvestments = buildIndicatorAggregate(indic, investments);
            indicatorDepreciation = buildIndicatorMerge(
                indicatorDepreciation, amount,
                indicatorInvestments, amountInvestments)
        }

        // Production immobilisée
        // ...not available yet (loop needed)

        depreciation.footprint.indicators[indic] = indicatorDepreciation;

        // Cession / Réévaluation / Transfert -> not taking into account for depreciations footprints

        return indicatorDepreciation;
    }

    async updateImmobilisationIndicFootprint(indic,immobilisation)
    {
        // acquisitions
        let investments = this.financialData.investments.filter(investment => investment.account == immobilisation.account); 
        if (investments.length > 0)
        {
            await Promise.all(investments.map(async (investment) => await this.updateInvestmentIndicFootprint(indic,investment)));
            let amountInvestments = investments.map(investment => investment.amount).reduce((a, b) => a + b, 0);
            let indicatorInvestments = buildIndicatorAggregate(indic, investments);
            if (immobilisation.initialState=="currentFootprint") immobilisation.prevFootprint.indicators[indic] = indicatorInvestments;
        }

        return immobilisation.prevFootprint.indicators[indic];
    }

    // ...update the footprint of each investment based on the footprint of the company
    async updateInvestmentIndicFootprint(indic, investment) 
    {
        let company = this.financialData.getCompanyByAccount(investment.accountAux);
        investment.footprint.indicators[indic] = company.footprint.indicators[indic];
        return investment.footprint.indicators[indic];
    }
    
    /* ----- NET VALUE ADDED ----- */

    async updateValueAddedIndicFootprint(indic) 
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
        if (this.financialData.getAmountExpenses()!=null) 
        {
            return buildIndicatorAggregate(indic,
                this.financialData.expenses.filter(expense => expense.account.substring(0,accountPurchases.length)==accountPurchases)
            )
        }
        return undefined;
    }

    getDepreciationsAccountIndicator(account,indic) 
    {
        return buildIndicatorAggregate(indic, this.financialData.depreciations.filter(depreciation => depreciation.account.substring(0,account.length) == account))
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
        let indicatorElement = usePrev ? element.prevFootprint.indicators[indic] : element.getFootprint().getIndicator(indic);

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
        let uncertainty = absolute > 0 ? Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100 : 0;
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