// La Société Nouvelle

// Utils
import { roundValue } from "../../../../utils/Utils";

/* -------------------- PARSER -------------------- */

const parseAmount = (stringAmount) =>
  roundValue(parseFloat(stringAmount.replace(",", ".")), 2)

/* ------------------------------------------------------------------------------------ */
/* ------------------------- ENTRY READER - EXTERNAL EXPENSES ------------------------- */

/* The function return an object with the following elements :
 *  - entryData (Array) : data from the entry to add the "main" data object
 *  - status (Boolean) : status of the reading
 *  - message (String) : -
 */

export const readStockVariationsFromEntry = (entry) => {
  // ---------- Entry ---------- //

  let res = readStockVariations(entry);
  if (res.isStockVariationsTracked) return res;

  // ---------- Sub-entries ---------- //

  let subEntries = [];

  // group by stock type
  subEntries = getSubEntriesByStockType(entry);
  res = readStockVariationsFromSubEntries(subEntries);
  if (res.isStockVariationsTracked) return res;

  // group by label
  subEntries = getSubEntriesByLabel(entry);
  res = readStockVariationsFromSubEntries(subEntries);
  if (res.isStockVariationsTracked) return res;

  // group by balanced group
  subEntries = getSubEntriesByBalancedGroup(entry);
  res = readStockVariationsFromSubEntries(subEntries);
  if (res.isStockVariationsTracked) return res;

  // ---------- Error ---------- //

  // if reading unsuccessfull
  res.isStockVariationsTracked = false;

  // lignes relatives aux comptes de variations des stocks
  let rowsStockVariations = entry.filter((ligne) =>
    /^603/.test(ligne.CompteNum)
  );
  let stockVariationsAccounts = rowsStockVariations.filter(
    (value, index, self) =>
      index === self.findIndex((item) => item.CompteNum === value.CompteNum)
  );

  // lignes relatives aux comtpes de stocks
  let rowsStocks = entry.filter((ligne) => /^3(1|2|7)/.test(ligne.CompteNum));
  let stocksAccounts = rowsStocks.filter(
    (value, index, self) =>
      index === self.findIndex((item) => item.CompteNum === value.CompteNum)
  );

  let balanced = checkBalanceTwoLists(rowsStockVariations, rowsStocks);

  // Message
  res.message =
    "L'écriture " +
    entry[0].EcritureNum +
    " du journal " +
    entry[0].JournalLib +
    " entraîne une exception (lecture de variation(s) de stock) : " +
    stockVariationsAccounts.length +
    " compte(s) de variation de stock (" +
    stockVariationsAccounts
      .map((row) => row.CompteNum)
      .reduce((a, b) => a + ", " + b, "")
      .substring(2) +
    "), " +
    stocksAccounts.length +
    " compte(s) de stocks (" +
    stocksAccounts
      .map((row) => row.CompteNum)
      .reduce((a, b) => a + ", " + b, "")
      .substring(2) +
    "), " +
    (balanced
      ? "montant des variations égal à la variation des stocks au sein de l'écriture "
      : "montant des variations différent de la variation des stocks au sein de l'écriture.");

  return res;
};

const readStockVariationsFromSubEntries = (subEntries) => {
  let res = { entryData: [], isStockVariationsTracked: false, message: "" };

  for (let subEntry of subEntries) {
    let resSubEntry = readStockVariations(subEntry);

    if (resSubEntry.isStockVariationsTracked)
      res.entryData.push(...resSubEntry.entryData);
    else {
      res.isStockVariationsTracked = false;
      res.message = resSubEntry.message;
      return res;
    }
  }

  res.isStockVariationsTracked = true;
  res.message = "OK";
  return res;
};

const readStockVariations = (rows) => {
  // response
  let res = { entryData: [], isStockVariationsTracked: false, message: "" };

  // lignes relatives aux variations de stocks
  let rowsStockVariations = rows.filter((ligne) =>
    /^603/.test(ligne.CompteNum)
  );

  // lignes relatives aux comtpes de stocks
  let rowsStocks = rows.filter((ligne) => /^3/.test(ligne.CompteNum));

  // Empty entry -------------------------------------------------------------------------------------- //

  if (rowsStockVariations.length == 0) {
    res.isStockVariationsTracked = true;
    return res;
  }

  // Single stock account ----------------------------------------------------------------------------- //

  let sameStockAccountUsed =
    rowsStocks.filter(
      (value, index, self) =>
        index === self.findIndex((item) => item.CompteNum === value.CompteNum)
    ).length == 1;
  if (sameStockAccountUsed) {
    res.isStockVariationsTracked = true;
    res.message = "OK";

    // ligne relative au compte de stock
    let rowStock = rowsStocks[0];

    // build data
    rowsStockVariations.forEach((rowStockVariation) => {
      // stock variation data
      let stockVariationData = {
        label: rowStockVariation.CompteLib.replace(/^\"/, "").replace(
          /\"$/,
          ""
        ),
        accountNum: rowStockVariation.CompteNum,
        accountLib: rowStockVariation.CompteLib,
        stockAccountNum: rowStock.CompteNum,
        stockAccountLib: rowStock.CompteLib,
        isProductionStock: false,
        amount:
          parseAmount(rowStockVariation.Debit) -
          parseAmount(rowStockVariation.Credit),
        date: rowStock.EcritureDate,
      };
      // push data
      res.entryData.push(stockVariationData);
    });

    // return
    return res;
  }

  // Single stock variation account & amount balanced with stock accounts ----------------------------- //

  let sameStockVariationAccountUsed =
    rowsStockVariations.filter(
      (value, index, self) =>
        index === self.findIndex((item) => item.CompteNum === value.CompteNum)
    ).length == 1;
  if (
    sameStockVariationAccountUsed &&
    checkBalanceTwoLists(rowsStockVariations, rowsStocks)
  ) {
    res.isStockVariationsTracked = true;
    res.message = "OK";

    // ligne relative à la variation de stock
    let rowStockVariation = rowsStockVariations[0];

    // build data
    rowsStocks.forEach((rowStock) => {
      // stock variation data
      let stockVariationData = {
        label: rowStockVariation.CompteLib.replace(/^\"/, "").replace(
          /\"$/,
          ""
        ),
        accountNum: rowStockVariation.CompteNum,
        accountLib: rowStockVariation.CompteLib,
        stockAccountNum: rowStock.CompteNum,
        stockAccountLib: rowStock.CompteLib,
        isProductionStock: false,
        amount: parseAmount(rowStock.Credit) - parseAmount(rowStock.Debit),
        date: rowStockVariation.EcritureDate,
      };
      // push data
      res.entryData.push(stockVariationData);
    });

    return res;
  }

  res.isStockVariationsTracked = false;
  res.message = sameStockVariationAccountUsed
    ? "Un seul compte de variation de stocks mais le montant de la variation ne correspond pas à la variation des stocks"
    : "Plusieurs comptes de varation de stocks et de stocks.";
  return res;
};