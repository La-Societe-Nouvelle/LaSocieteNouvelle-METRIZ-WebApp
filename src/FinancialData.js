// La Société Nouvelle

// Accounting Objects
import { Expense } from '/src/accountingObjects/Expense';
import { Immobilisation } from '/src/accountingObjects/Immobilisation';
import { Depreciation } from '/src/accountingObjects/Depreciation'
import { Stock } from '/src/accountingObjects/Stock';
import { Account, buildAggregateFromArray } from './accountingObjects/Account';

// Other objects
import { SocialFootprint } from '/src/footprintObjects/SocialFootprint'
import { Company } from '/src/Company';
import { getAmountItems, getDateFromString, getPrevAmountItems, getSumItems, roundValue } from './utils/Utils';
import { Aggregate } from './accountingObjects/Aggregate';

// Scripts
import { aggregatesBuilder } from './formulas/aggregatesBuilder';

// Libraries
import accountsMatching from '/lib/accountsMatching'

// list aggregates
const metaAggregates = ["revenue",
                        "production",
                        "storedProduction",
                        "intermediateConsumption",
                        "purchasesStocksVariations",
                        "externalExpenses",
                        "grossValueAdded",
                        "depreciationExpenses",
                        "capitalConsumption",
                        "netValueAdded"];

const oneDay = 24 * 60 * 60 * 1000;

/* ---------- OBJECT FINANCIAL DATA ---------- */

export class FinancialData {

    constructor(data) 
    {
    // ---------------------------------------------------------------------------------------------------- //
        
        if (data==undefined) data = {};
        
        // Print
        // console.log(data);

        // data loaded state
        this.isFinancialDataLoaded = data.isFinancialDataLoaded || false;   
        
        // Production ------------------------------ //

        this.revenue = data.revenue || 0;                                                                                                                               // revenue (#71)
        this.storedProduction = data.storedProduction || 0;                                                                                                             // stored production (#71)
        this.immobilisedProduction = data.immobilisedProduction || 0;                                                                                                   // immobilised production (#72)

        // Expenses -------------------------------- //

        this.expenses = data.expenses ? data.expenses.map((props,index) => new Expense({id: index, ...props})) : [];                                                    // external expenses (#60[^3], #61, #62)
        this.stockVariations = data.stockVariations ? data.stockVariations.map((props,index) => new Expense({id: index, ...props})) : [];                               // stock variation (#603, #71)
        this.depreciationExpenses = data.depreciationExpenses ? data.depreciationExpenses.map((props,index) => new Expense({id: index, ...props})) : [];                // depreciation expenses (#6811, #6871)
        
        this.expenseAccounts = data.expenseAccounts ? data.expenseAccounts.map((props) => new Account({...props})) : this.expensesAccountsBuilder();
        
        // Stocks ---------------------------------- //
        
        this.stocks = data.stocks ? data.stocks.map((props,index) => new Stock({id: index, ...props})) : [];                                                            // stocks (#31 to #35, #37)
        
        // Immobilisations ------------------------- //

        this.investments = data.investments ? data.investments.map((props,index) => new Expense({id: index, ...props})) : [];                                           // investments (flows #2 <- #404)
        this.immobilisationProductions = data.immobilisationProductions ? data.immobilisationProductions.map((props,index) => new Expense({id: index, ...props})) : []; // productions of immobilisations (flows #2 <- #72)
        
        this.immobilisations = data.immobilisations ? data.immobilisations.map((props,index) => new Immobilisation({id: index, ...props})) : [];                        // immobilisations (#20 to #27)
        this.depreciations = data.depreciations ? data.depreciations.map((props,index) => new Depreciation({id: index, ...props})) : [];                                // depreciations (#28, #29 & #39)

        // Other figures --------------------------- //

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
        this.companies = data.companies ? data.companies.map((props,id) => new Company({id: id, ...props})) : [];

        // Aggregates
        this.aggregates = {};
        data.aggregates ? Object.entries(data.aggregates).forEach(([aggregateId,aggregateProps]) => this.aggregates[aggregateId] = new Aggregate(aggregateProps)) : aggregatesBuilder(this);
        
    // ---------------------------------------------------------------------------------------------------- //
        buildPeriods(this.immobilisations,this.depreciations,this.depreciationExpenses);
    }

    /* ---------------------------------------- EXPENSE ACCOUNTS BUILDER ---------------------------------------- */

    expensesAccountsBuilder = () =>
    {
        return this.expenses.concat(this.depreciationExpenses)
                            .concat(this.stockVariations.filter(variation => /^6/.test(variation.account)))
                            .filter((value, index, self) => index === self.findIndex(item => item.account === value.account))
                            .map(expense => new Account({accountNum: expense.account, accountLib: expense.accountLib, amount: this.getAmountExpenseByAccount(expense.account)}));
    }

    getAmountExpenseByAccount = (accountNum) => getAmountItems(this.expenses.concat(this.depreciationExpenses)
                                                                            .concat(this.stockVariations)
                                                                            .filter(expense => expense.account == accountNum))

    /* ---------------------------------------- COMPANIES INITIALIZER ---------------------------------------- */

    companiesInitializer = () =>
    {
        this.companies = this.expenses.concat(this.investments)
                                      .map(expense => {return({account: expense.accountAux, accountLib: expense.accountAuxLib, isDefaultAccount: expense.isDefaultAccountAux})})
                                      .filter((value, index, self) => index === self.findIndex(item => item.account === value.account))
                                      .map(({account,accountLib,isDefaultAccount},id) => new Company({id, account, isDefaultAccount, corporateName: accountLib, amount: this.getAmountExpenseByAccountAux(account)}));
    }

    getAmountExpenseByAccountAux = (accountNum) => getAmountItems(this.expenses.concat(this.investments)
                                                                               .filter(expense => expense.accountAux == accountNum))

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

        // match accounts
        this.immobilisations.filter(immobilisation => immobilisation.isDepreciableImmobilisation)
                            .filter(immobilisation => immobilisation.initialState == "defaultData")
                            .forEach(immobilisation => 
        {
            accountsMatching.branche.forEach(matching => 
            {
                let regex = new RegExp(matching.accountRegex);
                if (regex.test(immobilisation.account)) {
                    immobilisation.prevFootprintActivityCode = matching.branche;
                }
            })
        });
    }

    /* ---------------------------------------- INITIAL STATES LOADER ---------------------------------------- */

    async loadInitialStates(data) 
    {        
        // Print
        // console.log(data);

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
            else if (stock.prevAmount > 0)
            {
                console.log("New account with previous amount not null");
            }
            else
            {
                stock.prevFootprint = new SocialFootprint();
                stock.initialState = "none";
            }
        })

        // Expense accounts
        this.expenseAccounts.forEach(account =>
        {
            let prevProps = data.financialData.expenseAccounts.filter(prevAccount => prevAccount.accountNum = account.accountNum)[0];
            if (prevProps!=undefined)
            {
                account.prevFootprint = new SocialFootprint(prevProps.footprint);
                account.initialState = "prevFootprint";
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
    getAmountExternalExpenses = () => getSumItems(this.expenses.map(expense => expense.amount))
    getAmountExpensesByAccountAux = (accountNum) => getSumItems(this.expenses.filter(expense => expense.accountAux.startsWith(accountNum)).map(expense => expense.amount))
    
    // Depreciation expenses
    getAmountDepreciationExpenses = () => getSumItems(this.depreciationExpenses.map(expense => expense.amount))
    getAmountOperatingDepreciationExpenses = () => getSumItems(this.depreciationExpenses.filter(expense => /^6811/.test(expense.account)).map(expense => expense.amount))
    getAmountExceptionalDepreciationExpenses = () => getSumItems(this.depreciationExpenses.filter(expense => /^6871/.test(expense.account)).map(expense => expense.amount))
    getAmountDepreciationExpensesByAccountAux = (accountNum) => getSumItems(this.depreciationExpenses.filter(expense => expense.accountAux.startsWith(accountNum)).map(expense => expense.amount))

    // STOCKS -------------------------------------------------- //
    
    // All stocks
    getVariationStocks = () => this.getFinalAmountStocks() - this.getInitialAmountStocks()
    getInitialAmountStocks = () => getPrevAmountItems(this.stocks)
    getFinalAmountStocks = () => getAmountItems(this.stocks)

    // Purchases stocks
    getVariationPurchasesStocks = () => this.getFinalAmountPurchasesStocks() - this.getInitialAmountPurchasesStocks()
    getInitialAmountPurchasesStocks = () => this.stocks.filter(stock => !stock.isProductionStock).map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getFinalAmountPurchasesStocks = () => this.stocks.filter(stock => !stock.isProductionStock).map(stock => stock.amount).reduce((a,b) => a + b,0)

    // Production stocks
    getVariationProductionStocks = () => this.getFinalAmountProductionStocks() - this.getInitialAmountProductionStocks()
    getInitialAmountProductionStocks = () => this.stocks.filter(stock => stock.isProductionStock).map(stock => stock.prevAmount).reduce((a,b) => a + b,0)
    getFinalAmountProductionStocks = () => this.stocks.filter(stock => stock.isProductionStock).map(stock => stock.amount).reduce((a,b) => a + b,0)
    
    // Net amount
    getInitialNetAmountStocks = () => getSumItems(this.stocks.map(stock => stock.prevAmount - this.getInitialValueLossStock(stock.account)))
    getFinalNetAmountStocks = () => getSumItems(this.stocks.map(stock => stock.amount - this.getFinalValueLossStock(stock.account)))

    // Value loss
    getInitialValueLossStock = (accountNum) => this.depreciations.filter(depreciation => depreciation.accountAux == accountNum).map(depreciation => depreciation.prevAmount)[0] || 0;
    getFinalValueLossStock = (accountNum) => this.depreciations.filter(depreciation => depreciation.accountAux == accountNum).map(depreciation => depreciation.amount)[0] || 0;


    // IMMOBILISATIONS ----------------------------------------- //
    
    // Net amount
    getInitialNetAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.prevAmount - this.getInitialValueLossImmobilisation(immobilisation.account)).reduce((a,b) => a + b,0)
    getFinalNetAmountImmobilisations = () => this.immobilisations.map(immobilisation => immobilisation.amount - this.getFinalValueLossImmobilisation(immobilisation.account)).reduce((a,b) => a + b,0)
    
    // Value loss
    getInitialValueLossImmobilisation = (accountNum) => getSumItems(this.depreciations.filter(depreciation => depreciation.accountAux == accountNum).map(depreciation => depreciation.prevAmount))
    getFinalValueLossImmobilisation = (accountNum) => getSumItems(this.depreciations.filter(depreciation => depreciation.accountAux==accountNum).map(depreciation => depreciation.amount))

    // OTHER KEY FIGURES --------------------------------------- //

    // Operating section

    getAmountOperatingIncomes = () => this.getProduction()+this.getAmountOtherOperatingIncomes();
    getAmountOtherOperatingIncomes = () => this.otherOperatingIncomes;

    getAmountTaxes = () => this.taxes;
    getAmountPersonnelExpenses = () => this.personnelExpenses;
    getAmountOtherExpenses = () => this.otherExpenses;
    getAmountOperatingExpenses = () => this.getAmountIntermediateConsumption()+this.getAmountTaxes()+this.getAmountPersonnelExpenses()+this.getAmountDepreciationExpenses()+this.getAmountProvisions()+this.getAmountOtherExpenses()

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

    updateCorporateId = (account,corporateName,corporateId) => 
    {
        let company ;

        if(account){
           company = this.getCompanyByAccount(account);
        }
        else {          
            company = this.getCompanyByName(corporateName);
        }

        if (company!=undefined) company.update({id: company.id,corporateId});
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
        aggregate = {accountLib: "Dotations aux amortissements, dépréciations et provisions", amount: this.getAmountDepreciationExpenses()+this.getAmountProvisions(), isToBeChecked: false};
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

const buildPeriods = async (immobilisations,amortisations,amortisationExpenses) =>
{
    amortisations.forEach(amortisation =>
    {
        let immobilisation = immobilisations.filter(immobilisation => immobilisation.account == amortisation.accountAux)[0];
        let expenses = amortisationExpenses.filter(expense => expense.accountAux == amortisation.account);

        let dateStartYear = immobilisation.entries[0].date; // A-NOUVEAUX ou initialisation compte immo
        let dateEndYear = expenses.length > 0 
            ? expenses.map(expense => expense.entries).reduce((a,b) => a.concat(b),[]).sort((a,b) => parseInt(a.date) < parseInt(b.date))[0].date 
            : immobilisation.entries[immobilisation.entries.length-1].date; // to confirm (last date amortisation ?)

        initImmobilisationsPeriods(immobilisation,dateStartYear,dateEndYear);
        initAmortisationsExpensesPeriods(expenses,dateStartYear,dateEndYear);
        initAmortisationsPeriods(amortisation,expenses,dateStartYear,dateEndYear);

        let dates = amortisation.periods
            .concat(immobilisation.periods)
            .concat(expenses.map(expense => expense.periods).reduce((a,b) => a.concat(b),[]))
            .map(period => [period.dateStart,period.dateEnd])   // get date start & date end
            .reduce((a,b) => a.concat(b),[])
            .filter((value, index, self) => index === self.findIndex(item => item === value) && value!="")   // remove duplicates and empty string
            .sort((a,b) => parseInt(a) > parseInt(b));   // sort by date (chronology)
        
        let datesExpenses = expenses
            .map(expense => expense.periods).reduce((a,b) => a.concat(b),[])
            .map(period => [period.dateStart,period.dateEnd])
            .reduce((a,b) => a.concat(b),[])
            .filter((value, index, self) => index === self.findIndex(item => item === value))
            .sort((a,b) => parseInt(a) > parseInt(b));

        // build next periods
        let nextPeriods = dates.slice(1).map((date,index,self) => {
            return({
                dateStart: index > 0 ? self[index-1] : dateStartYear,
                dateEnd: date,
                amount: null
            })
        })

        updatePeriods(immobilisation,amortisation,expenses,nextPeriods,datesExpenses,dateStartYear,dateEndYear);
        console.log("results");
        console.log(immobilisation);
        console.log(amortisation);
        expenses.forEach(expense => console.log(expense));
    })
}

const initImmobilisationsPeriods = async (immobilisation,dateStartYear,dateEndYear) =>
{
    let currentAmount = immobilisation.prevAmount;
    let dateStart = dateStartYear;

    immobilisation.periods = [];

    // entries
    let entries = immobilisation.entries.filter(entry => !entry.isANouveaux).sort((a,b) => parseInt(a.date) > parseInt(b.date));
    for (let entry of entries) {
        // end current period
        immobilisation.periods.push({
            dateStart: dateStart,
            dateEnd: entry.date,
            amount: currentAmount
        });
        // update current values
        currentAmount+= entry.amount;
        dateStart = entry.date;
    }
    // add last period
    if(dateStart!=dateEndYear) {
        immobilisation.periods.push({
            dateStart: dateStart,
            dateEnd: dateEndYear,
            amount: currentAmount
        });
    }
}

const initAmortisationsPeriods = async (amortisation,expenses,dateStartYear,dateEndYear) =>
{
    let currentAmount = amortisation.prevAmount;
    let dateStart = dateStartYear;

    amortisation.periods = [];

    // entries
    let entries = amortisation.entries
        .filter(entry => !entry.isANouveaux)
        .concat(expenses.map(expense => expense.adjustmentEntries).reduce((a,b) => a.concat(b),[]))
        .sort((a,b) => parseInt(a.date) > parseInt(b.date));
    for (let entry of entries) 
    {
        // end current period
        amortisation.periods.push({
            dateStart: dateStart,
            dateEnd: entry.date,
            amount: currentAmount
        });
        // update current values
        currentAmount+= entry.amount;
        dateStart = entry.date;
    }
    // add last period
    amortisation.periods.push({
        dateStart: dateStart,
        dateEnd: dateEndYear,
        amount: currentAmount
    });

    let index = 0;
    while (index < amortisation.periods.length)
    {
        if (amortisation.periods[index].dateStart==amortisation.periods[index].dateEnd) {
            amortisation.periods.splice(index,1);
        } else if (index > 0 && amortisation.periods[index].amount==amortisation.periods[index-1].amount) {
            amortisation.periods[index-1].dateEnd = amortisation.periods[index].dateEnd; // prolongation period
            amortisation.periods.splice(index,1);
        } else {
            index+= 1;
        }
    }
}

const initAmortisationsExpensesPeriods = async (expenses,dateStartYear,dateEndYear) =>
{
    expenses.forEach(expense => 
    {
        let currentAmount = 0;
        let currentMax = 0
        let dateStart = dateStartYear;

        expense.periods = [];
        expense.adjustmentEntries = [];

        // entries
        let flows = getFlowsByDate(expense.entries);
        for (let flow of flows) 
        {
            currentAmount+= flow.amount;

            if (currentAmount > currentMax) 
            {
                let amountPeriod = currentAmount-currentMax;
                currentMax = currentAmount;
                // end current period
                expense.periods.push({
                    dateStart: dateStart,
                    dateEnd: flow.date,
                    amount: amountPeriod
                });

                // update current values
                dateStart = flow.date;

                if (flow.amount > amountPeriod) {
                    expense.adjustmentEntries.push({
                        date: flow.date,
                        amount: -(flow.amount-amountPeriod)
                    })
                }
            }
            else {
                expense.adjustmentEntries.push({
                    date: flow.date,
                    amount: -flow.amount
                })
            }
        }

        if (dateStart!=dateEndYear) {
            // add last period
            expense.periods.push({
                dateStart: dateStart,
                dateEnd: dateEndYear,
                amount: currentAmount-currentMax
            });
        }
    })
}

const getFlowsByDate = (entries) => 
{
    let flows = [];
    entries.forEach((entry) => 
    {
        let flow = flows.filter(flow => flow.date==entry.date)[0];
        if (flow == undefined) flows.push({date: entry.date, amount: entry.amount})
        else flow.amount+= entry.amount;
    })
    return flows.sort((a,b) => parseInt(a.date) > parseInt(b.date));
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