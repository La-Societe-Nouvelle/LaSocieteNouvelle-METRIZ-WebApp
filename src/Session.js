// La Société Nouvelle

// Libraries
import metaIndics from '../lib/indics.json';

// Intern objects
import { LegalUnit } from '/src/LegalUnit.js';
import { FinancialData } from '/src/FinancialData.js';
import { ImpactsData } from '/src/ImpactsData.js';

// General objects
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint.js';
import { Indicator } from '/src/footprintObjects/Indicator';

// Formulas
import { buildIndicatorAggregate, 
         updateAggregatesFootprints,
         updateProductionItemsFootprints,
         updateOutputFlowsFootprints,
         updateAccountsFootprints,
         updateFinalStatesFootprints} from './formulas/aggregatesFootprintFormulas';
import { buildNetValueAddedIndicator } from './formulas/netValueAddedFootprintFormulas';

/* ---------- OBJECT SESSION ---------- */

export class Session {

    constructor(props) 
    {
        if (props==undefined) props = {};
    // ---------------------------------------------------------------------------------------------------- //
        
        // Session
        this.progression = props.progression || 0;
        
        // Year
        this.year = props.year || "";

        // Data
        this.legalUnit = new LegalUnit(props.legalUnit);
        this.financialData = new FinancialData(props.financialData);
        this.impactsData = new ImpactsData(props.impactsData);
        
        // Footprints (Soldes Intermédiaires de Gestion)

        this.revenueFootprint = new SocialFootprint(props.revenueFootprint);

        this.productionFootprint = new SocialFootprint(props.productionFootprint);
        this.storedProductionFootprint = new SocialFootprint(props.storedProductionFootprint);
                
        this.intermediateConsumptionFootprint = new SocialFootprint(props.intermediateConsumptionFootprint);
        this.purchasesStocksVariationsFootprint = new SocialFootprint(props.purchasesStocksVariationsFootprint);
        this.expensesFootprint = new SocialFootprint(props.expensesFootprint);

        this.grossValueAddedFootprint = new SocialFootprint(props.grossValueAddedFootprint);
        this.depreciationExpensesFootprint = new SocialFootprint(props.depreciationExpensesFootprint);

        this.netValueAddedFootprint = new SocialFootprint(props.netValueAddedFootprint);

        // Footprints (Comptes)

        this.accountsFootprints = {};
        Object.entries(props.accountsFootprints || {}).forEach(([accountNum,footprint]) => this.accountsFootprints[accountNum] = new SocialFootprint(footprint));

        // Validations 
        this.validations = props.validations || [];

    // ---------------------------------------------------------------------------------------------------- //
    }

    /* -------------------- PROGRESSION -------------------- */    

    getStepMax = () =>
    {
        // if no siren
        if (!/[0-9]{9}/.test(this.legalUnit.siren)) return 1;
        // if no financial data
        else if (!this.financialData.isFinancialDataLoaded) return 2;
        // if data for initial states not fetched
        else if (this.financialData.immobilisations.concat(this.financialData.stocks).filter(account => account.initialState=="defaultData" && !account.dataFetched).length > 0) return 3;
        // if data for comppanies not fetched
        else if (this.financialData.companies.filter(company => company.status != 200).length > 0) return 4;
        // else
        else return 5;
    }


    /* -------------------- GETTERS -------------------- */    

    // Production
    getRevenueFootprint = () => this.revenueFootprint;
    getProductionStockVariationsFootprint = () => this.storedProductionFootprint;
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

    // Main footprints are stored in variables to avoid processing multiple times when render the results
    // ... and allows to have all the values directly in the json back up file

    // Update all footprints (after loading data : financial data, initial states, fetching companies data)
    async updateFootprints() 
    {
        console.log("update footprints");

        await Promise.all(Object.keys(metaIndics)
                                .map((indic) => this.updateIndicator(indic)));
        return;
    }

    // Update indicator
    async updateIndicator(indic) 
    {
        console.log("update indicator : "+indic);

        // Net Value Added
        this.updateNetValueAddedFootprint(indic);

        // Output flows : expenses / investments
        await updateOutputFlowsFootprints(indic,this.financialData);

        // Accounts
        await updateAccountsFootprints(indic,this.financialData);

        // Aggregates
        await updateAggregatesFootprints(indic,this.financialData);

        // Production items
        await updateProductionItemsFootprints(indic,this.financialData);

        // Immobilisations & Stocks
        await updateFinalStatesFootprints(indic,this.financialData);

        return;
    }

    /* -------------------- NET VALUE ADDED FOOTPRINT -------------------- */

    updateNetValueAddedFootprint = (indic) => 
    {
        this.financialData.aggregates.netValueAdded.footprint.indicators[indic] = this.validations.indexOf(indic) >= 0 ? this.getNetValueAddedIndicator(indic) 
                                                                                                                       : new Indicator({indic});
    }

    getNetValueAddedIndicator = (indic) =>
    {        
        const netValueAdded = this.financialData.getNetValueAdded();
        const impactsData = this.impactsData;

        impactsData.setNetValueAdded(netValueAdded);

        if (this.financialData.isFinancialDataLoaded && netValueAdded > 0)
        {
            return buildNetValueAddedIndicator(indic,impactsData);
        }
        else return new Indicator({indic: indic});
    }

    /* -------------------- ACCOUNTS FOOTPRINTS -------------------- */

    getExpensesAccountIndicator(accountPurchases,indic) 
    {
        return buildIndicatorAggregate(indic, this.financialData.expenses.filter(expense => expense.account.startsWith(accountPurchases)))
    }

    getDepreciationsAccountIndicator(account,indic) 
    {
        return buildIndicatorAggregate(indic, this.financialData.depreciationExpenses.filter(expense => expense.account.startsWith(account)))
    }

}