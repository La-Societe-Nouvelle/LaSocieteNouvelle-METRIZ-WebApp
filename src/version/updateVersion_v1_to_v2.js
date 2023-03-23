

/**
 *    -> data = json of prev backup
 */

import { Immobilisation, ImmobilisationState } from "../accountingObjects/Immobilisation";
import { FinancialData } from "../FinancialData";
import { SocialFootprint } from "../footprintObjects/SocialFootprint";
import { buildRegexFinancialPeriod } from "../Session";
import { getAmountItems, getPrevDate } from "../utils/Utils";

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

export const updater_2_0_0 = async (sessionData) =>
{
  let prevSession = {...sessionData};
  
  // version
  sessionData.version = "2.0.0"; // Session.version ?

  // Progression
  sessionData.progression = prevSession.progression;
  
  // Periods
  let prevFinancialPeriod = getFinancialPeriod(prevSession.year);
  console.log(prevFinancialPeriod);
  sessionData.availablePeriods = [prevFinancialPeriod];
  sessionData.financialPeriod = prevFinancialPeriod;

  // Legal unit data
  sessionData.legalUnit = prevSession.legalUnit;

  // Financial data
  sessionData.financialData = await getNextFinancialDataObjectBuilder(prevSession.financialData,prevFinancialPeriod);

  // Impacts data
  sessionData.impactsData = {
    [prevFinancialPeriod.periodKey]: prevSession.impactsData,
  };

  // Validations
  sessionData.validations = {
    [prevFinancialPeriod.periodKey]: prevSession.validations,
  };

  // Comparative data
  sessionData.comparativeData = {
    activityCode : prevSession.comparativeData.activityCode,
    fixedCapitalConsumptions : prevSession.comparativeData.fixedCapitalConsumption,
    intermediateConsumptions : prevSession.comparativeData.intermediateConsumption,
    netValueAdded :  prevSession.comparativeData.netValueAdded,
    production :  prevSession.comparativeData.production,
  };
  // Indicators list
  sessionData.indics = {
    [prevFinancialPeriod.periodKey]: prevSession.indics,
  };

  prevSession = sessionData;
  console.log(prevSession);
}

const getFinancialPeriod = (prevYear) =>
{
  let year = prevYear || "2021"; // default 01/01/2021
  let prevFinancialPeriod = {
    dateStart: year+"0101",
    dateEnd: year+"1231",
    periodKey: "FY"+year,
    regex: buildRegexFinancialPeriod(year+"0101",year+"1231"),
  };
  return prevFinancialPeriod;
}

const getNextFinancialDataObjectBuilder = async (prevFinancialDataObject,prevFinancialPeriod) =>
{
  let nextFinancialData = {};
  // metaAccounts
  nextFinancialData.metaAccounts = {};
  prevFinancialDataObject.expenseAccounts
    .concat(prevFinancialDataObject.stocks)
    .concat(prevFinancialDataObject.immobilisations)
    .concat(prevFinancialDataObject.depreciations)
    .forEach(account => {
      nextFinancialData.metaAccounts[account.account] = account[account.accountLib];  // check no duplicate & all accounts
    })

  // isFinancialDataLoaded [unchange]
  nextFinancialData.isFinancialDataLoaded = prevFinancialDataObject.isFinancialDataLoaded;

  // Production items ------------------------ //

  nextFinancialData.productionAggregates = {
    revenue: {
      id:"revenue", 
      label:"Production vendue",
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
            amount: prevFinancialDataObject.revenue,
            footprint: prevFinancialDataObject.aggregates.revenue.footprint,
            periodKey: prevFinancialPeriod.periodKey
        }
      }
    }, 
    storedProduction: {
      id:"storedProduction", 
      label:"Production stockée",
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
            amount: prevFinancialDataObject.storedProduction,
            footprint: prevFinancialDataObject.aggregates.storedProduction.footprint,
            periodKey: prevFinancialPeriod.periodKey
        }
      }
    },
    immobilisedProduction: {
      id:"immobilisedProduction", 
      label:"Production immobilisée",
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
            amount: prevFinancialDataObject.immobilisedProduction,
            footprint: prevFinancialDataObject.aggregates.immobilisedProduction.footprint,
            periodKey: prevFinancialPeriod.periodKey
        }
      }
    },
  };

  // External expenses ----------------------- //

  nextFinancialData.externalExpenses = prevFinancialDataObject.expenses.map(prevExpense => buildExpense(prevExpense,prevFinancialPeriod));

  // Stocks ---------------------------------- //

  nextFinancialData.stocks = prevFinancialDataObject.stocks.map(prevStock => buildStock(prevFinancialDataObject,prevStock,prevFinancialPeriod));
  nextFinancialData.stockVariations = prevFinancialDataObject.stockVariations.map(prevStockVariation => buildStockVariation(prevStockVariation,prevFinancialPeriod));

  // Immobilisations ------------------------- //

  nextFinancialData.immobilisations = prevFinancialDataObject.immobilisations.map(prevImmobilisation => {
    let prevAmortisation = prevFinancialDataObject.depreciations.filter(({account,accountAux}) => accountAux==prevImmobilisation.account && /^28/.test(account))[0];
    let prevDepreciation = prevFinancialDataObject.depreciations.filter(({account,accountAux}) => accountAux==prevImmobilisation.account && /^29/.test(account))[0];
    let prevDepreciationExpenses = prevAmortisation ? prevFinancialDataObject.depreciationExpenses.filter(expense => expense.accountAux==prevAmortisation.account) : [];
    let nextImmobilisation = buildImmobilisation(prevImmobilisation,prevAmortisation,prevDepreciation,prevDepreciationExpenses,prevFinancialPeriod);
    return nextImmobilisation;
  });

  // depreciationExpenses => only amortisation expenses ?
  nextFinancialData.amortisationExpenses = prevFinancialDataObject.depreciationExpenses.map(prevAmortisationExpense => buildAmortisationExpense(prevAmortisationExpense,prevFinancialPeriod));
  nextFinancialData.adjustedAmortisationExpenses = nextFinancialData.immobilisations
    .filter(nextImmobilisation => nextImmobilisation.isAmortisable)
    .map(nextImmobilisation => buildAdjustedAmortisationExpense(nextImmobilisation,prevFinancialPeriod));
  nextFinancialData.investments = prevFinancialDataObject.investments.map(prevInvestment => buildInvestment(prevInvestment,prevFinancialPeriod));
  nextFinancialData.immobilisedProductions = prevFinancialDataObject.immobilisationProductions.map(prevImmobilisedProduction => buildImmobilisedProduction(prevImmobilisedProduction,prevFinancialPeriod));

  // Expenses accounts ----------------------- //

  nextFinancialData.externalExpensesAccounts = prevFinancialDataObject.expenseAccounts
    .filter(account => /^6(0[^3]|1|2)/.test(account.accountNum))
    .map(prevAccount => buildExpensesAccount(prevAccount,prevFinancialPeriod));

  nextFinancialData.stockVariationsAccounts = nextFinancialData.stocks
    .filter(stock => !stock.isProductionStock)
    .filter((value, index, self) => index === self.findIndex((item) => item.accountNum == value.accountNum))
    .map((stock) => {return({
          accountNum: "60" + stock.accountNum,
          accountLib: "Variation stock " + stock.accountLib,
          periodsData: {
            [prevFinancialPeriod.periodKey]: {
              periodKey: prevFinancialPeriod.periodKey,
              amount: getAmountItems(nextFinancialData.stockVariations.filter(item => item.stockAccountNum == stock.accountNum && prevFinancialPeriod.regex.test(item.date)), 2),
              footprint: new SocialFootprint(),
            }
          }
        })
      });

  nextFinancialData.amortisationExpensesAccounts = nextFinancialData.adjustedAmortisationExpenses
    .filter((value, index, self) => index === self.findIndex((item) => item.accountNum == value.accountNum))
    .map((expense) => {return({
          accountNum: expense.accountNum,
          accountLib: expense.accountLib,
          periodsData: {
            [prevFinancialPeriod.periodKey]: {
              periodKey: prevFinancialPeriod.periodKey,
              amount: getAmountItems(nextFinancialData.adjustedAmortisationExpenses.filter(item => item.accountNum == expense.accountNum && prevFinancialPeriod.regex.test(item.date)), 2),
              footprint: new SocialFootprint(),
            }
          }
        })
      });

  // Providers ------------------------------- //

  nextFinancialData.providers = prevFinancialDataObject.companies.map(prevProvider => buildProvider(prevProvider,prevFinancialDataObject.expenses,prevFinancialDataObject.investments,prevFinancialPeriod));

  // Aggregates ------------------------------ //

  nextFinancialData.mainAggregates = {
    production: {
      id:"production", 
      label:"Production",
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
            amount: prevFinancialDataObject.aggregates.production.amount,
            footprint: prevFinancialDataObject.aggregates.production.footprint,
            periodKey: prevFinancialPeriod.periodKey
        }
      }
    },
    intermediateConsumptions: {
      id:"intermediateConsumptions", 
      label:"Consommations intermédiaires",
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
            amount: prevFinancialDataObject.aggregates.intermediateConsumption.amount,
            footprint: prevFinancialDataObject.aggregates.intermediateConsumption.footprint,
            periodKey: prevFinancialPeriod.periodKey
        }
      }
    },
    fixedCapitalConsumptions: {
      id:"intermediateConsumptions", 
      label:"Consommations de capital fixe",
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
            amount: prevFinancialDataObject.aggregates.capitalConsumption.amount,
            footprint: prevFinancialDataObject.aggregates.capitalConsumption.footprint,
            periodKey: prevFinancialPeriod.periodKey
        }
      }
    },
    netValueAdded: {
      id:"netValueAdded", 
      label:"Valeur ajoutée nette",
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
            amount: prevFinancialDataObject.aggregates.netValueAdded.amount,
            footprint: prevFinancialDataObject.aggregates.netValueAdded.footprint,
            periodKey: prevFinancialPeriod.periodKey
        }
      }
    }
  };

  // Other figures --------------------------- //

  nextFinancialData.otherFinancialData = {};
  otherFinancialDataItems.forEach((itemLib) => {
    let financialDataItem = {
      id: itemLib,
      label: itemLib,
      periodsData: {
        [prevFinancialPeriod.periodKey]: {
          amount: prevFinancialDataObject[itemLib],
        }
      },
    };
    nextFinancialData.otherFinancialData[itemLib] = financialDataItem;
  });

  return nextFinancialData;
}

const buildExpense = (prevExpense,prevFinancialPeriod) => 
{
  let nextExpense = {
    accountNum: prevExpense.account,
    accountLib: prevExpense.accountLib,
    providerNum: prevExpense.accountAux,
    providerLib: prevExpense.accountAuxLib,
    isDefaultProviderAccount: prevExpense.isDefaultAccountAux,
    amount: prevExpense.amount,
    footprint: prevExpense.footprint,
    date: prevFinancialPeriod.dateEnd, // untracked before
  };
  return nextExpense;
}

const buildStock = (prevFinancialDataObject,prevStock,prevFinancialPeriod) => 
{
  let prefix = !prevStock.isProductionStock ? "60"+prevStock.account.slice(1).replace(/(0*)$/g,"") : null;
  let prevDepreciation = prevFinancialDataObject.depreciations.find(({accountAux}) => accountAux==prevStock.account);

  let nextStock = 
  {
    isProductionStock: prevStock.isProductionStock,
    expensesAccountsPrefix: !prevStock.isProductionStock ? prefix : null,
    purchasesAccounts: !prevStock.isProductionStock ? prevFinancialDataObject.expenseAccounts.map(account => account.accountNum).filter(accountNum => accountNum.startsWith(prefix)) : "",
    accountNum: prevStock.account,
    accountLib: prevStock.accountLib,
    entries: [],    
    depreciationAccountNum: prevDepreciation ? prevDepreciation.account : undefined,
    depreciationAccountLib: prevDepreciation ? prevDepreciation.accountLib : undefined,
    depreciationEntries: [],
    initialStateType: prevStock.initialState,
    initialState: prevStock.initialState ? {
      date: getPrevDate(prevFinancialPeriod.dateStart),
      prevStateDate: undefined,
      amount: prevStock.prevAmount,
      footprint: prevStock.prevFootprint,
    } : {},
    initialFootprintParams: prevStock.initialState=="defaultData" ? {
        area: prevStock.prevFootprintAreaCode,
        code: prevStock.prevFootprintActivityCode,
        aggregate: "TRESS"
      } : {},
    initialStateSet: prevStock.status==200,
    states: {
      [getPrevDate(prevFinancialPeriod.dateStart)] : {
        date: getPrevDate(prevFinancialPeriod.dateStart),
        prevStateDate: undefined,
        amount: prevStock.prevAmount,
        footprint: prevStock.prevFootprint,
      },
      [prevFinancialPeriod.dateEnd]: {
        date: prevFinancialPeriod.dateEnd,
        prevStateDate: getPrevDate(prevFinancialPeriod.dateStart),
        amount: prevStock.amount,
        footprint: prevStock.footprint
      }
    },
    lastState: {
      date: prevFinancialPeriod.dateEnd,
      prevStateDate: getPrevDate(prevFinancialPeriod.dateStart),
      amount: prevStock.amount,
      footprint: prevStock.footprint
    },
    status: prevStock.status,
    dataFetched: prevStock.dataFetched,
    lastUpdateFromRemote: prevStock.lastUpdateFromRemote, 
    defaultStockVariationAccountNum: prevStock.isProductionStock ? "60"+prevStock.account : undefined,
    defaultStockVariationAccountLib: prevStock.isProductionStock ?  "Variation stock "+prevStock.accountLib : undefined,
  };
  return nextStock;
}

const buildStockVariation = (prevStockVariation,prevFinancialPeriod) =>
{
  let nextStockVariation = {
    accountNum: "60"+prevStockVariation.accountAux,
    accountLib: "Variation stock "+prevStockVariation.accountAuxLib,
    stockAccountNum: prevStockVariation.accountAux,
    stockAccountLib: prevStockVariation.accountAuxLib,
    amount: prevStockVariation.amount,
    footprint: prevStockVariation.footprint,
    date: prevFinancialPeriod.dateEnd, // untracked before
  }
  return nextStockVariation;
}

const buildImmobilisation = (prevImmobilisation,prevAmortisation,prevDepreciation,prevDepreciationExpenses,prevFinancialPeriod) => 
{
  let nextImmobilisation = {
    isAmortisable: prevAmortisation!=undefined,
    accountNum: prevImmobilisation.account,
    accountLib: prevImmobilisation.accountLib,
    entries: [],
    amortisationAccountNum: prevAmortisation ? prevAmortisation.account : undefined,
    amortisationAccountLib: prevAmortisation ? prevAmortisation.accountLib : undefined,
    amortisationEntries: [], // untracked before
    depreciationAccountNum: prevDepreciation ? prevDepreciation.account : undefined,
    depreciationAccountLib: prevDepreciation ? prevDepreciation.accountLib : undefined,
    depreciationEntries: [], // untracked before
    initialStateType: prevImmobilisation.initialState || "none",
    initialState: prevImmobilisation.isDepreciableImmobilisation ? {
      date: getPrevDate(prevFinancialPeriod.dateStart),
      prevStateDate: null,
      amount: prevImmobilisation.prevAmount,
      footprint: new SocialFootprint(prevImmobilisation.prevFootprint),
      amortisationAmount: prevAmortisation ? prevAmortisation.prevAmount : undefined,
      amortisationFootprint: prevAmortisation ? new SocialFootprint(prevAmortisation.prevFootprint) : undefined,
      amortisationExpenseAmount: undefined // check if right
    } : null,
    initialFootprintParams: prevImmobilisation.initialState=="defaultData" ? {
      area: prevImmobilisation.prevFootprintAreaCode, 
      code: prevImmobilisation.prevFootprintActivityCode, 
      aggregate: "TRESS"} : {},
    initialStateSet: prevImmobilisation.status == 200,
    states: {
      [getPrevDate(prevFinancialPeriod.dateStart)]: {
        date: getPrevDate(prevFinancialPeriod.dateStart),
        prevStateDate: null,
        amount: prevImmobilisation.prevAmount,
        footprint: new SocialFootprint(prevImmobilisation.prevFootprint),
        amortisationAmount: prevAmortisation ? prevAmortisation.prevAmount : undefined,
        amortisationFootprint: prevAmortisation ? new SocialFootprint(prevAmortisation.prevFootprint) : undefined,
        amortisationExpenseAmount: undefined // check if right
      },
      [prevFinancialPeriod.dateEnd]: {
        date: prevFinancialPeriod.dateEnd,
        prevStateDate: getPrevDate(prevFinancialPeriod.dateStart),
        amount: prevImmobilisation.amount,
        footprint: new SocialFootprint(prevImmobilisation.footprint),
        amortisationAmount: prevAmortisation ? prevAmortisation.amount : undefined,
        amortisationFootprint: prevAmortisation ? new SocialFootprint(prevAmortisation.prevFootprint) : undefined,
        amortisationExpenseAmount: prevAmortisation ? getAmountItems(prevDepreciationExpenses) : undefined // check if right
      }
    }
  }
  return nextImmobilisation;
}

const buildAmortisationExpense = (prevAmortisationExpense, prevFinancialPeriod) =>
{
  let nextAmortisationExpense = {    
    accountNum: prevAmortisationExpense.account,
    accountLib: prevAmortisationExpense.accountLib,
    amortisationAccountNum: prevAmortisationExpense.accountAux,
    amortisationAccountLib: prevAmortisationExpense.accountAuxLib,
    amount: prevAmortisationExpense.amount,
    footprint: prevAmortisationExpense.footprint,
    date: prevFinancialPeriod.dateEnd
  };
  return nextAmortisationExpense;
}

const buildAdjustedAmortisationExpense = (nextImmobilisation,prevFinancialPeriod) =>
{
  let nextAdjustedAmortisationExpense = {
    accountNum: "6811" + (parseInt(nextImmobilisation.amortisationAccountNum.charAt(2)) + 1) + nextImmobilisation.amortisationAccountNum.slice(3),
    accountLib: "Dotations - " + nextImmobilisation.amortisationAccountLib,
    amortisationAccountNum: nextImmobilisation.amortisationAccountNum,
    amortisationAccountLib: nextImmobilisation.amortisationAccountLib,
    amount: nextImmobilisation.states[prevFinancialPeriod.dateEnd].amortisationExpenseAmount,
    date: prevFinancialPeriod.dateEnd
  };
  return nextAdjustedAmortisationExpense;
}

const buildInvestment = (prevInvestment,prevFinancialPeriod) => 
{
  let nextInvestment = {
    accountNum: prevInvestment.account,
    accountLib: prevInvestment.accountLib,
    providerNum: prevInvestment.accountAux,
    providerLib: prevInvestment.accountAuxLib,
    isDefaultProviderAccount: prevInvestment.isDefaultAccountAux,
    amount: prevInvestment.amount,
    footprint: prevInvestment.footprint,
    date: prevFinancialPeriod.dateStart,
  };
  return nextInvestment;
}

const buildImmobilisedProduction = (prevImmobilisedProduction,prevFinancialPeriod) =>
{
  let immobilisedProduction = {
    accountNum: prevImmobilisedProduction.accountAux,
    accountLib: prevImmobilisedProduction.accountAuxLib,
    immobilisationAccountNum: prevImmobilisedProduction.account,
    immobilisationAccountLib: prevImmobilisedProduction.accountLib,
    amount: prevImmobilisedProduction.amount,
    footprint: prevImmobilisedProduction.footprint,
    date: prevFinancialPeriod.dateEnd
  };
  return immobilisedProduction;
}

const buildExpensesAccount = (prevAccount,prevFinancialPeriod) =>
{
  let nextExpensesAccount = {
    accountNum: prevAccount.accountNum,
    accountLib: prevAccount.accountLib,
    periodsData: {
      [prevFinancialPeriod.periodKey]: {
        periodKey: prevFinancialPeriod.periodKey,
        amount: prevAccount.amount,
        footprint: prevAccount.footprint
      }
    }
  };
  return nextExpensesAccount;
}

const buildProvider = (prevProvider,prevExternalExpenses,prevInvestments,prevFinancialPeriod) =>
{
  let nextProvider = {
    isDefaultProviderAccount: prevProvider.isDefaultAccount,
    providerNum: prevProvider.account,
    providerLib: prevProvider.corporateName,
    corporateId: prevProvider.corporateId,
    legalUnitData: {
      codePays: prevProvider.legalUnitAreaCode,
      activitePrincipale: prevProvider.legalUnitActivityCode 
    },
    footprint: prevProvider.footprint,
    useDefaultFootprint: prevProvider.state=="default",
    defaultFootprintParams: prevProvider.state=="default" ? {
      area: prevProvider.footprintAreaCode,
      code: prevProvider.footprintActivityCode,
      aggregate: "PRD"
    } : {},
    dataFetched: prevProvider.dataFetched,
    footprintStatus: prevProvider.status,
    periodsData: {
      [prevFinancialPeriod.periodKey]: {
        periodKey: prevFinancialPeriod.periodKey,
        amount: getAmountItems(prevExternalExpenses.concat(prevInvestments).filter((expense) => expense.accountAux == prevProvider.account)),
        amountExpenses: getAmountItems(prevExternalExpenses.filter((expense) => expense.accountAux == prevProvider.account)),
        amountInvestments: getAmountItems(prevInvestments.filter((investment) => investment.accountAux == prevProvider.account))
      }
    }
  };
  return nextProvider;
}

class PrevFinancialDataObject 
{
  constructor(data) 
  {
  // ---------------------------------------------------------------------------------------------------- //
      
      if (data==undefined) data = {};
      
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
  }
}