
// Components
import { LegalUnit } from '/src/LegalUnit.js';
import { SocialFootprint } from '/src/SocialFootprint.js';
import { FinancialData } from '/src/FinancialData.js';
import { ImpactsData } from './ImpactsData.js';
import { Indicator } from './Indicator';

import { metaAccounts } from '../lib/accounts';
import { metaIndicators } from '../lib/indic';

const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];

export class Session {

    constructor() 
    {
        this.legalUnit = new LegalUnit();
        this.financialData = new FinancialData();
        this.impactsData = new ImpactsData();
        
        // Footprints
        this.revenueFootprint = new SocialFootprint({});
        this.productionFootprint = new SocialFootprint({});
        this.unstoredProductionFootprint = new SocialFootprint({});
        this.intermediateConsumptionFootprint = new SocialFootprint({});
        this.initialStocksFootprint = new SocialFootprint({});
        this.finalStocksFootprint = new SocialFootprint({});
        this.purchasesDiscountsFootprint = new SocialFootprint({});
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

    /* -------------------- EXTERNAL UPDATES -------------------- */

    // ...from financial section
    async updateFinancialData(financialData) {
        this.financialData = financialData;
        this.impactsData.setNetValueAdded(financialData.getNetValueAdded());
        await this.updateRevenueFootprint();
    }

    async updateImpactsData(impactsData) {
        this.impactsData = impactsData;
        await this.updateRevenueFootprint();
    }

    /* -------------------- GETTERS -------------------- */

    /* ---------- GENERAL ---------- */

    getLibelle() {return this.libelle}
    getUniteLegale() {return this.legalUnit}
    getFinancialData() {return this.financialData}
    getImpactsData() {return this.impactsData}

    /* ---------- FOOTPRINTS ---------- */

    // Revenue
    getRevenueFootprint() {return this.revenueFootprint}

    // Production
    getProductionFootprint() {return this.productionFootprint}
    getUnstoredProductionFootprint() {return this.unstoredProductionFootprint}

    // Expenses
    getIntermediateConsumptionFootprint() {return this.intermediateConsumptionFootprint}
    getFinalStocksFootprint() {return this.finalStocksFootprint}
    getInitialStocksFootprint() {return this.initialStocksFootprint}
    getPurchasesDiscountsFootprint() {return this.purchasesDiscountsFootprint}
    getExpensesFootprint() {return this.expensesFootprint}

    // Gross Value Added
    getGrossValueAddedFootprint() {return this.grossValueAddedFootprint}
    getDepreciationsFootprint() {return this.depreciationsFootprint}

    // Net Value Added
    getNetValueAddedFootprint() {return this.netValueAddedFootprint}
    
    /* -------------------- FOOTPRINTS PROCESS -------------------- */

    // Footprints are stored in variables to avoid processing multiple times when render the results
    // ... and allows to have all the values directly in the json back up file

    /* ---------- REVENUE (SOLD PRODUCTION) ---------- */

    async updateRevenueFootprint() {
        console.log("update footprints")
        await Promise.all(indics.map(async (indic) => {
            await this.updateRevenueIndicFootprint(indic);
            return;
        }))
        return;
    }

    // aggregated footprint
    async updateRevenueIndicFootprint(indic) 
    {
        // update aggregated footprints
        await this.updateProductionIndicFootprint(indic);
        await this.updateUnstoredProductionIndicFootprint(indic);

        // merge footprints
        let indicator = buildIndicatorMerge(this.productionFootprint.getIndicator(indic), this.financialData.getProduction(),
                                            this.unstoredProductionFootprint.getIndicator(indic), -this.financialData.getUnstoredProduction())
        
        this.revenueFootprint.getIndicator(indic).setValue(indicator.getValue())
        this.revenueFootprint.getIndicator(indic).setUncertainty(indicator.getUncertainty())
        return;
    }
    
    /* ---------- (CURRENT) PRODUCTION ---------- */

    async updateProductionIndicFootprint(indic) 
    {
        // update footprints
        await this.updateIntermediateConsumptionIndicFootprint(indic);
        await this.updateGrossValueAddedIndicFootprint(indic);

        // if all aggregates are set..
        let indicator = buildIndicatorMerge(this.grossValueAddedFootprint.getIndicator(indic), this.financialData.getGrossValueAdded(),
                                            this.intermediateConsumptionFootprint.getIndicator(indic), this.financialData.getAmountIntermediateConsumption())
            
        this.productionFootprint.getIndicator(indic).setValue(indicator.getValue())
        this.productionFootprint.getIndicator(indic).setUncertainty(indicator.getUncertainty())
        return;
    }

    /* ---------- UNSTORED PRODUCTION ---------- */
    
    async updateUnstoredProductionIndicFootprint(indic) 
    {
        // update only if footprint not set
        if (this.unstoredProductionFootprint.footprintId==null) {
            this.unstoredProductionFootprint.indicators[indic] = this.productionFootprint.getIndicator(indic);
        }
        return;
    }

    /* ---------- INTERMEDIATE CONSUMPTION ---------- */

    async updateIntermediateConsumptionIndicFootprint(indic)
    {
        // Update footprints
        await this.updateExpensesIndicFootprint(indic);
        await this.updateInitialStocksIndicFootprint(indic);
        await this.updateFinalStocksIndicFootprint(indic);
        await this.updatePurchasesDiscountsIndicFootprint(indic);

        let indicator = this.expensesFootprint.indicators[indic];
        let amount = this.financialData.getAmountExpenses();
        
        // merge discounts footprint
        if (this.financialData.purchasesDiscounts.length > 0) {
            indicator = buildIndicatorMerge(indicator, amount,
                                            this.purchasesDiscountsFootprint.getIndicator(indic), -this.financialData.getAmountPurchasesDiscounts())
            amount = amount-this.financialData.getAmountPurchasesDiscounts()
        }

        // merge initial stocks footprint
        if (this.financialData.initialStocks.length > 0) {
            indicator = buildIndicatorMerge(indicator, amount,
                                            this.initialStocksFootprint.getIndicator(indic), this.financialData.getAmountInitialStocks())
            amount = amount+this.financialData.getAmountInitialStocks();
        }

        // merge final stocks footprint
        if (this.financialData.finalStocks.length > 0) {
            indicator = buildIndicatorMerge(indicator, amount,
                                            this.finalStocksFootprint.getIndicator(indic), -this.financialData.getAmountFinalStocks())
        }
        
        this.intermediateConsumptionFootprint.getIndicator(indic).setValue(indicator.getValue())
        this.intermediateConsumptionFootprint.getIndicator(indic).setUncertainty(indicator.getUncertainty())
        return;
    }

    /* ---------- STOCKS ---------- */

    async updateInitialStocksIndicFootprint(indic)
    {
        if (this.financialData.initialStocks.length > 0) 
        {
            await this.financialData.initialStocks.forEach(stock => {
                stock.footprint.indicators[indic] = this.getExpensesAccountIndicator(stock.accountPurchases,indic) 
                    || this.getExpensesAccountIndicator("60") 
                    || this.expensesFootprint.getIndicator(indic);
            })

            let indicator = buildIndicatorAggregate(indic, this.financialData.initialStocks);
            this.initialStocksFootprint.indicators[indic] = indicator;
        }
        else 
        { 
            this.initialStocksFootprint.indicators[indic].setValue(null);
            this.initialStocksFootprint.indicators[indic].setUncertainty(null);
        }
        return;
    }

    async updateFinalStocksIndicFootprint(indic)
    {
        if (this.financialData.finalStocks.length > 0) 
        {
            await this.financialData.finalStocks.forEach(stock => {
                stock.footprint.indicators[indic] = this.getExpensesAccountIndicator(stock.accountPurchases,indic) 
                    || this.getExpensesAccountIndicator("60") 
                    || this.expensesFootprint.getIndicator(indic);
            })

            let indicator = buildIndicatorAggregate(indic, this.financialData.finalStocks);
            this.finalStocksFootprint.indicators[indic] = indicator;
        }
        else 
        { 
            this.finalStocksFootprint.indicators[indic].setValue(null);
            this.finalStocksFootprint.indicators[indic].setUncertainty(null);
        }
        return;
    }

    /* ---------- REVENUE EXPENDITURES DISCOUNTS ---------- */
    
    async updatePurchasesDiscountsIndicFootprint(indic) 
    {
        if (this.financialData.purchasesDiscounts.length > 0) 
        {
            await Promise.all(this.financialData.purchasesDiscounts.map(async (discount) => {
                await this.updateDiscountIndicFootprint(indic,discount);
                return;
            }));
            
            let indicatorPurchasesDiscounts = buildIndicatorAggregate(indic, this.financialData.purchasesDiscounts);
            this.purchasesDiscountsFootprint.indicators[indic] = indicatorPurchasesDiscounts;
        }
        else 
        { 
            this.purchasesDiscountsFootprint.indicators[indic].setValue(null);
            this.purchasesDiscountsFootprint.indicators[indic].setUncertainty(null);
        }
        return;
    }

    // ...update the footprint of each discount based on the footprint of the company
    async updateDiscountIndicFootprint(indic, discount) 
    {
        let company = this.financialData.getCompany(discount.companyId);
        let indicatorCompany = company.getFootprint().getIndicator(indic);
        discount.footprint.indicators[indic] = indicatorCompany;
        return;
    }

    /* ---------- REVENUE EXPENDITURES ---------- */
    
    async updateExpensesIndicFootprint(indic) 
    {
        if (this.financialData.getAmountExpenses()!=null) 
        {
            await Promise.all(this.financialData.expenses.map(async (expense) => {
                await this.updateExpenseIndicFootprint(indic,expense);
                return;
            }));
            
            let indicatorDetailedExpenses = buildIndicatorAggregate(indic,this.financialData.expenses);
            
            if (this.financialData.amountExpensesFixed) {
                let gap = this.financialData.getAmountExpenses()-this.financialData.getAmountDetailedExpenses();
                this.expensesFootprint.indicators[indic] = buildIndicatorMerge(indicatorDetailedExpenses, this.financialData.getAmountDetailedExpenses(),
                                                                               this.legalUnit.defaultConsumptionFootprint.getIndicator(indic), gap)
            } else {
                this.expensesFootprint.indicators[indic] = indicatorDetailedExpenses;
            }
        }
        else 
        { 
            this.expensesFootprint.indicators[indic].setValue(null);
            this.expensesFootprint.indicators[indic].setUncertainty(null);
        }
        return;
    }

    // ...update the footprint of each expense based on the footprint of the company
    async updateExpenseIndicFootprint(indic, expense) 
    {
        let company = this.financialData.getCompany(expense.companyId);
        let indicatorCompany = company.getFootprint().getIndicator(indic);
        expense.footprint.indicators[indic] = indicatorCompany;
        return;
    }
    
    /* ---------- GROSS VALUE ADDED ---------- */

    async updateGrossValueAddedIndicFootprint(indic) 
    {
        // update footprints
        await this.updateDepreciationsIndicFootprint(indic);
        await this.updateValueAddedIndicFootprint(indic);
        
        // merge footprints
        let indicator = buildIndicatorMerge(this.netValueAddedFootprint.getIndicator(indic), this.financialData.getNetValueAdded(),
                                            this.depreciationsFootprint.getIndicator(indic), this.financialData.getAmountDepreciations())
        
        this.grossValueAddedFootprint.getIndicator(indic).setValue(indicator.getValue())
        this.grossValueAddedFootprint.getIndicator(indic).setUncertainty(indicator.getUncertainty())
        return;
    }

    /* ---------- CAPITAL EXPENDITURES ---------- */

    // ...update the depreciations footprint
    async updateDepreciationsIndicFootprint(indic) 
    {
        if (this.financialData.getAmountDepreciations()!=null) 
        {
            await Promise.all(this.financialData.depreciations.map(async (depreciation) => {
                await this.updateDepreciationIndicFootprint(indic,depreciation);
                return;
            }));
            
            let indicatorDetailedDepreciations = buildIndicatorAggregate(indic, this.financialData.depreciations)
            
            if (this.financialData.amountDepreciationsFixed) {
                let gap = this.financialData.getAmountDepreciations()-this.financialData.getAmountDetailedDepreciations();
                this.depreciationsFootprint.indicators[indic] = buildIndicatorMerge(indicatorDetailedDepreciations, this.financialData.getAmountDetailedDepreciations(),
                                                                                    this.legalUnit.defaultConsumptionFootprint.getIndicator(indic), gap)
            } else {
                this.depreciationsFootprint.indicators[indic] = indicatorDetailedDepreciations;
            }
        }
        else 
        { 
            this.depreciationsFootprint.indicators[indic].setValue(null);
            this.depreciationsFootprint.indicators[indic].setUncertainty(null);
        }
        return;
    }

    // ...update the footprint of each depreciation based on the footprint of the immobilisation account & the investments
    async updateDepreciationIndicFootprint(indic, depreciation) 
    {
        let immobilisation = this.financialData.getImmobilisationByAccount(depreciation.accountImmobilisation);
        let indicatorImmobilisation = immobilisation.getFootprint().getIndicator(indic);
        
        let investments = this.financialData.investments.filter(investment => investment.accountImmobilisation==depreciation.accountImmobilisation);
        if (investments.length > 0) 
        {
            await Promise.all(investments.map(async (investment) => {
                await this.updateInvestmentIndicFootprint(indic,investment);
                return;
            }));

            let amountInvestments = investments.map(investment => investment.amount).reduce((a, b) => a + b, 0);
            let indicatorInvestments = buildIndicatorAggregate(indic, investments);
            depreciation.footprint.indicators[indic] = buildIndicatorMerge(indicatorImmobilisation, immobilisation.amount,
                                                                           indicatorInvestments, amountInvestments)
        } else {
            depreciation.footprint.indicators[indic] = indicatorImmobilisation;
        }
        return;
    }

    // ...update the footprint of each investment based on the footprint of the company
    async updateInvestmentIndicFootprint(indic, investment) 
    {
        let company = this.financialData.getCompany(investment.companyId);
        let indicatorCompany = company.getFootprint().getIndicator(indic);
        investment.footprint.indicators[indic] = indicatorCompany;
        return;
    }
    
    /* ---------- NET VALUE ADDED ---------- */

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

    getExpensesAccountIndicator(account,indic) {
        
        if (this.financialData.getAmountExpenses()!=null) 
        {
            if (account!="") { // specific account
                return buildIndicatorAggregate(indic,
                    this.financialData.expenses.filter(expense => expense.account.substring(0,account.length)==account)
                )
            } else if (account=="") { // other accounts
                return buildIndicatorAggregate(indic,
                    this.financialData.expenses.filter(expense => expense.account == "") // change
                )
            } else { // other expenses
                return this.legalUnit.defaultConsumptionFootprint.getIndicator(indic);
            }
        }
        return new Indicator({indic: indic});
    }

    getDepreciationsAccountIndicator(account,indic) {
        
        if (this.financialData.getAmountDepreciations()!=null)
        {
            if (["280","281","282"].includes(account)) {
                return buildIndicatorAggregate(indic,
                    this.financialData.depreciations.filter(depreciation => depreciation.account.substring(0,3)==account)
                )
            } else if (account!="") {
                return buildIndicatorAggregate(indic,
                    this.financialData.depreciations.filter(depreciation => depreciation.account == "") // change
                )
            } else {
                return this.legalUnit.defaultConsumptionFootprint.getIndicator(indic);
            }
        }
        return new Indicator(indic);
    }

    
}

/* ------------------------------------------------------------- */
/* -------------------- FOOTPRINTS FORMULAS -------------------- */
/* ------------------------------------------------------------- */


function buildIndicatorAggregate(indic,elements) 
{
    let indicator = new Indicator({indic: indic});
    
    let totalAmount = 0.0;
    let absolute = 0.0;
    let absoluteMax = 0.0;
    let absoluteMin = 0.0;

    let missingData = false;

    elements.forEach((element) => {
        let amount = element.amount;
        let indicatorElement = element.getFootprint().getIndicator(indic);
        
        if (amount!=null && indicatorElement.getValue()!=null) 
        {
            absolute+= indicatorElement.getValue()*amount;
            absoluteMax+= indicatorElement.getValueMax()*amount;
            absoluteMin+= indicatorElement.getValueMin()*amount;
            totalAmount+= amount;
        } 
        else {missingData = true}
    })

    if (!missingData && totalAmount > 0.0) { 
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

        if (totalAmount > 0) {
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