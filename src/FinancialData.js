
import { Expense } from './Expense';
import { Immobilisation } from './Immobilisation';
import { Depreciation } from './Depreciation'
import { Company } from './Company';
import { Stock } from './Stock';

import { metaAccounts } from '../lib/accounts.js';

import { getNewId } from './utils/Utils';
import { Flow } from './Flow';

export class FinancialData {

    constructor() 
    {
        this.isFinancialDataLoaded = false;
        
        // Production
        this.revenue = null;
        this.production = null;
        this.immobilisedProduction = null;

        // Expenses
        this.expenses = [];

        // Stocks
        this.stocks = [];
        this.stocksVariations = [];
        
        // Immobilisations
        this.immobilisations = [];
        this.depreciations = [];
        this.investments = [];

        // Net Value Added
        this.netValueAdded = null;

        // Other figures
        this.otherOperatingIncomes = 0;
        this.taxes = 0;               // 63_
        this.personnelExpenses = 0;   // 64_
        this.otherExpenses = 0;       // 65_
        this.financialExpenses = 0;   // 66_
        this.exceptionalExpenses = 0; // 67_
        this.provisions = 0;          // 68_ (hors amortissements)
        this.taxOnProfits = 0;        // 69_

        // Accounts
        this.labelsAccounts = {};

        // Companies
        this.companies = [];
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

    async loadFECData(FECData) 
    {
        console.log(FECData);
        
        /* --- Comptes d'Immobilisations (2) --- */
        
        // Immobilisations
        this.immobilisations = [];
        await Promise.all(FECData.immobilisations.map((immobilisation) => this.addImmobilisation(immobilisation)));
        
        this.investments = [];
        await Promise.all(FECData.investments.map((investment) => this.addInvestment(investment)));
        
        this.depreciations = [];
        await Promise.all(FECData.depreciations.map((depreciation) => this.addDepreciation(depreciation)));

        /* --- Comptes de Stocks (3) --- */
        
        this.stocks =[];
        await Promise.all(FECData.stocks.map((stock) => this.addStock(stock)));
        
        /* --- Comptes de Charges (7) --- */
        
        // 60, 61, 62
        this.expenses = [];
        await Promise.all(FECData.expenses.map((expense) => this.addExpense(expense)));
        
        // 603 & 71
        this.stocksVariations =[];
        await Promise.all(FECData.stocksVariations.map((stockVariation) => this.addStockVariation(stockVariation)));

        // Other expenses
        this.taxes = FECData.taxes;
        this.personnelExpenses = FECData.personnelExpenses;
        this.otherExpenses = FECData.otherExpenses;
        this.financialExpenses = FECData.financialExpenses;
        this.exceptionalExpenses = FECData.exceptionalExpenses;
        this.provisions = FECData.provisions;

        /* --- Comptes de Produits (7) --- */

        // 70
        this.revenue = FECData.revenue;

        // 71
        // ...Cf. stocksVariations

        // 72
        this.immobilisedProduction = FECData.immobilisedProduction;

        // Other figures
        this.otherOperatingIncomes = FECData.otherOperatingIncomes;
        this.taxOnProfits = FECData.taxOnProfits;

        /* --- Companies --- */

        this.companies = [];
        await Promise.all(this.expenses.concat(this.investments)
                                       .map(expense => {return({account: expense.accountAux, accountLib: expense.accountAuxLib})})
                                       .filter((value, index, self) => index === self.findIndex(item => item.account === value.account))
                                       .map(({account,accountLib}) => this.addCompany({account, corporateName: accountLib})));
        
        /* --- INITIAL STATES --- */

        // Default initial states
        this.immobilisations.forEach(immobilisation => {immobilisation.initialState = (this.investments.filter(investment => investment.account == immobilisation.account).length > 0) ? "currentFootprint" : "defaultData";})
        this.stocks.filter(stock => !stock.isProductionStock)
                   .forEach(stock => {stock.initialState = (this.expenses.filter(expense => expense.account == stock.accountAux).length > 0) ? "currentFootprint" : "defaultData";})
        this.stocks.filter(stock => stock.isProductionStock)
                   .forEach(stock => stock.initialState = "currentFootprint")

        this.isFinancialDataLoaded = true;
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