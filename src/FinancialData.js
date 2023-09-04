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
  mergeAggregatePeriodsData,
} from "./accountingObjects/Aggregate";

// Other objects
import { SocialFootprint } from "/src/footprintObjects/SocialFootprint";

// Utils
import { getAmountItems, mergePeriodsData, roundValue } from "./utils/Utils";

// Libraries
import accountsMatching from "/lib/accountsMatching";
import { StockVariation } from "./accountingObjects/StockVariation";
import { AmortisationExpense } from "./accountingObjects/AmortisationExpense";
import { immobilisedProduction } from "./accountingObjects/ImmobilisedProduction";
import { Provider } from "./Provider";

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

export class FinancialData 
{
  constructor(data) 
  {
    // if no data (new session)
    if (data == undefined) {
      this.isFinancialDataLoaded = false;
    } else {
      // ---------------------------------------------------------------------------------------------------- //

      // data loaded state
      this.metaAccounts = data.accounts;
      this.isFinancialDataLoaded = data.isFinancialDataLoaded; // to follow progression
      this.status = data.status;

      // Production items ------------------------ //

      this.productionAggregates = {
        revenue: new Aggregate(data.productionAggregates.revenue), // revenue (#71)
        storedProduction: new Aggregate(
          data.productionAggregates.storedProduction
        ), // stored production (#71)
        immobilisedProduction: new Aggregate(
          data.productionAggregates.immobilisedProduction
        ), // immobilised production (#72)
      };

      // External expenses ----------------------- //

      this.externalExpenses = data.externalExpenses.map(
        (props) => new Expense({ ...props })
      ); // external expenses (#60[^3], #61, #62)

      // Stocks ---------------------------------- //

      this.stocks = Object.values(data.stocks).map(
        (props) => new Stock({ ...props })
      ); // stocks (#31 to #35, #37) / Depreciation (#29)
      this.stockVariations = data.stockVariations.map(
        (props) => new StockVariation({ ...props })
      ); // stock variation (#603, #71)

      // Immobilisations ------------------------- //

      this.immobilisations = Object.values(data.immobilisations).map(
        (props) => new Immobilisation({ ...props })
      ); // immobilisations (#20 to #27) / Amortisation (#28) / Depreciation (#29)
      this.amortisationExpenses = data.amortisationExpenses.map(
        (props) => new AmortisationExpense({ ...props })
      ); // amortisation expenses (#6811, #6871)
      this.adjustedAmortisationExpenses = data.adjustedAmortisationExpenses.map(
        (props) => new AmortisationExpense({ ...props })
      ); // amortisation expenses (#6811, #6871)
      this.investments = data.investments.map(
        (props) => new Expense({ ...props })
      ); // investments (flows #2 <- #404)
      this.immobilisedProductions = data.immobilisedProductions.map(
        (props) => new immobilisedProduction({ ...props })
      ); // productions of immobilisations (flows #2 <- #72)

      // Expenses accounts ----------------------- //

      this.externalExpensesAccounts = data.externalExpensesAccounts.map(
        (props) => new Account({ ...props })
      );
      this.stockVariationsAccounts = data.stockVariationsAccounts.map(
        (props) => new Account({ ...props })
      );
      this.amortisationExpensesAccounts = data.amortisationExpensesAccounts.map(
        (props) => new Account({ ...props })
      );

      // Providers ------------------------------- //

      this.providers = data.providers.map(
        (props) => new Provider({ ...props })
      );

      // Aggregates ------------------------------ //

      this.mainAggregates = 
      {
        production: new Aggregate(data.mainAggregates.production),
        intermediateConsumptions: new Aggregate(data.mainAggregates.intermediateConsumptions),
        fixedCapitalConsumptions: new Aggregate(data.mainAggregates.fixedCapitalConsumptions),
        netValueAdded: new Aggregate(data.mainAggregates.netValueAdded),
      };

      // Other figures --------------------------- //

      this.otherFinancialData = data.otherFinancialData || {};

      // ---------------------------------------------------------------------------------------------------- //
    }
  }

  /* -------------------------------------------------------------------------------------------------------------------- */
  /* ---------------------------------------- BUILD FINANCIAL DATA FROM FEC DATA ---------------------------------------- */
  /* -------------------------------------------------------------------------------------------------------------------- */

  loadFECData = async (
    FECData, 
    financialPeriod, 
    periods
  ) => {
    // ---------------------------------------------------------------------------------------------------- //

    // Meta ------------------------------------ //

    this.metaAccounts = FECData.accounts || {};

    // Production items ------------------------ //

    await this.buildProductionAggregates(FECData, periods);

    // External expenses ----------------------- //

    this.externalExpenses = FECData.externalExpenses.map(
      (props) => new Expense({ ...props })
    ); // external expenses (#60[^3], #61, #62)

    // Stocks ---------------------------------- //

    this.stocks = Object.values(FECData.stocks).map(
      (props) => new Stock({ ...props })
    ); // stocks (#31 to #35, #37) / Depreciation (#29)
    this.stockVariations = FECData.stockVariations.map(
      (props) => new StockVariation({ ...props })
    ); // stock variation (#603, #71)

    for (let stock of this.stocks) {
      await stock.buildStates(financialPeriod);
    }

    // Immobilisations ------------------------- //

    this.immobilisations = Object.values(FECData.immobilisations).map(
      (props) => new Immobilisation({ ...props })
    ); // immobilisations (#20 to #27) / Amortisation (#28) / Depreciation (#29)
    this.amortisationExpenses = FECData.amortisationExpenses.map(
      (props) => new AmortisationExpense({ ...props })
    ); // amortisation expenses (#6811, #6871)
    this.investments = FECData.investments.map(
      (props) => new Expense({ ...props })
    ); // investments (flows #2 <- #404)
    this.immobilisedProductions = FECData.immobilisedProductions.map(
      (props) => new immobilisedProduction({ ...props })
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
    
    // Status ---------------------------------- //
    
    this.status = {};
    periods.forEach(({ periodKey }) => {
      this.status[periodKey] = {
        isLoaded: true,
        isValidated: false
      }
    });

    this.isFinancialDataLoaded = true;

    // ---------------------------------------------------------------------------------------------------- //
  };

  /* ---------------------------------------- EXPENSE ACCOUNTS BUILDER ---------------------------------------- */

  buildProductionAggregates = async (FECData, periods) => {
    this.productionAggregates = {};
    // revenue (#70)
    this.productionAggregates.revenue = buildAggregateFromItems({
      id: "revenue",
      label: "Production vendue",
      items: FECData.revenue,
      periods,
    });
    // stored production (#71)
    this.productionAggregates.storedProduction = buildAggregateFromItems({
      id: "storedProduction",
      label: "Production stockée",
      items: FECData.storedProduction,
      periods,
    });
    // immobilised production (#72)
    this.productionAggregates.immobilisedProduction = buildAggregateFromItems({
      id: "immobilisedProduction",
      label: "Production immobilisée",
      items: FECData.immobilisedProduction,
      periods,
    });
  };

  buildExpensesAccounts = async (periods) => {
    // external expenses
    this.externalExpensesAccounts = this.externalExpenses
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
    this.externalExpensesAccounts.forEach((account) =>
      account.buildPeriods(
        this.externalExpenses.filter(
          (expense) => expense.accountNum == account.accountNum
        ),
        periods
      )
    );

    // purchases stock variations
    this.stockVariationsAccounts = this.stocks
      .filter((stock) => !stock.isProductionStock)
      .filter(
        (value, index, self) =>
          index === self.findIndex((item) => item.accountNum == value.accountNum)
      )
      .map(
        (stock) =>
          new Account({
            accountNum: "60" + stock.accountNum,
            accountLib: "Variation stock " + stock.accountLib,
          })
      );
    this.stockVariationsAccounts.forEach((account) =>
      account.buildPeriods(
        this.stockVariations.filter(
          (variation) => variation.stockAccountNum == account.accountNum.substring(2)
        ),
        periods
      )
    );

    // amortisation expenses
    this.amortisationExpensesAccounts = this.adjustedAmortisationExpenses
      .filter(
        (value, index, self) =>
          index === self.findIndex((item) => item.accountNum == value.accountNum)
      )
      .map(
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
            this.productionAggregates.revenue.periodsData[periodKey].amount +
              this.productionAggregates.storedProduction.periodsData[periodKey]
                .amount +
              this.productionAggregates.immobilisedProduction.periodsData[
                periodKey
              ].amount,
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
      accounts: this.externalExpensesAccounts.concat(
        this.stockVariationsAccounts
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
    this.providers = this.externalExpenses
      .concat(this.investments)
      .map((expense) => {
        return {
          providerNum: expense.providerNum,
          providerLib: expense.providerLib,
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
        this.externalExpenses.filter(
          (expense) => expense.providerNum == provider.providerNum
        ),
        this.investments.filter(
          (expense) => expense.providerNum == provider.providerNum
        ),
        periods
      )
    );
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
        stock.initialStateType = this.externalExpenses.some((expense) =>
          stock.purchasesAccounts.includes(expense.accountNum)
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

  /* ------------------------- Load BackUp Data ------------------------- */

  loadFinancialDataFromBackUp = async (prevFinancialData) => {
    // Merge with previous exepenses
    this.adjustedAmortisationExpenses =
      this.adjustedAmortisationExpenses.concat(
        prevFinancialData.adjustedAmortisationExpenses
      );
    this.amortisationExpenses = this.amortisationExpenses.concat(
      prevFinancialData.amortisationExpenses
    );

    // Add previous periods in expenses accounts
    this.amortisationExpensesAccounts = mergePeriodsAccounts(
      this.amortisationExpensesAccounts,
      prevFinancialData.amortisationExpensesAccounts
    );

    // Merge with previous external expenses
    this.externalExpenses = this.externalExpenses.concat(
      prevFinancialData.externalExpenses
    );

    // Add previous periods in expenses accounts
    this.externalExpensesAccounts = mergePeriodsAccounts(
      this.externalExpensesAccounts,
      prevFinancialData.externalExpensesAccounts
    );

    // Add previous initial state for immobilisations

    for (let prevImmobilisation of prevFinancialData.immobilisations) {
      const existingImmo = this.immobilisations.find(
        (immobilisation) =>
          immobilisation.accountNum === prevImmobilisation.accountNum
      );

      if (existingImmo) {
        await existingImmo.loadInitialStateFromBackUp(prevImmobilisation);
      } else {
        const newImmo = new Immobilisation(prevImmobilisation);
        this.immobilisations.push(newImmo);
      }
    }

    // Add previous initial state for stocks

    for (let prevStock of prevFinancialData.stocks) {
      const existingStock = this.stocks.find(
        (stock) => stock.accountNum === prevStock.accountNum
      );

      if (existingStock) {
        await existingStock.loadInitialStateFromBackUp(prevStock);
      } else {
        const newStock = new Stock(prevStock);
        this.stocks.push(newStock);
      }
    }

    // Merge with previous investments
    this.investments = this.investments.concat(prevFinancialData.investments);

    // Add previous periods in mainAggregates
    this.mainAggregates = mergeAggregatePeriodsData(
      this.mainAggregates,
      prevFinancialData.mainAggregates
    );

    // Merge with previous metaAccounts
    this.metaAccounts = mergeAccounts(
      this.metaAccounts,
      prevFinancialData.metaAccounts
    );

    this.otherFinancialData = mergeAggregatePeriodsData(
      this.otherFinancialData,
      prevFinancialData.otherFinancialData
    );

    // Providers
    for (let prevProvider of prevFinancialData.providers) {
      let provider = this.providers.find(
        (provider) => provider.providerNum === prevProvider.providerNum
      );
      if (provider) {
        await provider.loadPrevProvider(prevProvider);
      } else {
        const newProvider = new Provider({ ...prevProvider });
        this.providers.push(newProvider);
      }
    }

    // Production aggregates

    this.productionAggregates.revenue = mergePeriodsData(
      this.productionAggregates.revenue,
      prevFinancialData.productionAggregates.revenue
    );

    this.productionAggregates.immobilisedProduction = mergePeriodsData(
      this.productionAggregates.immobilisedProduction,
      prevFinancialData.productionAggregates.immobilisedProduction
    );

    this.productionAggregates.storedProduction = mergePeriodsData(
      this.productionAggregates.storedProduction,
      prevFinancialData.productionAggregates.storedProduction
    );

    // Stock variations
    this.stockVariationsAccounts = mergePeriodsAccounts(
      this.stockVariationsAccounts,
      prevFinancialData.stockVariationsAccounts
    );

    this.stockVariations = this.stockVariations.concat(
      prevFinancialData.stockVariations
    );

  };

  /* ---------------------------------------- GETTERS ---------------------------------------- */

  getProvider = (providerNum) =>
    this.providers.filter((provider) => provider.providerNum == providerNum)[0];
}
/* ---------------------------------------- UTILS  ---------------------------------------- */

export const mergePeriodsAccounts = (
  currentExpensesAccounts,
  previousExpensesAccounts
) => {
  const uniqueAccounts = new Set(); // Create a new Set to store unique account num
  const mergedExpensesAccounts = [];

  // Merged expenses accounts
  const exepensesAccounts = currentExpensesAccounts.concat(
    previousExpensesAccounts
  );

  exepensesAccounts.forEach((account) => {
    // Check if the accountNum has not been added to the Set yet
    if (!uniqueAccounts.has(account.accountNum)) {
      uniqueAccounts.add(account.accountNum);
      mergedExpensesAccounts.push(account);
    } else {
      // If the accountNum has already been added to the Set, merge the periodsData
      const index = mergedExpensesAccounts.findIndex(
        (item) => item.accountNum === account.accountNum
      );
      Object.assign(
        mergedExpensesAccounts[index].periodsData,
        account.periodsData
      );
    }
  });
  return mergedExpensesAccounts;
};

export const mergeAccounts = (current, previous) => {
  // Create a new object to hold the merged metadata, starting with the previous metadata.
  const mergedAccounts = Object.assign({}, previous);

  for (const accNum in current) {
    // If the current account number is not in the merged metadata, add it.
    if (!(accNum in mergedAccounts)) {
      mergedAccounts[accNum] = current[accNum];
    } else {
      // Merge the current and previous metadata for that account number.
      const mergeddata = Object.assign({}, previous[accNum], current[accNum]);
      mergedAccounts[accNum] = mergeddata;
    }
  }

  return mergedAccounts;
};
