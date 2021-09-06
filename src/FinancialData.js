
import { Expense } from './Expense';
import { Immobilisation } from './Immobilisation';
import { Depreciation } from './Depreciation'
import { Company } from './Company';
import { SocialFootprint } from './SocialFootprint';

import { metaAccounts } from '../lib/accounts.js';

import { getNewId, ifCondition, valueOrDefault } from './utils/Utils';
import { Stock } from './Stock';

export class FinancialData {

    constructor() 
    {
        // Production
        this.revenue = null;
        this.production = null;
        this.storedProduction = null;
        this.unstoredProduction = null;
        this.immobilisedProduction = null;

        // Expenses
        this.amountExpenses = null;
        this.amountExpensesFixed = false;
        this.expenses = [];
        this.initialStocks = [];
        this.finalStocks = [];
        this.purchasesDiscounts = [];

        // Immobilisations
        this.amountDepreciations = null;
        this.amountDepreciationsFixed = false;
        this.depreciations = [];
        this.immobilisations = [];
        this.investments = [];

        // Net Value Added
        this.netValueAdded = null;

        // Accounts
        this.accounts = {};

        // Companies
        this.companies = [];
    }

    /* ----- Back Up ----- */

    updateFromBackUp(backUp) 
    {
        // Amounts
        this.revenue = backUp.revenue;
        this.production = backUp.production;
        this.storedProduction = backUp.storedProduction;
        this.unstoredProduction = backUp.unstoredProduction;
        this.immobilisedProduction = backUp.immobilisedProduction;
        this.amountExpenses = backUp.amountExpenses;
        this.amountDepreciations = backUp.amountDepreciations;
        this.netValueAdded = backUp.netValueAdded;
        
        // Booleans
        this.amountExpensesFixed = backUp.amountExpensesFixed;
        this.amountDepreciationsFixed = backUp.amountDepreciationsFixed;

        // flows
        this.expenses = backUp.expenses.map(expense => new Expense(expense))
        this.initialStocks = backUp.initialStocks.map(initialStock => new Stock(initialStock))
        this.finalStocks = backUp.finalStocks.map(finalStock => new Stock(finalStock))
        this.purchasesDiscounts = backUp.purchasesDiscounts.map(purchasesDiscount => new Expense(purchasesDiscount))
        this.depreciations = backUp.depreciations.map(depreciation => new Depreciation(depreciation))
        this.immobilisations = backUp.immobilisations.map(immobilisation => new Immobilisation(immobilisation))
        this.investments = backUp.investments.map(investment => new Expense(investment))
        
        // Meta
        this.accounts = backUp.accounts;
        this.companies = backUp.companies.map(company => new Company(company))
    }

    /* ---------------------------------------------------- */
    /* -------------------- FEC LOADER -------------------- */
    /* ---------------------------------------------------- */

    async loadFECData(FECData) 
    {
        // Accounts
        this.accounts = FECData.accounts;

        // Production
        this.setRevenue(FECData.revenue);
        this.setStoredProduction(FECData.stockInitProduction - FECData.unstoredProduction + FECData.storedProduction);
        this.setUnstoredProduction(FECData.stockInitProduction);
        this.setImmobilisedProduction(FECData.immobilisedProduction);

        // Stocks
        this.removeInitialStocks();
        await Promise.all(FECData.initialStocks.map(async (stock) => {
            await this.addInitialStock(stock);
        }));
        this.removeFinalStocks();
        await Promise.all(FECData.stocksVariations.map(async (variation) => {
            let initialStock = this.getInitialStockByAccount(variation.account);
            let amount = (initialStock!=undefined ? initialStock.amount : 0) + variation.amount;
            await this.addFinalStock({label: variation.label, account: variation.account, amount: amount});
        }));

        // Expenses
        this.removeExpenses();
        this.amountExpensesFixed = false;
        await Promise.all(FECData.expenses.map(async (expense) => {
            expense.companyName = this.accounts[expense.accountProvider];
            await this.addExpense(expense);
        }));
        if (FECData.expenses.length == 0) this.setAmountExpenses(0);

        this.removePurchasesDiscounts();
        await Promise.all(FECData.purchasesDiscounts.map(async (discount) => {
            discount.companyName = this.accounts[discount.accountProvider];
            await this.addDiscount(discount);
        }));

        // Immobilisations
        this.removeImmobilisations();
        await Promise.all(FECData.immobilisations.map(async (immobilisation) => {
            let accountDepreciation = "28"+immobilisation.account.slice(1,-1);
            let depreciationInit = FECData.depreciationsInit.filter(depreciation => depreciation.account == accountDepreciation)[0];
            if (depreciationInit!=undefined) immobilisation.amount+= -depreciationInit.amount; 
            await this.addImmobilisation(immobilisation);
        }));
        
        this.removeInvestments();
        await Promise.all(FECData.investments.map(async (investment) => {
            investment.companyName = this.accounts[investment.accountProvider];
            await this.addInvestment(investment);
        }));
        
        this.removeDepreciations();
        this.amountDepreciationsFixed = false;
        await Promise.all(FECData.depreciations.map(async (depreciation) => {
            depreciation.accountImmobilisation = "2"+depreciation.account.substring(2)+"0";
            await this.addDepreciation(depreciation);
        }));
        if (FECData.depreciations.length == 0) this.setAmountDepreciations(0);

        // Default initial states
        this.immobilisations.forEach(immobilisation => {
            immobilisation.initialState = ((this.investments.filter(investment => investment.account == immobilisation.account)).length > 0) ? "currentFootprint" : "defaultData";
        })
        this.initialStocks.forEach(stock => {
            stock.initialState = ((this.expenses.filter(expense => expense.account == stock.accountPurchases)).length > 0) ? "currentFootprint" : "defaultData";
        })

    }
    
    /* --------------------------------------------------------- */
    /* -------------------- AMOUNTS GETTERS -------------------- */
    /* --------------------------------------------------------- */
    
    // PRODUCTION AGGREGATES
    
    getRevenue() {return this.revenue}
    getProduction() {return this.production}
    getStoredProduction() {return this.storedProduction}
    getUnstoredProduction() {return this.unstoredProduction}
    getImmobilisedProduction() {return this.immobilisedProduction}
    
    // NET / GROSS VALUE ADDED
    
    getNetValueAdded() {
        if (this.getGrossValueAdded()!=null && this.getAmountDepreciations()!=null)  {return this.getGrossValueAdded() - this.getAmountDepreciations()}
        else                                                                         {return null}
    }

    getGrossValueAdded() {
        if (this.production!=null && this.getAmountIntermediateConsumption()!=null) {return this.production - this.getAmountIntermediateConsumption()}
        else                                                                        {return null}
    }

    // REVENUE EXPENDITURES

    getAmountIntermediateConsumption() {
        if (this.getAmountExpenses()!=null && this.getVariationStocks()!=null) {
            return this.getAmountExpenses() + this.getVariationStocks()
        } else {return null}
    }

    getVariationStocks() 
    {return this.getAmountInitialStocks() - this.getAmountFinalStocks()}

    getAmountInitialStocks() 
    {return ifCondition(this.initialStocks.length > 0, this.initialStocks.map(stock => stock.amount).reduce((a,b) => a + b,0))}
    
    getAmountFinalStocks() 
    {return ifCondition(this.finalStocks.length > 0, this.finalStocks.map(stock => stock.amount).reduce((a,b) => a + b,0))}

    
    getAmountExpenses() {
        if (this.amountExpensesFixed)       {return this.amountExpenses} 
        else return ifCondition(this.expenses.length > 0, this.expenses.map(expense => expense.amount).reduce((a,b) => a + b,0) - valueOrDefault(this.getAmountPurchasesDiscounts(),0))
    }

    getAmountPurchasesDiscounts() 
    {return ifCondition(this.purchasesDiscounts.length > 0, this.purchasesDiscounts.map(discount => discount.amount).reduce((a,b) => a + b,0))}
    
    getAmountDetailedExpenses() 
    {return ifCondition(this.expenses.length > 0, this.expenses.map(expense => expense.amount).reduce((a,b) => a + b,0))}

    // CAPITAL EXPENDITURES

    getAmountDepreciations() {
        if (this.amountDepreciationsFixed)      {return this.amountDepreciations} 
        else if (this.depreciations.length > 0) {return this.depreciations.map(depreciation => depreciation.amount).reduce((a,b) => a + b,0)}
        else                                    {return null}
    }

    getAmountDetailedDepreciations() 
    {return ifCondition(this.depreciations.length > 0, this.depreciations.map(depreciation => depreciation.amount).reduce((a,b) => a + b,0))}

    /* ------------------------------------------------------ */
    /* -------------------- INTERACTIONS -------------------- */
    /* ------------------------------------------------------ */

    /* -------------------------------------- */
    /* ---------- Production items ---------- */
    /* -------------------------------------- */

    /* ----- Revenue ----- */

    setRevenue(amount) {
        this.revenue = amount;
        if (amount!=null) {
            this.updateProduction();
            this.updateUnstoredProduction();
        } else {
            this.production = null;
            this.storedProduction = null;
            this.unstoredProduction = null;
            this.immobilisedProduction = null;
        }
    }

    /* ----- Production ----- */

    setProduction(amount) {
        this.production = amount;
        // Stored & Immobilised Production
        if (this.production==null || this.production < (this.storedProduction+this.immobilisedProduction)) {
            this.storedProduction = null;
            this.immobilisedProduction = null;
        }
        let availableProduction = this.production-this.storedProduction-this.immobilisedProduction;
        // Revenue
        if (this.revenue==null) { 
            this.revenue = this.production-this.storedProduction-this.immobilisedProduction+this.unstoredProduction 
        } else if (availableProduction > this.revenue) {
            this.revenue = this.unstoredProduction+availableProduction;
        }
        // Unstored Production
        if (this.unstoredProduction==null) { 
            this.unstoredProduction = this.revenue+this.storedProduction+this.immobilisedProduction-this.production 
        } else if (availableProduction < this.revenue) {
            this.unstoredProduction = this.revenue-availableProduction;
        }
    }
    
    /* ----- Stock Production ----- */

    setStoredProduction(amount) {
        this.storedProduction = amount;
        this.updateProduction();
    }
    setUnstoredProduction(amount) {
        this.unstoredProduction = amount;
        this.updateProduction();
    }
    
    /* ----- Immobilised Production ----- */

    setImmobilisedProduction(amount) {
        this.immobilisedProduction = amount;
        this.updateProduction();
    }

    /* ----- Updaters ----- */
    updateProduction() {this.production = this.revenue+this.storedProduction+this.immobilisedProduction-this.unstoredProduction}
    updateUnstoredProduction() {this.unstoredProduction = this.revenue+this.storedProduction+this.immobilisedProduction-this.production}

    /* ---------------------------- */
    /* ---------- Stocks ---------- */
    /* ---------------------------- */

    /* ---------- Initial Stocks ---------- */

    /* ----- Stock ----- */
      
    // Add new stock & return it
    // /!\ must have an account number
    async addInitialStock(props) 
    {
        // Init expenditures account & footprint
        if (props.accountPurchases==undefined) props.accountPurchases = "60"+props.account.slice(1,-1);
        props.footprint = new SocialFootprint({});
        // New stock
        let stock = new Stock({id: getNewId(this.initialStocks),...props});
        this.initialStocks.push(stock);
        return stock;
    }
    
    // Update stock
    async updateInitialStock(nextProps) 
    {
        let stock = this.getInitialStock(nextProps.id);
        stock.update(nextProps);
    }
    
    getInitialStock(id) {return this.initialStocks.filter(stock => stock.id==id)[0]}
    getInitialStockByAccount(account) {return this.initialStocks.filter(stock => stock.account==account)[0]}
    removeInitialStock(id) {this.initialStocks = this.initialStocks.filter(stock => stock.id!=id)}
    
    /* ----- Stocks ----- */

    getInitialStocks() {return this.initialStocks}
    removeInitialStocks() {this.initialStocks = []}

    /* ---------- Final Stocks ---------- */

    /* ----- Stock ----- */
      
    // Add new stock & return it
    // /!\ must have an account number
    async addFinalStock(props) 
    {
        // Init expenditures account & footprint
        if (props.accountPurchases==undefined) props.accountPurchases = "60"+props.account.slice(1,-1);
        props.footprint = new SocialFootprint({});
        // New stock
        let stock = new Stock({id: getNewId(this.finalStocks),...props});
        this.finalStocks.push(stock);
        return stock;
    }
    
    // Update stock
    async updateFinalStock(nextProps) 
    {
        let stock = this.getFinalStock(nextProps.id);
        stock.update(nextProps);
    }
    
    getFinalStock(id) {return this.finalStocks.filter(stock => stock.id==id)[0]}
    getFinalStockByAccount(account) {return this.finalStocks.filter(stock => stock.account==account)[0]}
    removeFinalStock(id) {this.finalStocks = this.finalStocks.filter(stock => stock.id!=id)}
    
    /* ----- Stocks ----- */

    getFinalStocks() {return this.finalStocks}
    removeFinalStocks() {this.finalStocks = []}

    /* ------------------------------ */
    /* ---------- Expenses ---------- */
    /* ------------------------------ */

    /* ----- Amount ----- */

    setAmountExpenses(amount) {
        this.amountExpenses = amount >= this.getAmountDetailedExpenses() ? amount : this.getAmountDetailedExpenses();
        this.amountExpensesFixed = this.amountExpenses!=null;
    }
    
    setAmountExpensesFixed(fixed) {
        this.amountExpensesFixed = fixed;
        this.amountExpenses = this.getAmountExpenses();
    }

    /* ----- Expense ----- */
      
    // Add new expense & return it
    async addExpense(props) 
    {
        // Company
        let company = this.getCompanyByName(props.companyName) || await this.addCompany({account: props.accountProvider, corporateName: props.companyName});
        props.companyId = company.id;
        props.footprint = company.footprint;
        // New expense
        let expense = new Expense({id: getNewId(this.expenses),...props});
        this.expenses.push(expense);
        return expense;
    }
    
    // Update expense
    async updateExpense(nextProps) 
    {
        let expense = this.getExpense(nextProps.id);
        // Company
        let company = this.getCompanyByName(nextProps.companyName) || await this.addCompany({corporateName: nextProps.companyName});
        nextProps.companyId = company.id;
        nextProps.footprint = company.footprint;
        // Update
        expense.update(nextProps);
        // Check amount details
        if (this.amountExpensesFixed && this.getAmountDetailedExpenses() > this.amountExpenses) this.setAmountExpensesFixed(false);
    }
    
    getExpense(id) {return this.expenses.filter(expense => expense.id==id)[0]}
    removeExpense(id) {this.expenses = this.expenses.filter(expense => expense.getId()!=id)}
    
    /* ----- Expenses ----- */

    getExpenses() {return this.expenses}
    removeExpenses() {this.expenses = []}

    /* ------------------------------- */
    /* ---------- Discounts ---------- */
    /* ------------------------------- */

    /* ----- Discount ----- */
      
    // Add new discount & return it
    async addDiscount(props) 
    {
        // Company
        let company = this.getCompanyByName(props.companyName) || await this.addCompany({account: props.accountProvider, corporateName: props.companyName});
        props.companyId = company.id;
        props.footprint = company.footprint;
        // New discount
        let discount = new Expense({id: getNewId(this.purchasesDiscounts),...props});
        this.purchasesDiscounts.push(discount);
        return discount;
    }
    
    // Update discount
    async updateDiscount(nextProps) 
    {
        let discount = this.getDiscount(nextProps.id);
        // Company
        let company = this.getCompanyByName(nextProps.companyName) || await this.addCompany({corporateName: nextProps.companyName});
        nextProps.companyId = company.id;
        nextProps.footprint = company.footprint;
        // Update discount
        discount.update(nextProps);
        }
        
    getDiscount(id) {return this.purchasesDiscounts.filter(discount => discount.id==id)[0]}
    removeDiscount(id) {this.purchasesDiscounts = this.purchasesDiscounts.filter(discount => discount.getId()!=id)}
    
    /* ----- Discounts ----- */

    getPurchasesDiscounts() {return this.purchasesDiscounts}
    removePurchasesDiscounts() {this.purchasesDiscounts = []}

    /* ------------------------------------- */
    /* ---------- Immobilisations ---------- */
    /* ------------------------------------- */

    /* ----- Immobilisation ----- */

    // Add new immobilisation & return it
    async addImmobilisation(props) 
    {
        let immobilisation = new Immobilisation({id: getNewId(this.immobilisations),...props});
        this.immobilisations.push(immobilisation);
        return immobilisation;
    }
    
    // Update immobilisation
    async updateImmobilisation(nextProps) 
    {
        let immobilisation = this.getImmobilisation(nextProps.id);
        // if account changed -> update linked depreciations / investments
        if (nextProps.account!=undefined && nextProps.account!=immobilisation.account) {
            this.depreciations.filter(depreciation => depreciation.accountImmobilisation==immobilisation.account)
                              .forEach(depreciation => depreciation.accountImmobilisation = nextProps.account)
            this.investments.filter(investment => investment.accountImmobilisation==immobilisation.account)
                            .forEach(investment => investment.accountImmobilisation = nextProps.account)
        }
        // Update immobilisation
        await immobilisation.update(nextProps);
    }

    getImmobilisation(id) {return this.immobilisations.filter(immobilisation => immobilisation.id==id)[0]}
    getImmobilisationByAccount(account) {return this.immobilisations.filter(immobilisation => immobilisation.account==account)[0]}
    removeImmobilisation(id) {
        let {account} = this.getImmobilisation(id);
        this.investments = this.investments.filter(investment => investment.account!=account)
        this.depreciations = this.depreciations.filter(depreciation => depreciation.accountImmobilisation!=account)
        this.immobilisations = this.immobilisations.filter(immobilisation => immobilisation.id!=id)
    }

    /* ----- Immobilisations ----- */

    removeImmobilisations() {this.immobilisations = []}

    /* ----------------------------------- */
    /* ---------- Depreciations ---------- */
    /* ----------------------------------- */

    /* ----- Amount ----- */

    setAmountDepreciations(amount) {
        this.amountDepreciations = amount >= this.getAmountDetailedDepreciations() ? amount : this.getAmountDetailedDepreciations();
        this.amountDepreciationsFixed = this.amountDepreciations!=null;    
    }

    setAmountDepreciationsFixed(fixed) {
        this.amountDepreciationsFixed = fixed;
        this.amountDepreciations = this.getAmountDepreciations();
    }

    /* ----- Depreciation ----- */
    
    // Add new depreciation & return it
    // /!\ must be linked to an immobilisation account
    async addDepreciation(props) 
    {
        // fetch footprint from immobilisation
        let immobilisation = this.getImmobilisationByAccount(props.accountImmobilisation);
        props.footprint = immobilisation.footprint;
        // New depreciation
        let depreciation = new Depreciation({id: getNewId(this.depreciations),...props});
        this.depreciations.push(depreciation);
        return depreciation;
    }
    
    // Update depreciation
    async updateDepreciation(nextProps) 
    {
        let depreciation = this.getDepreciation(nextProps.id);
        // fetch footprint from immobilisation
        let immobilisation = this.getImmobilisationByAccount(nextProps.accountImmobilisation);
        nextProps.footprint = immobilisation.footprint;
        // Update depreciation
        depreciation.update(nextProps);
        // check if amount fixed
        if (this.amountDepreciationsFixed && this.getAmountDetailedDepreciations() > this.amountDepreciations) this.setAmountDepreciationsFixed(false);
    }
    
    getDepreciation(id) {return this.depreciations.filter(depreciation => depreciation.getId()==id)[0]}
    removeDepreciation(id) {this.depreciations = this.depreciations.filter(depreciation => depreciation.getId()!=id)}

    /* ----- Depreciations ----- */
    
    getDepreciations() {return this.depreciations}
    removeDepreciations() {this.depreciations = []}

    /* --------------------------------- */
    /* ---------- Investments ---------- */
    /* --------------------------------- */

    /* ----- Investments ----- */

    // Add new depreciation & return it
    // /!\ must have the name of the company
    async addInvestment(props) 
    {
        // Company
        let company = this.getCompanyByName(props.companyName) || await this.addCompany({account: props.accountProvider, corporateName: props.companyName});
        props.companyId = company.id;
        props.footprint = company.footprint;
        // New Investment
        let investment = new Expense({id: getNewId(this.investments),...props})
        this.investments.push(investment);
        return investment;
    }

    // Update investment
    async updateInvestment(nextProps) 
    {
        let investment = this.getInvestment(nextProps.id);
        // Company
        let company = this.getCompanyByName(nextProps.companyName) || await this.addCompany({corporateName: nextProps.companyName});
        nextProps.companyId = company.id;
        nextProps.footprint = company.footprint;
        // Update Investment
        investment.update(nextProps);
    }
    
    getInvestment(id) {return this.investments.filter(investment => investment.id==id)[0]}
    removeInvestment(id) {this.investments = this.investments.filter(investment => investment.id!=id)}

    /* ----- Investments ----- */

    removeInvestments() {this.investments = []}
    
    /* ------------------------------- */
    /* ---------- Companies ---------- */
    /* ------------------------------- */

    /* ----- Company ----- */

    getCompany(id) {return this.companies.filter(company => company.getId()==id)[0]}

    getCompanyByAccount(account) {return this.companies.filter(company => company.account==account)[0]}
    getCompanyByName(name) {return this.companies.filter(company => company.corporateName==name)[0]}
    
    // Add new company & return it (inside function)
    // /!\ must check if the name available as it's a key props
    async addCompany(props) 
    {
        let company = new Company({id: getNewId(this.companies),...props});
        this.companies.push(company);
        return company;
    }

    // Update company
    async updateCompany(nextProps) 
    {
        let company = this.getCompany(nextProps.id);
        // Update company
        await company.update(nextProps);
        // Updates expenditures linked to the company
        this.expenses.concat(this.investments).concat(this.purchasesDiscounts)
                     .filter(expense => expense.companyId == company.id)
                     .forEach(expense => {
            expense.companyName = company.corporateName;
            expense.footprint = company.footprint;
        })
    }

    /* ----- Companies ----- */

    // Get requested companies for expenditures
    //  ...used to set ids
    getCompanies() 
    {
        let usedCompanies = [];
        // scan revenue expenditures & capital expenditures
        this.expenses.concat(this.investments).forEach((expense) => {
            if (usedCompanies.map(company => company.id).includes(expense.companyId)) {
                let company = usedCompanies.filter(company => company.id == expense.companyId)[0];
                company.amount+= expense.amount;
            } else {
                let company = this.getCompany(expense.companyId)
                company.amount = expense.amount;
                usedCompanies.push(company)
            }
        })
        // take discounts into account
        this.purchasesDiscounts.forEach(discount => {
            let company = usedCompanies.filter(company => company.id == discount.companyId)[0];
            if (company!=undefined) company.amount-= discount.amount;
        })
        return usedCompanies;
    }

    // Get requested companies for revenue expenditures
    //  ...used for adding discount
    getCompaniesExpenses() 
    {
        let usedCompanies = [];
        // scan revenue expenditures
        this.expenses.forEach(expense => {
            if (usedCompanies.map(company => company.id).includes(expense.companyId)) {
                let company = usedCompanies.filter(company => company.id == expense.companyId)[0];
                company.amount+= expense.amount;
            } else {
                let company = this.getCompany(expense.companyId)
                company.amount = expense.amount;
                usedCompanies.push(company)
            }
        })
        // take discounts into account
        this.purchasesDiscounts.forEach(discount => {
            let company = usedCompanies.filter(company => company.id == discount.companyId)[0];
            if (company!=undefined) company.amount-= discount.amount;
        })
        return usedCompanies;
    }

    /* ------------------------------------------------------------------ */
    /* ---------- Amounts Expenses / Depreciations by Accounts ---------- */
    /* ------------------------------------------------------------------ */

    // Expenses
    getExpensesAccounts() 
    {
        let accounts = {};
        // group expenses by account
        this.expenses.forEach(expense => {
            let account = (expense.account!=undefined & expense.account.length >= 2) ? expense.account.substring(0,2) : "";
            if (accounts[account]==undefined) accounts[account] = {amount: 0, label: metaAccounts.accountsExpenses[account]};
            accounts[account].amount+= expense.amount;
        })
        // add gap
        if (this.amountExpensesFixed) {
            if (accounts[""]==undefined) accounts[""] = {amount: 0, label: metaAccounts.accountsExpenses[""]};
            accounts[""].amount+= this.getAmountExpenses()-this.getAmountDetailedExpenses();
        }
        // return
        return accounts;
    }

    // Depreciations
    getDepreciationsAccounts() 
    {
        let accounts = {};
        // group depreciations by account
        this.depreciations.forEach(depreciation => {
            let account = (depreciation.account!=undefined && depreciation.account.length >= 3) ? depreciation.account.substring(0,3) : "";
            if (accounts[account]==undefined) accounts[account] = {amount: 0, label: metaAccounts.accountsDepreciations[account]};
            accounts[account].amount+= depreciation.amount;
        })
        // add gap
        if (this.amountDepreciationsFixed) {
            if (accounts[""]==undefined) accounts[""] = {amount: 0, label: metaAccounts.accountsDepreciations[""]};
            accounts[""].amount+= this.getAmountDepreciations()-this.getAmountDetailedDepreciations();
        }
        // return
        return accounts;
    }

}