// La Société Nouvelle

// Objects
import { Aggregate } from '../accountingObjects/Aggregate';

// Utils
import { getAmountItems, getPrevAmountItems, getSumItems, roundValue } from '../utils/Utils';

/* ------------------------------------------------------------ */
/* -------------------- AGGREGATES BUILDER -------------------- */
/* ------------------------------------------------------------ */

export const aggregatesBuilder = (financialData) =>
{
  let aggregates = financialData.aggregates;

  // MAIN AGGREGATES ----------------------------------------- //

  aggregates.production = new Aggregate({
      label: "Production",
      amount: roundValue(financialData.getProduction(), 2)
  });

  aggregates.intermediateConsumption = new Aggregate({
      label: "Consommations intermédiaires",
      amount: roundValue(financialData.getAmountIntermediateConsumptions(), 2)
  })

  aggregates.capitalConsumption = new Aggregate({
      label: "Consommations de capital fixe",
      amount: roundValue(financialData.getAmountFixedCapitalConsumptions(), 2)
  })

  aggregates.netValueAdded = new Aggregate({
      label: "Valeur ajoutée nette",
      amount: roundValue(financialData.getNetValueAdded(), 2)
  })

  // PRODUCTION ---------------------------------------------- //

  aggregates.revenue = new Aggregate({
      label: "Chiffre d'affaires",
      amount: roundValue(financialData.revenue, 2)
  });
  aggregates.storedProduction = new Aggregate({
      label: "Production stockée",
      amount: roundValue(financialData.storedProduction, 2)
  });
  aggregates.immobilisedProduction = new Aggregate({
      label: "Production immobilisée",
      amount: roundValue(financialData.immobilisedProduction, 2)
  });

  // EXPENSES ------------------------------------------------ //

  aggregates.externalExpenses = new Aggregate({
      label: "Charges externes",
      amount: roundValue(financialData.getAmountExternalExpenses(), 2)
  });
  aggregates.amortisationExpenses = new Aggregate({
      label: "Dotations aux amortissements sur immobilisations",
      amount: roundValue(financialData.getAmountAmortisationExpenses(), 2)
  });
  aggregates.storedPurchases = new Aggregate({
      label: "Variation de stock d'achats et de marchandises",
      amount: roundValue(financialData.getVariationPurchasesStocks(), 2)
  });

  // STOCKS -------------------------------------------------- //

  // Purchases
  aggregates.purchaseStocks = new Aggregate({
      label: "Stocks d'achats et de marchandises",
      amount: getAmountItems(financialData.stocks.filter(stock => !stock.isProductionStock), 2),
      prevAmount: getPrevAmountItems(financialData.stocks.filter(stock => !stock.isProductionStock), 2)
  });

  // Production
  aggregates.productionStocks = new Aggregate({
      label: "Stocks de production",
      amount: getAmountItems(financialData.stocks.filter(stock => stock.isProductionStock), 2),
      prevAmount: getPrevAmountItems(financialData.stocks.filter(stock => stock.isProductionStock), 2)
  });

  // Stocks
  aggregates.stocksVariation = new Aggregate({
      label: "Variation des stocks",
      amount: getSumItems(financialData.stocks.map(stock => stock.amount - stock.prevAmount), 2)
  });
  aggregates.stocks = new Aggregate({
      label: "Stocks",
      amount: getAmountItems(financialData.stocks, 2),
      prevAmount: getPrevAmountItems(financialData.stocks, 2)
  });
  aggregates.grossAmountStocks = new Aggregate({
      label: "Stocks",
      amount: getAmountItems(financialData.stocks, 2),
      prevAmount: getPrevAmountItems(financialData.stocks, 2)
  });
  aggregates.netAmountStocks = new Aggregate({
      label: "Stocks",
      amount: financialData.getFinalNetAmountStocks(),
      prevAmount: financialData.getInitialNetAmountStocks()
  });

  // IMMOBILISATIONS ----------------------------------------- //
  
  // Immobilisation
  aggregates.grossAmountImmobilisation = new Aggregate({
      label: "Immobilisations",
      amount: getAmountItems(financialData.immobilisations, 2),
      prevAmount: getPrevAmountItems(financialData.immobilisations, 2)
  });
  aggregates.netAmountImmobilisation = new Aggregate({
      label: "Immobilisations",
      amount: getSumItems(financialData.immobilisations.map(immobilisation => immobilisation.amount - financialData.getFinalValueLossImmobilisation(immobilisation.accountNum)), 2),
      prevAmount: getSumItems(financialData.immobilisations.map(immobilisation => immobilisation.prevAmount - financialData.getInitialValueLossImmobilisation(immobilisation.accountNum)), 2)
  });

  // --------------------------------------------------------- //
}