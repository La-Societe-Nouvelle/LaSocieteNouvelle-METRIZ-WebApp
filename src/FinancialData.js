
import { Expense } from './Expense';
import { Immobilisation } from './Immobilisation';
import { Depreciation } from './Depreciation'
import { Company } from './Company';
import { Stock } from './Stock';

import { metaAccounts } from '../lib/accounts.js';

import { getNewId } from './utils/Utils';
import { Flow } from './Flow';

export class FinancialData {

    constructor(props) 
    {
    // ---------------------------------------------------------------------------------------------------- //
        
        // data loaded state
        this.isFinancialDataLoaded = false;                 // i.e. FEC loaded
        
        // Production
        this.revenue = null;                                // revenue (#70)
        this.immobilisedProduction = null;                  // immobilised production (#72)

        // Expenses
        this.expenses = [];                                 // external expenses (#60, #61, #62)
        this.depreciationExpenses = [];                     // depreciation expenses (#6811, #6871)

        // Stocks
        this.stocks = [];                                   // stocks (#31 to #35, #37)
        this.stockVariations = [];                          // stock variation (#71, #603)
        
        // Immobilisations
        this.immobilisations = [];                          // immobilisations (#20 to #27)
        this.depreciations = [];                            // depreciations (#28 & #29)
        this.investments = [];                              // investments (flows #2 <- #404)

        // Other figures
        this.otherOperatingIncomes = 0;                     //
        this.taxes = 0;                                     // #63
        this.personnelExpenses = 0;                         // #64
        this.otherExpenses = 0;                             // #65
        this.financialExpenses = 0;                         // #66
        this.exceptionalExpenses = 0;                       // #67 hors #6871
        this.provisions = 0;                                // #68 hors #6811
        this.taxOnProfits = 0;                              // #69

        // Companies
        this.companies = [];                                // Companies

    // ---------------------------------------------------------------------------------------------------- //
    }

    /* ----- Back Up ----- */

    updateFromBackUp(backUp) 
    {
        // Amounts
        this.revenue = backUp.revenue;
        this.production = backUp.production;
        this.immobilisedProduction = backUp.immobilisedProduction;
        this.netValueAdded = backUp.netValueAdded;
        
        // flows
        this.expenses = backUp.expenses.map(expense => new Expense(expense))
        this.depreciations = backUp.depreciations.map(depreciation => new Depreciation(depreciation))
        this.immobilisations = backUp.immobilisations.map(immobilisation => new Immobilisation(immobilisation))
        this.investments = backUp.investments.map(investment => new Expense(investment))
        
        this.stocks = backUp.stocks.map(stock => new Stock(stock))
        
        // Meta
        this.labelsAccounts = backUp.labelsAccounts;
        this.companies = backUp.companies.map(company => new Company(company))
    }

    /* ---------------------------------------------------- */
    /* -------------------- FEC LOADER -------------------- */
    /* ---------------------------------------------------- */

    async loadData(data) 
    {
    // ---------------------------------------------------------------------------------------------------- //    
        
        // Print
        console.log(data);
        
        // Production
        this.revenue = data.revenue || 0;
        this.immobilisedProduction = data.immobilisedProduction || 0;

        // Expenses
        this.expenses = data.expenses.map((props,id) => new Expense({id: id, ...props}));
        this.depreciationExpenses = data.depreciationExpenses.map((props,id) => new Expense({id: id, ...props}));

        // Stocks
        this.stocks = data.stocks.map((props,id) => new Stock({id: id, ...props}));
        this.stockVariations = data.stockVariations.map((props,id) => new Flow({id: id, ...props}));

        // Immobilisations
        this.immobilisations = data.immobilisations.map((props,id) => new Immobilisation({id: id, ...props}));
        this.depreciations = data.depreciations.map((props,id) => new Depreciation({id: id, ...props}));
        this.investments = data.investments.map((props,id) => new Expense({id: id, ...props}));

        // Other figures
        this.otherOperatingIncomes = data.otherOperatingIncomes || 0;
        this.taxes = data.taxes || 0;
        this.personnelExpenses = data.personnelExpenses || 0;
        this.otherExpenses = data.otherExpenses || 0;
        this.financialExpenses = data.financialExpenses || 0;
        this.exceptionalExpenses = data.exceptionalExpenses || 0;
        this.provisions = data.provisions || 0;
        this.taxOnProfits = data.taxOnProfits || 0;

        // Companies
        this.companies = this.expenses.concat(this.investments)
                                      .map(expense => {return({account: expense.accountAux, accountLib: expense.accountAuxLib})})
                                      .filter((value, index, self) => index === self.findIndex(item => item.account === value.account))
                                      .map(({account,accountLib},id) => new Company({id, account, corporateName: accountLib}));
        
        /* --- INITIAL STATES --- */

        // Default initial states
        this.immobilisations.forEach(immobilisation => {immobilisation.initialState = (this.investments.filter(investment => investment.account == immobilisation.account).length > 0) ? "currentFootprint" : "defaultData";})
        this.stocks.filter(stock => !stock.isProductionStock)
                   .forEach(stock => {stock.initialState = (this.expenses.filter(expense => expense.account == stock.accountAux).length > 0) ? "currentFootprint" : "defaultData";})
        this.stocks.filter(stock => stock.isProductionStock)
                   .forEach(stock => stock.initialState = "currentFootprint")

        // data loaded
        this.isFinancialDataLoaded = true;
    // ---------------------------------------------------------------------------------------------------- //
    }
    
    /* -------------------- AMOUNTS GETTERS -------------------- */
    
    // PRODUCTION AGGREGATES
    
    getAvailableProduction = () => this.getProduction() + this.getUnstoredProduction()
    getProduction = () => this.getRevenue() + this.getStoredProduction() + this.getImmobilisedProduction() - this.getUnstoredProduction();
    getRevenue = () => this.revenue
    getStoredProduction = () => this.stocks.filter(stock => stock.isProductionStock).map(stock => stock.amount).reduce((a,b) => a + b,0)
    getUnstoredProduction = () => this.stocks.filter(stock => stock.isProductionStock).map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getImmobilisedProduction = () => this.immobilisedProduction
    
    // NET / GROSS VALUE ADDED
    
    getGrossValueAdded = () => this.getProduction() - this.getAmountIntermediateConsumption()
    getNetValueAdded = () => this.getGrossValueAdded() - this.getAmountDepreciations()

    // REVENUE EXPENDITURES

    getAmountIntermediateConsumption = () => this.getAmountExpenses() - this.getVariationPurchasesStocks()
    
    getVariationPurchasesStocks = () => this.getAmountPurchasesStocks() - this.getPrevAmountPurchasesStocks()

    getPrevAmountPurchasesStocks = () => this.stocks.filter(stock => !stock.isProductionStock).map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getAmountPurchasesStocks = () => this.stocks.filter(stock => !stock.isProductionStock).map(stock => stock.amount).reduce((a,b) => a + b,0)

    getAmountExpenses = () => this.expenses.map(expense => expense.amount).reduce((a,b) => a + b,0)
    
    // CAPITAL EXPENDITURES

    getAmountDepreciations = () => this.depreciations.map(depreciation => depreciation.amount).reduce((a,b) => a + b,0)

    // OTHER KEY FIGURES

    getAmountOtherOperatingIncomes = () => this.otherOperatingIncomes;

    getAmountTaxes = () => this.taxes;
    getAmountPersonnelExpenses = () => this.personnelExpenses;
    getAmountOtherExpenses = () => this.otherExpenses;
    getAmountFinancialExpenses = () => this.financialExpenses;
    getAmountExceptionalExpenses = () => this.exceptionalExpenses;
    getAmountProvisions = () => this.provisions;
    getAmountTaxOnProfits = () => this.taxOnProfits;

    getOperatingResult = () => this.getNetValueAdded() - this.getAmountTaxes() - this.getAmountPersonnelExpenses() - this.getAmountOtherExpenses() - this.getAmountProvisions() + this.getAmountOtherOperatingIncomes();

    // IMMOBILISATIONS

    getPrevAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.prevAmount).reduce((a,b) => a + b,0)
    getAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.amount).reduce((a,b) => a + b,0)

    // STOCKS

    getVariationStocks = () => this.getAmountStocks() - this.getPrevAmountStocks()

    getPrevAmountStocks = () => this.stocks.map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getAmountStocks = () => this.stocks.map(stock => stock.amount).reduce((a,b) => a + b,0)

    /* -------------------- INTERACTIONS -------------------- */

    /* ---------- Stocks ---------- */

    getStock = (id) => this.stocks.filter(stock => stock.id==id)[0]
    getStockByAccount = (account) => this.stocks.filter(stock => stock.account==account)[0]
    getStocks = () => this.stocks
      
    // Add new stock
    addStock = (props) => this.stocks.push(new Stock({id: getNewId(this.stocks),...props}))
    
    // Update stock
    updateStock = (nextProps) => this.getStock(nextProps.id).update(nextProps)    

    /* ----- Stock Variation ----- */
      
    getStockVariation = (id) => this.stocksVariations.filter(expense => expense.id==id)[0]
    getStocksVariations = () => this.stocksVariations

    addStockVariation = (props) => this.stocksVariations.push(new Flow({id: getNewId(this.stocksVariations),...props}))
    
    updateStockVariation = (nextProps) => this.getStockVariation(nextProps.id).update(nextProps)    

    /* ---------- Expenses ---------- */

    getExpense = (id) => this.expenses.filter(expense => expense.id==id)[0]
    getExpenses = () => this.expenses
      
    addExpense = (props) => this.expenses.push(new Expense({id: getNewId(this.expenses),...props}))
    
    updateExpense = (nextProps) => this.getExpense(nextProps.id).update(nextProps)

    /* ---------- Immobilisations ---------- */

    getImmobilisation = (id) => this.immobilisations.filter(immobilisation => immobilisation.id==id)[0]
    getImmobilisationByAccount = (account) => this.immobilisations.filter(immobilisation => immobilisation.account==account)[0]
    getImmobilisations = () => this.immobilisations

    addImmobilisation = (props) =>  this.immobilisations.push(new Immobilisation({id: getNewId(this.immobilisations),...props}))
   
    updateImmobilisation = (nextProps) => this.getImmobilisation(nextProps.id).update(nextProps)

    /* ---------- Depreciations ---------- */
    
    getDepreciation = (id) => this.depreciations.filter(depreciation => depreciation.getId()==id)[0]
    getDepreciations = () => this.depreciations

    addDepreciation = (props) => this.depreciations.push(new Depreciation({id: getNewId(this.depreciations),...props}))
    
    updateDepreciation = (nextProps) => this.getDepreciation(nextProps.id).update(nextProps)

    /* ---------- Investments ---------- */
    
    getInvestment = (id) => this.investments.filter(investment => investment.id==id)[0]
    getInvestments = () => this.investments
    
    addInvestment = (props) => this.investments.push(new Expense({id: getNewId(this.investments),...props}))

    updateInvestment = (nextProps) => this.getInvestment(nextProps.id).update(nextProps)    
    
    /* ------------------------------- */
    /* ---------- Companies ---------- */
    /* ------------------------------- */

    /* ----- Company ----- */

    getCompany = (id) => this.companies.filter(company => company.getId()==id)[0]
    getCompanyByAccount = (account) => this.companies.filter(company => company.account==account)[0]
    getCompanyByName = (name) => this.companies.filter(company => company.corporateName==name)[0]
    getCompanies = () => this.companies 

    // Add new company
    async addCompany(props) 
    {
        let company = new Company({id: getNewId(this.companies),...props});
        this.companies.push(company);
    }

    // Update company
    async updateCompany(nextProps) 
    {
        let company = this.getCompany(nextProps.id);
        // Update company
        await company.update(nextProps);
        // Updates expenditures linked to the company
        this.expenses.concat(this.investments)
                     .filter(expense => expense.accountAux == company.account)
                     .forEach(expense => expense.footprint = company.footprint)
    }

}