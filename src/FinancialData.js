
import { Expense } from './Expense.js';
import { Depreciation } from './Depreciation.js'
import { Company } from './Company';

import { metaAccounts } from '../lib/accounts.js';

export class FinancialData {

    constructor() 
    {
        // Production
        this.production = null;
        this.productionFixed = false;
        this.revenue = null;
        this.storedProduction = null;
        this.immobilisedProduction = null;
        this.unstoredProduction = null;
        // Expenses
        this.amountExpenses = null;
        this.amountExpensesFixed = false;
        this.expenses = [];
        // Depreciations
        this.amountDepreciations = null;
        this.amountDepreciationsFixed = false;
        this.depreciations = [];
        // Net Value Added
        this.netValueAdded = null;

        // Companies
        this.companies = [];
    }

    /* ----- Back Up ----- */

    updateFromBackUp(backUp) 
    {
        this.production = backUp.production;
        this.productionFixed = backUp.productionFixed;
        this.revenue = backUp.revenue;
        this.storedProduction = backUp.storedProduction;
        this.immobilisedProduction = backUp.immobilisedProduction;
        this.unstoredProduction = backUp.unstoredProduction;
        
        this.amountExpenses = backUp.amountExpenses;
        this.amountExpensesFixed = backUp.amountExpensesFixed;
        this.updateExpensesFromBackUp(backUp.expenses);
        this.amountExpenses = this.getAmountExpenses();
        
        this.amountDepreciations = backUp.amountDepreciations;
        this.amountDepreciationsFixed = backUp.amountDepreciationsFixed;
        this.updateDepreciationsFromBackUp(backUp.depreciations);
        this.amountDepreciations = this.getAmountDepreciations();
        
        this.netValueAdded = backUp.netValueAdded;

        this.updateCompaniesFromBackUp(backUp.companies);
    }
     
    updateExpensesFromBackUp(backUpExpenses) {
        backUpExpenses.forEach((backUpExpense) => {
            let expense = new Expense({id: this.getNewExpenseId()});
            expense.updateFromBackUp(backUpExpense);
            this.expenses.push(expense);
        })
    }

    updateDepreciationsFromBackUp(backUpDepreciations) {
        backUpDepreciations.forEach((backUpDepreciation) => {
            let depreciation = new Depreciation({id: this.getNewDepreciationId()});
            depreciation.updateFromBackUp(backUpDepreciation);
            this.depreciations.push(depreciation);
        })
    }

    updateCompaniesFromBackUp(backUpCompanies) {
        backUpCompanies.forEach((backUpCompany) => {
            let company = new Company({id: this.getNewCompanyId(), ...backUpCompany});
            this.companies.push(company);
        })
    }

    /* ----- FEC Data ----- */

    async setFECData(FECData) {
        // Production
        this.setRevenue(FECData.revenue!=null ? FECData.revenue : 0);
        this.setStoredProduction(FECData.storedProduction!=null ? FECData.storedProduction : 0);
        this.setImmobilisedProduction(FECData.immobilisedProduction!=null ? FECData.immobilisedProduction : 0);
        this.setUnstoredProduction(FECData.unstoredProduction!=null ? FECData.unstoredProduction : 0);
        // Expenses
        this.removeExpenses();
        this.amountExpensesFixed = false;
        await Promise.all(FECData.expenses.map(async (expense) => {
            await this.addExpense(expense);
        }));
        if (FECData.expenses.length == 0) this.setAmountExpenses(0);
        // Depreciations
        this.removeDepreciations();
        this.amountDepreciationsFixed = false;
        await Promise.all(FECData.depreciations.map(async (depreciation) => {
            await this.addDepreciation(depreciation);
        }));
        if (FECData.depreciations.length == 0) this.setAmountDepreciations(0);
        // Companies
        //this.refreshCompanies(); // possible to get the data from the reader in FECData
    }

    /* --------------------------------------------------------- */
    /* -------------------- AMOUNTS GETTERS -------------------- */
    /* --------------------------------------------------------- */

    // REVENUE

    getRevenue() {
        return this.revenue;
    }

    // PRODUCTION

    getProduction() {
        return this.production;
    }

    getStoredProduction() {
        return this.storedProduction;
    }

    getImmobilisedProduction() {
        return this.immobilisedProduction;
    }

    getUnstoredProduction() {
        return this.unstoredProduction;
    }

    // EXPENSES

    getAmountExpenses() {
        if (this.amountExpensesFixed) {
            return this.amountExpenses} 
        else if (this.expenses.length > 0) {
            let amount = 0.0;
            this.expenses.forEach((expense) => {amount+= expense.getAmount()});
            return amount} 
        else {return null}
    }

    getAmountDetailedExpenses() {
        if (this.expenses.length > 0) {
            let amount = 0.0;
            this.expenses.forEach((expense) => {amount+= expense.getAmount()});
            return amount;
        } else {
            return null;
        }
    }

    // GROSS VALUE ADDED

    getGrossValueAdded() {
        if (this.production!=null & this.getAmountExpenses()!=null) {
            return this.production - this.getAmountExpenses();
        } else {
            return null;
        }
    }

    // DEPRECIATIONS

    getAmountDepreciations() {
        if (this.amountDepreciationsFixed) {
            return this.amountDepreciations} 
        else if (this.depreciations.length > 0) {
            let amount = 0.0;
            this.depreciations.forEach((depreciation) => {amount+= depreciation.getAmount()});
            return amount}
        else {return null}
    }

    getAmountDetailedDepreciations() {
        if (this.depreciations.length > 0) {    
            let amount = 0.0;
            this.depreciations.forEach((depreciation) => {amount+= depreciation.getAmount()});
            return amount;
        } else {
            return null;
        }
    }

    // NET VALUE ADDED

    getNetValueAdded() {
        if (this.production!=null & this.getAmountExpenses()!=null & this.getAmountDepreciations()!=null) {
            return this.production - this.getAmountExpenses() - this.getAmountDepreciations();
        } else {
            return null;
        }
    }

    /* ------------------------------------------------------ */
    /* -------------------- INTERACTIONS -------------------- */
    /* ------------------------------------------------------ */

    /* -------------------------------------- */
    /* ---------- Production items ---------- */
    /* -------------------------------------- */

    /* ----- Revenue ----- */

    // Setter
    setRevenue(amount) {
        this.revenue = amount;
        if (this.revenue!=null) {
            this.updateProduction();
            this.updateUnstoredProduction();
        } else {
            this.production = null;
            this.storedProduction = null;
            this.immobilisedProduction = null;
            this.unstoredProduction = null;
        }
    }

    /* ----- Production ----- */

    // Setter
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
    
    // Updater
    updateProduction() {
        this.production = this.revenue+this.storedProduction+this.immobilisedProduction-this.unstoredProduction;
    }
    updateUnstoredProduction() {
        this.unstoredProduction = this.revenue+this.storedProduction+this.immobilisedProduction-this.production;
    }

    /* ----- Stored Production ----- */

    // Setter
    setStoredProduction(amount) {
        this.storedProduction = amount;
        this.updateProduction();
    }

    /* ----- Immobilised Production ----- */
    
    // Setter
    setImmobilisedProduction(amount) {
        this.immobilisedProduction = amount;
        this.updateProduction();
    }

    /* ----- Unstored Production ----- */

    // Setter
    setUnstoredProduction(amount) {
        this.unstoredProduction = amount;
        this.updateProduction();
    }


    /* ------------------------------ */
    /* ---------- Expenses ---------- */
    /* ------------------------------ */

    /* ----- Amount ----- */

    // Setter
    setAmountExpenses(amount) {
        if (amount < this.getAmountDetailedExpenses()) {
            this.amountExpenses = this.getAmountDetailedExpenses();
        } else {
            this.amountExpenses = amount;
        }
        this.amountExpensesFixed = this.amountExpenses!=null;
    }
    
    setAmountExpensesFixed(fixed) {
        this.amountExpensesFixed = fixed;
        this.amountExpenses = this.getAmountExpenses();
    }

    isAmountExpensesFixed() {return this.amountExpensesFixed}

    /* ----- Expense ----- */
      
    // Add new expense & return it
    async addExpense(props) {
        let {label,account,corporateId,corporateName,amount} = props;
        // Company
        let company = this.getCompanyByName(corporateName);
        if (company==undefined) {
            company = this.addCompany({corporateName});
            await company.setCorporateId(corporateId);
        };
        // Expense
        let expense = new Expense({
            id: this.getNewExpenseId(),
            label : label,
            account: account,
            companyId: company.id,
            corporateId: corporateId,
            corporateName: company.corporateName,
            amount: amount,
            footprint: company.footprint,
            dataFetched: company.dataFetched
        });
        this.expenses.push(expense);
        return expense;
    }

    getNewExpenseId() {
        let ids = [0];
        this.expenses.forEach((expense) => {ids.push(expense.getId())});
        return Math.max(...ids) +1;
    }

    // Update expense
    async updateExpense(props) {
        let expense = this.getExpense(props.id);
        // Company
        let company = this.getCompanyByName(props.corporateName);
        if (company==undefined) { 
            company = this.addCompany(props) 
        }
        if (props.companyId==undefined || props.companyId!=company.id) {
            props.companyId = company.id;
            props.corporateId = company.corporateId;
            props.footprint = company.footprint;
            props.dataFetched = company.dataFetched;
        }
        // Expense
        expense.update(props);
        
        if (this.amountExpensesFixed & this.getAmountDetailedExpenses() > this.amountExpenses) {
            this.setAmountExpensesFixed(false);
        }
    }

    // Remove expense (by id)
    removeExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.getId()!=id);
    }
    
    // Get expense object
    getExpense(id) {
        return this.expenses.filter(expense => expense.getId()==id)[0]
    }

    /* ----- Expenses ----- */

    // Update all expenses
    fetchDataExpenses() {
        this.expenses.forEach((expense) => {expense.fetchData()})
    }
    
    // Update CSF data for a specific indic
    fetchDataExpenses(indic) {
        this.expenses.forEach((expense) => {expense.fetchCSFdata(indic)})
    }

    // Remove expenses
    removeExpenses() {
        this.expenses = [];
    }

    // Get expenses array
    getExpenses() {
        return this.expenses
    }

    /* ----------------------------------- */
    /* ---------- Depreciations ---------- */
    /* ----------------------------------- */

    /* ----- Amount ----- */

    // Used in financial section (main table & depreciations tab)
    setAmountDepreciations(amount) {
        // total amount can't be inferior to the sum of detailed depreciations
        if (amount < this.getAmountDetailedDepreciations()) {
            this.amountDepreciations = this.getAmountDetailedDepreciations();
        // else...
        } else {
            this.amountDepreciations = amount;
        }
        this.amountDepreciationsFixed = this.amountDepreciations!=null;    
    }

    setAmountDepreciationsFixed(fixed) {
        this.amountDepreciationsFixed = fixed;
        this.amountDepreciations = this.getAmountDepreciations();
    }

    isAmountDepreciationsFixed() {
        return this.amountDepreciationsFixed
    }

    /* ----- Depreciation ----- */
      
    // Add new depreciation & return it
    async addDepreciation(depreciationProps) {
        let {label,account,corporateId,corporateName,amount,year} = depreciationProps;
        // Company
        let company = this.getCompanyByName(corporateName);
        if (company==undefined) {
            company = this.addCompany({corporateName});
            await company.setCorporateId(corporateId);
        };
        // New depreciation
        let depreciation = new Depreciation({
            id: this.getNewDepreciationId(),
            label : label,
            account: account,
            companyId: company.id,
            corporateId: corporateId,
            corporateName: company.corporateName,
            amount: amount,
            year: year,
            footprint: company.footprint,
            dataFetched: company.dataFetched
        });
        this.depreciations.push(depreciation);
        return depreciation;
    }

    getNewDepreciationId() {
        let ids = [0];
        this.depreciations.forEach((depreciation) => {ids.push(depreciation.getId())});
        return Math.max(...ids) +1;
    }

    // Update depreciation
    async updateDepreciation(nextProps) {
        let depreciation = this.getDepreciation(nextProps.id);
        // Company
        let company = this.getCompanyByName(nextProps.corporateName);
        if (company==undefined) {
            company = this.addCompany(nextProps)
        }
        // if new company or switch
        if (nextProps.companyId==undefined || nextProps.companyId!=company.id) {
            nextProps.companyId = company.id;
            nextProps.corporateId = company.corporateId;
            nextProps.footprint = company.footprint;
            nextProps.dataFetched = company.dataFetched;
        }
        // Update
        depreciation.update(nextProps);

        if (this.amountDepreciationsFixed & this.getAmountDetailedDepreciations() > this.amountDepreciations) {
            this.setAmountDepreciationsFixed(false);
        }
    }

    // Remove depreciation (by id)
    removeDepreciation(id) {this.depreciations = this.depreciations.filter(depreciation => depreciation.getId()!=id)}
    
    // Get depreciation object
    getDepreciation(id) {return this.depreciations.filter(depreciation => depreciation.getId()==id)[0]}

    /* ----- Depreciations ----- */

    // Update all expenses
    fetchDataDepreciations() {
        this.depreciations.forEach((depreciation) => {depreciation.fetchData()})
    }
    
    // Update CSF data for a specific indic
    fetchDataDepreciations(indic) {
        this.depreciations.forEach((depreciation) => {depreciation.fetchCSFdata(indic)})
    }

    // Remove expenses
    removeDepreciations() {
        this.depreciations = [];
    }

    // Get expenses array
    getDepreciations() {
        return this.depreciations
    }

    /* ------------------------------- */
    /* ---------- Companies ---------- */
    /* ------------------------------- */

    /* ----- Company ----- */
      
    // Add new company & return it (inside function)
    // ...if used outside, check if the name available
    addCompany(props) {
        props.id = this.getNewCompanyId();
        let company = new Company(props);
        company.fetchData();
        this.companies.push(company);
        return company;
    }

    getNewCompanyId() {
        let ids = [0];
        this.companies.forEach((company) => {ids.push(company.getId())});
        return Math.max(...ids) +1;
    }

    // Update company
    async updateCompany(props) {
        let company = this.companies.filter(company => company.getId()==props.id)[0];
        await company.update(props);
        this.expenses.filter(expense => expense.companyId == company.id).forEach((expense) => {
            expense.setCorporateId(company.corporateId);
            expense.setCorporateName(company.corporateName);
            expense.setFootprint(company.footprint);
            // set footprint id or put additionnal data in SocialFootprint object
            expense.dataFetched = company.dataFetched;
        })
    }

    // Remove company (by id)
    removeCompany(id) {
        this.companies = this.companies.filter(company => company.getId()!=id);
    }
    
    // Get expense object
    getCompany(id) {
        return this.companies.filter(company => company.getId()==id)[0];
    }
    getCompanyByName(name) {
        return this.companies.filter(company => company.corporateName==name)[0];
    }

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
                    id: this.getNewCompanyId(),
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
        this.expenses.concat(this.depreciations).forEach((expense) => {
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