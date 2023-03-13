// La Société Nouvelle

// Accounting Objects
import { Expense } from "/src/accountingObjects/Expense";
import { Immobilisation } from "/src/accountingObjects/Immobilisation";
import { Stock } from "/src/accountingObjects/Stock";
import { Account } from "./accountingObjects/Account";
import {
  Aggregate,
  buildAggregateFromAccounts,
  buildAggregateFromItems,
} from "./accountingObjects/Aggregate";

// Other objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Utils
import {
  getAmountItems,
  roundValue,
  mergeAggregates,
  mergeExpenses,
} from "./utils/Utils";

// Libraries
import accountsMatching from "/lib/accountsMatching";
import { StockVariation } from "./accountingObjects/StockVariation";
import { AmortisationExpense } from "./accountingObjects/AmortisationExpense";
import { buildRegexFinancialPeriod } from "./Session";
import { immobilisedProduction } from "./accountingObjects/ImmobilisedProduction";
import { Provider } from "./Provider";

const oneDay = 24 * 60 * 60 * 1000;

export const otherFinancialDataItems = [
  "otherOperatingIncomes", // #74, #75, #781, #791
  "financialIncomes", // #76, #786, #796
  "exceptionalIncomes", // #77, #787, #797
  "taxes", // #63
  "personnelExpenses", // #64
  "otherExpenses", // #65
  "financialExpenses", // #66 & #686
  "exceptionalExpenses", // #67 & #687 except #6871
  "provisions", // #681 except #6811
  "taxOnProfits", // #69
];

/* ---------- OBJECT FINANCIAL DATA ---------- */

export class FinancialData {
  constructor(data) {
    // if no data (new session)
    if (data == undefined) {
      this.isFinancialDataLoaded = false;
    } else {
      // ---------------------------------------------------------------------------------------------------- //
      // data loaded state
      this.metaAccounts = data.accounts;
      this.isFinancialDataLoaded = data.isFinancialDataLoaded; // (true)                                                                             // to follow step

      // Production items ------------------------ //

      this.revenue = new Aggregate(data.revenue); // revenue (#71)
      this.storedProduction = new Aggregate(data.storedProduction); // stored production (#71)
      this.immobilisedProduction = new Aggregate(data.immobilisedProduction); // immobilised production (#72)

      // External expenses ----------------------- //

      this.expenses = data.expenses.map(
        (props, index) => new Expense({ id: index, ...props })
      ); // external expenses (#60[^3], #61, #62)

      // Stocks ---------------------------------- //

      this.stocks = Object.values(data.stocks).map(
        (props, index) => new Stock({ id: index, ...props })
      ); // stocks (#31 to #35, #37) / Depreciation (#29)
      this.stockVariations = data.stockVariations.map(
        (props, index) => new StockVariation({ id: index, ...props })
      ); // stock variation (#603, #71)

      // Immobilisations ------------------------- //

      this.immobilisations = Object.values(data.immobilisations).map(
        (props, index) => new Immobilisation({ id: index, ...props })
      ); // immobilisations (#20 to #27) / Amortisation (#28) / Depreciation (#29)
      this.amortisationExpenses = data.amortisationExpenses.map(
        (props, index) => new AmortisationExpense({ id: index, ...props })
      ); // amortisation expenses (#6811, #6871)
      this.adjustedAmortisationExpenses = data.adjustedAmortisationExpenses.map(
        (props, index) => new AmortisationExpense({ id: index, ...props })
      ); // amortisation expenses (#6811, #6871)
      this.investments = data.investments.map(
        (props, index) => new Expense({ id: index, ...props })
      ); // investments (flows #2 <- #404)
      this.immobilisedProductions = data.immobilisedProductions.map(
        (props, index) => new immobilisedProduction({ id: index, ...props })
      ); // productions of immobilisations (flows #2 <- #72)

      // Expenses accounts ----------------------- //

      this.externalExpenseAccounts = data.externalExpenseAccounts.map(
        (props) => new Account({ ...props })
      );
      this.stockVariationAccounts = data.stockVariationAccounts.map(
        (props) => new Account({ ...props })
      );
      this.amortisationExpensesAccounts = data.amortisationExpensesAccounts.map(
        (props) => new Account({ ...props })
      );

      // Providers ------------------------------- //

      this.providers = data.providers.map(
        (props, id) => new Provider({ id: id, ...props })
      );

      // Aggregates ------------------------------ //

      this.mainAggregates = {};
      Object.entries(data.aggregates).forEach(
        ([aggregateId, aggregateProps]) =>
          (this.mainAggregates[aggregateId] = new Aggregate(aggregateProps))
      );

      // Other figures --------------------------- //

      this.otherFinancialData = data.otherFinancialData || {};

      // ---------------------------------------------------------------------------------------------------- //
    }
  }

  /* -------------------------------------------------------------------------------------------------------------------- */
  /* ---------------------------------------- BUILD FINANCIAL DATA FROM FEC DATA ---------------------------------------- */
  /* -------------------------------------------------------------------------------------------------------------------- */

  loadFECData = async (FECData) => {
    console.log(FECData);
    // ---------------------------------------------------------------------------------------------------- //

    // periods to build
    let financialPeriod = {
      dateStart: FECData.firstDate,
      dateEnd: FECData.lastDate,
      periodKey: "FY" + FECData.lastDate.substring(0, 4),
      regex: buildRegexFinancialPeriod(FECData.firstDate, FECData.lastDate),
    };
    let periods = [financialPeriod];

    // let periods = getListMonthsFinancialPeriod(importedData.meta.firstDate, importedData.meta.lastDate)
    //     .map(month => {
    //         return ({
    //             regex: new RegExp("^" + month),
    //             periodKey: month
    //         })
    //     })
    //     .concat(props.session.financialPeriod);

    // ---------------------------------------------------------------------------------------------------- //

    // Meta ------------------------------------ //

    this.metaAccounts = FECData.accounts || {};

    // Production items ------------------------ //

    await this.buildProductionItems(FECData, periods);

    // External expenses ----------------------- //

    this.expenses = FECData.expenses.map(
      (props, index) => new Expense({ id: index, ...props })
    ); // external expenses (#60[^3], #61, #62)

    // Stocks ---------------------------------- //

    this.stocks = Object.values(FECData.stocks).map(
      (props, index) => new Stock({ id: index, ...props })
    ); // stocks (#31 to #35, #37) / Depreciation (#29)
    this.stockVariations = FECData.stockVariations.map(
      (props, index) => new StockVariation({ id: index, ...props })
    ); // stock variation (#603, #71)

    for (let stock of this.stocks) {
      await stock.buildStates(financialPeriod);
    }

    // Immobilisations ------------------------- //

    this.immobilisations = Object.values(FECData.immobilisations).map(
      (props, index) => new Immobilisation({ id: index, ...props })
    ); // immobilisations (#20 to #27) / Amortisation (#28) / Depreciation (#29)
    this.amortisationExpenses = FECData.amortisationExpenses.map(
      (props, index) => new AmortisationExpense({ id: index, ...props })
    ); // amortisation expenses (#6811, #6871)
    this.investments = FECData.investments.map(
      (props, index) => new Expense({ id: index, ...props })
    ); // investments (flows #2 <- #404)
    this.immobilisedProductions = FECData.immobilisedProductions.map(
      (props, index) => new immobilisedProduction({ id: index, ...props })
    ); // productions of immobilisations (flows #2 <- #72)

    this.adjustedAmortisationExpenses = [];
    for (let immobilisation of this.immobilisations) {
      let immobilisationAmortisationExpenses = this.amortisationExpenses.filter(
        (expense) =>
          expense.amortisationAccountNum ==
          immobilisation.amortisationAccountNum
      );
      await immobilisation.buildStates(
        financialPeriod,
        immobilisationAmortisationExpenses
      );
      await immobilisation.divideAdjustedAmortisationExpenses();
      let immobilisationAdjustedAmortisationExpenses =
        await immobilisation.getAdjustedAmortisationExpenses();
      this.adjustedAmortisationExpenses.push(
        ...immobilisationAdjustedAmortisationExpenses
      );
    }

    // Expenses accounts ----------------------- //

    await this.buildExpensesAccounts(periods);

    // Providers ------------------------------- //

    await this.buildProviders(periods);

    // Other figures --------------------------- //

    await this.buildOtherFinancialData(FECData, periods);

    // Main Aggregates ------------------------- //

    await this.buildMainAggregates(periods);

    // Initial states -------------------------- //

    await this.initInitialStates();

    // ---------------------------------------------------------------------------------------------------- //
    this.isFinancialDataLoaded = true;
  };

  /* ---------------------------------------- EXPENSE ACCOUNTS BUILDER ---------------------------------------- */

  buildProductionItems = async (FECData, periods) => {
    // revenue (#70)
    this.revenue = buildAggregateFromItems({
      id: "revenue",
      label: "Production vendue",
      items: FECData.revenue,
      periods,
    });
    // stored production (#71)
    this.storedProduction = buildAggregateFromItems({
      id: "storedProduction",
      label: "Production stockée",
      items: FECData.storedProduction,
      periods,
    });
    // immobilised production (#72)
    this.immobilisedProduction = buildAggregateFromItems({
      id: "immobilisedProduction",
      label: "Production immobilisée",
      items: FECData.immobilisedProduction,
      periods,
    });
  };

  buildExpensesAccounts = async (periods) => {
    // external expenses
    this.externalExpenseAccounts = this.expenses
      .map((expense) => expense.accountNum)
      .filter(
        (value, index, self) =>
          index === self.findIndex((item) => item == value)
      )
      .map(
        (accountNum) =>
          new Account({
            accountNum,
            accountLib: this.metaAccounts[accountNum].accountLib,
          })
      );
    this.externalExpenseAccounts.forEach((account) =>
      account.buildPeriods(
        this.expenses.filter(
          (expense) => expense.accountNum == account.accountNum
        ),
        periods
      )
    );

    // purchases stock variations
    this.stockVariationAccounts = this.stocks
      .filter((stock) => !stock.isProductionStock)
      .map(
        (stock) =>
          new Account({
            accountNum: "60" + stock.accountNum,
            accountLib: "Variation stock " + stock.accountLib,
          })
      );
    this.stockVariationAccounts.forEach((account) =>
      account.buildPeriods(
        this.stockVariations.filter(
          (variation) => variation.stockAccountNum == account.accountNum
        ),
        periods
      )
    );

    // amortisation expenses
    console.log(this.adjustedAmortisationExpenses);
    this.amortisationExpensesAccounts = this.adjustedAmortisationExpenses.map(
      (expense) =>
        new Account({
          accountNum: expense.accountNum,
          accountLib: expense.accountLib,
        })
    );
    this.amortisationExpensesAccounts.forEach((account) =>
      account.buildPeriods(
        this.adjustedAmortisationExpenses.filter(
          (expense) => expense.accountNum == account.accountNum
        ),
        periods
      )
    );
  };

  buildMainAggregates = async (periods) => {
    this.mainAggregates = {};

    // MAIN AGGREGATES ----------------------------------------- //

    // Production
    let production = new Aggregate({
      id: "production",
      label: "Production",
    });
    periods.forEach(
      ({ periodKey }) =>
        (production.periodsData[periodKey] = {
          periodKey,
          amount: roundValue(
            this.revenue.periodsData[periodKey].amount +
              this.storedProduction.periodsData[periodKey].amount +
              this.immobilisedProduction.periodsData[periodKey].amount,
            2
          ),
          footprint: new SocialFootprint(),
        })
    );
    this.mainAggregates.production = production;

    // Intermediate consumptions
    let intermediateConsumptions = buildAggregateFromAccounts({
      id: "intermediateConsumptions",
      label: "Consommations intermédiaires",
      accounts: this.externalExpenseAccounts.concat(
        this.stockVariationAccounts
      ),
      periods,
    });
    this.mainAggregates.intermediateConsumptions = intermediateConsumptions;

    // Fixed capital consumptions
    let fixedCapitalConsumptions = buildAggregateFromAccounts({
      id: "fixedCapitalConsumptions",
      label: "Consommations de capital fixe",
      accounts: this.amortisationExpensesAccounts,
      periods,
    });
    this.mainAggregates.fixedCapitalConsumptions = fixedCapitalConsumptions;

    // Net value added
    let netValueAdded = new Aggregate({
      id: "netValueAdded",
      label: "Valeur ajoutée nette",
    });
    periods.forEach(
      ({ periodKey }) =>
        (netValueAdded.periodsData[periodKey] = {
          periodKey,
          amount: roundValue(
            production.periodsData[periodKey].amount -
              intermediateConsumptions.periodsData[periodKey].amount -
              fixedCapitalConsumptions.periodsData[periodKey].amount,
            2
          ),
          footprint: new SocialFootprint(),
        })
    );
    this.mainAggregates.netValueAdded = netValueAdded;
    console.log(this.mainAggregates);

    // --------------------------------------------------------- //
  };

  buildOtherFinancialData = async (FECData, periods) => {
    this.otherFinancialData = {};

    otherFinancialDataItems.forEach((itemLib) => {
      let financialDataItem = {
        id: itemLib,
        label: itemLib,
        periodsData: {},
      };
      periods.forEach((period) => {
        financialDataItem.periodsData[period.periodKey] = {
          periodKey: period.periodKey,
          amount: getAmountItems(
            FECData[itemLib].filter((entry) => period.regex.test(entry.date))
          ),
        };
      });
      this.otherFinancialData[itemLib] = financialDataItem;
    });
  };

  /* ---------------------------------------- PROVIDERS INITIALIZER ---------------------------------------- */

  // call when load financial data (import)
  buildProviders = async (periods) => {
    this.providers = this.expenses
      .concat(this.investments)
      .map((expense) => {
        return {
          providerNum: expense.providerNum,
          corporateName: expense.providerLib,
          isDefaultProviderAccount: expense.isDefaultProviderAccount,
        };
      })
      .filter(
        (value, index, self) =>
          index ===
          self.findIndex((item) => item.providerNum === value.providerNum)
      )
      .map((providerData, id) => new Provider({ id, ...providerData }));
    this.providers.forEach((provider) =>
      provider.buildPeriods(
        this.expenses
          .concat(this.investments)
          .filter((expense) => expense.providerNum == provider.providerNum),
        periods
      )
    );
    console.log(this.providers);
  };

  /* ---------------------------------------- INITIAL STATES INITIALIZER ---------------------------------------- */

  initInitialStates = async () => {
    // Immobilisations -> default data for all amortisable immobilisation
    this.immobilisations
      .filter((immobilisation) => immobilisation.isAmortisable)
      .forEach((immobilisation) => {
        immobilisation.initialStateType = "defaultData";
        let matchingActivity = accountsMatching.branche.filter(
          ({ accountRegex }) =>
            new RegExp(accountRegex).test(immobilisation.accountNum)
        )[0];
        immobilisation.initialFootprintParams = {
          area: "FRA",
          code: matchingActivity ? matchingActivity.branche : "TOTAL",
          aggregate: "TRESS",
        };
      });

    // Stocks (purchases) -> current footprint if at least one expense related to the stock account
    this.stocks
      .filter((stock) => !stock.isProductionStock)
      .forEach((stock) => {
        stock.initialStateType = this.expenses.some((expense) =>
          expense.accountNum.startsWith(stock.expensesAccountsPrefix)
        )
          ? "currentFootprint"
          : "defaultData";
        stock.initialFootprintParams =
          stock.initialStateType == "defaultData"
            ? {
                area: "FRA",
                code: "00",
                aggregate: "TRESS",
              }
            : {};
      });

    // Stocks (production) -> current footprint for all
    this.stocks
      .filter((stock) => stock.isProductionStock)
      .forEach((stock) => (stock.initialStateType = "currentFootprint"));
  };

  /* ---------------------------------------- INITIAL STATES LOADER ---------------------------------------- */

  // WIP (temp name)
  mergeData = async (previousData) => {
    this.externalExpenseAccounts = mergeExpenses(
      this.externalExpenseAccounts,
      previousData.externalExpenseAccounts
    );
    this.amortisationExpensesAccounts = mergeExpenses(
      this.amortisationExpensesAccounts,
      previousData.amortisationExpensesAccounts
    );
    this.mainAggregates = mergeAggregates(this.mainAggregates, previousData.mainAggregates);

  };  

  // WIP 
  async loadInitialStates(data) {

    // Available accounts
    let prevAccountsData = data.stocks.concat(data.immobilisations);
    let currentAccountsData = this.stocks.concat(this.immobilisations);
  
    // Assets accounts
    currentAccountsData.forEach((account) => {
      let prevAccount = prevAccountsData.find(prevItem => prevItem.accountNum === account.accountNum);
      if (prevAccount) {
        const entries = prevAccount.entries.concat(account.entries);
        const depreciationEntries = prevAccount.depreciationEntries.concat(account.depreciationEntries);
        const states = {...prevAccount.states, ...account.states};
        account.initialStateType = "prevFootprint";
        account.initialState = prevAccount.initialState;
        // update objets
        account.entries = entries;
        account.depreciationEntries = depreciationEntries;
        account.states = states;
        prevAccountsData.splice(prevAccountsData.indexOf(prevAccount), 1);
      }
      else {
        // TO DO init initial state
      }
    })
  
    console.log(currentAccountsData)
  }
  

  /* ---------------------------------------- GETTERS ---------------------------------------- */

  getProvider = (providerNum) =>
    this.providers.filter((provider) => provider.providerNum == providerNum)[0];
}
