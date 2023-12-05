// La Société Nouvelle

// Utils
import { roundValue } from "../../../../utils/Utils";

/* -------------------- PARSER -------------------- */

const parseAmount = (stringAmount) =>
  roundValue(parseFloat(stringAmount.replace(",", ".")), 2)

/* -------------------- BALANCE CHECKER -------------------- */

const checkBalance = (lines) => {
  let amount = lines
    .map((line) => parseAmount(line.Debit) - parseAmount(line.Credit))
    .reduce((a, b) => a + b, 0);
  return Math.round(amount) == 0;
}

/* ------------------------------------------------------------------------------------ */
/* ------------------------- ENTRY READER - EXTERNAL EXPENSES ------------------------- */


/* The function return an object with the following elements :
 *  - entryData (Array) : data from the entry to add the "main" data object
 *  - status (Boolean) : status of the reading
 *  - message (String) : -
 */

export const readAmortisationExpensesFromEntry = (entry) => {
  // ---------- Entry ---------- //

  let res = readAmortisationExpenses(entry);
  if (res.isExpensesTracked) return res;

  // ---------- Sub-entries ---------- //

  let subEntries = [];

  // group by asset type
  subEntries = getSubEntriesByAssetType(entry);
  res = readAmortisationExpensesFromSubEntries(subEntries);
  if (res.isExpensesTracked) return res;

  // group by label
  subEntries = getSubEntriesByLabel(entry);
  res = readAmortisationExpensesFromSubEntries(subEntries);
  if (res.isExpensesTracked) return res;

  // group by balanced group
  subEntries = getSubEntriesByBalancedGroup(entry);
  res = readAmortisationExpensesFromSubEntries(subEntries);
  if (res.isExpensesTracked) return res;

  // ---------- Error ---------- //

  // if reading unsuccessfull
  res.isExpensesTracked = false;

  // lignes relatives aux comptes de dotations
  let rowsAmortisationExpenses = entry.filter((ligne) =>
    /^68(1|7)1/.test(ligne.CompteNum)
  );
  let amortisationExpenseAccounts = rowsAmortisationExpenses.filter(
    (value, index, self) =>
      index === self.findIndex((item) => item.CompteNum === value.CompteNum)
  );

  // lignes relatives aux comtpes d'amortissements
  let rowsDepreciations = entry.filter((ligne) => /^28/.test(ligne.CompteNum));
  let depreciationAccounts = rowsDepreciations.filter(
    (value, index, self) =>
      index === self.findIndex((item) => item.CompteNum === value.CompteNum)
  );

  let balanced = checkBalanceTwoLists(
    rowsDepreciations,
    rowsAmortisationExpenses
  );

  // Message
  res.message =
    "L'écriture " +
    entry[0].EcritureNum +
    " du journal " +
    entry[0].JournalLib +
    " entraîne une exception (lecture dotation(s) aux amortissements) : " +
    depreciationAccounts.length +
    " compte(s) d'amortissements (" +
    depreciationAccounts
      .map((row) => row.CompteNum)
      .reduce((a, b) => a + ", " + b, "")
      .substring(2) +
    "), " +
    amortisationExpenseAccounts.length +
    " compte(s) de dotations (" +
    amortisationExpenseAccounts
      .map((row) => row.CompteNum)
      .reduce((a, b) => a + ", " + b, "")
      .substring(2) +
    "), " +
    (balanced
      ? "montant des dotations égal à la variation des amortissements au sein de l'écriture "
      : "montant des dotations différent de la variation des amortissements au sein de l'écriture.");

  return res;
};

const readAmortisationExpensesFromSubEntries = (subEntries) => {
  let res = { entryData: [], isExpensesTracked: false, message: "" };

  for (let subEntry of subEntries) {
    let resSubEntry = readAmortisationExpenses(subEntry);

    if (resSubEntry.isExpensesTracked)
      res.entryData.push(...resSubEntry.entryData);
    else {
      res.isExpensesTracked = false;
      res.message = resSubEntry.message;
      return res;
    }
  }

  res.isExpensesTracked = true;
  res.message = "OK";
  return res;
};

const readAmortisationExpenses = (rows) => {
  // response
  let res = { entryData: [], isExpensesTracked: false, message: "" };

  // lignes relatives aux comptes de dotations
  let rowsAmortisationExpenses = rows.filter((ligne) =>
    /^68(1|7)1/.test(ligne.CompteNum)
  );

  // lignes relatives aux comtpes d'amortissements
  let rowsAmortisations = rows.filter((ligne) => /^28/.test(ligne.CompteNum));

  // Empty entry -------------------------------------------------------------------------------------- //

  if (rowsAmortisationExpenses.length == 0) {
    res.isExpensesTracked = true;
    res.message = "Aucune dotation aux amortissements sur immobilisations.";
    return res;
  }

  // Single depreciation account ---------------------------------------------------------------------- //

  let sameDepreciationAccountUsed =
    rowsAmortisations.filter(
      (value, index, self) =>
        index === self.findIndex((item) => item.CompteNum === value.CompteNum)
    ).length == 1;
  if (sameDepreciationAccountUsed) {
    res.isExpensesTracked = true;
    res.message = "OK";

    // ligne relative au compte d'amortissements
    let rowAmortisation = rowsAmortisations[0];

    // build data
    rowsAmortisationExpenses.forEach((rowAmortisationExpense) => {
      // amortisation expense data
      let amortisationExpenseData = {
        label: rowAmortisationExpense.CompteLib.replace(/^\"/, "").replace(
          /\"$/,
          ""
        ),
        accountNum: rowAmortisationExpense.CompteNum,
        accountLib: rowAmortisationExpense.CompteLib,
        amortisationAccountNum: rowAmortisation.CompteNum,
        amortisationAccountLib: rowAmortisation.CompteLib,
        amount:
          parseAmount(rowAmortisationExpense.Debit) -
          parseAmount(rowAmortisationExpense.Credit),
        date: rowAmortisation.EcritureDate,
      };
      // push data
      res.entryData.push(amortisationExpenseData);
    });

    // return
    return res;
  }

  // Single amortisation expense account & amount balanced with amortisation accounts ----------------- //

  let sameAmortisationExpenseAccountUsed =
    rowsAmortisationExpenses.filter(
      (value, index, self) =>
        index === self.findIndex((item) => item.CompteNum === value.CompteNum)
    ).length == 1;
  if (
    sameAmortisationExpenseAccountUsed &&
    checkBalanceTwoLists(rowsAmortisationExpenses, rowsAmortisations)
  ) {
    res.isExpensesTracked = true;
    res.message = "OK";

    // ligne relative au compte de dotations
    let rowAmortisationExpense = rowsAmortisationExpenses[0];

    // build data
    rowsAmortisations.forEach((rowAmortisation) => {
      // amortisation expense data
      let amortisationExpenseData = {
        label: rowAmortisationExpense.CompteLib.replace(/^\"/, "").replace(
          /\"$/,
          ""
        ),
        accountNum: rowAmortisationExpense.CompteNum,
        accountLib: rowAmortisationExpense.CompteLib,
        amortisationAccountNum: rowAmortisation.CompteNum,
        amortisationAccountLib: rowAmortisation.CompteLib,
        amount:
          parseAmount(rowAmortisation.Credit) -
          parseAmount(rowAmortisation.Debit),
        date: rowAmortisationExpense.EcritureDate,
      };
      // push data
      res.entryData.push(amortisationExpenseData);
    });

    return res;
  }

  res.isExpensesTracked = false;
  res.message = sameAmortisationExpenseAccountUsed
    ? "Un seul compte de dotations mais le montant des dotations ne correspond pas à la variation des amortissements"
    : "Plusieurs comptes de dotations et d'amortissements.";
  return res;
};

/* ----------------------------------------------------------------------- */
/* ------------------------- SUB-ENTRIES SCRIPTS ------------------------- */

const getSubEntriesByLabel = (entry) => {
  let subEntries = [];

  // get list labels
  let labels = entry
    .map((row) => row.EcritureLib)
    .filter(
      (value, index, self) => index === self.findIndex((item) => item === value)
    );

  for (let label of labels) {
    let subEntry = entry.filter((ligne) => ligne.EcritureLib == label);
    subEntries.push(subEntry);
  }

  return subEntries;
};

const getSubEntriesByBalancedGroup = (entry) => {
  let subEntries = [];

  // build subEntries
  let currentSubEntry = [];
  for (let row of entry) {
    currentSubEntry.push(row);
    if (checkBalance(currentSubEntry)) {
      subEntries.push(currentSubEntry);
      currentSubEntry = [];
    }
  }
  if (currentSubEntry.length > 0) subEntries.push(currentSubEntry);

  return subEntries;
};

const getSubEntriesByStockType = (entry) => {
  let subEntries = [];

  // stock - raw materials
  let rowsRawMaterialsStock = entry.filter(
    (ligne) => /^6031/.test(ligne.CompteNum) || /^31/.test(ligne.CompteNum)
  );
  subEntries.push(rowsRawMaterialsStock);

  // stock - other supplies
  let rowsOtherSuppliesStock = entry.filter(
    (ligne) => /^6032/.test(ligne.CompteNum) || /^32/.test(ligne.CompteNum)
  );
  subEntries.push(rowsOtherSuppliesStock);

  // stock - goods
  let rowsGoodsStock = entry.filter(
    (ligne) => /^6037/.test(ligne.CompteNum) || /^37/.test(ligne.CompteNum)
  );
  subEntries.push(rowsGoodsStock);

  return subEntries;
};

const getSubEntriesByAssetType = (entry) => {
  let subEntries = [];

  // tangible assets
  let rowsTangibleAssets = entry.filter(
    (ligne) =>
      /^68(1|7)12/.test(ligne.CompteNum) || /^281/.test(ligne.CompteNum)
  );
  if (rowsTangibleAssets.length > 0) subEntries.push(rowsTangibleAssets);

  // intangible assets
  let rowsIntangibleAssets = entry.filter(
    (ligne) =>
      /^68(1|7)11/.test(ligne.CompteNum) || /^280/.test(ligne.CompteNum)
  );
  if (rowsIntangibleAssets.length > 0) subEntries.push(rowsIntangibleAssets);

  return subEntries;
};