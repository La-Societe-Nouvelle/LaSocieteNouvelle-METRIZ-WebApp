
import {Expense} from '/src/Expense.js';
import {Depreciation} from '/src/Depreciation.js'

export class FinancialData {

    constructor() 
    {
        this.production = null;
        this.productionFixed = false;
        this.revenue = null;
        this.storedProduction = null;
        this.immobilisedProduction = null;

        this.unstoredProduction = null;
        
        this.amountExpenses = null;
        this.amountExpensesFixed = false;
        this.expenses = [];
        
        this.amountDepreciations = null;
        this.amountDepreciationsFixed = false;
        this.depreciations = [];
        
        this.netValueAdded = null;
    }

    updateFromBackUp(backUp) {
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
        if (this.production==null | this.production < (this.storedProduction+this.immobilisedProduction)) {
            this.storedProduction = null;
            this.immobilisedProduction = null;
            this.unstoredProduction = this.revenue;
        }
        if (this.revenue==null) {
            this.revenue = this.production-this.storedProduction-this.immobilisedProduction+this.unstoredProduction;
        }
        if (this.unstoredProduction==null) {
            this.unstoredProduction = 0;
        }
    }
    
    // Updater
    updateProduction() {
        this.production = this.revenue+this.storedProduction+this.immobilisedProduction-this.unstoredProduction;
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
        this.amountExpenses = amount;
        this.amountExpensesFixed = this.amountExpenses!=null;
    }
    
    setAmountExpensesFixed(fixed) {
        this.amountExpensesFixed = fixed;
        this.amountExpenses = this.getAmountExpenses();
    }

    isAmountExpensesFixed() {return this.amountExpensesFixed}

    // Printer
    printAmountDetailedExpenses() {
        if (this.expenses.length > 0) {
            let amount = 0.0;
            this.expenses.forEach((expense) => {amount+= expense.getAmount();})
            return amount;
        } else {
            return "";
        }
    }

    /* ----- Expense ----- */
      
    // Add new expense & return it
    addExpense(expenseData) {
        let {corporateId,corporateName,amount} = expenseData;
        let expense = new Expense({
            id: this.getNewExpenseId(),
            corporateId: corporateId,
            corporateName: corporateName,
            amount: amount});
        expense.fetchData();
        this.expenses.push(expense);
        return expense;
    }

    getNewExpenseId() {
        let ids = [0];
        this.expenses.forEach((expense) => {ids.push(expense.getId())});
        return Math.max(...ids) +1;
    }

    // Update expense
    updateExpense(expenseUpdated) {
        let index = this.expenses.findIndex((expense) => expense.getId()==expenseUpdated.getId());
        this.expenses[index] = expenseUpdated;
        if (this.amountExpensesFixed & this.getAmountDetailedExpenses() > this.amountExpenses) {
            this.setAmountExpensesFixed(false);
        }
    }

    // Remove expense (by id)
    removeExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.getId()!=id);
    }
    
    // Get expense object
    getExpense(id) {return this.expenses.filter(expense => expense.getId()==id)[0]}

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
    getExpenses() {return this.expenses}
        


    /* ----------------------------------- */
    /* ---------- Depreciations ---------- */
    /* ----------------------------------- */

    /* ----- Amount ----- */

    // Setter
    setAmountDepreciations(amount) {
        this.amountDepreciations = amount;
        this.amountDepreciationsFixed = this.amountDepreciations!=null;
    }

    setAmountDepreciationsFixed(fixed) {
        this.amountDepreciationsFixed = fixed;
        this.amountDepreciations = this.getAmountDepreciations();
    }

    //Getter
    isAmountDepreciationsFixed() {return this.amountDepreciationsFixed}

    // Printer
    printAmountDetailedDepreciations() {
        if (this.depreciations.length > 0) {
            let amount = 0.0;
            this.depreciations.forEach((depreciation) => {amount+= depreciation.getAmount();})
            return amount;
        } else {
            return "";
        }
    }

    /* ----- Depreciation ----- */
      
    // Add new depreciation & return it
    addDepreciation(depreciationData) {
        let {corporateId,corporateName,year,amount} = depreciationData;
        let depreciation = new Depreciation({
            id: this.getNewDepreciationId(),
            corporateId: corporateId,
            corporateName: corporateName,
            year: year,
            amount: amount});
        depreciation.fetchData();
        this.depreciations.push(depreciation);
        return depreciation;
    }

    getNewDepreciationId() {
        let ids = [0];
        this.depreciations.forEach((depreciation) => {ids.push(depreciation.getId())});
        return Math.max(...ids) +1;
    }

    // Update depreciation
    updateDepreciation(depreciationUpdated) {
        let index = this.depreciations.findIndex((depreciation) => depreciation.getId()==depreciationUpdated.getId());
        this.depreciations[index] = depreciationUpdated;
        if (this.amountDepreciationsFixed & this.getAmountDetailedDepreciations() > this.amountDepreciations) {
            this.setAmountDepreciationsFixed(false);
        }
    }

    // Remove depreciation (by id)
    removeDepreciation(id) {
        this.depreciations = this.depreciations.filter(depreciation => depreciation.getId()!=id);
    }
    
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
    getDepreciations() {return this.depreciations}


}