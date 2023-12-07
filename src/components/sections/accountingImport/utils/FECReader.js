// La Société Nouvelle - METRIZ

// Libraries
import booksProps from "/lib/books.json";

// Utils
import { buildMappingAssetAccounts } from "./AmortisationAssetMapping";
import { roundValue } from "/src/utils/Utils";
import { readExternalExpensesFromEntry } from "./ExternalExpensesEntryReader";

// FEC colums
const columnsFEC = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "CompAuxNum",
  "CompAuxLib",
  "PieceRef",
  "PieceDate",
  "EcritureLib",
  "Debit",
  "Credit",
  "EcritureLet",
  "DateLet",
  "ValidDate",
  "Montantdevise",
  "Idevise",
];

/* -------------------------------------------------------------------------------------------- */
/* ---------------------------------------- FEC READER ---------------------------------------- */
/* -------------------------------------------------------------------------------------------- */

/*  La lecture du FEC est décomposée en deux fonctions :
 *
 *    1/ FECFileReader pour la lecture du fichier (file -> JSON)
 *        L'encodage utilisé est ISO-8859-1 [requis]
 *        Le séparateur doit être '\t' (tabulation) ou '|' (pipe) [requis]
 *        La structure du JSON produit est la suivante :
 *          .books (Array) -> journaux contenant la liste des lignes ({bookCode : [...rows]})
 *          .meta -> libellés des journaux, libellés des comptes, etc.
 *
 *    2/ FECDataReader pour la lecture des lignes (JSON -> JSON)
 *        Le JSON produit correspond directement à la structure de l'objet "FinancialData"
 *
 *  En cas d'erreurs ou de cas non "lisible" une exception est levée.
 *
 *  Une documentation est disponible via le lien : https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp/blob/main/src/readers/DOCUMENTATION%20-%20FEC%20Reader.md
 */

/* -------------------- PARSER -------------------- */

const parseAmount = (stringAmount) =>
  roundValue(parseFloat(stringAmount.replace(",", ".")), 2);

/* -------------------- BALANCE CHECKER -------------------- */

const checkBalanceTwoLists = (lignesA, lignesB) => {
  let amountA = lignesA
    .map((ligne) => parseAmount(ligne.Debit) - parseAmount(ligne.Credit))
    .reduce((a, b) => a + b, 0);
  let amountB = lignesB
    .map((ligne) => parseAmount(ligne.Credit) - parseAmount(ligne.Debit))
    .reduce((a, b) => a + b, 0);
  return Math.round(amountA * 100) == Math.round(amountB * 100);
};

const checkBalance = (rows) => {
  let amount = rows
    .map((row) => parseAmount(row.Debit) - parseAmount(row.Credit))
    .reduce((a, b) => a + b, 0);
  return Math.round(amount * 100) == 0;
};
/* -------------------- FEC ID BUIDER -------------------- */

const buildId = (amount) => {
  amount = parseInt(amount);
  while (amount > 9)
    amount = amount
      .toString()
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0);
  return amount;
};

/* ----------------------------------------------------- */
/* -------------------- FILE READER -------------------- */
/* ----------------------------------------------------- */

export async function FECFileReader(content) {
  // ...build JSON from FEC File (FEC -> JSON)
  // Output data ---------------------------------------------------------------------------------------- //

  let dataFEC = {
    books: [],
    id: "",
    meta: {
      books: {}, // key : accountNum / values : { label, type }
      accounts: {}, // key : accountNum / value : accountLib
      accountsAux: {}, // key : accountNum / value : accountLib
      firstDate: null,
      lastDate: null,
    },
  };

  // Separator ------------------------------------------------------------------------------------------ //

  let separator;
  try {
    separator = getSeparator(content.slice(0, content.indexOf("\n"))); // throw exception
  } catch (error) {
    throw error;
  }

  // Header --------------------------------------------------------------------------------------------- //

  // header

  let header = content
    .slice(0, content.indexOf("\n"))
    .replace("\r", "")
    .split(separator);

  // Vérification des colonnes
  const missingColumns = columnsFEC.filter(column => !header.includes(column));
  if (missingColumns.length > 0) {
    throw `Fichier erroné (libellé(s) manquant(s) : ${missingColumns.join(', ')})`;
  }

  // Construction de l'index des colonnes
  let indexColumns = {};
  header.forEach((column) => (indexColumns[column] = header.indexOf(column)));
  // Rows ----------------------------------------------------------------------------------------------- //

  // Segmentation des lignes
  const rows = content.slice(content.indexOf("\n") + 1).split("\n");

  // Lecture des lignes
  await rows.forEach(async (rowString, index) => {
    // Segmentation des colonnes (String -> JSON)
    let row = rowString.replace("\r", "").split(separator);

    if (row.length == header.length) {
      // Construction du JSON
      // -------------------------------------------------- //

      // Construction du JSON pour la ligne
      let rowData = await readFECFileRow(indexColumns, row);

      // Construction du journal (si absent) et mise à jour des métadonnées relatives aux journaux
      if (!(rowData.JournalCode in dataFEC.meta.books)) {
        dataFEC.books[rowData.JournalCode] = [];
        dataFEC.meta.books[rowData.JournalCode] = {
          label: rowData.JournalLib,
          type: getDefaultBookType(rowData.JournalCode, rowData.JournalLib),
        };
      }

      // Mise à jour des métadonnées relatives aux libellés de comptes
      if (!Object.keys(dataFEC.meta.accounts).includes(rowData.CompteNum)) {
        dataFEC.meta.accounts[rowData.CompteNum] = {
          accountNum: rowData.CompteNum,
          accountLib: rowData.CompteLib,
        };
      }
      if (
        rowData.CompAuxNum != undefined &&
        !Object.keys(dataFEC.meta.accountsAux).includes(rowData.CompAuxNum)
      ) {
        dataFEC.meta.accountsAux[rowData.CompAuxNum] = {
          accountNum: rowData.CompAuxNum,
          accountLib: rowData.CompAuxLib,
        };
      }

      // Date
      if (
        dataFEC.meta.firstDate == null ||
        parseInt(rowData.EcritureDate) < parseInt(dataFEC.meta.firstDate)
      )
        dataFEC.meta.firstDate = rowData.EcritureDate;
      if (
        dataFEC.meta.lastDate == null ||
        parseInt(rowData.EcritureDate) > parseInt(dataFEC.meta.lastDate)
      )
        dataFEC.meta.lastDate = rowData.EcritureDate;

      // Ajout des données
      dataFEC.books[rowData.JournalCode].push(rowData);

      // FEC id
      if (dataFEC.id.length < 15)
        dataFEC.id =
          dataFEC.id +
          buildId(parseAmount(rowData.Debit) + parseAmount(rowData.Credit));

      // -------------------------------------------------- //
    } else if (rowString != "")
      throw "Erreur - Ligne incomplète (" + (index + 2) + ")";
  });

  // Mapping accounts ----------------------------------------------------------------------------------- //

  dataFEC.meta.accounts = await buildMappingAssetAccounts(
    dataFEC.meta.accounts
  );

  // Return --------------------------------------------------------------------------------------------- //
  return dataFEC;
}

// Get separator
function getSeparator(line) {
  if (line.split("\t").length > 1) return "\t";
  else if (line.split("|").length > 1) return "|";
  else throw "Fichier erroné (séparateur incorrect).";
}

// Read line (Array -> JSON)
async function readFECFileRow(indexColumns, row) {
  let rowData = {};
  Object.entries(indexColumns).forEach(([column, index]) => {
    rowData[column] = row[index]
      .replace(/^\"/, "") // remove quote at the beginning
      .replace(/\"$/, "") // remove quote at the end
      .replace(/^\s+|\s+$/, ""); // remove spaces before and after string
  });
  return rowData;
}

// Book recognition (obsolete)
function getDefaultBookType(bookCode, bookLib) {
  // ~ A Nouveaux
  if (
    booksProps.ANOUVEAUX.codes.includes(bookCode) ||
    booksProps.ANOUVEAUX.labels.includes(bookLib.toUpperCase())
  )
    return "ANOUVEAUX";
  // ~ Ventes
  else if (
    booksProps.VENTES.codes.includes(bookCode) ||
    booksProps.VENTES.labels.includes(bookLib.toUpperCase())
  )
    return "VENTES";
  // ~ Achats
  else if (
    booksProps.ACHATS.codes.includes(bookCode) ||
    booksProps.ACHATS.labels.includes(bookLib.toUpperCase())
  )
    return "ACHATS";
  // ~ Operations Diverses
  else if (
    booksProps.OPERATIONS.codes.includes(bookCode) ||
    booksProps.OPERATIONS.labels.includes(bookLib.toUpperCase())
  )
    return "OPERATIONS";
  // ~ Others
  else return "AUTRE";
}

/* ----------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- DATA READER -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------- */

export async function FECDataReader(FECData) {
  // ...extract data to use in session (JSON -> Session)
  // Output data ---------------------------------------------------------------------------------------- //
  let data = {};

  // Meta ----------------------------------------------------------------------------------------------- //
  data.accounts = FECData.meta.accounts;
  data.accountsAux = FECData.meta.accountsAux;
  data.firstDate = FECData.meta.firstDate;
  data.lastDate = FECData.meta.lastDate;
  data.defaultProviders = [];

  // Reader data ---------------------------------------------------------------------------------------- //
  data.ignoreAmortisationEntries = [];
  data.ignoreStockVariationsEntries = [];
  data.ignoreExternalExpensesEntries = [];
  data.errors = [];

  // Production / Incomes ------------------------------------------------------------------------------- //
  data.revenue = []; // 70
  data.storedProduction = []; // 71
  data.immobilisedProduction = []; // 72
  data.otherOperatingIncomes = []; // 74, 75, 781, 791

  // Stocks --------------------------------------------------------------------------------------------- //
  data.stocks = {};
  Object.entries(FECData.meta.accounts)
    .filter(([accountNum, _]) => /^3[1-7]/.test(accountNum))
    .forEach(
      ([accountNum, accountData]) =>
        (data.stocks[accountNum] = {
          // stock data
          accountNum: accountNum,
          accountLib: accountData.accountLib,
          entries: [],
          // depreciation data
          depreciationAccountNum:
            FECData.meta.accounts[accountNum].depreciationAccountNum,
          depreciationAccountNum:
            FECData.meta.accounts[accountNum].depreciationAccountLib,
          depreciationEntries: [],
          purchasesAccounts:
            FECData.meta.accounts[accountNum].purchasesAccounts,
          // initial state
          initialState: {
            amount: 0,
            depreciationAmount: 0,
          },
        })
    );

  data.stockVariations = []; // stock flows 603 <-> 31-32-37 & 71 <-> 33-34-35

  // Expenses ------------------------------------------------------------------------------------------- //
  data.externalExpenses = []; // 60, 61, 62 (hors 603)
  data.amortisationExpenses = []; // 6811 and 6871

  // Immobilisations ------------------------------------------------------------------------------------ //
  data.immobilisations = {}; // #20 to #27 / #28 / #29
  Object.entries(FECData.meta.accounts)
    .filter(([accountNum, _]) => /^2[0-7]/.test(accountNum))
    .forEach(
      ([accountNum, accountData]) =>
        (data.immobilisations[accountNum] = {
          // immobilisation data
          accountNum: accountNum,
          accountLib: accountData.accountLib,
          entries: [],
          // amortisation data
          amortisationAccountNum:
            FECData.meta.accounts[accountNum].amortisationAccountNum,
          amortisationAccountLib:
            FECData.meta.accounts[accountNum].amortisationAccountLib,
          amortisationEntries: [],
          // depreciation data
          depreciationAccountNum:
            FECData.meta.accounts[accountNum].depreciationAccountNum,
          depreciationAccountNum:
            FECData.meta.accounts[accountNum].depreciationAccountLib,
          depreciationEntries: [],
          // initial state
          initialState: {
            amount: 0,
            amortisationAmount: 0,
            depreciationAmount: 0,
          },
        })
    );

  data.investments = []; // flow #2 <- #404
  data.immobilisedProductions = []; // flow #2 <- #72

  // Amortissements et Dépréciations -------------------------------------------------------------------- //
  //data.amortisations = [];                // #28
  //data.depreciations = [];                // #29 and #39 (unused)

  // others key figures --------------------------------------------------------------------------------- //
  data.financialIncomes = []; // #76, #786, #796
  data.exceptionalIncomes = []; // #77, #787, #797
  data.taxes = []; // #63
  data.personnelExpenses = []; // #64
  data.otherExpenses = []; // #65
  data.financialExpenses = []; // #66 & #686
  data.exceptionalExpenses = []; // #67 & #687 (hors #6871)
  data.provisions = []; // #68 (hors #6811)
  data.taxOnProfits = []; // #69

  // Other used data ------------------------------------------------------------------------------------//
  data.KNWData = {
    apprenticeshipTax: 0,
    vocationalTrainingTax: 0,
  };

  // ----------------------------------------------------------------------------------------------------//

  /* ------------------------- A NOUVEAUX ------------------------- */

  // Get book code for "A Nouveaux"
  let codeANouveaux = Object.entries(FECData.meta.books)
    .filter(([_, { type }]) => type == "ANOUVEAUX")
    .map(([bookCode, _]) => bookCode)[0];
  if (codeANouveaux != undefined) {
    // Lecture du journal des A-NOUVEAUX
    // -------------------------------------------------- //

    let journal = FECData.books[codeANouveaux];
    await journal
      .sort((a, b) => a.CompteNum.localeCompare(b.CompteNum))
      .map(async (ligne) => {
        try {
          await readANouveauxEntry(data, journal, ligne);
          // init #2 & #3 accounts
        } catch (error) {
          data.errors.push(error);
        }

        return;
      });

    // -------------------------------------------------- //
  }

  /* ------------------------- OTHER BOOKS ------------------------- */

  // Read books (except "A Nouveaux")
  Object.entries(FECData.meta.books)
    .filter(([_, { type }]) => type != "ANOUVEAUX")
    .forEach(async ([bookCode, _]) => {
      // Get book
      let journal = FECData.books[bookCode];

      // Read book
      await journal.map(async (ligne) => {
        try {
          // Lecture des lignes
          // -------------------------------------------------- //

          // Construction des données comptables
          if (/^2/.test(ligne.CompteNum))
            await readImmobilisationEntry(data, journal, ligne);
          if (/^3/.test(ligne.CompteNum))
            await readStockEntry(data, journal, ligne);
          if (/^6/.test(ligne.CompteNum))
            await readExpenseEntry(data, journal, ligne);
          if (/^7/.test(ligne.CompteNum))
            await readProductionEntry(data, journal, ligne);

          // Lecture d'informations supplémentaires
          if (/^63/.test(ligne.CompteNum))
            await readAddtionalDataEntry(data, journal, ligne);

          // -------------------------------------------------- //
        } catch (error) {
          data.errors.push(error);
        }
        return;
      });
    });

  /* ------------------------- RETURN ------------------------- */
  data.isFinancialDataLoaded = true;
  return data;
}

/* -------------------- BOOKS READERS ------------------------- */

/* ---------- JOURNAL A NOUVEAUX ---------- */

async function readANouveauxEntry(data, journal, ligneCourante) {
  /* --- IMMOBILISATIONS --- */

  /*  LISTE DES COMPTES D'IMMOBILISATIONS - NIV 1
  ----------------------------------------------------------------------------------------------------
    Comptes 20 - Immobilisations incorporelles
    Comptes 21 - Immobilisations corporelles
    Comptes 22 - Immobilisations mises en concession
    Comptes 23 - Immobilisations en cours
    Comptes 25 - Part dans des entreprises liées
    Comptes 26 - Participations
    Comptes 27 - Autres immobilisations financières
    Comptes 28 - Amortissements des immobilisations (non enregistrés) -> valeur comptable
    Comptes 29 - Dépréciations des immobilisations (non enregistrés)
  ----------------------------------------------------------------------------------------------------
    */

  // Comptes d'immobilisations (hors amortissements et dépréciations) --------------------------------- //

  if (/^2[0-7]/.test(ligneCourante.CompteNum)) {
    // Retrieve immobilisation item
    let immobilisation = data.immobilisations[ligneCourante.CompteNum];
    if (immobilisation == undefined)
      throw (
        "Erreur de lecture pour le compte d'immobilisation " +
        ligneCourante.CompteNum +
        "."
      );

    // update data
    immobilisation.initialState.amount = parseAmount(ligneCourante.Debit);
  }

  // Comptes d'amortissements ------------------------------------------------------------------------- //

  if (/^28/.test(ligneCourante.CompteNum)) {
    // Retrieve immobilisation item
    let accountData = data.accounts[ligneCourante.CompteNum];
    if (accountData == undefined)
      throw (
        "Erreur de correspondance pour le compte d'amortissement " +
        ligneCourante.CompteNum +
        "."
      );
    let immobilisation = data.immobilisations[accountData.assetAccountNum];
    if (immobilisation == undefined)
      throw (
        "Erreur de lecture pour le compte d'immobilisation " +
        accountData.assetAccountNum +
        "."
      );

    // update date
    immobilisation.initialState.amortisationAmount = parseAmount(
      ligneCourante.Credit
    );
  }

  // Comptes de dépréciations ------------------------------------------------------------------------- //

  if (/^29/.test(ligneCourante.CompteNum)) {
    // Retrieve immobilisation item
    let accountData = data.accounts[ligneCourante.CompteNum];
    if (accountData == undefined)
      throw (
        "Erreur de correspondance pour le compte de dépréciation " +
        ligneCourante.CompteNum +
        "."
      );
    let immobilisation = data.immobilisations[accountData.assetAccountNum];
    if (immobilisation == undefined)
      throw (
        "Erreur de lecture pour le compte d'immobilisation " +
        accountData.assetAccountNum +
        "."
      );

    // update date
    immobilisation.initialState.depreciationAmount = parseAmount(
      ligneCourante.Credit
    );
  }

  /* --- STOCKS --- */

  /*  LISTE DES COMPTES DE STOCKS - NIV 1
  ----------------------------------------------------------------------------------------------------
    Comptes 31 - Matières premières
    Comptes 32 - Autres approvisionnements
    Comptes 33 - En-cours de production de biens [Production]
    Comptes 34 - En-cours de production de services [Production]
    Comptes 35 - Stocks de produits [Production]
    Comptes 36 - Stocks provenant d'immobilisation (non traités)
    Comptes 37 - Stocks de marchandises
    Comptes 38 - Stocks en voie d'acheminement (non traités)
    Comptes 39 - Dépréciations des stocks et en-cours
  ----------------------------------------------------------------------------------------------------
    */

  // Comptes de stocks (hors dépréciations et comptes 36 & 38) ---------------------------------------- //

  if (/^3([1-5]|7)/.test(ligneCourante.CompteNum)) {
    // Retrieve stock item
    let stock = data.stocks[ligneCourante.CompteNum];
    if (stock == undefined)
      throw (
        "Erreur de lecture pour le compte de stock " +
        ligneCourante.CompteNum +
        "."
      );

    // update data
    stock.initialState.amount = parseAmount(ligneCourante.Debit);
  }

  // Comptes de dépréciations ------------------------------------------------------------------------- //

  if (/^39/.test(ligneCourante.CompteNum)) {
    // Retrieve stock item
    let accountData = data.accounts[ligneCourante.CompteNum];
    if (accountData == undefined)
      throw (
        "Erreur de correspondance pour le compte de dépréciation " +
        ligneCourante.CompteNum +
        "."
      );
    let stock = data.stocks[accountData.assetAccountNum];
    if (stock == undefined)
      throw (
        "Erreur de lecture pour le compte de stock " +
        accountData.assetAccountNum +
        "."
      );

    // update date
    stock.initialState.depreciationAmount = parseAmount(ligneCourante.Credit);
  }
}

/* --------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- ENTRIES READERS -------------------------------------------------- */
/* --------------------------------------------------------------------------------------------------------------------- */

/* ---------- COMPTES D'IMMOBILISATIONS ---------- */

const readImmobilisationEntry = async (data, journal, ligneCourante) => {
  /*  LISTE DES COMPTES D'IMMOBILISATIONS - NIV 1
  ----------------------------------------------------------------------------------------------------
    Comptes 20 - Immobilisations incorporelles
    Comptes 21 - Immobilisations corporelles
    Comptes 22 - Immobilisations mises en concession
    Comptes 23 - Immobilisations en cours
    Comptes 25 - Part dans des entreprises liées
    Comptes 26 - Participations
    Comptes 27 - Autres immobilisations financières
    Comptes 28 - Amortissements des immobilisations
    Comptes 29 - Dépréciations des immobilisations (non traités)
  ----------------------------------------------------------------------------------------------------
  */

  // Immobilisation ----------------------------------------------------------------------------------- //

  if (/^2[0-7]/.test(ligneCourante.CompteNum)) 
  {
    // Immobilisation --------------------------------------------------- //

    // Retrieve immobilisation item
    let immobilisation = data.immobilisations[ligneCourante.CompteNum];
    if (immobilisation == undefined) throw ("Erreur de lecture pour le compte d'immobilisation "+ligneCourante.CompteNum+".");

    // update data
    immobilisation.lastAmount = immobilisation.lastAmount 
      + parseAmount(ligneCourante.Debit)
      - parseAmount(ligneCourante.Credit);
    immobilisation.entries.push({
      entryNum: ligneCourante.EcritureNum,
      amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });

    // Acquisition ------------------------------------------------------ //

    // lecture du compte auxiliaire (cas acquisition)
    let ligneFournisseur = journal.filter((ligne) =>
         ligne.EcritureNum == ligneCourante.EcritureNum
      && /^40/.test(ligne.CompteNum))[0];

    if (ligneFournisseur != undefined) 
    {
      // investment data
      let investmentData = {
        entryNum: ligneCourante.EcritureNum,
        label: ligneCourante.EcritureLib.replace(/^\"/, "").replace(/\"$/, ""),
        accountNum: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        providerNum: ligneFournisseur.CompAuxNum || "_" + ligneCourante.CompteNum,
        providerLib: ligneFournisseur.CompAuxLib || "ACQUISTIONS " + ligneCourante.CompteLib,
        isDefaultProvider: ligneFournisseur.CompAuxNum ? false : true,
        amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
        date: ligneCourante.EcritureDate,
      };
      // push data
      data.investments.push(investmentData);
      if (!ligneFournisseur.CompAuxNum) data.defaultProviders.push(investmentData.providerNum);
    }

    // Immobilisation en cours (avances / acomptes) --------------------- //

    // lecture du compte auxiliaire
    let ligneImmobilisationEnCours = journal.filter((ligne) =>
         ligne.EcritureNum == ligneCourante.EcritureNum
      && /^23(7|8)/.test(ligne.CompteNum)
      && ligne.CompteNum != ligneCourante.CompteNum)[0];
    
    if (ligneImmobilisationEnCours != undefined) 
    {
      // investment data
      let immobilisationEnCoursData = {
        entryNum: ligneCourante.EcritureNum,
        label: ligneCourante.EcritureLib.replace(/^\"/, "").replace(/\"$/, ""),
        accountNum: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        accountAux: ligneImmobilisationEnCours.CompteNum, // param name
        accountAuxLib: ligneImmobilisationEnCours.CompteLib, // param name
        amount: parseAmount(ligneImmobilisationEnCours.Credit) - parseAmount(ligneImmobilisationEnCours.Debit),
        date: ligneCourante.EcritureDate,
      };

      // push data
      // data.investments.push(immobilisationEnCoursData);
    }

    // Production immobilisée ------------------------------------------- //

    // lecture du compte auxiliaire (cas production immobilisée)
    let ligneProduction = journal.filter((ligne) =>
         ligne.EcritureNum == ligneCourante.EcritureNum
      && /^72/.test(ligne.CompteNum))[0];
    
    if (ligneProduction != undefined) 
    {
      // investment data
      let immobilisedProductionData = {
        entryNum: ligneCourante.EcritureNum,
        label: ligneCourante.EcritureLib.replace(/^\"/, "").replace(/\"$/, ""),
        accountNum: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        productionAccountNum: ligneProduction.CompteNum,
        productionAccountLib: ligneProduction.CompteLib,
        amount: parseAmount(ligneProduction.Credit) - parseAmount(ligneCourante.Debit),
        date: ligneCourante.EcritureDate,
      };

      // push data
      data.immobilisedProductions.push(immobilisedProductionData);
    }

    // Immobilisation en cours (production immobilisée) ----------------- //

    // lecture du compte auxiliaire
    let ligneProductionEnCours = journal.filter((ligne) => 
         ligne.EcritureNum == ligneCourante.EcritureNum 
      && /^23(1|2)/.test(ligne.CompteNum) 
      && ligne.CompteNum != ligneCourante.CompteNum)[0];
    
    if (ligneProductionEnCours != undefined) 
    {
      // immobilised production data
      let immobilisationProductionData = {
        entryNum: ligneCourante.EcritureNum,
        label: ligneCourante.EcritureLib.replace(/^\"/, "").replace(/\"$/, ""),
        accountNum: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        accountAux: ligneProductionEnCours.CompteNum,
        accountAuxLib: ligneProductionEnCours.CompteLib,
        amount: parseAmount(ligneProductionEnCours.Credit) - parseAmount(ligneProductionEnCours.Debit),
        date: ligneCourante.EcritureDate,
      };

      // push data
      // data.immobilisationProductions.push(immobilisationProductionData);
    }

    // Other case ------------------------------------------------------- //

    if (!ligneFournisseur
     && !ligneImmobilisationEnCours
     && !ligneProduction
     && !ligneProductionEnCours
     && (parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit))>0) // immobilisation increase
    {
      // investment data
      let investmentData = {
        entryNum: ligneCourante.EcritureNum,
        label: ligneCourante.EcritureLib.replace(/^\"/, "").replace(/\"$/, ""),
        accountNum: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        providerNum: "_" + ligneCourante.CompteNum,
        providerLib: "ACQUISTIONS " + ligneCourante.CompteLib,
        isDefaultProvider: true,
        amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
        date: ligneCourante.EcritureDate,
      };

      // push data
      data.investments.push(investmentData);
      data.defaultProviders.push(investmentData.providerNum);
    }

  }

  // Amortissement ------------------------------------------------------------------------------------ //

  if (/^28/.test(ligneCourante.CompteNum)) {
    // Retrieve immobilisation item
    let accountData = data.accounts[ligneCourante.CompteNum];
    if (accountData == undefined)
      throw (
        "Erreur de correspondance pour le compte d'amortissement " +
        ligneCourante.CompteNum +
        "."
      );
    let immobilisation = data.immobilisations[accountData.assetAccountNum];
    if (immobilisation == undefined)
      throw (
        "Erreur de lecture pour le compte d'immobilisation " +
        accountData.assetAccountNum +
        "."
      );

    // update data
    immobilisation.lastAmortisationAmount =
      immobilisation.lastAmortisationAmount +
      parseAmount(ligneCourante.Credit) -
      parseAmount(ligneCourante.Debit);
    immobilisation.amortisationEntries.push({
      entryNum: ligneCourante.EcritureNum,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Dépréciation ------------------------------------------------------------------------------------- //

  if (/^29/.test(ligneCourante.CompteNum)) {
    // Retrieve immobilisation item
    let accountData = data.accounts[ligneCourante.CompteNum];
    if (accountData == undefined)
      throw (
        "Erreur de correspondance pour le compte de dépréciation " +
        ligneCourante.CompteNum +
        "."
      );
    let immobilisation = data.immobilisations[accountData.assetAccountNum];
    if (immobilisation == undefined)
      throw (
        "Erreur de lecture pour le compte d'immobilisation " +
        accountData.assetAccountNum +
        "."
      );

    // update data
    immobilisation.lastDepreciationAmount =
      immobilisation.lastDepreciationAmount +
      parseAmount(ligneCourante.Credit) -
      parseAmount(ligneCourante.Debit);
    immobilisation.depreciationEntries.push({
      entryNum: ligneCourante.EcritureNum,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }
};

/* ---------- COMPTES DE STOCKS ---------- */

const readStockEntry = async (data, journal, ligneCourante) => {
  /*  LISTE DES COMPTES DE STOCKS - NIV 1
  ----------------------------------------------------------------------------------------------------
    Comptes 31 - Matières premières
    Comptes 32 - Autres approvisionnements
    Comptes 33 - En-cours de production de biens [Production]
    Comptes 34 - En-cours de production de services [Production]
    Comptes 35 - Stocks de produits [Production]
    Comptes 36 - Stocks provenant d'immobilisation (non traités)
    Comptes 37 - Stocks de marchandises
    Comptes 38 - Stocks en voie d'acheminement (non traités)
    Comptes 39 - Dépréciations des stocks et en-cours (non traités)
  ----------------------------------------------------------------------------------------------------
  */

  // Stock -------------------------------------------------------------------------------------------- //

  if (/^3([1-5]|7)/.test(ligneCourante.CompteNum)) {
    // Retrieve stock item
    let stock = data.stocks[ligneCourante.CompteNum];
    if (stock == undefined)
      throw (
        "Erreur de lecture pour le compte de stock " +
        ligneCourante.CompteNum +
        "."
      );

    // update data
    stock.lastAmount =
      stock.lastAmount +
      parseAmount(ligneCourante.Debit) -
      parseAmount(ligneCourante.Credit);
    stock.entries.push({
      entryNum: ligneCourante.EcritureNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Dépréciation ------------------------------------------------------------------------------------- //

  if (/^39/.test(ligneCourante.CompteNum)) {
    // Retrieve stock item
    let accountData = data.accounts[ligneCourante.CompteNum];
    if (accountData == undefined)
      throw (
        "Erreur de correspondance pour le compte de dépréciation " +
        ligneCourante.CompteNum +
        "."
      );
    let stock = data.stocks[accountData.assetAccountNum];
    if (stock == undefined)
      throw (
        "Erreur de lecture pour le compte de stock " +
        accountData.assetAccountNum +
        "."
      );

    // update data
    stock.lastDepreciationAmount =
      stock.lastDepreciationAmount +
      parseAmount(ligneCourante.Credit) -
      parseAmount(ligneCourante.Debit);
    stock.depreciationEntries.push({
      entryNum: ligneCourante.EcritureNum,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }
};

/* ---------- COMPTES DE CHARGES ---------- */

const readExpenseEntry = async (data, journal, ligneCourante) => {
  /*  LISTE DES COMPTES DE CHARGES - NIV 1
  ----------------------------------------------------------------------------------------------------
    Comptes 60 - Achats (sauf 603, variation des stocks)
    Comptes 61 - Services extérieurs
    Comptes 62 - Autres services extérieurs
    Comptes 63 - Impôts, taxes et versements assimilés
    Comptes 64 - Charges de personnel
    Comptes 65 - Autres charges de gestion courante
    Comptes 66 - Charges financières
    Comptes 67 - Charges exceptionnelles
    Comptes 68 - Dotations aux amortissements, dépréciations et provisions
    Comptes 69 - Participation des salariés, impôts sur les bénéfices et assimilés
  ----------------------------------------------------------------------------------------------------
  */

  // Expense accounts
  //if (!data.expenseAccounts.map(account => account.accountNum).includes(ligneCourante.CompteNum)) data.expenseAccounts.push({accountNum:ligneCourante.CompteNum,accountLib:ligneCourante.CompteLib});

  // Charges externes (60, 61, 62 hors 603) ----------------------------------------------------------- //

  if (
    /^6(0[^3]|[1-2])/.test(ligneCourante.CompteNum) &&
    !data.ignoreExternalExpensesEntries.includes(ligneCourante.EcritureNum)) 
  {
    // lecture du compte auxiliaire
    let lignesFournisseur = journal.filter((ligne) => ligne.EcritureNum == ligneCourante.EcritureNum && /^40/.test(ligne.CompteNum));
    let paiementBancaire = journal.some((ligne) => ligne.EcritureNum == ligneCourante.EcritureNum && /^512/.test(ligne.CompteNum));

    // paiement bancaire (pas de ligne fournisseur)
    if (paiementBancaire) 
    {
      // expense data
      let expenseData = {
        label: ligneCourante.EcritureLib.replace(/^\"/, "").replace(/\"$/, ""),
        accountNum: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        providerNum: "_" + ligneCourante.CompteNum,
        providerLib: "DEPENSES " + ligneCourante.CompteLib,
        isDefaultProviderAccount: true,
        amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
        date: ligneCourante.EcritureDate,
      };

      // push data
      data.externalExpenses.push(expenseData);
      data.defaultProviders.push(expenseData.providerNum);
    }

    // plusieurs fournisseurs
    else if (lignesFournisseur.length > 1) 
    {
      let ecriture = journal.filter((ligne) => ligne.EcritureNum == ligneCourante.EcritureNum);

      data.ignoreExternalExpensesEntries.push(ligneCourante.EcritureNum);
      let entryData = await readExternalExpensesFromEntry(ecriture);
      if (entryData.isExpensesTracked) {
        data.externalExpenses.push(...entryData.expensesData);
        data.defaultProviders.push(...entryData.defaultProviders);
      } 
      else {
        // error message
        throw ("Problème de lecture pour l'écriture "+ligneCourante.EcritureNum +" : Plusieurs comptes fournisseurs détectés ");
      }
    } 
    
    // fournisseur unique (ou non trouvé)
    else 
    {
      let ligneFournisseur = lignesFournisseur[0] || {};
      // expense data
      let expenseData = {
        label: ligneCourante.EcritureLib.replace(/^\"/, "").replace(/\"$/, ""),
        accountNum: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        providerNum:
          ligneFournisseur.CompAuxNum || "_" + ligneCourante.CompteNum,
        providerLib:
          ligneFournisseur.CompAuxLib || "DEPENSES " + ligneCourante.CompteLib,
        isDefaultProviderAccount: ligneFournisseur.CompAuxNum ? false : true,
        amount:
          parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
        date: ligneCourante.EcritureDate,
      };
      // push data
      data.externalExpenses.push(expenseData);
      if (!ligneFournisseur.CompAuxNum) {
        data.defaultProviders.push(expenseData.providerNum);
      }
    }
  }

  // Stocks variation (603) --------------------------------------------------------------------------- //

  if (
    /^603/.test(ligneCourante.CompteNum) &&
    !data.ignoreStockVariationsEntries.includes(ligneCourante.EcritureNum)
  ) {
    // entry
    let entry = journal.filter(
      (ligne) => ligne.EcritureNum == ligneCourante.EcritureNum
    );

    // ignore entry for futher references
    data.ignoreStockVariationsEntries.push(ligneCourante.EcritureNum);

    let entryStockVariationsData = readStockVariationsFromEntry(entry);

    if (entryStockVariationsData.isStockVariationsTracked) {
      data.stockVariations.push(...entryStockVariationsData.entryData);
    } else throw entryStockVariationsData.message;
  }

  // Dotations aux amortissements sur immobilisations (6811 & 6871) ----------------------------------- //

  if (
    /^68(1|7)1/.test(ligneCourante.CompteNum) &&
    !data.ignoreAmortisationEntries.includes(ligneCourante.EcritureNum)
  ) {
    // get entry
    let entry = journal.filter(
      (ligne) => ligne.EcritureNum == ligneCourante.EcritureNum
    );

    // ignore entry for futher references
    data.ignoreAmortisationEntries.push(ligneCourante.EcritureNum);

    let entryAmortisationExpensesData =
      readAmortisationExpensesFromEntry(entry);

    if (entryAmortisationExpensesData.isExpensesTracked) {
      data.amortisationExpenses.push(
        ...entryAmortisationExpensesData.entryData
      );
    } else throw entryAmortisationExpensesData.message;
  }

  // Other expenses ----------------------------------------------------------------------------------- //

  if (/^63/.test(ligneCourante.CompteNum)) {
    data.taxes.push({
      accountNum: ligneCourante.CompteNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }
  if (/^64/.test(ligneCourante.CompteNum)) {
    data.personnelExpenses.push({
      accountNum: ligneCourante.CompteNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }
  if (/^65/.test(ligneCourante.CompteNum)) {
    data.otherExpenses.push({
      accountNum: ligneCourante.CompteNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }
  if (/^681[^1]/.test(ligneCourante.CompteNum)) {
    data.provisions.push({
      accountNum: ligneCourante.CompteNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Financial expenses ------------------------------------------------------------------------------- //

  if (/^6(6|86)/.test(ligneCourante.CompteNum)) {
    data.financialExpenses.push({
      accountNum: ligneCourante.CompteNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Exceptional expenses ----------------------------------------------------------------------------- //

  if (/^6(7|87[^1])/.test(ligneCourante.CompteNum)) {
    data.exceptionalExpenses.push({
      accountNum: ligneCourante.CompteNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Tax on profits ----------------------------------------------------------------------------------- //

  if (/^69/.test(ligneCourante.CompteNum)) {
    data.taxOnProfits.push({
      accountNum: ligneCourante.CompteNum,
      amount:
        parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      date: ligneCourante.EcritureDate,
    });
  }
};

/* ---------- COMPTES DE PRODUITS ---------- */

const readProductionEntry = async (data, journal, ligneCourante) => {
  /*  LISTE DES COMPTES DE PRODUITS - NIV 1
  ----------------------------------------------------------------------------------------------------
    Comptes 70 - Ventes de produits -> revenue
    Comptes 71 - Production stockée / déstockée
    Comptes 72 - Production immobilisée
    Comptes 74 - Subventions d'exploitation
    Comptes 75 - Autres produits de gestion courante
    Comptes 76 - Produits financiers
    Comptes 77 - Produits exceptionnels
    Comptes 78 - Reprises sur amortissements, dépréciations et provisions
    Comptes 79 - Transferts de charges
  ----------------------------------------------------------------------------------------------------
  */

  // Revenue ------------------------------------------------------------------------------------------ //

  if (/^70/.test(ligneCourante.CompteNum)) {
    data.revenue.push({
      accountNum: ligneCourante.CompteNum,
      accountLib: ligneCourante.CompteLib,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Stored/Unstored Production ----------------------------------------------------------------------- //

  if (/^71/.test(ligneCourante.CompteNum)) {
    data.storedProduction.push({
      accountNum: ligneCourante.CompteNum,
      accountLib: ligneCourante.CompteLib,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Immobilised Production --------------------------------------------------------------------------- //

  if (/^72/.test(ligneCourante.CompteNum)) {
    data.immobilisedProduction.push({
      accountNum: ligneCourante.CompteNum,
      accountLib: ligneCourante.CompteLib,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Other operating incomes -------------------------------------------------------------------------- //

  if (/^7(4|5|81|91)/.test(ligneCourante.CompteNum)) {
    data.otherOperatingIncomes.push({
      accountNum: ligneCourante.CompteNum,
      accountLib: ligneCourante.CompteLib,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Financial incomes -------------------------------------------------------------------------------- //

  if (/^7(6|86|96)/.test(ligneCourante.CompteNum)) {
    data.financialIncomes.push({
      accountNum: ligneCourante.CompteNum,
      accountLib: ligneCourante.CompteLib,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }

  // Exceptional incomes ------------------------------------------------------------------------------ //

  if (/^7(7|87|97)/.test(ligneCourante.CompteNum)) {
    data.exceptionalIncomes.push({
      accountNum: ligneCourante.CompteNum,
      accountLib: ligneCourante.CompteLib,
      amount:
        parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit),
      date: ligneCourante.EcritureDate,
    });
  }
};

/* ---------- DONNEES SUPPLEMENTAIRES ---------- */

const readAddtionalDataEntry = async (data, journal, ligneCourante) => {
  /*  LISTE DES COMPTES
  ----------------------------------------------------------------------------------------------------
    Comptes 6312 - Ventes de produits -> revenue
    Comptes 6313 - Production stockée / déstockée
    Comptes 6333 - Production immobilisée
  ----------------------------------------------------------------------------------------------------
  */

  // Data for KNW ------------------------------------------------------------------------------------- //

  // ...taxe d'apprentissage
  if (/^6312/.test(ligneCourante.CompteNum))
    data.KNWData.apprenticeshipTax =
      data.KNWData.apprenticeshipTax +
      parseAmount(ligneCourante.Debit) -
      parseAmount(ligneCourante.Credit);

  // ...participation formation professionnelle
  if (/^63(1|3)3/.test(ligneCourante.CompteNum))
    data.KNWData.vocationalTrainingTax =
      data.KNWData.vocationalTrainingTax +
      parseAmount(ligneCourante.Debit) -
      parseAmount(ligneCourante.Credit);
};

/* ------------------------------------------------------------------------------------------------------------------------------ */
/* -------------------------------------------------- STOCK VARIATIONS SCRIPTS -------------------------------------------------- */

/* The function return an object with the following elements :
 *  - entryData (Array) : data from the entry to add the "main" data object
 *  - status (Boolean) : status of the reading
 *  - message (String) : -
 */

const readStockVariationsFromEntry = (entry) => {
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

/* ----------------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- DEPRECIATION EXPENSES SCRIPTS -------------------------------------------------- */

/* The function return an object with the following elements :
 *  - entryData (Array) : data from the entry to add the "main" data object
 *  - status (Boolean) : status of the reading
 *  - message (String) : -
 */

const readAmortisationExpensesFromEntry = (entry) => {
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