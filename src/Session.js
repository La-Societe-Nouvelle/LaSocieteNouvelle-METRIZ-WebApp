
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

    /* ---------- Constructor ---------- */

    constructor() 
    {
        this.legalUnit = new LegalUnit();
        this.financialData = new FinancialData();
        
        this.impactsDirects = this.buildImpactsDirects();
        
        this.productionFootprint = new SocialFootprint();
        this.expensesFootprint = new SocialFootprint();
        this.depreciationsFootprint = new SocialFootprint();
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

    updateFromBackUp(backUp) {
        this.legalUnit.updateFromBackUp(backUp.legalUnit);        
        this.financialData.updateFromBackUp(backUp.financialData);
        this.updateImpactsDirectsFromBackUp(backUp.impactsDirects);
        this.productionFootprint.updateFromBackUp(backUp.productionFootprint);
        this.expensesFootprint.updateFromBackUp(backUp.expensesFootprint);
        this.depreciationsFootprint.updateFromBackUp(backUp.depreciationsFootprint);
    }

    updateImpactsDirectsFromBackUp(backUp) {
        indics.forEach((indic) => this.impactsDirects[indic].updateFromBackUp(backUp[indic]));
    }

    /* ---------- Getters ---------- */

    // General data
    getLibelle() {return this.libelle}
    getUniteLegale() {return this.legalUnit}
    getFinancialData() {return this.financialData}

    // Footprints
    getProductionFootprint() {return this.productionFootprint}
    getExpensesFootprint( ) {
        this.updateExpensesFootprint();
        return this.expensesFootprint}
    getDepreciationsFootprint() {return this.depreciationsFootprint}
    getImpactsDirects() {return this.impactsDirects}
    getValueAddedFootprint(indic) {return this.impactsDirects[indic]}

    updateFootprints() {
        this.updateExpensesFootprint();
        this.updateDepreciationsFootprint();
        this.updateValueAddedFootprint();
    }
    
    updateFootprints(indic) {
        this.updateExpensesIndicFootprint(indic);
        this.updateDepreciationsIndicFootprint(indic);
        this.updateValueAddedFootprint(indic);
    }
    
    // Production Social Footprint
    
    updateProductionFootprint(indic) {
        
        // if all amounts are set..
        if (this.financialData.getProduction()!=null 
                & this.financialData.getAmountExpenses()!=null
                & this.financialData.getAmountDepreciations()!=null
                & this.financialData.getNetValueAdded()!=null)
        {
            // ...and all the footprints are set (if the amount is not null)
            if ( !(this.financialData.getAmountExpenses()>0.0 & this.expensesFootprint.getIndicator(indic).getValue()==null) 
                    & !(this.financialData.getAmountDepreciations()>0.0 & this.depreciationsFootprint.getIndicator(indic).getValue()==null) 
                    & !(this.financialData.getNetValueAdded()>0.0 & this.impactsDirects[indic].getValue()==null) ) 
            {
                let absolute = 0.0;
                let absoluteMax = 0.0;
                let absoluteMin = 0.0;
                
                if (this.financialData.getAmountExpenses()>0.0) { 
                    absolute+= this.financialData.getAmountExpenses()*this.expensesFootprint.getIndicator(indic).getValue();
                    absoluteMax+= this.financialData.getAmountExpenses()*this.expensesFootprint.getIndicator(indic).getValueMax();
                    absoluteMin+= this.financialData.getAmountExpenses()*this.expensesFootprint.getIndicator(indic).getValueMin();
                }
                if (this.financialData.getAmountDepreciations()>0.0) { 
                    absolute+= this.financialData.getAmountDepreciations()*this.depreciationsFootprint.getIndicator(indic).getValue();
                    absoluteMax+= this.financialData.getAmountDepreciations()*this.depreciationsFootprint.getIndicator(indic).getValueMax();
                    absoluteMin+= this.financialData.getAmountDepreciations()*this.depreciationsFootprint.getIndicator(indic).getValueMin();
                }
                if (this.financialData.getNetValueAdded()>0.0) { 
                    absolute+= this.financialData.getNetValueAdded()*this.impactsDirects[indic].getValue();
                    absoluteMax+= this.financialData.getNetValueAdded()*this.impactsDirects[indic].getValueMax();
                    absoluteMin+= this.financialData.getNetValueAdded()*this.impactsDirects[indic].getValueMin();
                }
                
                let value = (Math.round(absolute/this.financialData.getProduction() *100)/100).toFixed(indicData[indic].nbDecimals);
                this.productionFootprint.getIndicator(indic).setValue(value);
                let uncertainty = Math.round( Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100 );
                this.productionFootprint.getIndicator(indic).setUncertainty(uncertainty);
            
            }
            else 
            {
               this.productionFootprint.getIndicator(indic).setValue(null); 
            }
        }
        else
        {
            this.productionFootprint.getIndicator(indic).setValue(null);
        }
        
    }
    
    
    // Expenses Social Footprint
    
    updateExpensesFootprint() {
        indics.forEach((indic) => {
            this.updateExpensesIndicFootprint(indic);
        })
    }
    
    async updateExpensesIndicFootprint(indic) {
        
        let indicatorExpenses = this.expensesFootprint.getIndicator(indic);
        let defaultData = (await this.getExpenseDefaultFootprint()).getIndicator(indic);
        
        if (this.financialData.getAmountExpenses()!=null) {
        
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
        
        this.updateProductionFootprint(indic);
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
    
    // Depreciation expenses Social Footprint
    
    updateDepreciationsFootprint() {
        Indic.values().forEach(
            (indic) => {
                updateDepreciationsIndicFootprint(indic);
            }
        )
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
        
        this.updateProductionFootprint(indic);
    }
    
    // Net Value Added
    
    setValueAddedIndicator(indicator) {
        this.impactsDirects[indicator.getIndic()] = indicator;
    }

    updateValueAddedFootprint() {
        indics.forEach(
            (indic) => {
                this.impactsDirects[indic].setNetValueAdded(this.financialData.getNetValueAdded());
            }
        )
    }

}