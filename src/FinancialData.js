
import { Expense } from './Expense';
import { Immobilisation } from './Immobilisation';
import { Depreciation } from './Depreciation'
import { Company } from './Company';

import { metaAccounts } from '../lib/accounts.js';
import { SocialFootprint } from './SocialFootprint';
import { EconomicValue } from './EconomicValue';

import { getNewId } from './utils/Utils';

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
        this.storedPurchases = null;
        this.unstoredPurchases = null;
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
        this.revenue = backUp.revenue;
        this.production = backUp.production;
        this.storedProduction = backUp.storedProduction;
        this.unstoredProduction = backUp.unstoredProduction;
        this.immobilisedProduction = backUp.immobilisedProduction;
        
        this.amountExpenses = backUp.amountExpenses;
        this.amountExpensesFixed = backUp.amountExpensesFixed;
        this.updateExpensesFromBackUp(backUp.expenses);
        this.storedPurchases =(backUp.storedPurchases);
        this.unstoredPurchases = backUp.unstoredPurchases;
        this.updatePurchasesDiscountsFromBackUp(backUp.purchasesDiscounts);
        
        this.amountDepreciations = backUp.amountDepreciations;
        this.amountDepreciationsFixed = backUp.amountDepreciationsFixed;
        this.updateDepreciationsFromBackUp(backUp.depreciations);
        this.updateImmobilisationsFromBackUp(backUp.immobilisations);
        this.updateInvestmentsFromBackUp(backUp.investments);
        
        this.netValueAdded = backUp.netValueAdded;

        this.accounts = backUp.accounts;

        this.updateCompaniesFromBackUp(backUp.companies);
    }
     
    updateExpensesFromBackUp(backUpExpenses) {
        backUpExpenses.forEach((backUpExpense) => {
            let expense = new Expense({id: backUpExpense.id});
            expense.updateFromBackUp(backUpExpense);
            this.expenses.push(expense);
        })
    }

    updatePurchasesDiscountsFromBackUp(backUpPurchasesDiscounts) {
        backUpPurchasesDiscounts.forEach((backUpDiscount) => {
            let discount = new Expense({id: bac.id});
            discount.updateFromBackUp(backUpDiscount);
            this.expenses.push(discount);
        })
    }

    updateDepreciationsFromBackUp(backUpDepreciations) {
        backUpDepreciations.forEach((backUpDepreciation) => {
            let depreciation = new Depreciation({id: backUpDepreciation.id});
            depreciation.updateFromBackUp(backUpDepreciation);
            this.depreciations.push(depreciation);
        })
    }

    updateImmobilisationsFromBackUp(backUpImmobilisations) {
        backUpImmobilisations.forEach((backUpImmobilisation) => {
            let immobilisation = new Immobilisation({id: backUpImmobilisation.id});
            immobilisation.updateFromBackUp(backUpImmobilisation)
            this.immobilisations.push(immobilisation);
        })
    }

    updateInvestmentsFromBackUp(backUpInvestments) {
        backUpInvestments.forEach((backUpInvestment) => {
            let investment = new Expense({id: backUpInvestment});
            investment.updateFromBackUp(backUpInvestment)
            this.investments.push(investment);
        })
    }

    updateCompaniesFromBackUp(backUpCompanies) {
        backUpCompanies.forEach((backUpCompany) => {
            let company = new Company({id: backUpCompany.id});
            company.updateFromBackUp(backUpCompany)
            this.companies.push(company);
        })
    }

    /* ---------------------------------------------------- */
    /* -------------------- FEC SETTER -------------------- */
    /* ---------------------------------------------------- */

    async setFECData(FECData) 
    {
        // Accounts
        this.accounts = FECData.accounts;

        // Production
        this.setRevenue(FECData.revenue);
        this.setStoredProduction(FECData.stockInitProduction - FECData.unstoredProduction + FECData.storedProduction);
        this.setUnstoredProduction(FECData.stockInitProduction);
        this.setImmobilisedProduction(FECData.immobilisedProduction);

        // Expenses
        this.removeExpenses();
        this.amountExpensesFixed = false;
        await Promise.all(FECData.expenses.map(async (expense) => {
            expense.companyName = this.accounts[expense.accountProvider];
            await this.addExpense(expense);
        }));
        if (FECData.expenses.length == 0) this.setAmountExpenses(0);
        this.storedPurchases = FECData.storedPurchases;
        this.unstoredPurchases = FECData.stockInitPurchases - FECData.unstoredPurchases + FECData.storedPurchases;

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
        if (this.getGrossValueAdded()!=null & this.getAmountDepreciations()!=null)  {return this.getGrossValueAdded() - this.getAmountDepreciations()}
        else                                                                        {return null}
    }
    getGrossValueAdded() {
        if (this.production!=null && this.getAmountExpenses()!=null) {return this.production - this.getAmountExpenses()}
        else                                                         {return null}
    }

    // REVENUE EXPENDITURES

    getAmountIntermediateConsumption() {return this.getAmountExpenses() + this.getVariationStockPurchases() - this.getAmountPurchasesDiscounts()}
    getVariationStockPurchases() {return this.unstoredPurchases - this.storedPurchases}

    getStoredPurchases() {return this.storedPurchases}
    getUnstoredPurchases() {return this.unstoredPurchases}

    getAmountPurchasesDiscounts() {
        if (this.purchasesDiscounts.length > 0) {return this.purchasesDiscounts.map(discount => discount.amount).reduce((a,b) => a + b,0)}
        else                                    {return null}
    }

    getAmountExpenses() {
        if (this.amountExpensesFixed)       {return this.amountExpenses} 
        else if (this.expenses.length > 0)  {return this.expenses.map(expense => expense.amount).reduce((a,b) => a + b,0)} 
        else                                {return null}
    }
    getAmountDetailedExpenses() {
        if (this.expenses.length > 0) {return this.expenses.map(expense => expense.amount).reduce((a,b) => a + b,0)}
        else                          {return null}
    }
    // CAPITAL EXPENDITURES

    getAmountDepreciations() {
        if (this.amountDepreciationsFixed)      {return this.amountDepreciations} 
        else if (this.depreciations.length > 0) {return this.depreciations.map(depreciation => depreciation.amount).reduce((a,b) => a + b,0)}
        else                                    {return null}
    }
    getAmountDetailedDepreciations() {
        if (this.depreciations.length > 0) {return this.depreciations.map(depreciation => depreciation.amount).reduce((a,b) => a + b,0)}
        else                               {return null}
    }

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
    async addExpense(props) {
        let {accountProvider,companyName} = props;
        // Company
        let company = this.getCompanyByName(companyName) || this.addCompany({account: accountProvider, corporateName: companyName});
            props.companyId = company.id;
            props.footprint = company.footprint;
        // New expense
        let expense = new Expense({id: getNewId(this.expenses),...props});
        this.expenses.push(expense);
        return expense;
    }

    // Get expense (by id)
    getExpense(id) {return this.expenses.filter(expense => expense.id==id)[0]}

    // Update expense
    async updateExpense(nextProps) {
        let {id,companyName} = nextProps;
        let expense = this.getExpense(id);
        // Company
        let company = this.getCompanyByName(companyName) || this.addCompany({corporateName: companyName});
            nextProps.companyId = company.id;
            nextProps.footprint = company.footprint;
        // Update
        expense.update(nextProps);
        // Check amount details
        if (this.amountExpensesFixed && this.getAmountDetailedExpenses() > this.amountExpenses) this.setAmountExpensesFixed(false);
    }

    // Remove expense (by id)
    removeExpense(id) {this.expenses = this.expenses.filter(expense => expense.getId()!=id)}
    
    /* ----- Expenses ----- */

    // Get expenses array
    getExpenses() {return this.expenses}

    // Remove expenses
    removeExpenses() {this.expenses = []}

    /* ------------------------------- */
    /* ---------- Discounts ---------- */
    /* ------------------------------- */

    /* ----- Discount ----- */
      
    // Add new discount & return it
    async addDiscount(props) {
        let {accountProvider,companyName} = props;
        // Company
        let company = this.getCompanyByName(companyName) || this.addCompany({account: accountProvider, corporateName: companyName});
            props.companyId = company.id;
            props.footprint = company.footprint;
        // New expense
        let discount = new Expense({id: getNewId(this.purchasesDiscounts),...props});
        this.purchasesDiscounts.push(discount);
        return discount;
    }

    // Get discount (by id)
    getDiscount(id) {return this.purchasesDiscounts.filter(discount => discount.id==id)[0]}

    // Update discount
    async updateDiscount(nextProps) {
        let {id,companyName} = nextProps;
        let discount = this.getDiscount(id);
        // Company
        let company = this.getCompanyByName(companyName) || this.addCompany({corporateName: companyName});
            nextProps.companyId = company.id;
            nextProps.footprint = company.footprint;
        // Update
        discount.update(nextProps);
    }

    // Remove discount (by id)
    removeDiscount(id) {this.purchasesDiscounts = this.purchasesDiscounts.filter(discount => discount.getId()!=id)}
    
    /* ----- Expenses ----- */

    // Get expenses array
    getPurchasesDiscounts() {return this.purchasesDiscounts}

    // Remove expenses
    removePurchasesDiscounts() {this.purchasesDiscounts = []}

    /* ------------------------------------- */
    /* ---------- Immobilisations ---------- */
    /* ------------------------------------- */

    /* ----- Immobilisation ----- */

    // Add new immobilisation & return it
    async addImmobilisation(props) {
        // Footprint
        let footprint = new SocialFootprint();
            props.footprint = footprint;
            // ...init values
        // New immobilisation
        let immobilisation = new Immobilisation({id: getNewId(this.immobilisations),...props});
        this.immobilisations.push(immobilisation);
        return immobilisation;
    }

    getImmobilisation(id) {return this.immobilisations.filter(immobilisation => immobilisation.id==id)[0]}
    getImmobilisationByAccount(account) {return this.immobilisations.filter(immobilisation => immobilisation.account==account)[0]}

    async updateImmobilisation(nextProps) {
        let {id,account} = nextProps;
        let immobilisation = this.getImmobilisation(id);
        // Update depreciations
        this.depreciations.filter(depreciation => depreciation.accountImmobilisation==immobilisation.account)
                          .forEach(depreciation => depreciation.accountImmobilisation = account)
        // Update investments
        this.investments.filter(investment => investment.accountImmobilisation==immobilisation.account)
                        .forEach(investment => investment.accountImmobilisation = account)
        // Immobilisation
        immobilisation.update(nextProps);
    }

    removeImmobilisation(id) {
        let {account} = this.getImmobilisation(id);
        this.investments = this.investments.filter(investment => investment.accountImmobilisation!=account)
        this.depreciations = this.depreciations.filter(depreciation => depreciation.accountImmobilisation!=account)
        this.immobilisations = this.immobilisations.filter(immobilisation => immobilisation.id!=id)
    }

    /* ----- Immobilisations ----- */

    removeImmobilisations() {this.immobilisations = []}


    /* --------------------------------- */
    /* ---------- Investments ---------- */
    /* --------------------------------- */

    /* ----- Investments ----- */

    // Add new depreciation & return it
    async addInvestment(props) {
        let {label,amount,account,accountProvider,companyName} = props;
        // Company
        let company = this.getCompanyByName(companyName) || this.addCompany({account: accountProvider, corporateName: companyName});
            props.companyId = company.id;
            props.footprint = company.footprint;
        // New Investment
        let investment = new Expense({id: getNewId(this.investments),...props})
        this.investments.push(investment);
        return investment;
    }

    getInvestment(id) {return this.investments.filter(investment => investment.id==id)[0]}

    async updateInvestment(nextProps) {
        let {id,companyName} = nextProps;
        let expense = this.getInvestment(id);
        // Company
        let company = this.getCompanyByName(companyName) || this.addCompany({corporateName: companyName});
            nextProps.companyId = company.id;
            nextProps.footprint = company.footprint;
        // Update Investment
        expense.update(nextProps);
    }

    removeInvestment(id) {this.investments = this.investments.filter(investment => investment.id!=id)}

    /* ----- Investments ----- */

    removeInvestments() {this.investments = []}
    

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
    async addDepreciation(props) {
        let {accountImmobilisation} = props;
        // Immobilisation
        let immobilisation = this.getImmobilisationByAccount(accountImmobilisation);
            props.footprint = immobilisation.footprint;
        // New depreciation
        let depreciation = new Depreciation({id: getNewId(this.depreciations),...props});
        this.depreciations.push(depreciation);
        return depreciation;
    }
    
    // Get depreciation object
    getDepreciation(id) {return this.depreciations.filter(depreciation => depreciation.getId()==id)[0]}

    // Update depreciation
    async updateDepreciation(nextProps) {
        let {id,accountImmobilisation} = nextProps;
        let depreciation = this.getDepreciation(id);
        // Immobilisation
        let immobilisation = this.getImmobilisationByAccount(accountImmobilisation);
            nextProps.footprint = immobilisation.footprint;
        // Update
        depreciation.update(nextProps);
        if (this.amountDepreciationsFixed && this.getAmountDetailedDepreciations() > this.amountDepreciations) this.setAmountDepreciationsFixed(false);
    }

    // Remove depreciation (by id)
    removeDepreciation(id) {this.depreciations = this.depreciations.filter(depreciation => depreciation.getId()!=id)}

    /* ----- Depreciations ----- */
    
    // Get expenses array
    getDepreciations() {return this.depreciations}

    // Remove expenses
    removeDepreciations() {this.depreciations = []}

    /* ------------------------------- */
    /* ---------- Companies ---------- */
    /* ------------------------------- */

    /* ----- Company ----- */
      
    // Add new company & return it (inside function)
    // ...if used outside, check if the name available
    addCompany(props) {
        let company = new Company({id: getNewId(this.companies),...props});
        //await company.fetchData();
        this.companies.push(company);
        return company;
    }

    // Get expense object
    getCompany(id) {return this.companies.filter(company => company.getId()==id)[0]}
    getCompanyByAccount(account) {return this.companies.filter(company => company.account==account)[0]}
    getCompanyByName(name) {return this.companies.filter(company => company.corporateName==name)[0]}

    // Update company
    async updateCompany(nextProps) {
        let company = this.getCompany(nextProps.id);
        await company.update(nextProps);
        // Updates expenses & investments
        this.expenses.concat(this.investments).concat(this.purchasesDiscounts).filter(expense => expense.companyId == company.id).forEach((expense) => {
            expense.companyName = company.corporateName;
            expense.footprint = company.footprint;
        })
    }

    // Remove company (by id)
    removeCompany(id) {this.companies = this.companies.filter(company => company.getId()!=id)}

    /* ----- Companies ----- */

    // Update all companies
    fetchDataCompanies() {
        this.companies.forEach((company) => {company.fetchData()})
    }

    // Remove expenses
    refreshCompanies() {
        this.companies = [];
        let names = [];
        this.expenses.concat(this.depreciations).forEach((expense) => {
            if (names.includes(expense.corporateName)) {
                this.companies.filter(company => company.corporateName == expense.corporateName)[0].amount+= expense.amount;
            } else {
                let company = new Company({
                    id: this.getId(this.companies),
                    corporateId: expense.corporateId,
                    corporateName: expense.corporateName,
                    areaCode: expense.areaCode,
                    corporateActivity: expense.corporateActivity,
                    amount: expense.amount
                })
                this.companies.push(company);
                names.push(expense.corporateName);
            }
        })
    }

    // Get companies array
    getCompanies() {
        let usedCompanies = [];
        this.expenses.concat(this.investments).forEach((expense) => {
            let company = usedCompanies.filter(company => company.id == expense.companyId)[0];
            if (company==undefined) {
                company = this.getCompany(expense.companyId)
                company.amount = expense.amount;
                usedCompanies.push(company)
            } else {
                company.amount+= expense.amount;
            }
        })
        return usedCompanies;
    }

    getCompaniesExpenses() {
        let usedCompanies = [];
        this.expenses.forEach((expense) => {
            let company = usedCompanies.filter(company => company.id == expense.companyId)[0];
            if (company==undefined) {
                company = this.getCompany(expense.companyId)
                company.amount = expense.amount;
                usedCompanies.push(company)
            } else {
                company.amount+= expense.amount;
            }
        })
        return usedCompanies;
    }

    getCompaniesDepreciations() {
        let usedCompanies = [];
        this.depreciations.forEach((expense) => {
            let company = usedCompanies.filter(company => company.id == expense.companyId)[0];
            if (company==undefined) {
                company = this.getCompany(expense.companyId)
                company.amount = expense.amount;
                usedCompanies.push(company)
            } else {
                company.amount+= expense.amount;
            }
        })
        return usedCompanies;
    }

    getAllCompanies() {
        return this.companies;
    }

    /* ------------------------------ */
    /* ---------- Accounts ---------- */
    /* ------------------------------ */

    getExpensesAccounts() {
        let accounts = {};
        accounts[""] = {amount: 0, label: metaAccounts.accountsExpenses[""]};
        this.expenses.forEach((expense) => {
            if (expense.account!=undefined & expense.account.length >= 2) {
                let account = expense.account.substring(0,2);
                if (accounts[account]==undefined) accounts[account] = {amount: 0, label: metaAccounts.accountsExpenses[account]};
                accounts[account].amount+= expense.amount;
            } else {
                accounts[""].amount+= expense.amount;
            }
        })
        if (this.amountExpensesFixed) {
            accounts[""].amount+= this.getAmountExpenses()-this.getAmountDetailedExpenses();
        }
        if (accounts[""].amount == 0) delete accounts[""];
        return accounts;
    }

    getDepreciationsAccounts() {
        let accounts = {};
        accounts[""] = {amount: 0, label: metaAccounts.accountsDepreciations[""]};
        this.depreciations.forEach((depreciation) => {
            if (depreciation.account!=undefined & depreciation.account.length >= 3) {
                let account = depreciation.account.substring(0,3);
                if (accounts[account]==undefined) accounts[account] = {amount: 0, label: metaAccounts.accountsDepreciations[account]};
                accounts[account].amount+= depreciation.amount;
            } else {
                accounts[""].amount+= depreciation.amount;
            }
        })
        if (this.amountDepreciationsFixed) {
            accounts[""].amount+= this.getAmountDepreciations()-this.getAmountDetailedDepreciations();
        }
        if (accounts[""].amount == 0) delete accounts[""];
        return accounts;
    }

}