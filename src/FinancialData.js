// La Société Nouvelle

// Accounting Objects
import { Expense } from '/src/accountingObjects/Expense';
import { Immobilisation } from '/src/accountingObjects/Immobilisation';
import { Stock } from '/src/accountingObjects/Stock';
import { Account, buildAggregateFromArray } from './accountingObjects/Account';
import { AccountingItem } from './accountingObjects/AccountingItem';
import { Aggregate } from './accountingObjects/Aggregate';

// Other objects
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint'
import { Company } from '/src/Company';

// Utils
import { getAmountItems, getDateFromString, getDatesEndMonths, getNextDay, getPrevAmountItems, getPrevDay, getSumItems, roundValue } from './utils/Utils';

// Scripts
import { aggregatesBuilder } from './formulas/aggregatesBuilder';

// Libraries
import accountsMatching from '/lib/accountsMatching'

const oneDay = 24 * 60 * 60 * 1000;

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
        
        // Production ------------------------------ //

        this.revenue = data.revenue || 0;                                                                                                                                           // revenue (#71)
        this.sales = data.sales ? data.sales.map((props,index) => new AccountingItem({id: index, ...props})) : [];                                                                  // sales
        this.storedProduction = data.storedProduction || 0;                                                                                                                         // stored production (#71)
        this.immobilisedProduction = data.immobilisedProduction || 0;                                                                                                               // immobilised production (#72)

        // Expenses -------------------------------- //

        this.expenses = data.expenses ? data.expenses.map((props,index) => new Expense({id: index, ...props})) : [];                                                                // external expenses (#60[^3], #61, #62)
        this.stockVariations = data.stockVariations ? data.stockVariations.map((props,index) => new Expense({id: index, ...props})) : [];                                           // stock variation (#603, #71)
        this.amortisationExpenses = data.amortisationExpenses ? data.amortisationExpenses.map((props,index) => new Expense({id: index, ...props})) : [];                            // amortisation expenses (#6811, #6871)
        this.adjustedAmortisationExpenses = data.adjustedAmortisationExpenses ? data.adjustedAmortisationExpenses.map((props,index) => new Expense({id: index, ...props})) : [];    // amortisation expenses (#6811, #6871)
                
        // Stocks ---------------------------------- //
        
        this.stocks = data.stocks ? data.stocks.map((props,index) => new Stock({id: index, ...props})) : [];                                                                        // stocks (#31 to #35, #37)
        
        // Immobilisations ------------------------- //

        this.investments = data.investments ? data.investments.map((props,index) => new Expense({id: index, ...props})) : [];                                                       // investments (flows #2 <- #404)
        this.immobilisationProductions = data.immobilisationProductions ? data.immobilisationProductions.map((props,index) => new Expense({id: index, ...props})) : [];             // productions of immobilisations (flows #2 <- #72)
        
        this.immobilisations = data.immobilisations ? data.immobilisations.map((props,index) => new Immobilisation({id: index, ...props})) : [];                                    // immobilisations (#20 to #27)
        this.amortisations = data.amortisations ? data.amortisations.map((props,index) => new Account({id: index, ...props})) : [];                                                 // amortisations (#28)
        this.adjustedAmortisations = data.adjustedAmortisations ? data.adjustedAmortisations.map((props,index) => new Account({id: index, ...props})) : [];                         // amortisations (#28)

        // Depreciations --------------------------- //

        this.depreciations = data.depreciations ? data.depreciations.map((props,index) => new Account({id: index, ...props})) : [];                                                 // depreciations (#29 & #39)

        // Other figures --------------------------- //

        this.financialIncomes = data.financialIncomes || 0;
        this.exceptionalIncomes = data.exceptionalIncomes || 0;
        this.otherOperatingIncomes = data.otherOperatingIncomes || 0;                                                                                                               //
        this.taxes = data.taxes || 0;                                                                                                                                               // #63
        this.personnelExpenses = data.personnelExpenses || 0;                                                                                                                       // #64
        this.otherExpenses = data.otherExpenses || 0;                                                                                                                               // #65
        this.financialExpenses = data.financialExpenses || 0;                                                                                                                       // #66
        this.exceptionalExpenses = data.exceptionalExpenses || 0;                                                                                                                   // #67 hors #6871
        this.provisions = data.provisions || 0;                                                                                                                                     // #68 hors #6811
        this.taxOnProfits = data.taxOnProfits || 0;                                                                                                                                 // #69

        // Expenses accounts ----------------------- //

        this.expenseAccounts = data.expenseAccounts ? data.expenseAccounts.map((props) => new Account({...props})) : this.expensesAccountsBuilder(data.accounts);

        // Companies ------------------------------- //

        this.companies = data.companies ? data.companies.map((props,id) => new Company({id: id, ...props})) : [];
        this.defaultAccountsAux = data.defaultAccountsAux ? data.defaultAccountsAux : [];

        // Aggregates ------------------------------ //

        this.aggregates = {};
        data.aggregates ? Object.entries(data.aggregates).forEach(([aggregateId,aggregateProps]) => this.aggregates[aggregateId] = new Aggregate(aggregateProps)) : aggregatesBuilder(this);
        
    // ---------------------------------------------------------------------------------------------------- //

        buildImmobilisationsPhases(this.immobilisations, this.amortisations, this.amortisationExpenses);
        console.log(this);
    }

    /* ---------------------------------------- EXPENSE ACCOUNTS BUILDER ---------------------------------------- */

    expensesAccountsBuilder = (metaAccounts) =>
    {
        // external expenses
        let externalExpenseAccounts = this.expenses
            .map(expense => expense.accountNum)
            .filter((value, index, self) => index === self.findIndex(item => item == value))
            .map(accountNum => new Account({accountNum, accountLib: metaAccounts[accountNum], amount: this.getAmountExternalExpenseByAccount(accountNum)}));
        // purchases stock variations
        let stockVariationAccounts = this.stocks
            .filter(stock => !stock.isProductionStock)
            .map(stock => "60"+stock.accountNum)
            .filter((value, index, self) => index === self.findIndex(item => item == value))
            .map(accountNum => new Account({accountNum, accountLib: metaAccounts[accountNum], amount: this.getAmountStockVariationByAccountAux(accountNum)}));
        // amortisation expenses
        let amortisationExpenseAccounts = this.amortisations
            .map(amortisation => "6811"+(parseInt(amortisation.accountNum.charAt(2))+1)+amortisation.accountNum.slice(3))
            .filter((value, index, self) => index === self.findIndex(item => item == value))
            .map(accountNum => new Account({accountNum, accountLib: metaAccounts[accountNum], amount: this.getAmountAmortisationExpenseByAccountAux(accountNum)}));

        return [...externalExpenseAccounts,...stockVariationAccounts,...amortisationExpenseAccounts];
    }

    getAmountExternalExpenseByAccount = (accountNum) => getAmountItems(this.expenses.filter(expense => expense.accountNum == accountNum))
    getAmountStockVariationByAccountAux = (accountNum) => getAmountItems(this.stockVariations.filter(variation => variation.accountAux == accountNum))
    getAmountAmortisationExpenseByAccountAux = (accountNum) => getAmountItems(this.amortisationExpenses.filter(expense => expense.accountAux == accountNum))

    /* ---------------------------------------- COMPANIES INITIALIZER ---------------------------------------- */

    // call when load financial data (import)
    companiesInitializer = () =>
    {
        this.companies = this.expenses.concat(this.investments)
            .map(expense => {return({
                accountNum: expense.accountAux, 
                corporateName: expense.accountAuxLib, 
                isDefaultAccount: this.defaultAccountsAux.includes(expense.accountAux)
            })})
            .filter((value, index, self) => index === self.findIndex(item => item.accountNum === value.accountNum))
            .map(({accountNum,corporateName,isDefaultAccount},id) => new Company({id, accountNum, isDefaultAccount, corporateName, amount: this.getAmountExpenseByAccountAux(accountNum)}));
    }

    getAmountExpenseByAccountAux = (accountNum) => getAmountItems(this.expenses.concat(this.investments).filter(expense => expense.accountAux == accountNum))

    /* ---------------------------------------- INITIAL STATES INITIALIZER ---------------------------------------- */

    initialStatesInitializer = () =>
    {
        // Immobilisations -> default data for all amortisable immobilisation
        this.immobilisations
            .filter(immobilisation => immobilisation.isDepreciableImmobilisation)
            .filter(immobilisation => (this.amortisations.filter(amortisation => amortisation.accountAux==immobilisation.accountNum).length > 0))
            .forEach(immobilisation => {
                immobilisation.initialState = "defaultData";
                accountsMatching.branche.forEach(matching => {
                    let regex = new RegExp(matching.accountRegex);
                    if (regex.test(immobilisation.accountNum)) {
                        immobilisation.prevFootprintActivityCode = matching.branche; // set default branch
                    }
                })
            });
        
        // Stocks (purchases) -> current footprint if at least one expense related to the stock account
        this.stocks.filter(stock => !stock.isProductionStock)
            .forEach(stock => {stock.initialState = (this.expenses.filter(expense => expense.accountNum.startsWith(stock.accountAux)).length > 0) ? "currentFootprint" : "defaultData";});
        
        // Stocks (production) -> current footprint for all
        this.stocks.filter(stock => stock.isProductionStock)
            .forEach(stock => stock.initialState = "currentFootprint");
    }

    /* ---------------------------------------- INITIAL STATES LOADER ---------------------------------------- */

    async loadInitialStates(data) 
    {        
        // Print
        console.log(data);

        // Available accounts
        let prevAccountsData = data.financialData.stocks.concat(data.financialData.immobilisations).concat(data.financialData.amortisations);

        // Asset accounts
        this.stocks.concat(this.immobilisations).concat(this.amortisations)
            .forEach((account) => 
        {
            let prevAccount = prevAccountsData.filter(item => item.accountNum == account.accountNum)[0];
            // prev account found
            if (prevAccount!=undefined) {
                account.prevFootprint = new SocialFootprint(prevAccount.footprint);
                account.initialState = "prevFootprint";
            } 
            // prev account not found & prev amount > 0
            else if (account.prevAmount > 0) {
                console.log("New account with previous amount not null");
            } 
            // else no prev data
            else {
                account.prevFootprint = new SocialFootprint();
                account.initialState = "none";
            }
        })
    }
    
    /* ---------------------------------------- AMOUNTS GETTERS ---------------------------------------- */
    
    // MAIN AGGREGATES ----------------------------------------- //

    // Principaux agrégats
    getProduction = () => this.getRevenue() + this.getStoredProduction() + this.getImmobilisedProduction()
    getAmountIntermediateConsumptions = () => this.getAmountExternalExpenses() + this.getVariationPurchasesStocks() // SI-SF i.e. delta < 0 -> storage (not consumption)
    getAmountFixedCapitalConsumptions = () => this.getAmountAmortisationExpenses()
    getNetValueAdded = () => this.getProduction() - this.getAmountIntermediateConsumptions() - this.getAmountFixedCapitalConsumptions()

    // PRODUCTION ---------------------------------------------- //

    getRevenue = () => this.revenue
    getStoredProduction = () => this.storedProduction
    getImmobilisedProduction = () => this.immobilisedProduction

    // EXPENSES ------------------------------------------------ //

    getAmountExternalExpenses = () => getAmountItems(this.expenses, 2)
    getAmountAmortisationExpenses = () => getAmountItems(this.amortisationExpenses, 2)
    // getAmountDepreciationExpenses = () => getAmountItems(this.depreciationExpenses, 2)

    // STOCKS -------------------------------------------------- //
    
    // Purchases stocks
    getVariationPurchasesStocks = () => getAmountItems(this.stockVariations, 2)
    getInitialAmountPurchasesStocks = () => getPrevAmountItems(this.stocks.filter(stock => !stock.isProductionStock), 2)
    getFinalAmountPurchasesStocks = () => getAmountItems(this.stocks.filter(stock => !stock.isProductionStock), 2)
    
    // Net amount
    getInitialNetAmountStocks = () => getSumItems(this.stocks.map(stock => stock.prevAmount - this.getInitialValueLossStock(stock.accountNum)), 2)
    getFinalNetAmountStocks = () => getSumItems(this.stocks.map(stock => stock.amount - this.getFinalValueLossStock(stock.accountNum)), 2)

    // Value loss
    getInitialValueLossStock = (accountNum) => getPrevAmountItems(this.depreciations.filter(depreciation => depreciation.accountAux == accountNum), 2);
    getFinalValueLossStock = (accountNum) => getAmountItems(this.depreciations.filter(depreciation => depreciation.accountAux == accountNum), 2);


    // IMMOBILISATIONS ----------------------------------------- //
        
    // Value loss
    getInitialValueLossImmobilisation = (accountNum) => getPrevAmountItems(this.depreciations.filter(depreciation => depreciation.accountAux == accountNum), 2)
    getFinalValueLossImmobilisation = (accountNum) => getAmountItems(this.depreciations.filter(depreciation => depreciation.accountAux==accountNum), 2)

    // OTHER KEY FIGURES --------------------------------------- //

    // Operating section

    getAmountOperatingIncomes = () => this.getProduction() + this.getAmountOtherOperatingIncomes();
    getAmountOtherOperatingIncomes = () => this.otherOperatingIncomes;

    getAmountTaxes = () => this.taxes;
    getAmountPersonnelExpenses = () => this.personnelExpenses;
    getAmountOtherExpenses = () => this.otherExpenses;
    getAmountOperatingExpenses = () => this.getAmountFixedCapitalConsumptions()+this.getAmountTaxes()+this.getAmountPersonnelExpenses()+this.getAmountAmortisationExpenses()+this.getAmountProvisions()+this.getAmountOtherExpenses()

    getOperatingResult = () => this.getAmountOperatingIncomes() - this.getAmountOperatingExpenses();

    // Financial section
    
    getAmountFinancialIncomes = () => this.financialIncomes;
    getAmountFinancialExpenses = () => this.financialExpenses;
    getFinancialResult = () => this.getAmountFinancialIncomes() - this.getAmountFinancialExpenses();
    
    // Exceptionnal section
    
    getAmountExceptionalIncomes = () => this.exceptionalIncomes;
    getAmountExceptionalExpenses = () => this.exceptionalExpenses;
    getExceptionalResult = () => this.getAmountExceptionalIncomes() - this.getAmountExceptionalExpenses();
    
    // Profit

    getAmountProvisions = () => this.provisions;
    getAmountTaxOnProfits = () => this.taxOnProfits;
    getProfit = () => this.getOperatingResult()+this.getFinancialResult()+this.getExceptionalResult()-this.getAmountTaxOnProfits();

    /* ---------------------------------------- INTERACTIONS ---------------------------------------- */

    /* ---------- Stocks ---------- */

    getStockByAccount = (accountNum) => this.stocks.filter(stock => stock.accountNum==accountNum)[0]
    updateStock = (nextProps) => this.getStockByAccount(nextProps.accountNum).update(nextProps)    
      
    /* ---------- Expenses ---------- */

    getExpense = (id) => this.expenses.filter(expense => expense.id==id)[0]
    
    getAmortisationExpense = (id) => this.amortisationExpenses.filter(expense => expense.getId()==id)[0]
    getAmortisationExpenseByAccountAux = (accountNum) => this.amortisationExpenses.filter(expense => expense.accountAux==accountNum)[0]    

    /* ---------- Immobilisations ---------- */

    getImmobilisationByAccount = (accountNum) => this.immobilisations.filter(immobilisation => immobilisation.accountNum==accountNum)[0]
    updateImmobilisation = (nextProps) => this.getImmobilisationByAccount(nextProps.accountNum).update(nextProps)    

    /* ---------- Depreciations ---------- */
    
    getDepreciationByAccount = (accountNum) => this.depreciations.filter(depreciation => depreciation.accountNum==accountNum)[0]
        
    /* ---------- Companies ---------- */

    getCompany = (id) => this.companies.filter(company => company.id==id)[0]
    getCompanyByAccount = (accountNum) => this.companies.filter(company => company.accountNum == accountNum)[0]
    getCompanyByName = (name) => this.companies.filter(company => company.corporateName==name)[0]

    updateCorporateId = (accountNum,corporateName,corporateId) => 
    {
        let company  = accountNum ? this.getCompanyByAccount(accountNum) : this.getCompanyByName(corporateName);
        if (company!=undefined) {
            company.update({corporateId});
        }
    }

    /* ---------------------------------------- Détails - Soldes Intermédiaires de Gestion ---------------------------------------- */

    /** Aggrégats - Consommations intermédiaires :
     *      607,6097                                Achats de marchandises
     *      6037                                    Variation des stocks de marchandises
     *      601,6091,602,6092                       Achats de matières premières et autres approvisionnements
     *      6031,6032                               Variations de stocks de matières premières et autres approvisionnements
     *      604,6094,605,6095,606,6096,608,6098     Autres achats
     *      61,62                                   Autres charges externes
     * 
     *  Aggrégats - Consommations de capital fixe :
     *      68111                                   Dotations aux amortissements sur immobilisations incorporelles
     *      68112                                   Dotations aux amortissements sur immobilisations corporelles
     *      6871                                    Dotations aux amortissements exceptionnels des immobilisations
     */

     getIntermediateConsumptionsAggregates = () =>
     {
        let aggregates = [];
        let aggregate = {};
        let items = [];

        // Achats stockés - Matières premières
        items = this.expenseAccounts.filter(account => /^60(1|91)/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Matières premières",items});
        aggregates.push(aggregate);

        // Achats stockés - Autres approvisionnements
        items = this.expenseAccounts.filter(account => /^60(2|92)/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Autres approvisionnements",items});
        aggregates.push(aggregate);
        
        // Achats de marchandises
        items = this.expenseAccounts.filter(account => /^60(7|97)/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Marchandises",items});
        aggregates.push(aggregate);

        // Variation des stocks
        items = this.expenseAccounts.filter(account => /^603/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Variation des stocks",items});
        aggregates.push(aggregate);

        // Autres achats
        items = this.expenseAccounts.filter(account => /^60([4|5|6|8]|9[4|5|6|8])/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Autres achats",items});
        aggregates.push(aggregate);

        // Autres charges externes
        items = this.expenseAccounts.filter(account => /^6(1|2)/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Autres charges externes",items});
        aggregates.push(aggregate);      
 
         return aggregates;
     }

     getFixedCapitalConsumptionsAggregates = () =>
     {
        let aggregates = [];
        let aggregate = {};
        let items = []

        // Dotations aux amortissements sur immobilisations incorporelles
        items = this.expenseAccounts.filter(account => /^68111/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Dotations aux amortissements sur immobilisations incorporelles",items});
        aggregates.push(aggregate);

        // Dotations aux amortissements sur immobilisations corporelles
        items = this.expenseAccounts.filter(account => /^68112/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Dotations aux amortissements sur immobilisations corporelles",items});
        aggregates.push(aggregate);
 
        // Dotations aux amortissements exceptionnels des immobilisations
        items = this.expenseAccounts.filter(account => /^6871/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Dotations aux amortissements exceptionnels des immobilisations",items});
        aggregates.push(aggregate);           
 
         return aggregates;
     }

    /* ---------------------------------------- Details - Charges d'exploitation ---------------------------------------- */

    /** Aggrégats - Charges d'exploitation
     *      607                                     Achats de marchandises
     *      6037                                    Variation des stocks de marchandises
     *      601,6091,602,6092                       Achats de matières premières et autres approvisionnements
     *      6031,6032                               Variation des stocks de matières premières et autres approvisionnements 
     *      604,6094,605,6095,606,6096,608,6098     Autres achats
     *      61,62                                   Autres charges externes
     *      63                                      Impôts, taxes et versements assimilés
     *      64                                      Charges sociales
     *      681                                     Dotations aux amortissements, dépréciations et provisions
     *      65                                      Autres charges d'exploitation
     */

    getOperatingExpensesAggregates = () =>
    {
        let aggregates = [];
        let aggregate = {};
        let items = [];
 
        // Achats de marchandises
        items = this.expenseAccounts.filter(account => /^60(7|97)/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Achats de marchandises",items});
        aggregate.isToBeChecked = true;
        aggregates.push(aggregate);

        // Variation des stocks de marchandises
        items = this.expenseAccounts.filter(account => /^6037/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Variation des stocks de marchandises",items});
        aggregate.isToBeChecked = true;
        aggregates.push(aggregate);

        // Achats de matières premières et autres approvisionnements 
        items = this.expenseAccounts.filter(account => /^60([1|2]|9[1|2])/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Achats de matières premières et autres approvisionnements",items});
        aggregate.isToBeChecked = true;
        aggregates.push(aggregate);

        // Variation des stocks de matières premières et autres approvisionnements 
        items = this.expenseAccounts.filter(account => /^603(1|2)/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Variation des stocks de matières premières et autres approvisionnements",items});
        aggregate.isToBeChecked = true;
        aggregates.push(aggregate);

        // Autres achats
        items = this.expenseAccounts.filter(account => /^60([4|5|6|8]|9[4|5|6|8])/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Autres achats",items});
        aggregate.isToBeChecked = true;
        aggregates.push(aggregate);

        // Autres charges externes
        items = this.expenseAccounts.filter(account => /^6(1|2)/.test(account.accountNum));
        aggregate = buildAggregateFromArray({accountLib: "Autres charges externes",items});
        aggregate.isToBeChecked = true;
        aggregates.push(aggregate);
        
        // Impôts, taxes et versements assimilés
        //items = this.expenseAccounts.filter(account => /^63/.test(account.accountNum));
        aggregate = {accountLib: "Impôts, taxes et versements assimilés", amount: this.getAmountTaxes(), isToBeChecked: false};
        aggregates.push(aggregate); 

        // Charges sociales
        //items = this.expenseAccounts.filter(account => /^64/.test(account.accountNum));
        aggregate = {accountLib: "Charges sociales", amount: this.getAmountPersonnelExpenses(), isToBeChecked: false};
        aggregates.push(aggregate);

        // Dotations aux amortissements, dépréciations et provisions
        //items = this.expenseAccounts.filter(account => /^681/.test(account.accountNum));
        aggregate = {accountLib: "Dotations aux amortissements, dépréciations et provisions", amount: this.getAmountAmortisationExpenses()+this.getAmountProvisions(), isToBeChecked: false};
        aggregate.isToBeChecked = true;
        aggregates.push(aggregate); 

        // Autres charges d'exploitation
        //items = this.expenseAccounts.filter(account => /^65/.test(account.accountNum));
        aggregate = {accountLib: "Autres charges d'exploitation", amount: this.getAmountOtherExpenses(), isToBeChecked: false};
        aggregates.push(aggregate); 

        return aggregates;
    }

    /* ---------------------------------------- Details [OBSOLETE] ---------------------------------------- */

    getExternalExpensesAggregates = () =>
    {
        // Achats
        let purchases = this.expenseAccounts.filter(account => /^60(?!4|94|61|961)/.test(account.accountNum));
        let purchasesAggregate = buildAggregateFromArray({accountLib: "Achats",items: purchases});

        // Achats non stockables
        let nonStorablePurchases = this.expenseAccounts.filter(account => /^60(61|961)/.test(account.accountNum));
        let nonStorablePurchasesAggregate = buildAggregateFromArray({accountLib: "Fournitures non-stockables",items: nonStorablePurchases});
        
        // Services extérieurs
        let externalServices = this.expenseAccounts.filter(account => /^6(1|04|94)/.test(account.accountNum));
        let externalServicesAggregate = buildAggregateFromArray({accountLib: "Services extérieurs",items: externalServices});
        
        // Autres services extérieurs
        let otherExternalServices = this.expenseAccounts.filter(account => /^62/.test(account.accountNum));
        let otherExternalServicesAggregate = buildAggregateFromArray({accountLib: "Autres services extérieurs",items: otherExternalServices});        

        return ([purchasesAggregate,
                 nonStorablePurchasesAggregate,
                 externalServicesAggregate,
                 otherExternalServicesAggregate]);
    }

    getBasicDepreciationExpensesAggregates = () =>
    {
        // Dotations sur immobilisations incorporelles
        let intangibleAssetsDepreciationsExpenses = this.expenseAccounts.filter(account => /^68111/.test(account.accountNum));
        let intangibleAssetsDepreciationsExpensesAggregate = buildAggregateFromArray({accountLib: "Dotations aux amortissements sur immobilisations incorporelles",items: intangibleAssetsDepreciationsExpenses});

        // Dotations sur immoblisations corporelles
        let tangibleAssetsDepreciationsExpenses = this.expenseAccounts.filter(account => /^68112/.test(account.accountNum));
        let tangibleAssetsDepreciationsExpensesAggregate = buildAggregateFromArray({accountLib: "Dotations aux amortissements sur immobilisations corporelles",items: tangibleAssetsDepreciationsExpenses});
        
        // Dotations exceptionnelles
        let exceptionalDepreciationsExpenses = this.expenseAccounts.filter(account => /^6871/.test(account.accountNum));
        let exceptionalDepreciationsExpensesAggregate = buildAggregateFromArray({accountLib: "Dotations aux amortissements exceptionnels sur immobilisations",items: exceptionalDepreciationsExpenses});

        return ([intangibleAssetsDepreciationsExpensesAggregate,
                 tangibleAssetsDepreciationsExpensesAggregate,
                 exceptionalDepreciationsExpensesAggregate]);
    }

}

/* -------------------------------------------------- PERIODS -------------------------------------------------- */

/**
 *  For each immobilisation - amortisation - amortisation expenses :
 *      
 */

const buildImmobilisationsPhases = async (immobilisations,amortisations,financialYear) =>
{
    immobilisations
        .filter(immobilisation => immobilisation.isDepreciableImmobilisation)
        .forEach(async immobilisation =>
    {
        let amortisation = amortisations.filter(amortisation => amortisation.accountAux == immobilisation.accountNum)[0];

        // get all dates ending an immobilisation account phase (i.e. before any change)
        let datesEndImmobilisationPhases = immobilisation.entries
            .filter(entry => !entry.isANouveaux)
            .map(entry => entry.date)
            .map(date => getPrevDay(date))
            .filter(date => parseInt(date)>=parseInt(financialYear.dateStart));

        // get all dates ending an amortisation account phase (i.e. at any change)
        let datesEndAmortisationPhases = amortisation.entries
            .filter(entry => !entry.isANouveaux)
            .map(entry => entry.date);

        // end of months
        let datesEndMonths = getDatesEndMonths(financialYear.dateStart,financialYear.dateEnd);

        // concat phases & sort dates
        let datesEndPhases = datesEndMonths
            .concat([financialYear.dateEnd])
            .concat(datesEndImmobilisationPhases)
            .concat(datesEndAmortisationPhases)
            .filter((value, index, self) => index === self.findIndex(item => item === value) && value!="")   // remove duplicates dates and empty string
            .sort((a,b) => parseInt(a) > parseInt(b));   // sort by date (chronology)

        // build phases
        let phases = datesEndPhases.map((value,index,self) => {
            return({
                dateStart: index>0 ? getNextDay(self[index-1]) : financialYear.dateStart, 
                dateEnd: value
            })
        })

        immobilisation.buildPeriods(phases);
        amortisation.buildPeriods(phases);

        amortisationExpenses.forEach(async expense => await expense.initPeriods(dateStart,dateEnd));
        await amortisation.initPeriods(amortisationExpenses,dateStart,dateEnd);
        await immobilisation.initPeriods(dateStart,dateEnd);
        
        // let dates = amortisation.periods
        //     .concat(immobilisation.periods)
        //     .concat(expenses.map(expense => expense.periods).reduce((a,b) => a.concat(b),[]))
        //     .map(period => [period.dateStart,period.dateEnd])   // get date start & date end
        //     .reduce((a,b) => a.concat(b),[])
        //     .filter((value, index, self) => index === self.findIndex(item => item === value) && value!="")   // remove duplicates and empty string
        //     .sort((a,b) => parseInt(a) > parseInt(b));   // sort by date (chronology)
        
        let datesExpenses = amortisationExpenses
            .map(expense => expense.periods).reduce((a,b) => a.concat(b),[])
            .map(period => [period.dateStart,period.dateEnd])
            .reduce((a,b) => a.concat(b),[])
            .filter((value, index, self) => index === self.findIndex(item => item === value))
            .sort((a,b) => parseInt(a) > parseInt(b));

        // build next periods
        let nextPeriods = dates.slice(1).map((date,index,self) => {
            return({
                id: index,
                dateStart: index > 0 ? self[index-1] : dateStart,
                dateEnd: date,
                amount: null
            })
        })

        immobilisation.completePeriods(nextPeriods);
        amortisation.completePeriods(nextPeriods);
        amortisationExpenses.forEach(async expense => expense.completePeriods(immobilisation,amortisation,nextPeriods,datesExpenses,dateStart));
        
        console.log("results");
        console.log(immobilisation);
        console.log(amortisation);
        amortisationExpenses.forEach(expense => console.log(expense));
    })
}

const buildAjustedPeriods = async (immobilisations,amortisations,amortisationExpenses,financialPeriod) =>
{
    let adjustedAmortisations = [];
    let adjustedAmortisationExpenses = [];

    immobilisations
        .filter(immobilisation => immobilisation.isDepreciableImmobilisation)
        .forEach(async immobilisation =>
    {
        let amortisation = amortisations.filter(amortisation => amortisation.accountAux == immobilisation.accountNum)[0];
        let expenses = amortisationExpenses.filter(expense => expense.accountAux == amortisation.accountNum);

        let adjustedAmortisationPeriods = [];

        let currentAmortisationAmount = amortisation.prevAmount;
        let currentExpensesAmount = 0;
        let currentMax = 0;
        let dateStart = financialPeriod.dateStart;

        for (let amortisationPeriod of amortisation.periods)
        {
            let immobilisationPeriod = immobilisation.periods.filter(period => period.index==amortisationPeriod.index)[0];

            let expensesPeriod = expenses.filter(expense => expense.date==amortisationPeriod.dateEnd);
            currentExpensesAmount = currentExpensesAmount+getAmountItems(expensesPeriod);

            let entriesPeriod = amortisation.entries.filter(entry => entry.date==amortisationPeriod.dateEnd);
            currentAmortisationAmount = currentAmortisationAmount + getAmountItems(entriesPeriod) - getAmountItems(expensesPeriod);

            adjustedAmortisationPeriods.push({
                dateStart: amortisationPeriod.dateStart,
                dateEnd: amortisationPeriod.dateEnd,
                amount: currentAmortisationAmount,
                nbDays: Math.round(Math.abs((getDateFromString(amortisationPeriod.dateStart) - getDateFromString(amortisationPeriod.dateEnd)) / oneDay), 0),
                amountToDepreciate: immobilisationPeriod.amount-currentAmortisationAmount
            })

            if (currentExpensesAmount > currentMax) 
            {
                let amountExpenses = currentExpensesAmount-currentMax;
                let totalAmountToDepreciate = getSumItems(concernedPeriods.map(period => period.nbDays*period.amountToDepreciate));

                let adjustedAmortisationExpense = new Expense({
                    label: "Dotation ajustée",
                    accountNum: /^280/.test(amortisation.accountNum) ? "6811"+immobilisation.accountNum : "6812"+immobilisation.accountNum,
                    accountLib: "Amortissement "+immobilisation.label,
                    accountAux: amortisation.accountNum,
                    amount: roundValue(amountExpenses,2),
                });
                adjustedAmortisationExpenses.push(adjustedAmortisationExpense);

                let concernedPeriods = adjustedAmortisationPeriods.periods.filter(period => (parseInt(period.dateStart)>=parseInt(dateStart)) && (parseInt(period.dateEnd)<=parseInt(amortisationPeriod.dateEnd)));
                concernedPeriods.forEach(period => {
                    period.amount = totalAmountToDepreciate>0 ? roundValue(Math.round( amountExpenses*(period.amountToDepreciate/totalAmountToDepreciate)), 2) : 0;
                })
                
                currentAmortisationAmount = currentAmortisationAmount+amountExpenses;
                currentMax = currentExpensesAmount;
                dateStart = getNextDay(amortisationPeriod.dateEnd);
            }
        }

        let adjustedAmortisation = new Depreciation(amortisation);
        adjustedAmortisation.periods = adjustedAmortisationPeriods;
        adjustedAmortisations.push(adjustedAmortisation);
    })

    return({
        adjustedAmortisations,
        adjustedAmortisationExpenses
    })
}

const updatePeriods = (immobilisation,amortisation,expenses,nextPeriods,datesExpenses,dateStartYear,dateEndYear) =>
{
    // Immobilisation periods
    let immobilisationPrevPeriods = [...immobilisation.periods];
    immobilisation.periods = [];
    nextPeriods.forEach(nextPeriod =>
    {
        let prevPeriod = immobilisationPrevPeriods.filter(period => (parseInt(period.dateStart) <= parseInt(nextPeriod.dateStart)) && (parseInt(period.dateEnd) >= parseInt(nextPeriod.dateEnd)))[0];
        immobilisation.periods.push({
            dateStart: nextPeriod.dateStart,
            dateEnd: nextPeriod.dateEnd,
            amount: prevPeriod.amount
        })
    })

    // Amortisation periods
    let amortisationPrevPeriods = [...amortisation.periods];
    amortisation.periods = [];
    nextPeriods.forEach(nextPeriod =>
    {
        let prevPeriod = amortisationPrevPeriods.filter(period => (parseInt(period.dateStart) <= parseInt(nextPeriod.dateStart)) && (parseInt(period.dateEnd) >= parseInt(nextPeriod.dateEnd)))[0];
        amortisation.periods.push({
            dateStart: nextPeriod.dateStart,
            dateEnd: nextPeriod.dateEnd,
            amount: roundValue(prevPeriod.amount,2)
        })
    })

    // Expenses periods
    expenses.forEach(expense =>
    {
        let expensePrevPeriods = [...expense.periods];
        expense.periods = [];
        expensePrevPeriods.forEach(prevPeriod =>
        {
            // get start date (based on all amortisation expenses linked to amortisation account) -> period without other amortisation expenses
            let dateStartNextPeriods = datesExpenses.filter(date => parseInt(date) < parseInt(prevPeriod.dateEnd)).sort((a,b) => parseInt(a) < parseInt(b))[0];
            if (dateStartNextPeriods==undefined) dateStartNextPeriods = dateStartYear;
    
            let subPeriods = nextPeriods.filter(period => (parseInt(period.dateStart) >= parseInt(prevPeriod.dateStart)) && (parseInt(period.dateEnd) <= parseInt(prevPeriod.dateEnd)));

            // if empty period
            if (prevPeriod.amount==0) 
            {
                subPeriods.forEach(subPeriod => {
                    expense.periods.push({
                        dateStart: subPeriod.dateStart,
                        dateEnd: subPeriod.dateEnd,    
                        amount: 0
                    })
                })
            } 
            
            // get all new periods
            else 
            {
                let total = 0; // sum of time x amount to depreciate
                let tempPeriods = [];

                subPeriods.forEach(subPeriod => 
                {
                    if (parseInt(subPeriod.dateStart) < parseInt(dateStartNextPeriods)) {
                        // push 0
                        expense.periods.push({
                            dateStart: subPeriod.dateStart,
                            dateEnd: subPeriod.dateEnd,    
                            amount: 0
                        })
                    } else {
                        // nb days
                        let nbDaysSubPeriod = Math.round(Math.abs((getDateFromString(subPeriod.dateStart) - getDateFromString(subPeriod.dateEnd)) / oneDay));
    
                        // amount to depreciate
                        let prevAmortisationPeriod = amortisation.periods.filter(period => period.dateStart==subPeriod.dateStart)[0];
                        let prevImmobilisationPeriod = immobilisation.periods.filter(period => period.dateStart==subPeriod.dateStart)[0];
                        let amountToDepreciate = prevImmobilisationPeriod.amount - prevAmortisationPeriod.amount;
                        
                        total+= amountToDepreciate*nbDaysSubPeriod;
                        tempPeriods.push({
                            dateStart: subPeriod.dateStart,
                            dateEnd: subPeriod.dateEnd,
                            nbDays: nbDaysSubPeriod,    
                            prevAmount: subPeriod.dateEnd==prevPeriod.dateEnd ? prevPeriod.amount : 0,
                            amount: prevPeriod.amount * (amountToDepreciate*nbDaysSubPeriod) // to divide after
                        })
                    }
                })

                // if divider zero ? (to prevent)
                let cumulChanges = 0;
                for (let tempPeriod of tempPeriods) 
                {
                    tempPeriod.amount = roundValue(tempPeriod.amount / total,2);
                    tempPeriod.rate = roundValue(tempPeriod.amount/tempPeriod.nbDays,2);
                    expense.periods.push(tempPeriod);

                    if (tempPeriod.dateEnd!=dateEndYear) {
                        cumulChanges+= tempPeriod.amount-tempPeriod.prevAmount;
                        let amortisationPeriod = amortisation.periods.filter(period => period.dateStart==tempPeriod.dateEnd)[0];
                        amortisationPeriod.amount+= cumulChanges;
                    }
                }
            }  
        })
    })
}