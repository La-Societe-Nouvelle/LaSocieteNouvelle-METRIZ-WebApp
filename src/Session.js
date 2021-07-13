
import {LegalUnit} from '/src/LegalUnit.js';
import {SocialFootprint} from '/src/SocialFootprint.js';
import {FinancialData} from '/src/FinancialData.js';

import {IndicatorART} from '/src/indicator/IndicatorART.js';
import {IndicatorDIS} from '/src/indicator/IndicatorDIS.js';
import {IndicatorECO} from '/src/indicator/IndicatorECO.js';
import {IndicatorGEQ} from '/src/indicator/IndicatorGEQ.js';
import {IndicatorGHG} from '/src/indicator/IndicatorGHG.js';
import {IndicatorHAZ} from '/src/indicator/IndicatorHAZ.js';
import {IndicatorKNW} from '/src/indicator/IndicatorKNW.js';
import {IndicatorMAT} from '/src/indicator/IndicatorMAT.js';
import {IndicatorNRG} from '/src/indicator/IndicatorNRG.js';
import {IndicatorSOC} from '/src/indicator/IndicatorSOC.js';
import {IndicatorWAS} from '/src/indicator/IndicatorWAS.js';
import {IndicatorWAT} from '/src/indicator/IndicatorWAT.js';

import {indic as indicData} from '../lib/indic';

const indics = ["eco","art","soc","knw","dis","geq","ghg","mat","was","nrg","wat","haz"];
const apiBaseUrl = "https://systema-api.azurewebsites.net/api/v2/";


export class Session {

    /* -------------------- CONSTRUCTOR -------------------- */

    constructor() 
    {
        this.legalUnit = new LegalUnit();
        this.financialData = new FinancialData();
        
        // Footprints
        this.revenueFootprint = new SocialFootprint();
        this.productionFootprint = new SocialFootprint();
        this.unstoredProductionFootprint = new SocialFootprint();
        this.expensesFootprint = new SocialFootprint();
        this.grossValueAddedFootprint = new SocialFootprint();
        this.depreciationsFootprint = new SocialFootprint();
        
        // Impacts
        this.impactsDirects = this.buildImpactsDirects();
    }

    buildImpactsDirects() {
        let impacts = {};
        impacts["art"] = new IndicatorART();
        impacts["dis"] = new IndicatorDIS();
        impacts["eco"] = new IndicatorECO();
        impacts["geq"] = new IndicatorGEQ();
        impacts["ghg"] = new IndicatorGHG();
        impacts["haz"] = new IndicatorHAZ();
        impacts["knw"] = new IndicatorKNW();
        impacts["mat"] = new IndicatorMAT();
        impacts["nrg"] = new IndicatorNRG();
        impacts["soc"] = new IndicatorSOC();
        impacts["was"] = new IndicatorWAS();
        impacts["wat"] = new IndicatorWAT();
        return impacts;
    }

    /* ---------- BACK UP ---------- */

    async updateFromBackUp(backUp) {
        await this.legalUnit.updateFromBackUp(backUp.legalUnit);        
        await this.financialData.updateFromBackUp(backUp.financialData);
        await this.updateImpactsDirectsFromBackUp(backUp.impactsDirects);
        this.updateRevenueFootprint();
        /*
        this.productionFootprint.updateFromBackUp(backUp.productionFootprint);
        this.expensesFootprint.updateFromBackUp(backUp.expensesFootprint);
        this.depreciationsFootprint.updateFromBackUp(backUp.depreciationsFootprint);
        // reprocess instead of import calculated data
        this.updateGrossValueAddedFootprint();
        this.updateUnstoredProductionFootprint();
        */
    }

    updateImpactsDirectsFromBackUp(backUp) {
        indics.forEach((indic) => this.impactsDirects[indic].updateFromBackUp(backUp[indic]));
    }

    /* -------------------- EXTERNAL UPDATES -------------------- */

    // ...from financial section
    updateFinancialData(financialData) {
        this.financialData = financialData;
        this.updateRevenueFootprint();
    }

    // ...from indicator section
    updateValueAddedIndicator(indicator) {
        let indic = indicator.getIndic();
        this.impactsDirects[indic] = indicator;
        this.updateRevenueFootprint(indic);
    }

    /* -------------------- GETTERS -------------------- */

    /* ---------- GENERAL ---------- */

    getLibelle() {return this.libelle}
    getUniteLegale() {return this.legalUnit}
    getFinancialData() {return this.financialData}
    getImpactsDirects() {return this.impactsDirects}

    /* ---------- FOOTPRINTS ---------- */

    // Revenue
    getRevenueFootprint() {
        return this.revenueFootprint;
    }

    // Production
    getProductionFootprint() {
        return this.productionFootprint;
    }

    // Production
    getUnstoredProductionFootprint() {
        return this.unstoredProductionFootprint;
    }

    // Expenses
    getExpensesFootprint( ) {
        return this.expensesFootprint;
    }

    // Gross Value Added
    getGrossValueAddedFootprint() {
        return this.grossValueAddedFootprint;
    }

    // Depreciations
    getDepreciationsFootprint() {
        return this.depreciationsFootprint;
    }

    // Net Value Added
    getValueAddedFootprint(indic) {
        return this.impactsDirects[indic];
    }

    /* -------------------- FOOTPRINTS PROCESS -------------------- */

    // Footprints are stored in variables to avoid processing mutliple times when render the results
    // (ex. reprocess depreciations footrpint for gross value added footprint, production footprint & revenue footprint)
    // & it allows to have all the values directly in the json back up file

    /* ---------- REVENUE (AVAILABLE PRODUCTION) ---------- */

    updateRevenueFootprint() {
        indics.forEach((indic) => {
            this.updateRevenueIndicFootprint(indic);
        })
    }

    async updateRevenueIndicFootprint(indic) {
        
        // update footprints
        await this.updateProductionIndicFootprint(indic);
        await this.updateUnstoredProductionIndicFootprint(indic);

        // if all aggregates are set..
        if (this.financialData.getProduction()!=null 
                & this.financialData.getUnstoredProduction()!=null)
        {
            // ...and check if all the footprints are set (if the amount is not null)
            if ( !(this.financialData.getProduction()>0.0 & this.productionFootprint.getIndicator(indic).getValue()==null) 
                    & !(this.financialData.getUnstoredProduction()>0.0 & this.unstoredProductionFootprint.getIndicator(indic).getValue()==null) ) 
            {
                let absolute = 0.0;
                let absoluteMax = 0.0;
                let absoluteMin = 0.0;
                
                if (this.financialData.getProduction()>0.0) {
                    let currentProductionSold = this.financialData.getProduction()-this.financialData.getStoredProduction()-this.financialData.getImmobilisedProduction();
                    absolute+= currentProductionSold*this.productionFootprint.getIndicator(indic).getValue();
                    absoluteMax+= currentProductionSold*this.productionFootprint.getIndicator(indic).getValueMax();
                    absoluteMin+= currentProductionSold*this.productionFootprint.getIndicator(indic).getValueMin();
                }
                if (this.financialData.getUnstoredProduction()>0.0) {
                    let previousProductionSold = this.getUnstoredProduction();
                    absolute+= previousProductionSold*this.unstoredProductionFootprint.getIndicator(indic).getValue();
                    absoluteMax+= previousProductionSold*this.unstoredProductionFootprint.getIndicator(indic).getValueMax();
                    absoluteMin+= previousProductionSold*this.unstoredProductionFootprint.getIndicator(indic).getValueMin();
                }
                
                let value = (Math.round(absolute/this.financialData.getProduction() *100)/100).toFixed(indicData[indic].nbDecimals);
                this.revenueFootprint.getIndicator(indic).setValue(value);
                let uncertainty = Math.round( Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100 );
                this.revenueFootprint.getIndicator(indic).setUncertainty(uncertainty);
            }
            else { this.revenueFootprint.getIndicator(indic).setValue(null); }
        } else { this.revenueFootprint.getIndicator(indic).setValue(null); }
    }
    
    /* ---------- (CURRENT) PRODUCTION ---------- */

    updateProductionFootprint() {
        indics.forEach((indic) => {
            this.updateProductionIndicFootprint(indic);
        })
    }

    async updateProductionIndicFootprint(indic) {
        
        // update footprints
        await this.updateExpensesIndicFootprint(indic);
        await this.updateGrossValueAddedIndicFootprint(indic);

        // if all aggregates are set..
        if (this.financialData.getProduction()!=null 
                & this.financialData.getAmountExpenses()!=null
                & this.financialData.getAmountDepreciations()!=null)
        {
            // ...and check if all the footprints are set (if the amount is not null)
            if ( !(this.financialData.getAmountExpenses()>0.0 & this.expensesFootprint.getIndicator(indic).getValue()==null) 
                    & !(this.financialData.getGrossValueAdded()>0.0 & this.grossValueAddedFootprint.getIndicator(indic).getValue()==null) ) 
            {
                let absolute = 0.0;
                let absoluteMax = 0.0;
                let absoluteMin = 0.0;
                
                if (this.financialData.getAmountExpenses()>0.0) { 
                    absolute+= this.financialData.getAmountExpenses()*this.expensesFootprint.getIndicator(indic).getValue();
                    absoluteMax+= this.financialData.getAmountExpenses()*this.expensesFootprint.getIndicator(indic).getValueMax();
                    absoluteMin+= this.financialData.getAmountExpenses()*this.expensesFootprint.getIndicator(indic).getValueMin();
                }
                if (this.financialData.getGrossValueAdded()>0.0) {
                    absolute+= this.financialData.getGrossValueAdded()*this.grossValueAddedFootprint.getIndicator(indic).getValue();
                    absoluteMax+= this.financialData.getGrossValueAdded()*this.grossValueAddedFootprint.getIndicator(indic).getValueMax();
                    absoluteMin+= this.financialData.getGrossValueAdded()*this.grossValueAddedFootprint.getIndicator(indic).getValueMin();
                }
                
                let value = (Math.round(absolute/this.financialData.getProduction() *100)/100).toFixed(indicData[indic].nbDecimals);
                this.productionFootprint.getIndicator(indic).setValue(value);
                let uncertainty = Math.round( Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100 );
                this.productionFootprint.getIndicator(indic).setUncertainty(uncertainty);
            }
            else { this.productionFootprint.getIndicator(indic).setValue(null); }
        } else { this.productionFootprint.getIndicator(indic).setValue(null); }
    }

    /* ---------- UNSTORED PRODUCTION ---------- */
    
    updateUnstoredProductionFootprint() {
        indics.forEach((indic) => {
            this.updateUnstoredProductionIndicFootprint(indic);
        })
    }

    async updateUnstoredProductionIndicFootprint(indic) {
        
        let isLastYearProductionFootrpintSet = false;
        
        if (this.legalUnit.siren.match("[0-9]{9}"))
        {
            // Fetch data -> Stored data (only update on action)
            const endpoint = `${apiBaseUrl}/siren/${this.legalUnit.siren}`; // add year to resquest
            const response = await fetch(endpoint, {method:'get'});
            const data = await response.json();
            if (data.header.statut===200)
            {
                let indicator = data.profil.empreinteSocietale[indic.toUpperCase()];
                if (indicator.valueDeclared & indicator.year<"2021") {
                    this.unstoredProductionFootprint.getIndicator(indic).setValue(value);
                    this.unstoredProductionFootprint.getIndicator(indic).setUncertainty(uncertainty);
                    isLastYearProductionFootrpintSet = true;
                }
            }
        }

        if (!isLastYearProductionFootrpintSet)
        {
            this.unstoredProductionFootprint.getIndicator(indic).setValue(this.productionFootprint.getIndicator(indic).getValue());
            this.unstoredProductionFootprint.getIndicator(indic).setUncertainty(this.productionFootprint.getIndicator(indic).getUncertainty());
        }
    }

    /* ---------- EXPENSES ---------- */
    
    updateExpensesFootprint() {
        indics.forEach((indic) => {
            this.updateExpensesIndicFootprint(indic);
        })
    }
    
    async updateExpensesIndicFootprint(indic) {
        
        let indicatorExpenses = this.expensesFootprint.getIndicator(indic);
        let defaultData = (await this.getExpenseDefaultFootprint()).getIndicator(indic);
        
        if (this.financialData.getAmountExpenses()!=null) 
        {
            let totalAmount = 0.0;
            let absolute = 0.0;
            let absoluteMax = 0.0;
            let absoluteMin = 0.0;

            // Process for listed expenses
            let expenses = this.financialData.getExpenses();
            expenses.forEach((expense) => {
                let amountExpense = expense.getAmount();
                if (amountExpense!=null) 
                {
                    let indicatorExpense = expense.getFootprint().getIndicator(indic);
                    totalAmount+= expense.getAmount();
                    absolute+= indicatorExpense.getValue()*amountExpense;
                    absoluteMax+= indicatorExpense.getValueMax()*amountExpense;
                    absoluteMin+= indicatorExpense.getValueMin()*amountExpense;
                }
            })
            // Process for remaining expenses (difference between total declared & total listed expenses)
            if (totalAmount<this.financialData.getAmountExpenses()) {
                let amountRemaining = this.financialData.getAmountExpenses()-totalAmount;
                totalAmount = this.financialData.getAmountExpenses();
                absolute+= defaultData.getValue()*amountRemaining;
                absoluteMax+= defaultData.getValueMax()*amountRemaining;
                absoluteMin+= defaultData.getValueMin()*amountRemaining;
            }

            if (totalAmount>0.0) { 
                indicatorExpenses.setValue(absolute/totalAmount);
                let uncertainty = Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100;
                indicatorExpenses.setUncertainty(uncertainty);
            } else {
                indicatorExpenses.setValue(null); 
                indicatorExpenses.setUncertainty(null);
            }
        
        } else { 
            indicatorExpenses.setValue(null); 
            indicatorExpenses.setUncertainty(null);
        }
    }

    async getExpenseDefaultFootprint() 
    {
        let endpoint = apiBaseUrl + "default?" + "pays=FRA" + "&activite=00" + "&flow=IC"; // use legal unit data to improve
        let response = await fetch(endpoint, {method:'get'});
        let data = await response.json();
        if (data.header.statut != 200) {
            endpoint = apiBaseUrl + "defaultpays=FRA&activite=00&flow=IC";
            response = await fetch(endpoint, {method:'get'});
            data = await response.json();
        }
        let expenseDefaultFootprint = new SocialFootprint();
        expenseDefaultFootprint.updateAll(data.empreinteSocietale);
        return expenseDefaultFootprint;
    }
    
    /* ---------- GROSS VALUE ADDED ---------- */

    updateGrossValueAddedFootprint() {
        indics.forEach((indic) => {
            this.updateGrossValueAddedIndicFootprint(indic);
        })
    }

    async updateGrossValueAddedIndicFootprint(indic) {
        
        // update footprints
        await this.updateDepreciationsIndicFootprint(indic);
        await this.updateValueAddedFootprint();
        
        // if all aggregates are set..
        if (this.financialData.getAmountDepreciations()!=null
                & this.financialData.getNetValueAdded()!=null)
        {
            // ...and all the footprints are set (if the amount is not null)
            if ( !(this.financialData.getAmountDepreciations()>0.0 & this.depreciationsFootprint.getIndicator(indic).getValue()==null) 
                    & !(this.financialData.getNetValueAdded()>0.0 & this.impactsDirects[indic].getValue()==null) ) 
            {
                let totalAmount = 0.0;
                let absolute = 0.0;
                let absoluteMax = 0.0;
                let absoluteMin = 0.0;
                
                if (this.financialData.getAmountDepreciations()>0.0) {
                    totalAmount+= this.financialData.getAmountDepreciations();
                    absolute+= this.financialData.getAmountDepreciations()*this.depreciationsFootprint.getIndicator(indic).getValue();
                    absoluteMax+= this.financialData.getAmountDepreciations()*this.depreciationsFootprint.getIndicator(indic).getValueMax();
                    absoluteMin+= this.financialData.getAmountDepreciations()*this.depreciationsFootprint.getIndicator(indic).getValueMin();
                }
                if (this.financialData.getNetValueAdded()>0.0) {
                    totalAmount+= this.financialData.getNetValueAdded();
                    absolute+= this.financialData.getNetValueAdded()*this.impactsDirects[indic].getValue();
                    absoluteMax+= this.financialData.getNetValueAdded()*this.impactsDirects[indic].getValueMax();
                    absoluteMin+= this.financialData.getNetValueAdded()*this.impactsDirects[indic].getValueMin();
                }
                
                let value = (Math.round(absolute/totalAmount *100)/100).toFixed(indicData[indic].nbDecimals);
                this.grossValueAddedFootprint.getIndicator(indic).setValue(value);
                let uncertainty = Math.round( Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100 );
                this.grossValueAddedFootprint.getIndicator(indic).setUncertainty(uncertainty);
            }
            else { this.grossValueAddedFootprint.getIndicator(indic).setValue(null); }
        } else { this.grossValueAddedFootprint.getIndicator(indic).setValue(null); }

    }

    /* ---------- DEPRECIATIONS ---------- */
    
    updateDepreciationsFootprint() {
        indics.forEach((indic) => {
            this.updateDepreciationsIndicFootprint(indic);
        })
    }
    
    async updateDepreciationsIndicFootprint(indic) {
        
        let indicatorDepreciations = this.depreciationsFootprint.getIndicator(indic);
        let defaultData = (await this.getExpenseDefaultFootprint()).getIndicator(indic);
        
        if (this.financialData.getAmountDepreciations()!=null) {

            let totalAmount = 0.0;
            let absolute = 0.0;
            let absoluteMax = 0.0;
            let absoluteMin = 0.0;
            
            // Process for listed depreciations
            let depreciations = this.financialData.getDepreciations();
            depreciations.forEach(
                (depreciation) => {
                    let amountDepreciation = depreciation.getAmount();
                    if (amountDepreciation!=null) 
                    {
                        let indicatorDepreciation = depreciation.getFootprint().getIndicator(indic);
                        if (indicatorDepreciation.getValue()==null) { indicatorDepreciation.setDefaultData(); }
    
                        totalAmount+= depreciation.getAmount();
                        absolute+= indicatorDepreciation.getValue()*amountDepreciation;
                        absoluteMax+= indicatorDepreciation.getValueMax()*amountDepreciation;
                        absoluteMin+= indicatorDepreciation.getValueMin()*amountDepreciation;
                    }
                }
            )
            // Process for remaining amount of depreciations
            if (totalAmount<this.financialData.getAmountDepreciations()) {
                let amountRemaining = this.financialData.getAmountDepreciations()-totalAmount;
                totalAmount = this.financialData.getAmountDepreciations();
                absolute+= defaultData.getValue()*amountRemaining;
                absoluteMax+= defaultData.getValueMax()*amountRemaining;
                absoluteMin+= defaultData.getValueMin()*amountRemaining;
            }
            
            if (totalAmount>0.0) { 
                indicatorDepreciations.setValue(absolute/totalAmount);
                let uncertainty = Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100;
                indicatorDepreciations.setUncertainty(uncertainty);
            } else {
                indicatorDepreciations.setValue(null);
                indicatorDepreciations.setUncertainty(null);
            }
        
        } else { 
            indicatorDepreciations.setValue(null);
            indicatorDepreciations.setUncertainty(null);
        }        
    }
    
    /* ---------- NET VALUE ADDED ---------- */

    updateValueAddedFootprint() {
        indics.forEach(
            (indic) => {
                this.impactsDirects[indic].setNetValueAdded(this.financialData.getNetValueAdded());
            }
        )
    }

}