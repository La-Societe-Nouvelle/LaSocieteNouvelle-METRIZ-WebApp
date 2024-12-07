// La Société Nouvelle

import { getDistinctItems } from "../../../utils/Utils";

// Lib
import metaIndics from "/lib/indics";

const indics = Object.entries(metaIndics)
  .filter(([_,metaIndic]) => metaIndic.isAvailable)
  .map(([indic,_]) => indic);

export const refetchData = async (session) => 
{
  const {
    legalUnit,
    financialData,
    comparativeData,
    validations
  } = session;

  // Récupération des données de l'unité légale --------------------------------------------------------- //

  if (legalUnit.siren !== "") {
    // fetch data
    await legalUnit.fetchLegalUnitData();
  }

  // Récupération des données fournisseurs -------------------------------------------------------------- //

  for (let provider of financialData.providers) 
  {
    try {
      // fetch footprint
      await provider.updateFromRemote();

      // assign to expenses & investments
      financialData.externalExpenses
        .concat(financialData.investments)
        .filter((expense) => expense.footprintOrigin == "provider")
        .filter((expense) => expense.providerNum == provider.providerNum)
        .forEach((expense) => {
          expense.footprint = provider.footprint;
        });
    } 
    catch (error) {
      console.log(error); // add to log
    }
  }

  // Récupération des données génériques (empreintes comptes de charges) -------------------------------- //

  for (let account of financialData.externalExpensesAccounts) 
  {
    try {
      // fetch footprint
      await account.updateFromRemote();

      // assign to expenses & investments
      financialData.externalExpenses
        .filter((expense) => expense.footprintOrigin == "account")
        .filter((expense) => expense.accountNum == account.accountNum)
        .forEach((expense) => {
          expense.footprint = account.footprint;
        });
    } 
    catch (error) {
      console.log(error); // add to log
    }
  }

  // Récupération des données par défaut ---------------------------------------------------------------- //
  
  const accounts = financialData.immobilisations
    .concat(financialData.stocks)
    .filter((asset) => asset.initialStateType == "defaultData");
  
  for (let account of accounts) 
  {
    try {
      await account.updateInitialStateFootprintFromRemote();
    } 
    catch (error) {
      console.log(error); // add to log
    }
  }

  // Récupération des données comparatives -------------------------------------------------------------- //

  const validIndics = getDistinctItems(Object.values(validations).flat(1));

  if (validIndics.length>0) {
    comparativeData.fetchComparativeData(validIndics);
  }
}

export const getProvidersChanges = async (
  currProviders,
  prevProviders 
) => {
  // providers data changes
  const changes = [];

  // Parcours de tous les fournisseurs
  for (let index in currProviders) 
  {
    const currProvider = currProviders[index];
    const prevProvider = prevProviders[index];

    for (let indic of indics) {
      const currIndicator = currProvider.footprint.indicators[indic];
      const prevIndicator = prevProvider.footprint.indicators[indic];
   
     if (JSON.stringify(currIndicator)!==JSON.stringify(prevIndicator)) {
      changes.push({
        providerId: currProvider.id,
        prevData: prevIndicator,
        nextData: currIndicator
      })
     }
    }
  }

  return changes;
}

export const getInitialStatesChanges = async (
  currAccounts,
  prevAccounts
) => {
  // initial states data changes
  const changes = [];

  // Parcours de tous les comptes immobilisations & stocks
  for (let index in currAccounts) 
  {
    const currAccount = currAccounts[index];
    if (currAccount.initialStateType=="defaultData") 
    {
      const prevAccount = prevAccounts[index];

      for (let indic of indics) {
        const currIndicator = currAccount.initialState.footprint.indicators[indic];
        const prevIndicator = prevAccount.initialState.footprint.indicators[indic];
  
       if (JSON.stringify(currIndicator)!==JSON.stringify(prevIndicator)) {
        changes.push({
          accountNum: currAccount.accountNum,
          prevData: prevIndicator,
          nextData: currIndicator
        })
       }
      }
    }
  }

  return changes;
}

export const getProductionFootprintChanges = (
  currFootprint,
  prevFootprint
) => {
  // changes
  const changes = [];

  for (let indic of indics) {
    const currIndicator = currFootprint.indicators[indic];
    const prevIndicator = prevFootprint.indicators[indic];

   if (JSON.stringify(currIndicator)!==JSON.stringify(prevIndicator)) {
    changes.push({
      prevData: prevIndicator,
      nextData: currIndicator
    })
   }
  }

  return changes;
}

export const getComparativeDataChanges = (prevData, currData) => {
  const metaAggregates = {
    production: "PRD",
    intermediateConsumptions: "IC",
    fixedCapitalConsumptions: "CFC",
    netValueAdded: "NVA",
  };

  const metaScales = ["area", "division"];

  const metaSeries = {
    history: { enpoint: "macro_fpt_a88" },
    trend: { enpoint: "macro_fpt_trd_a88" },
    target: { enpoint: "macro_fpt_tgt_a88" },
  };

  const changes = {};

  // Compare each aggregate, scale, and serie
  for (const aggregateKey of Object.keys(metaAggregates)) {
    changes[aggregateKey] = {};

    for (const scale of metaScales) {
      changes[aggregateKey][scale] = {};

      for (const serie of Object.keys(metaSeries)) {
        changes[aggregateKey][scale][serie] = [];

        const prevDataset = prevData[aggregateKey][scale][serie].data;
        const currDataset = currData[aggregateKey][scale][serie].data;

        // Compare each indic in the dataset
        for (const indic of Object.keys(prevDataset)) {
          const prevDataArray = prevDataset[indic];
          const currDataArray = currDataset[indic];

          // Check if the arrays have the same length
          if (prevDataArray.length !== currDataArray.length) {
            changes[aggregateKey][scale][serie].push({
              indic,
            });
          } else {
            // Compare each element in the array
            for (let i = 0; i < prevDataArray.length; i++) {
              if (
                prevDataArray[i].year !== currDataArray[i].year ||
                prevDataArray[i].value !== currDataArray[i].value
              ) {
                changes[aggregateKey][scale][serie].push({
                  indic,
                  year: prevDataArray[i].year,
                  prevValue: prevDataArray[i].value,
                  currValue: currDataArray[i].value,
                });
              }
            }
          }
        }
      }
    }
  }

  // Check if there are any changes, and return null if not
  const hasChanges = Object.keys(changes).some((aggregateKey) =>
    Object.keys(changes[aggregateKey]).some((scale) =>
      Object.keys(changes[aggregateKey][scale]).some(
        (serie) => changes[aggregateKey][scale][serie].length > 0
      )
    )
  );

  return hasChanges ? changes : null;
};
