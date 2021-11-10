// La Société Nouvelle

// Objects
import { Expense } from '/src/accountingObjects/Expense';
import { Immobilisation } from '/src/accountingObjects/Immobilisation';
import { Depreciation } from '/src/accountingObjects/Depreciation'
import { Stock } from '/src/accountingObjects/Stock';
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint'
import { Company } from '/src/Company';

// Utils
import { getNewId } from './utils/Utils';

/* ---------- OBJECT FINANCIAL DATA ---------- */

export class FinancialData {

    constructor(data) 
    {
    // ---------------------------------------------------------------------------------------------------- //
        
        if (data==undefined) data = {};
        
        // Print
        console.log(data);

        // data loaded state
        this.isFinancialDataLoaded = data.isFinancialDataLoaded || false;   
        
        // Production
        this.revenue = data.revenue || 0;                                                                                                                               // revenue (#71)
        this.storedProduction = data.storedProduction || 0;                                                                                                             // stored production (#71) -> variation
        this.immobilisedProduction = data.immobilisedProduction || 0;                                                                                                   // immobilised production (#72)

        // Expenses
        this.expenses = data.expenses ? data.expenses.map((props,index) => new Expense({id: index, ...props})) : [];                                                    // external expenses (#60, #61, #62)
        this.depreciationExpenses = data.depreciationExpenses ? data.depreciationExpenses.map((props,index) => new Expense({id: index, ...props})) : [];                // depreciation expenses (#6811, #6871)

        // Stocks
        this.stocks = data.stocks ? data.stocks.map((props,index) => new Stock({id: index, ...props})) : [];                                                            // stocks (#31 to #35, #37)
        this.stockVariations = data.stockVariations ? data.stockVariations.map((props,index) => new Expense({id: index, ...props})) : [];                               // stock variation (#603, #71)
        
        // Immobilisations
        this.immobilisations = data.immobilisations ? data.immobilisations.map((props,index) => new Immobilisation({id: index, ...props})) : [];                        // immobilisations (#20 to #27)
        this.investments = data.investments ? data.investments.map((props,index) => new Expense({id: index, ...props})) : [];                                           // investments (flows #2 <- #404)
        this.immobilisationProductions = data.immobilisationProductions ? data.immobilisationProductions.map((props,index) => new Expense({id: index, ...props})) : []; // productions of immobilisations (flows #2 <- #72)

        // Depreciations
        this.depreciations = data.depreciations ? data.depreciations.map((props,index) => new Depreciation({id: index, ...props})) : [];                                // depreciations (#28, #29 & #39)

        // Other figures
        this.financialIncomes = data.financialIncomes || 0;
        this.exceptionalIncomes = data.exceptionalIncomes || 0;
        this.otherOperatingIncomes = data.otherOperatingIncomes || 0;                                                                                                   //
        this.taxes = data.taxes || 0;                                                                                                                                   // #63
        this.personnelExpenses = data.personnelExpenses || 0;                                                                                                           // #64
        this.otherExpenses = data.otherExpenses || 0;                                                                                                                   // #65
        this.financialExpenses = data.financialExpenses || 0;                                                                                                           // #66
        this.exceptionalExpenses = data.exceptionalExpenses || 0;                                                                                                       // #67 hors #6871
        this.provisions = data.provisions || 0;                                                                                                                         // #68 hors #6811
        this.taxOnProfits = data.taxOnProfits || 0;                                                                                                                     // #69

        // Companies
        this.companies = data.companies ? data.companies.map((props,id) => new Company({id: id, ...props})) : [];                                                       // Companies

    // ---------------------------------------------------------------------------------------------------- //
    }

    /* ---------------------------------------- COMPANIES INITIALIZER ---------------------------------------- */

    companiesInitializer = () =>
    {
        this.companies = this.expenses.concat(this.investments)
                                      .map(expense => {return({account: expense.accountAux, accountLib: expense.accountAuxLib, isDefaultAccount: expense.isDefaultAccountAux})})
                                      .filter((value, index, self) => index === self.findIndex(item => item.account === value.account))
                                      .map(({account,accountLib,isDefaultAccount},id) => new Company({id, account, isDefaultAccount, corporateName: accountLib}));
    }

    /* ---------------------------------------- INITIAL STATES INITIALIZER ---------------------------------------- */

    initialStatesInitializer = () =>
    {
        // Immobilisations
        this.immobilisations.filter(immobilisation => immobilisation.isDepreciableImmobilisation)
                            .filter(immobilisation => (this.depreciations.filter(depreciation => depreciation.accountAux==immobilisation.account).length > 0))
                            .forEach(immobilisation => {immobilisation.initialState = (this.investments.filter(investment => investment.account == immobilisation.account).length > 0) ? "currentFootprint" : "defaultData";});
        
        // Stocks (purchases)
        this.stocks.filter(stock => !stock.isProductionStock)
                   .forEach(stock => {stock.initialState = (this.expenses.filter(expense => expense.account.startsWith("60"+stock.account.charAt(1))).length > 0) ? "currentFootprint" : "defaultData";});
        
        // Stocks (production)
        this.stocks.filter(stock => stock.isProductionStock)
                   .forEach(stock => stock.initialState = "currentFootprint");
    }

    /* ---------------------------------------- INITIAL STATES LOADER ---------------------------------------- */

    async loadInitialStates(data) 
    {        
        // Print
        console.log(data);

        // Available accounts
        let prevAccountsData = data.financialData.stocks.concat(data.financialData.immobilisations).concat(data.financialData.depreciations);

        // Stocks accounts
        this.stocks.concat(this.immobilisations).concat(this.depreciations)
                   .forEach((stock) => 
        {
            let prevAccount = prevAccountsData.filter(item => item.account == stock.account)[0];
            if (prevAccount!=undefined)
            {
                stock.prevFootprint = new SocialFootprint(prevAccount.footprint);
                stock.initialState = "prevFootprint";
            }
            else
            {
                account.prevFootprint = new SocialFootprint();
                account.initialState = account.isProductionStock ? "currentFootprint" : "defaultData";
            }
        })
    }
    
    /* ---------------------------------------- AMOUNTS GETTERS ---------------------------------------- */
    
    // MAIN AGGREGATES ----------------------------------------- //

    // Principaux agrégats
    getProduction = () => this.getRevenue() + this.getStoredProduction() + this.getImmobilisedProduction()
    getAmountIntermediateConsumption = () => this.getAmountExternalExpenses() - this.getVariationPurchasesStocks()
    getGrossValueAdded = () => this.getProduction() - this.getAmountIntermediateConsumption()
    getAmountCapitalConsumption = () => this.getAmountDepreciationExpenses()
    getNetValueAdded = () => this.getGrossValueAdded() - this.getAmountDepreciationExpenses()

    // PRODUCTION ---------------------------------------------- //

    getRevenue = () => this.revenue
    getStoredProduction = () => this.storedProduction
    getImmobilisedProduction = () => this.immobilisedProduction

    // EXPENSES ------------------------------------------------ //

    // External penses
    getAmountExternalExpenses = () => this.expenses.map(expense => expense.amount).reduce((a,b) => a + b,0)
    getAmountExpensesByAccountAux = (accountNum) => this.expenses.filter(expense => expense.accountAux.startsWith(accountNum)).map(expense => expense.amount).reduce((a,b) => a + b,0)
    
    // Depreciation expenses
    getAmountDepreciationExpenses = () => this.depreciationExpenses.map(expense => expense.amount).reduce((a,b) => a + b,0)
    getAmountOperatingDepreciationExpenses = () => this.depreciationExpenses.filter(expense => /^6811/.test(expense.account)).map(expense => expense.amount).reduce((a,b) => a + b,0)
    getAmountExceptionalDepreciationExpenses = () => this.depreciationExpenses.filter(expense => /^6871/.test(expense.account)).map(expense => expense.amount).reduce((a,b) => a + b,0)
    getAmountDepreciationExpensesByAccountAux = (accountNum) => this.depreciationExpenses.filter(expense => expense.accountAux.startsWith(accountNum)).map(expense => expense.amount).reduce((a,b) => a + b,0)

    // STOCKS -------------------------------------------------- //
    
    // All stocks
    getVariationStocks = () => this.getFinalAmountStocks() - this.getInitialAmountStocks()
    getInitialAmountStocks = () => this.stocks.map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getFinalAmountStocks = () => this.stocks.map(stock => stock.amount).reduce((a,b) => a + b,0)

    // Purchases stocks
    getVariationPurchasesStocks = () => this.getFinalAmountPurchasesStocks() - this.getInitialAmountPurchasesStocks()
    getInitialAmountPurchasesStocks = () => this.stocks.filter(stock => !stock.isProductionStock).map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getFinalAmountPurchasesStocks = () => this.stocks.filter(stock => !stock.isProductionStock).map(stock => stock.amount).reduce((a,b) => a + b,0)

    // Production stocks
    getVariationProductionStocks = () => this.getFinalAmountProductionStocks() - this.getInitialAmountProductionStocks()
    getInitialAmountProductionStocks = () => this.stocks.filter(stock => stock.isProductionStock).map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getFinalAmountProductionStocks = () => this.stocks.filter(stock => stock.isProductionStock).map(stock => stock.amount).reduce((a,b) => a + b,0)
    
    // IMMOBILISATIONS ----------------------------------------- //
    
    // Net amount
    getInitialNetAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.prevAmount - this.getInitialValueLossImmobilisation(immobilisation.account)).reduce((a,b) => a + b,0)
    getFinalNetAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.amount - this.getFinalValueLossImmobilisation(immobilisation.account)).reduce((a,b) => a + b,0)
    
    // Value loss
    getInitialValueLossImmobilisation = (accountNum) => this.depreciations.filter(depreciation => depreciation.accountAux == accountNum).map(depreciation => depreciation.prevAmount).reduce((a,b) => a+b,0)
    getFinalValueLossImmobilisation = (accountNum) => this.depreciations.filter(depreciation => depreciation.accountAux==accountNum).map(depreciation => depreciation.amount).reduce((a,b) => a+b,0)

    // Amounts
    getInitialAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.prevAmount).reduce((a,b) => a + b,0)
    getFinalAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.amount).reduce((a,b) => a + b,0)

    // OTHER KEY FIGURES --------------------------------------- //

    // Incomes
    getAmountOtherOperatingIncomes = () => this.otherOperatingIncomes;
    getAmountFinancialIncomes = () => this.financialIncomes;
    getAmountExceptionalIncomes = () => this.exceptionalIncomes;

    // Expenses
    getAmountTaxes = () => this.taxes;
    getAmountPersonnelExpenses = () => this.personnelExpenses;
    getAmountOtherExpenses = () => this.otherExpenses;
    getAmountFinancialExpenses = () => this.financialExpenses;
    getAmountExceptionalExpenses = () => this.exceptionalExpenses;
    getAmountProvisions = () => this.provisions;
    getAmountTaxOnProfits = () => this.taxOnProfits;

    // Results
    getOperatingResult = () => this.getNetValueAdded() - this.getAmountTaxes() - this.getAmountPersonnelExpenses() - this.getAmountOtherExpenses() - this.getAmountProvisions() + this.getAmountOtherOperatingIncomes();
    getFinancialResult = () => this.getAmountFinancialIncomes() - this.getAmountFinancialExpenses();
    getExceptionalResult = () => this.getAmountExceptionalIncomes() - this.getAmountExceptionalExpenses();

    /* ---------------------------------------- INTERACTIONS ---------------------------------------- */

    /* ---------- Stocks ---------- */

    getStock = (id) => this.stocks.filter(stock => stock.id==id)[0]
    getStockByAccount = (account) => this.stocks.filter(stock => stock.account==account)[0]
    updateStock = (nextProps) => this.getStock(nextProps.id).update(nextProps)    

    /* ----- Stock Variation ----- */
      
    getStockVariation = (id) => this.stockVariations.filter(expense => expense.id==id)[0]    
    updateStockVariation = (nextProps) => this.getStockVariation(nextProps.id).update(nextProps)    

    /* ---------- Expenses ---------- */

    getExpense = (id) => this.expenses.filter(expense => expense.id==id)[0]
    updateExpense = (nextProps) => this.getExpense(nextProps.id).update(nextProps)

    /* ---------- Depreciations ---------- */
    
    getDepreciationExpense = (id) => this.depreciationExpenses.filter(expense => expense.getId()==id)[0]
    getDepreciationExpenseByAccountAux = (accountNum) => this.depreciationExpenses.filter(expense => expense.accountAux==accountNum)[0]    
    updateDepreciationExpense = (nextProps) => this.getAmountDepreciationExpense(nextProps.id).update(nextProps)

    /* ---------- Immobilisations ---------- */

    getImmobilisation = (id) => this.immobilisations.filter(immobilisation => immobilisation.id==id)[0]
    getImmobilisationByAccount = (accountNum) => this.immobilisations.filter(immobilisation => immobilisation.account==accountNum)[0]
    updateImmobilisation = (nextProps) => this.getImmobilisation(nextProps.id).update(nextProps)

    /* ---------- Depreciations ---------- */
    
    getDepreciation = (id) => this.depreciations.filter(depreciation => depreciation.id==id)[0]
    getDepreciationByAccount = (accountNum) => this.depreciations.filter(depreciation => depreciation.account==accountNum)[0]
    updateDepreciation = (nextProps) => this.getDepreciation(nextProps.id).update(nextProps)

    /* ---------- Investments ---------- */
    
    getInvestment = (id) => this.investments.filter(investment => investment.id==id)[0]
    updateInvestment = (nextProps) => this.getInvestment(nextProps.id).update(nextProps)    
    
    /* ---------- Companies ---------- */

    getCompany = (id) => this.companies.filter(company => company.id==id)[0]
    getCompanyByAccount = (accountNum) => this.companies.filter(company => company.account == accountNum)[0]
    getCompanyByName = (name) => this.companies.filter(company => company.corporateName==name)[0]

    // Update company
    async updateCompany(nextProps) 
    {
        // Retrieve company
        let company = this.getCompany(nextProps.id);
        // Update company
        await company.update(nextProps);
    }

    /* ---------------------------------------- Details ---------------------------------------- */

    getBasicExpensesGroups = () =>
    {
        // Achats
        let purchases = this.expenses.filter(expense => expense.account.substring(0,2)=="60" 
                                                     && expense.account.substring(0,3)!="604" && expense.account.substring(0,4)!="6094"
                                                     && expense.account.substring(0,4)!="6061" && expense.account.substring(0,5)!="60961");
        // Achats non stockables
        let nonStorablePurchases = this.expenses.filter(expense => expense.account.substring(0,4)=="6061" || expense.account.substring(0,5)=="60961");
        // Services extérieurs
        let externalServices = this.expenses.filter(expense => expense.account.substring(0,2)=="61" 
                                                            || expense.account.substring(0,3)=="604" || expense.account.substring(0,4)=="6094");
        // Autres services extérieurs
        let otherExternalServices = this.expenses.filter(expense => expense.account.substring(0,2)=="62");

        return ([{label: "Achats",
                expenses: purchases},
                {label: "Fournitures non-stockables",
                expenses: nonStorablePurchases},
                {label: "Services extérieurs",
                expenses: externalServices},
                {label: "Autres services extérieurs",
                expenses: otherExternalServices}]);
    }

    getBasicDepreciationExpensesGroups = () =>
    {
        // Dotations sur immobilisations incorporelles
        let intangibleAssetsDepreciationsExpenses = this.depreciationExpenses.filter(expense => /^68111/.test(expense.account));
        // Dotations sur immoblisations corporelles
        let tangibleAssetsDepreciationsExpenses = this.depreciationExpenses.filter(expense => /^68112/.test(expense.account));
        // Dotations exceptionnelles
        let exceptionalDepreciationsExpenses = this.depreciationExpenses.filter(expense => /^6871/.test(expense.account));

        return ([{label: "Dotations aux amortissements sur immobilisations incorporelles",
                expenses: intangibleAssetsDepreciationsExpenses},
                {label: "Dotations aux amortissements sur immobilisations corporelles",
                expenses: tangibleAssetsDepreciationsExpenses},
                {label: "Dotations aux amortissements exceptionnels sur immobilisations",
                expenses: exceptionalDepreciationsExpenses}]);
    }

}