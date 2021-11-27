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
         buildIndicatorMerge, 
         buildNetValueAddedIndicator,
         updateDepreciationExpensesIndicator, 
         updateDepreciationsIndicator, 
         updateExternalExpensesIndicator, 
         updateExternalExpensesAccountsIndicator,
         updateImmobilisationsIndicator, 
         updateInvestmentsIndicator, 
         updatePurchasesStocksIndicator, 
         updatePurchasesStocksVariationsIndicator, 
         updateAggregatesFootprints,
         updatePurchasesStocksVariationsAccountsIndicator,
         updateDepreciationExpensesAccountsIndicator,
         updateProductionItemsFootprints} from './formulas/footprintFormulas';

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

        // Financial items : expenses / investments
        await this.updateOutputFlowsFootprints(indic);

        // Accounts footprints
        await this.updateAccountsFootprints(indic);

        // Aggregates Footprints
        await updateAggregatesFootprints(indic,this.financialData);

        // Revenue Footprint
        await this.updateProductionItemsFootprints(indic);

        // Final States Footprints
        await this.updateFinalStatesFootprints(indic);

        return;
    }

    /* -------------------- OUTPUT FLOWS FOOTPRINTS -------------------- */

    updateOutputFlowsFootprints = async (indic) =>
    {
        // External expenses
        await updateExternalExpensesIndicator(indic,this.financialData);

        // Investments
        await updateInvestmentsIndicator(indic,this.financialData);
    }

    updateAccountsFootprints = async (indic) =>
    {
        // External expenses --------------------------------------------------------- //

        // External expenses accounts
        await updateExternalExpensesAccountsIndicator(indic,this.financialData);

        // Purchase stocks ----------------------------------------------------------- //
        
        // Purchase stocks
        await updatePurchasesStocksIndicator(indic,this.financialData);

        // ...previous footprints based on current financial year
        this.financialData.stocks.filter(stock => !stock.isProductionStock)
                                 .filter(stock => stock.initialState == "currentFootprint")
                                 .map(async (stock) => stock.prevFootprint.indicators[indic] = stock.footprint.indicators[indic]);      

        // Purchase stocks variations ------------------------------------------------ //

        // Stocks variations footprints
        await updatePurchasesStocksVariationsIndicator(indic,this.financialData);

        // Stocks variations accounts footprints
        await updatePurchasesStocksVariationsAccountsIndicator(indic,this.financialData);

        // Immobilisation ------------------------------------------------------------ //

        // ...previous immobilisation footprints based on current financial year
        this.financialData.immobilisations.filter(immobilisation => immobilisation.initialState == "currentFootprint")
                                          .map(async (immobilisation) => 
            {
                let investmentsRelatedToImmobilisation = this.financialData.investments.filter(investment => investment.account == immobilisation.account);
                immobilisation.prevFootprint.indicators[indic] = await buildIndicatorAggregate(indic,investmentsRelatedToImmobilisation);
            });

        // ...previous depreciation footprints based on current financial year
        this.financialData.depreciations.filter(depreciation => depreciation.initialState == "currentFootprint")
                                        .map(async (depreciation) => 
            {
                let immobilisation = this.financialData.getImmobilisationByAccount(depreciation.accountAux);
                depreciation.prevFootprint.indicators[indic] = immobilisation.prevFootprint.indicators[indic];
            });

        // Depreciation expenses ----------------------------------------------------- //
        
        // Depreciation expenses
        await updateDepreciationExpensesIndicator(indic,this.financialData);

        // Depreciation expenses accounts
        await updateDepreciationExpensesAccountsIndicator(indic,this.financialData);

        return;
    }

    /* -------------------- REVENUE FOOTPRINT -------------------- */

    updateProductionItemsFootprints = async (indic) =>
    {      
        // Production stocks ----------------------------------------------------------- //

        // Set production footprint to final production stocks footprint
        this.financialData.stocks.filter(stock => stock.isProductionStock)
                                 .forEach(stock => stock.footprint.indicators[indic] = this.financialData.aggregates.production.footprint.indicators[indic]);
        
        // ...initial production stock footprint based on current production footprint
        this.financialData.stocks.filter(stock => stock.isProductionStock)
                                 .filter(stock => stock.initialState == "currentFootprint")
                                 .forEach(stock => stock.prevFootprint.indicators[indic] = this.financialData.aggregates.production.footprint.indicators[indic]);

        // Production items ------------------------------------------------------------ //
        
        await updateProductionItemsFootprints(indic,this.financialData)
        
        return;
    }
    
    /* -------------------- FINAL STATES FOOTPRINTS -------------------- */

    updateFinalStatesFootprints = async (indic) =>
    {
        // Immobilisations
        await updateImmobilisationsIndicator(indic,this.financialData);
        
        // Depreciations
        await updateDepreciationsIndicator(indic,this.financialData);
        
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