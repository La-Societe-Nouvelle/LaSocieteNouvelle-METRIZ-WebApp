// La Société Nouvelle

// Objects
import { Aggregate } from '../accountingObjects/Aggregate';

// Utils
import { getAmountItems, getPrevAmountItems, getSumItems } from '../utils/Utils';

/* ------------------------------------------------------------ */
/* -------------------- AGGREGATES BUILDER -------------------- */
/* ------------------------------------------------------------ */

export const aggregatesBuilder = (financialData) =>
{
  let aggregates = financialData.aggregates;

  // MAIN AGGREGATES ----------------------------------------- //

  aggregates.production = new Aggregate({
      label: "Production",
      amount: financialData.getRevenue() + financialData.getStoredProduction() + financialData.getImmobilisedProduction()
  });

  aggregates.intermediateConsumption = new Aggregate({
      label: "Consommations intermédiaires",
      amount: financialData.getAmountExternalExpenses() - financialData.getVariationPurchasesStocks()
  })

  aggregates.grossValueAdded = new Aggregate({
      label: "Valeur ajoutée brute",
      amount: financialData.getProduction() - financialData.getAmountIntermediateConsumption()
  })

  aggregates.capitalConsumption = new Aggregate({
      label: "Consommations de capital fixe",
      amount: financialData.getAmountDepreciationExpenses()
  })

  aggregates.netValueAdded = new Aggregate({
      label: "Valeur ajoutée nette",
      amount: financialData.getGrossValueAdded() - financialData.getAmountDepreciationExpenses()
  })

  // PRODUCTION ---------------------------------------------- //

  aggregates.revenue = new Aggregate({
      label: "Chiffre d'affaires",
      amount: financialData.revenue
  });
  aggregates.storedProduction = new Aggregate({
      label: "Production stockée",
      amount: getSumItems(financialData.stocks.filter(stock => stock.isProductionStock).map(stock => stock.amount - stock.prevAmount))
  });
  aggregates.immobilisedProduction = new Aggregate({
      label: "Production immobilisée",
      amount: financialData.immobilisedProduction
  });

  // EXPENSES ------------------------------------------------ //

  aggregates.externalExpenses = new Aggregate({
      label: "Charges externes",
      amount: getAmountItems(financialData.expenses)
  });
  aggregates.depreciationExpenses = new Aggregate({
      label: "Dotations aux amortissements sur immobilisations",
      amount: getAmountItems(financialData.depreciationExpenses)
  });
  aggregates.storedPurchases = new Aggregate({
      label: "Variation de stock d'achats et de marchandises",
      amount: getSumItems(financialData.stocks.filter(stock => !stock.isProductionStock).map(stock => stock.amount - stock.prevAmount))
  });

  // STOCKS -------------------------------------------------- //

  // Purchases
  aggregates.purchaseStocks = new Aggregate({
      label: "Stocks d'achats et de marchandises",
      amount: getAmountItems(financialData.stocks.filter(stock => !stock.isProductionStock)),
      prevAmount: getPrevAmountItems(financialData.stocks.filter(stock => !stock.isProductionStock))
  });

  // Production
  aggregates.productionStocks = new Aggregate({
      label: "Stocks de production",
      amount: getAmountItems(financialData.stocks.filter(stock => stock.isProductionStock)),
      prevAmount: getPrevAmountItems(financialData.stocks.filter(stock => stock.isProductionStock))
  });

  // Stocks
  aggregates.stocksVariation = new Aggregate({
      label: "Variation des stocks",
      amount: getSumItems(financialData.stocks.map(stock => stock.amount - stock.prevAmount))
  });
  aggregates.stocks = new Aggregate({
      label: "Stocks",
      amount: getAmountItems(financialData.stocks),
      prevAmount: getPrevAmountItems(financialData.stocks)
  });
  aggregates.grossAmountStocks = new Aggregate({
      label: "Stocks",
      amount: getAmountItems(financialData.stocks),
      prevAmount: getPrevAmountItems(financialData.stocks)
  });
  aggregates.netAmountStocks = new Aggregate({
      label: "Stocks",
      amount: financialData.getFinalNetAmountStocks(),
      prevAmount: financialData.getInitialNetAmountStocks()
  });

  // IMMOBILISATIONS ----------------------------------------- //

  // Formation brute de capital fixe
  aggregates.grossFixedCapitalFormation = new Aggregate({
    label: "Formation brute de capital fixe",
    amount: getAmountItems(financialData.investments)
  });

  // Immobilisation
  aggregates.grossAmountImmobilisation = new Aggregate({
      label: "Immobilisations",
      amount: getAmountItems(financialData.immobilisations),
      prevAmount: getPrevAmountItems(financialData.immobilisations)
  });
  aggregates.netAmountImmobilisation = new Aggregate({
      label: "Immobilisations",
      amount: getSumItems(financialData.immobilisations.map(immobilisation => immobilisation.amount - financialData.getFinalValueLossImmobilisation(immobilisation.account))),
      prevAmount: getSumItems(financialData.immobilisations.map(immobilisation => immobilisation.prevAmount - financialData.getInitialValueLossImmobilisation(immobilisation.account)))
  });

  // --------------------------------------------------------- //
}