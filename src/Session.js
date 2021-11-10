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
         updateImmobilisationsIndicator, 
         updateInvestmentsIndicator, 
         updatePurchasesStocksIndicator, 
         updatePurchasesStocksVariationsIndicator } from './formulas/footprintFormulas';

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
        await this.updateFinancialItemsFootprints(indic);

        // Aggregates Footprints
        await this.updateAggregatesFootprints(indic);

        // Revenue Footprint
        await this.updateRevenueFootprint(indic);

        // Final States Footprints
        await this.updateFinalStatesFootprints(indic);

        return;
    }

    /* -------------------- FINANCIAL ITEMS FOOTPRINTS -------------------- */

    updateFinancialItemsFootprints = async (indic) =>
    {
        // Intermediate consumption footprint -------------------- //
        
        // External expenses
        await updateExternalExpensesIndicator(indic,this.financialData);

        // Purchasing stocks
        await updatePurchasesStocksIndicator(indic,this.financialData);

        // ...previous footprints based on current financial year
        this.financialData.stocks.filter(stock => !stock.isProductionStock)
                                 .filter(stock => stock.initialState == "currentFootprint")
                                 .map(async (stock) => stock.prevFootprint.indicators[indic] = stock.footprint.indicators[indic]);      

        // Stocks variations footprints
        await updatePurchasesStocksVariationsIndicator(indic,this.financialData);

        // Capital consumption footprint -------------------- //

        // Investments
        await updateInvestmentsIndicator(indic,this.financialData);

        // ...previous immoblisation footprints based on current financial year
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

        // Depreciation expenses
        await updateDepreciationExpensesIndicator(indic,this.financialData);

        return;
    }

    /* -------------------- AGGREGATES FOOTPRINTS -------------------- */

    updateAggregatesFootprints = async (indic) =>
    {
        // Dépreciation expenses
        this.depreciationExpensesFootprint.indicators[indic] = await buildIndicatorAggregate(indic, this.financialData.depreciationExpenses);

        // Gross value added
        this.grossValueAddedFootprint.indicators[indic] = await buildIndicatorMerge(this.netValueAddedFootprint.indicators[indic], this.financialData.getNetValueAdded(),
                                                                                    this.depreciationExpensesFootprint.indicators[indic], this.financialData.getAmountDepreciationExpenses())

        // External expenses
        this.expensesFootprint.indicators[indic] = await buildIndicatorAggregate(indic,this.financialData.expenses);

        // Purchasing stock Variations
        let purchasingStockVariations = this.financialData.stockVariations.filter(stockVariation => stockVariation.account.charAt(0)=="6");
        this.purchasesStocksVariationsFootprint.indicators[indic] = await buildIndicatorAggregate(indic,purchasingStockVariations);
        
        // Intermediate consumption
        this.intermediateConsumptionFootprint.indicators[indic] = purchasingStockVariations > 0 ? await buildIndicatorMerge(this.expensesFootprint.indicators[indic], this.financialData.getAmountExternalExpenses(),
                                                                                                                            this.purchasesStocksVariationsFootprint.indicators[indic], this.financialData.getVariationPurchasesStocks())
                                                                                                : this.expensesFootprint.indicators[indic];
        
        // Current production
        this.productionFootprint.indicators[indic] = await buildIndicatorMerge(this.intermediateConsumptionFootprint.indicators[indic], this.financialData.getAmountIntermediateConsumption(),
                                                                               this.grossValueAddedFootprint.indicators[indic], this.financialData.getGrossValueAdded());
        
        return;
    }

    /* -------------------- REVENUE FOOTPRINT -------------------- */

    updateRevenueFootprint = async (indic) =>
    {       
        // Set production footprint to final production stocks footprint
        this.financialData.stocks.filter(stock => stock.isProductionStock)
                                 .forEach(stock => stock.footprint.indicators[indic] = this.productionFootprint.indicators[indic]);
        
        // ...initial production stock footprint based on current production footprint
        this.financialData.stocks.filter(stock => stock.isProductionStock)
                                 .filter(stock => stock.initialState == "currentFootprint")
                                 .forEach(stock => stock.prevFootprint.indicators[indic] = this.productionFootprint.indicators[indic]);

        // Stored production footprint
        let productionStockFinalIndicator = await buildIndicatorAggregate(indic,this.financialData.stocks.filter(stock => stock.isProductionStock));
        let productionStockInitialIndicator = await buildIndicatorAggregate(indic,this.financialData.stocks.filter(stock => stock.isProductionStock),{usePrev: true});
        this.storedProductionFootprint.indicators[indic] = await buildIndicatorMerge(productionStockFinalIndicator, this.financialData.getFinalAmountProductionStocks(),
                                                                                     productionStockInitialIndicator, this.financialData.getInitialAmountProductionStocks());

        // Revenue footprint
        this.revenueFootprint.indicators[indic] = this.financialData.getVariationProductionStocks() > 0 ? await buildIndicatorMerge(this.productionFootprint.indicators[indic], this.financialData.getRevenue()-this.financialData.getInitialAmountProductionStocks(),
                                                                                                                                    productionStockInitialIndicator, this.financialData.getInitialAmountProductionStocks())
                                                                                                        : this.productionFootprint.indicators[indic];
        
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
        this.netValueAddedFootprint.indicators[indic] = this.validations.indexOf(indic) >= 0 ? this.getNetValueAddedIndicator(indic) 
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