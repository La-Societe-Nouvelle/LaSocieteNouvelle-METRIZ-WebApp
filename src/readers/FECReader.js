// La Société Nouvelle - METRIZ

// Libraries
import booksProps from '../../lib/books'
import { roundValue } from '../utils/Utils';

// FEC colums
const columnsFEC = ["JournalCode",
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
                    "Idevise"]

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

const parseAmount = (stringAmount) => roundValue(parseFloat(stringAmount.replace(',','.')),2)

/* -------------------- BALANCE CHECKER -------------------- */

const checkBalanceTwoLists = (lignesA,lignesB) =>
{
  let amountA = lignesA.map(ligne => parseAmount(ligne.Debit) - parseAmount(ligne.Credit)).reduce((a,b) => a+b,0);
  let amountB = lignesB.map(ligne => parseAmount(ligne.Credit) - parseAmount(ligne.Debit)).reduce((a,b) => a+b,0);
  return Math.round(amountA*100) == Math.round(amountB*100);
}

const checkBalance = (rows) =>
{
  let amount = rows.map(row => parseAmount(row.Debit) - parseAmount(row.Credit)).reduce((a,b) => a+b,0);
  return Math.round(amount*100) == 0;
}

/* ----------------------------------------------------- */
/* -------------------- FILE READER -------------------- */ 
/* ----------------------------------------------------- */

export async function FECFileReader(content) 
// ...build JSON from FEC File (FEC -> JSON)
{
  // Output data ---------------------------------------------------------------------------------------- //

  let dataFEC = {
    books: [],
    meta: {books: {},accounts: [], accountsAux: {}, firstDate: null, lastDate: null}
  };

  // Separator ------------------------------------------------------------------------------------------ //

  let separator = getSeparator(content.slice(0,content.indexOf('\n'))); // throw exception

  // Header --------------------------------------------------------------------------------------------- //
  
  // header
  const header = content.slice(0,content.indexOf('\n')).replace('\r','').split(separator);

  // Vérification des colonnes
  header.forEach(column => {if (!columnsFEC.includes(column)) throw 'Fichier erroné (colonne(s) manquante(s) ou libellé(s) incorrect(s))'});
  
  // Construction de l'index des colonnes
  let indexColumns = {};
  header.forEach(column => indexColumns[column] = header.indexOf(column));

  // Rows ----------------------------------------------------------------------------------------------- //
  
  // Segmentations des lignes
  const rows = content.slice(content.indexOf('\n')+1).split('\n');

  // Lecture des lignes
  await rows.forEach(async (rowString,index) => 
  {
    // Segmentations des colonnes (String -> JSON)
    let rowArray = rowString.replace('\r','').split(separator);

    if (rowArray.length == 18)
    {
      // Construction du JSON
      // -------------------------------------------------- //

      // Construction du JSON pour la ligne
      let rowData = await readFECFileRow(indexColumns,rowArray);

      // Construction du journal (si absent) et mise à jour des métadonnées relatives aux journaux
      if (!(rowData.JournalCode in dataFEC.meta.books)) 
      {
        dataFEC.books[rowData.JournalCode] = [];
        dataFEC.meta.books[rowData.JournalCode] = {label: rowData.JournalLib, type: getDefaultBookType(rowData.JournalCode,rowData.JournalLib)}
      }

      // Mise à jour des métadonnées relatives aux libellés de comptes
      if (dataFEC.meta.accounts.map(account => account.accountNum).includes(rowData.CompteNum)) dataFEC.meta.accounts.push({accountNum:rowData.CompteNum, accountLib:rowData.CompteLib});
      if (rowData.CompAuxNum != undefined && dataFEC.meta.accountsAux[rowData.CompAuxNum] == undefined) dataFEC.meta.accountsAux[rowData.CompAuxNum] = rowData.CompAuxLib;

      // Date
      if (dataFEC.meta.firstDate==null || parseInt(rowData.EcritureDate) < parseInt(dataFEC.meta.firstDate)) dataFEC.meta.firstDate = rowData.EcritureDate;
      if (dataFEC.meta.lastDate==null || parseInt(rowData.EcritureDate) > parseInt(dataFEC.meta.lastDate)) dataFEC.meta.lastDate = rowData.EcritureDate;

      // Ajout des données
      dataFEC.books[rowData.JournalCode].push(rowData);

      // -------------------------------------------------- //
    }
    else if (rowString!="") throw 'Erreur - Ligne incomplète ('+(index+2)+')';
  })

  // Return --------------------------------------------------------------------------------------------- //
  return dataFEC;
}

// Get separator
function getSeparator(line)
{
  if      (line.split('\t').length == 18) return '\t';
  else if (line.split('|').length == 18)  return '|';
  else throw 'Fichier erroné (séparateur incorrect ou colonne(s) manquante(s)).';
}

// Read line (Array -> JSON)
async function readFECFileRow(indexColumns,rowArray) 
{
  let rowData = {}
  Object.entries(indexColumns).forEach(([column,index]) => 
  {
    rowData[column] = rowArray[index].replace(/^\"/,"")      // remove quote at the beginning
                                     .replace(/\"$/,"")      // remove quote at the end
                                     .replace(/ *$/,"");     // remove spaces at the end
  });
  return rowData;
}

// Book recognition (obsolete)
function getDefaultBookType(bookCode,bookLib) 
{
  // ~ A Nouveaux
  if (booksProps.ANOUVEAUX.codes.includes(bookCode) || booksProps.ANOUVEAUX.labels.includes(bookLib.toUpperCase())) return "ANOUVEAUX";
  // ~ Ventes
  else if (booksProps.VENTES.codes.includes(bookCode) || booksProps.VENTES.labels.includes(bookLib.toUpperCase())) return "VENTES"
  // ~ Achats
  else if (booksProps.ACHATS.codes.includes(bookCode) || booksProps.ACHATS.labels.includes(bookLib.toUpperCase())) return "ACHATS"
  // ~ Operations Diverses
  else if (booksProps.OPERATIONS.codes.includes(bookCode) || booksProps.OPERATIONS.labels.includes(bookLib.toUpperCase())) return "OPERATIONS"
  // ~ Others
  else return "AUTRE";
}

/* ----------------------------------------------------- */
/* -------------------- DATA READER -------------------- */
/* ----------------------------------------------------- */ 

export async function FECDataReader(FECData)
// ...extract data to use in session (JSON -> Session)
{ 
  // Output data ---------------------------------------------------------------------------------------- //
  
  let data = {};

  // Meta ----------------------------------------------------------------------------------------------- //
  data.accounts = FECData.meta.accounts;
  data.accountsAux = FECData.meta.accountsAux;
  data.ignoreDepreciationEntries = [];
  data.errors =[];

  // Production / Incomes ------------------------------------------------------------------------------- //
  data.revenue = 0;                       // 70
  data.storedProduction = 0;              // 71
  data.immobilisedProduction = 0;         // 72
  data.otherOperatingIncomes = 0;         // 74, 75, 781, 791

  // Stocks --------------------------------------------------------------------------------------------- //
  data.stocks = [];                       // stock 31, 32, 33, 34, 35, 37
  data.stockVariations = [];              // stock flows 603 <-> 31-32-37 & 71 <-> 33-34-35

  // Expenses ------------------------------------------------------------------------------------------- //
  data.expenses = [];                     // 60, 61, 62 (hors 603)
  data.depreciationExpenses = [];         // 6811 and 6871
  
  // Immobilisations ------------------------------------------------------------------------------------ //
  data.immobilisations = [];              // #20 to #27
  data.investments = [];                  // flow #2 <- #404
  data.immobilisationProductions = [];    // flow #2 <- #72

  // Amortissements et Dépréciations -------------------------------------------------------------------- //
  data.depreciations = [];                // #28, #29 and #39

  // others key figures --------------------------------------------------------------------------------- //
  data.financialIncomes = 0;              // #76, #786, #796
  data.exceptionalIncomes = 0;            // #77, #787, #797
  data.taxes = 0;                         // #63
  data.personnelExpenses = 0;             // #64
  data.otherExpenses = 0;                 // #65
  data.financialExpenses = 0;             // #66 & #686
  data.exceptionalExpenses = 0;           // #67 & #687 (hors #6871)
  data.provisions = 0;                    // #68 (hors #6811)
  data.taxOnProfits = 0;                  // #69

  // Other used data ------------------------------------------------------------------------------------//
  data.KNWData = {apprenticeshipTax: 0, vocationalTrainingTax: 0}

  // ----------------------------------------------------------------------------------------------------//

  /* ---------- A NOUVEAUX ---------- */

  // Get book code for "A Nouveaux"
  let codeANouveaux = Object.entries(FECData.meta.books)
                            .filter(([_,{type}]) => type == "ANOUVEAUX")
                            .map(([bookCode,_]) => bookCode)[0];
  if (codeANouveaux != undefined) 
  {
    // Lecture du journal des A-NOUVEAUX
    // -------------------------------------------------- //

    try
    {
      await readBookAsJournalANouveaux(data, FECData.books[codeANouveaux]);
    }
    catch (error) {data.errors.push(error)};

    // -------------------------------------------------- //
  }

  /* ---------- OTHER BOOKS ---------- */

  // Read books (except "A Nouveaux")
  Object.entries(FECData.meta.books)
        .filter(([_,{type}]) => type != "ANOUVEAUX")
        .forEach(async ([bookCode,_]) => 
  {  
    // Get book
    let journal = FECData.books[bookCode];
    
    // Read book
    await journal.map(async (ligne) => 
    {
      try 
      {
        // Lecture des lignes
        // -------------------------------------------------- //
        
        // Construction des données comptables
        if (/^2/.test(ligne.CompteNum)) await readImmobilisationEntry(data,journal,ligne);
        if (/^3/.test(ligne.CompteNum)) await readStockEntry(data,journal,ligne);
        if (/^6/.test(ligne.CompteNum)) await readExpenseEntry(data,journal,ligne);
        if (/^7/.test(ligne.CompteNum)) await readProductionEntry(data,journal,ligne);
      
        // Lecture d'informations supplémentaires
        if (/^63/.test(ligne.CompteNum)) readAddtionalDataEntry(data,journal,ligne);

        // -------------------------------------------------- //
      }
      catch (error) {data.errors.push(error)};
      return;
    })
  });

  /* ---------- RETURN ---------- */
  data.isFinancialDataLoaded = true;
  return data;
}

/* -------------------- BOOKS READERS ------------------------- */

/* ---------- JOURNAL A NOUVEAUX ---------- */

async function readBookAsJournalANouveaux(data,book) 
{  
  await book.sort((a,b) => a.CompteNum.localeCompare(b.CompteNum))
            .forEach((ligneCourante) => 
  {
    
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

    if (/^2[0-7]/.test(ligneCourante.CompteNum))
    {
      // immobilisation data
      let immobilisationData = 
      {
        account: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        isDepreciableImmobilisation: /^2(0|1)/.test(ligneCourante.CompteNum),
        prevAmount: parseAmount(ligneCourante.Debit),
        amount: parseAmount(ligneCourante.Debit)
      }
      // push data
      data.immobilisations.push(immobilisationData);
    }

    // Comptes d'amortissements et de dépréciations ----------------------------------------------------- //

    if (/^2[8-9]/.test(ligneCourante.CompteNum))
    {
      // retrieve immobilisation account
      let immobilisationAccountsAux = book.filter(ligne => ligne.CompteNum.startsWith("2"+ligneCourante.CompteNum.substring(2)));
      if (immobilisationAccountsAux.length == 1)
      {
        // depreciation data
        let depreciationData = 
        {
          account: ligneCourante.CompteNum,
          accountLib: ligneCourante.CompteLib,
          accountAux: immobilisationAccountsAux[0].CompteNum,
          prevAmount: parseAmount(ligneCourante.Credit),
          amount: parseAmount(ligneCourante.Credit)
        }
        // push data
        data.depreciations.push(depreciationData);
      }
      else throw "Le compte "+ligneCourante.CompteNum+" dans le journal \""+ligneCourante.JournalLib+"\" ne peut être relié à un compte d'immobilisations.";
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

    if (/^3([1-5]|7)/.test(ligneCourante.CompteNum))
    {
      // stock data
      let stockData = 
      {
        account: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        accountAux: /^3[3-5]/.test(ligneCourante.CompteNum) ? null : "60"+ligneCourante.CompteNum.slice(1,-1).replaceAll("0$",""),
        isProductionStock: /^3[3-5]/.test(ligneCourante.CompteNum),
        amount: parseAmount(ligneCourante.Debit),
        prevAmount: parseAmount(ligneCourante.Debit)
      }
      // push data
      data.stocks.push(stockData);
    }

    // Comptes de dépréciations ------------------------------------------------------------------------- //

    if (/^39/.test(ligneCourante.CompteNum))
    {
      // retrieve stock account
      let stockAccountsAux = book.filter(ligne => ligne.CompteNum.startsWith("3"+ligneCourante.CompteNum.substring(2)));
      if (stockAccountsAux.length == 1)
      {
        // depreciation data
        let depreciationData = 
        {
          account: ligneCourante.CompteNum,
          accountLib: ligneCourante.CompteLib,
          accountAux: stockAccountsAux[0].CompteNum,
          prevAmount: parseAmount(ligneCourante.Credit),
          amount: parseAmount(ligneCourante.Credit)
        }
        // push data
        data.depreciations.push(depreciationData);
      }
      else throw "Le compte "+ligneCourante.CompteNum+" dans le journal \""+ligneCourante.JournalLib+"\" ne peut être relié à un compte de stocks.";
    }

  })
}

/* -------------------- ENTRIES READERS ------------------------- */

/* ---------- COMPTES D'IMMOBILISATIONS ---------- */

const readImmobilisationEntry = async (data,journal,ligneCourante) =>
{
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
    let immobilisation = data.immobilisations.filter(immobilisation => immobilisation.account == ligneCourante.CompteNum)[0];

    // si compte existant -> variation de la valeur de l'immobilisation
    if (immobilisation!=undefined) immobilisation.amount+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
    
    // si compte inexistant -> ajout compte
    else 
    {
      // immobilisation data
      let immobilisationData = 
      {
        account: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        isDepreciableImmobilisation: /^2(0|1)/.test(ligneCourante.CompteNum),
        prevAmount: 0.0,
        amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit)
      }
      // push data
      data.immobilisations.push(immobilisationData);
    }

    // Acquisition ------------------------------------------------------ //
    
    // lecture du compte auxiliaire (cas acquisition)
    let ligneFournisseur = journal.filter(ligne => ligne.EcritureNum == ligneCourante.EcritureNum 
                                                && /^40/.test(ligne.CompteNum))[0];
    if (ligneFournisseur!=undefined)
    {      
      // investment data
      let investmentData = 
      {
        label: ligneCourante.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        accountAux: ligneFournisseur.CompAuxNum || "_"+ligneCourante.CompteNum,
        accountAuxLib : ligneFournisseur.CompAuxLib || "ACQUISTIONS "+ligneCourante.CompteLib,
        isDefaultAccountAux: ligneFournisseur.CompAuxNum ? false : true,
        amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      }
      // push data
      data.investments.push(investmentData);
    }

    // Immobilised Production ------------------------------------------- //
    
    // lecture du compte auxiliaire (cas production immobilisée)
    let ligneProduction = journal.filter(ligne => ligne.EcritureNum == ligneCourante.EcritureNum 
                                               && /^72/.test(ligne.CompteNum))[0];
    if (ligneProduction!=undefined)
    {      
      // investment data
      let immobilisationProductionData = 
      {
        label: ligneCourante.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        accountAux: ligneProduction.CompteNum,
        accountAuxLib : ligneProduction.CompteLib,
        amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
      }
      // push data
      data.immobilisationProductions.push(immobilisationProductionData);
    }
  }

  // Amortissement & Dépréciation --------------------------------------------------------------------- //

  if (/^2[8-9]/.test(ligneCourante.CompteNum))
  {
    // Retrieve depreciation item
    let depreciation = data.depreciations.filter(depreciation => depreciation.account == ligneCourante.CompteNum)[0];
    
    // si compte existant -> variation de la valeur de l'immobilisation
    if (depreciation!=undefined) depreciation.amount+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);

    // si compte inexistant -> ajout compte
    else
    {
      // retrieve immobilisation account
      let immobilisationAccounts = data.immobilisations.filter(immobilisation => immobilisation.account.startsWith("2"+ligneCourante.CompteNum.substring(2)));
      if (immobilisationAccounts.length == 1)
      {
        // depreciation data
        let depreciationData = 
        {
          account: ligneCourante.CompteNum,
          accountLib: ligneCourante.CompteLib,
          accountAux: immobilisationAccounts[0].account,
          prevAmount: 0.0,
          amount: parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit)
        }
        // push data
        data.depreciations.push(depreciationData);
      }
      else throw "Le compte "+ligneCourante.CompteNum+" dans le journal "+ligneCourante.JournalLib+" ne peut être relié à un compte d'immobilisations.";
    }
  }
}

/* ---------- COMPTES DE STOCKS ---------- */

const readStockEntry = async (data,journal,ligneCourante) =>
{
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

  if (/^3([1-5]|7)/.test(ligneCourante.CompteNum))
  {    
    // Retrieve stock item
    let stock = data.stocks.filter(stock => stock.account == ligneCourante.CompteNum)[0];

    // si compte existant -> variation de la valeur du stock
    if (stock!=undefined) stock.amount+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);

    // si compte inexistant -> ajout compte
    else
    {
      // stock data
      let stockData = 
      {
        account: ligneCourante.CompteNum,
        accountLib: ligneCourante.CompteLib,
        accountAux: /^3[3-5]/.test(ligneCourante.CompteNum) ? null : "60"+ligneCourante.CompteNum.slice(1,-1).replaceAll("0$",""),
        isProductionStock: /^3[3-5]/.test(ligneCourante.CompteNum),
        prevAmount: 0,
        amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit)
      }
      // push data
      data.stocks.push(stockData);
    }
  }

  // Dépréciation ------------------------------------------------------------------------------------- //

  if (/^39/.test(ligneCourante.CompteNum))
  {
    // Retrieve depreciation item
    let depreciation = data.depreciations.filter(depreciation => depreciation.account == ligneCourante.CompteNum)[0];
    
    // si compte existant -> variation de la valeur de l'immobilisation
    if (depreciation!=undefined) depreciation.amount+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);

    // si compte inexistant -> ajout compte
    else
    {
      // retrieve stock account
      let stockAccounts = data.stocks.filter(stock => stock.account.startsWith("3"+ligneCourante.CompteNum.substring(2)));

      if (stockAccounts.length == 1)
      {
        // depreciation data
        let depreciationData = 
        {
          account: ligneCourante.CompteNum,
          accountLib: ligneCourante.CompteLib,
          accountAux: stockAccounts[0].account,
          prevAmount: 0.0,
          amount: parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit)
        }
        // push data
        data.depreciations.push(depreciationData);
      }
      else throw "Le compte "+ligneCourante.CompteNum+" dans le journal "+ligneCourante.JournalLib+" ne peut être relié à un compte de stocks.";
    }
  }

}

/* ---------- COMPTES DE CHARGES ---------- */

const readExpenseEntry = async (data,journal,ligneCourante) =>
{
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

  if (/^6(0[^3]|[1-2])/.test(ligneCourante.CompteNum))
  { 
    // lecture du compte auxiliaire
    let ligneFournisseur = journal.filter(ligne => ligne.EcritureNum == ligneCourante.EcritureNum 
                                                && /^40/.test(ligne.CompteNum))[0] || {};
    // expense data
    let expenseData = 
    {
      label: ligneCourante.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
      account: ligneCourante.CompteNum,
      accountLib: ligneCourante.CompteLib,
      accountAux: ligneFournisseur.CompAuxNum || "_"+ligneCourante.CompteNum,
      accountAuxLib: ligneFournisseur.CompAuxLib || "DEPENSES "+ligneCourante.CompteLib,
      isDefaultAccountAux: ligneFournisseur.CompAuxNum ? false : true,
      amount: parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit),
    }
    // push data
    data.expenses.push(expenseData);
  }

  // Stocks variation (603) --------------------------------------------------------------------------- //

  if (/^603/.test(ligneCourante.CompteNum))
  {    
    // lignes des comptes de stocks
    let regexPrefixeCompteStocks = /^6031/.test(ligneCourante.CompteNum) ? /^31/ 
                                 : /^6032/.test(ligneCourante.CompteNum) ? /^32/ 
                                 : /^6037/.test(ligneCourante.CompteNum) ? /^37/ 
                                                                         : /^3/;
    let lignesStocks = journal.filter(ligne => ligne.EcritureNum == ligneCourante.EcritureNum 
                                            && ligne.EcritureLib == ligneCourante.EcritureLib
                                            && regexPrefixeCompteStocks.test(ligne.CompteNum));  
                                            
    let equilibre = checkBalanceTwoLists([ligneCourante],lignesStocks);    
    if (equilibre) 
    {
      lignesStocks.forEach((ligneStock) => 
      {
        // retrieve stock variation item
        let stockVariation = data.stockVariations.filter(stockVariation => stockVariation.account == ligneCourante.CompteNum
                                                                        && stockVariation.accountAux == ligneStock.CompteNum)[0];

        if (stockVariation!=undefined) stockVariation.amount+= parseAmount(ligneStock.Credit) - parseAmount(ligneStock.Debit);

        else
        {
          // stock variation data
          let stockVariationData = 
          {
            label: ligneCourante.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
            account: ligneCourante.CompteNum,
            accountLib: ligneCourante.CompteLib,
            accountAux: ligneStock.CompteNum,
            accountAuxLib: ligneStock.CompteLib,
            isProductionStock: false,
            amount: parseAmount(ligneStock.Credit) - parseAmount(ligneStock.Debit),
          }
          // push data
          data.stockVariations.push(stockVariationData);
        }
      })
    }
    else throw "L'écriture "+ligneCourante.EcritureNum+" du journal "+ligneCourante.JournalLib+" entraîne une exception (lecture variation de stock).";
  }

  // Dotations aux amortissements sur immobilisations (6811 & 6871) ----------------------------------- //
  
  if (/^68(1|7)1/.test(ligneCourante.CompteNum) && !data.ignoreDepreciationEntries.includes(ligneCourante.EcritureNum))
  {
    // get entry
    let entry = journal.filter(ligne => ligne.EcritureNum == ligneCourante.EcritureNum);

    // ignore entry for futher references
    data.ignoreDepreciationEntries.push(ligneCourante.EcritureNum);

    let entryDepreciationExpensesData = readDepreciationExpensesFromEntry(entry);

    if (entryDepreciationExpensesData.isExpensesTracked)
    {
      for (let depreciationExpenseData of entryDepreciationExpensesData.entryData)
      {
        // retrieve depreciation expense item
        let depreciationExpense = data.depreciationExpenses.filter(expense => expense.account == depreciationExpenseData.CompteNum
                                                                           && expense.accountAux == depreciationExpenseData.CompteNum)[0];

        if (depreciationExpense!=undefined) depreciationExpense.amount+= depreciationExpenseData.amount;

        else
        {
          // push data
          data.depreciationExpenses.push(depreciationExpenseData);
        } 
      }
    }
    else throw entryDepreciationExpensesData.message;
  }

  // Other expenses ----------------------------------------------------------------------------------- //

  if (/^63/.test(ligneCourante.CompteNum))      data.taxes+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
  if (/^64/.test(ligneCourante.CompteNum))      data.personnelExpenses+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
  if (/^65/.test(ligneCourante.CompteNum))      data.otherExpenses+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
  if (/^681[^1]/.test(ligneCourante.CompteNum)) data.provisions+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
  
  // Financial expenses ------------------------------------------------------------------------------- //

  if (/^66/.test(ligneCourante.CompteNum))      data.financialExpenses+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
  if (/^686/.test(ligneCourante.CompteNum))     data.financialExpenses+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);

  // Exceptional expenses ----------------------------------------------------------------------------- //
  
  if (/^67/.test(ligneCourante.CompteNum))      data.exceptionalExpenses+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
  if (/^687[^1]/.test(ligneCourante.CompteNum)) data.exceptionalExpenses+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);
  
  // Tax on profits ----------------------------------------------------------------------------------- //

  if (/^69/.test(ligneCourante.CompteNum))      data.taxOnProfits+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);

}

/* ---------- COMPTES DE PRODUITS ---------- */

const readProductionEntry = async (data,journal,ligneCourante) =>
{
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

  if (/^70/.test(ligneCourante.CompteNum))      data.revenue+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);
  
  // Stored/Unstored Production ----------------------------------------------------------------------- //

  if (/^71/.test(ligneCourante.CompteNum))      data.storedProduction+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);
  
  // Immobilised Production --------------------------------------------------------------------------- //

  if (/^72/.test(ligneCourante.CompteNum))      data.immobilisedProduction+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);
  
  // Other operating incomes -------------------------------------------------------------------------- //

  if (/^74/.test(ligneCourante.CompteNum))      data.otherOperatingIncomes+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);
  if (/^75/.test(ligneCourante.CompteNum))      data.otherOperatingIncomes+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);
  if (/^7(8|9)1/.test(ligneCourante.CompteNum)) data.otherOperatingIncomes+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);

  // Financial incomes -------------------------------------------------------------------------------- //

  if (/^76/.test(ligneCourante.CompteNum))      data.financialIncomes+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);
  if (/^7(8|9)6/.test(ligneCourante.CompteNum)) data.financialIncomes+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);

  // Exceptional incomes ------------------------------------------------------------------------------ //

  if (/^77/.test(ligneCourante.CompteNum))      data.exceptionalIncomes+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);
  if (/^7(8|9)7/.test(ligneCourante.CompteNum)) data.exceptionalIncomes+= parseAmount(ligneCourante.Credit) - parseAmount(ligneCourante.Debit);

}

/* ---------- DONNEES SUPPLEMENTAIRES ---------- */

const readAddtionalDataEntry = async (data,journal,ligneCourante) =>
{
  /*  LISTE DES COMPTES
  ----------------------------------------------------------------------------------------------------
    Comptes 6312 - Ventes de produits -> revenue
    Comptes 6313 - Production stockée / déstockée
    Comptes 6333 - Production immobilisée
  ----------------------------------------------------------------------------------------------------
  */

  // Data for KNW ------------------------------------------------------------------------------------- //

  // ...taxe d'apprentissage
  if (/^6312/.test(ligneCourante.CompteNum)) data.KNWData.apprenticeshipTax+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);

  // ...participation formation professionnelle
  if (/^63(1|3)3/.test(ligneCourante.CompteNum)) data.KNWData.vocationalTrainingTax+= parseAmount(ligneCourante.Debit) - parseAmount(ligneCourante.Credit);

}

/* ----------------------------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- DEPRECIATION EXPENSES SCRIPTS -------------------------------------------------- */

/* The function return an object with the following elements :
 *  - entryData (Array) : data from the entry to add the "main" data object
 *  - status (Boolean) : status of the reading
 *  - message (String) : -
 */

const readDepreciationExpensesFromEntry = (entry) =>
{
  let res = {entryData: [], isExpensesTracked: false, message: ""};

  // basic case
  res = readDepreciationExpenses(entry);
  if (res.isExpensesTracked) return res;

  // group by asset types
  res = divideEntryByAssetsTypes(entry);
  if (res.isExpensesTracked) return res;

  // group by labels
  res = divideEntryByEntryLabels(entry);
  if (res.isExpensesTracked) return res;

  // group by balanced groups
  res = divideEntryByBalancedGroups(entry);
  if (res.isExpensesTracked) return res;

  // if reading unsuccessfull
  res.isExpensesTracked = false;
  
  // lignes relatives aux comptes de dotations
  let rowsDepreciationExpenses = entry.filter(ligne => /^68(1|7)1/.test(ligne.CompteNum));
  let nbDepreciationAccounts = rowsDepreciationExpenses.filter((value, index, self) => index === self.findIndex(item => item.CompteNum === value.CompteNum)).length;
  
  // lignes relatives aux comtpes d'amortissements
  let rowsDepreciations = entry.filter(ligne => /^28/.test(ligne.CompteNum));
  let nbDepreciationExpenseAccounts = rowsDepreciations.filter((value, index, self) => index === self.findIndex(item => item.CompteNum === value.CompteNum)).length;

  let balanced = checkBalanceTwoLists(rowsDepreciations,rowsDepreciationExpenses);

  // Message
  res.message = "L'écriture "+entry[0].EcritureNum+" du journal "+entry[0].JournalLib+" entraîne une exception (lecture dotation(s) aux amortissements). "
    + "Informations complémentaires : "
    + nbDepreciationAccounts+" comptes d'amortissements ("+(rowsDepreciations.map(row => row.CompteNum).reduce((a,b) => a+", "+b,"").substring(2))+"), "
    + nbDepreciationExpenseAccounts+" comptes de dotations ("+(rowsDepreciationExpenses.map(row => row.CompteNum).reduce((a,b) => a+", "+b,"").substring(2))+"), "
    + (balanced ? "montant des dotations égal à la variation des amortissements au sein de l'écriture " : "montant des dotations différent de la variation des amortissements au sein de l'écriture.");
  
  return res;
}

const readDepreciationExpenses = (rowsEntry) =>
{
  // response
  let res = {entryData: [], isExpensesTracked: false, message: ""};

  // lignes relatives aux comptes de dotations
  let rowsDepreciationExpenses = rowsEntry.filter(ligne => /^68(1|7)1/.test(ligne.CompteNum));
  // lignes relatives aux comtpes d'amortissements
  let rowsDepreciations = rowsEntry.filter(ligne => /^28/.test(ligne.CompteNum));

  // Single depreciation account ---------------------------------------------------------------------- //

  let sameDepreciationAccountUsed = rowsDepreciations.filter((value, index, self) => index === self.findIndex(item => item.CompteNum === value.CompteNum)).length == 1;
  if (sameDepreciationAccountUsed)
  {
    res.isExpensesTracked = true;
    res.message = "OK";

    // ligne relative au compte d'amortissements
    let rowDepreciation = rowsDepreciations[0];

    // build data
    rowsDepreciationExpenses.forEach((rowDepreciationExpense) =>
    {
      // depreciation expense data
      let depreciationExpenseData = 
      {
        label: rowDepreciationExpense.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
        account: rowDepreciationExpense.CompteNum,
        accountLib: rowDepreciationExpense.CompteLib,
        accountAux: rowDepreciation.CompteNum,
        amount: parseAmount(rowDepreciationExpense.Debit) - parseAmount(rowDepreciationExpense.Credit),
      }
      // push data
      res.entryData.push(depreciationExpenseData);
    })

    // return
    return res;
  }

  // Single depreciation expense account & amount balanced with depreciation accounts ----------------- //

  let sameDepreciationExpenseAccountUsed = rowsDepreciationExpenses.filter((value, index, self) => index === self.findIndex(item => item.CompteNum === value.CompteNum)).length == 1;
  if (sameDepreciationExpenseAccountUsed && checkBalanceTwoLists(rowsDepreciationExpenses,rowsDepreciations))
  {
    res.isExpensesTracked = true;
    res.message = "OK";

    // ligne relative au compte de dotations
    let rowDepreciationExpense = rowsDepreciationExpenses[0];

    // build data
    rowsDepreciations.forEach((rowDepreciation) =>
    {
      // depreciation expense data
      let depreciationExpenseData = 
      {
        label: rowDepreciationExpense.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
        account: rowDepreciationExpense.CompteNum,
        accountLib: rowDepreciationExpense.CompteLib,
        accountAux: rowDepreciation.CompteNum,
        amount: parseAmount(rowDepreciation.Credit) - parseAmount(rowDepreciation.Debit),
      }
      // push data
      res.entryData.push(depreciationExpenseData);
    })

    return res;
  }

  res.isExpensesTracked = false;
  res.message = sameDepreciationExpenseAccountUsed ? "Un seul compte de dotations mais le montant des dotations ne correspond pas à la variation des amortissements" : "Plusieurs comptes de dotations et d'amortissements.";
  return res;
}


const divideEntryByAssetsTypes = (rowsEntry) =>
{
  let res = {entryData: [], isExpensesTracked: false, message: ""};

  // tangible assets
  let rowsTangibleAssets = rowsEntry.filter(ligne => /^68(1|7)12/.test(ligne.CompteNum) || /^281/.test(ligne.CompteNum));
  let resTangibleAssets = readDepreciationExpenses(rowsTangibleAssets);

  // intangible assets
  let rowsIntangibleAssets = rowsEntry.filter(ligne => /^68(1|7)11/.test(ligne.CompteNum) || /^280/.test(ligne.CompteNum));
  let resIntangibleAssets = readDepreciationExpenses(rowsIntangibleAssets);

  if (resTangibleAssets.isExpensesTracked && resIntangibleAssets.isExpensesTracked)
  {
    res.isExpensesTracked = true;
    res.entryData = [...resTangibleAssets.entryData, ...resIntangibleAssets.entryData];

    return res;
  }
  
  res.isExpensesTracked = false;
  return res;
}

const divideEntryByEntryLabels = (rowsEntry) =>
{
  let res = {entryData: [], isExpensesTracked: false, message: ""};

  // get list entry
  let entryLabels = rowsEntry.map(row => row.EcritureLib)
                             .filter((value, index, self) => index === self.findIndex(item => item === value));
  
  for (let label of entryLabels)
  {
    let rowsLabel = rowsEntry.filter(ligne => ligne.EcritureLib == label);
    let resLabel = readDepreciationExpenses(rowsLabel);

    if (resLabel.status)
    {
      res.entryData.push(resLabel.entryData);
    }
    else
    {
      res.isExpensesTracked = false;
      return res;
    }
  }
  
  res.isExpensesTracked = true;
  return res;
}

const divideEntryByBalancedGroups = (rowsEntry) =>
{
  let res = {entryData: [], isExpensesTracked: false, message: ""};

  // build groups
  let groups = [];
  let currentGroup = [];
  for (let row of rowsEntry)
  {
    currentGroup.push(row);
    if (checkBalance(currentGroup))
    {
      groups.push(currentGroup);
      currentGroup = [];
    }
  }

  if (groups.length == 0)
  {
    res.isExpensesTracked = false;
    res.message = "Ecriture non équilibrée.";
    return res;
  }

  for (let group of groups)
  {
    let resGroup = readDepreciationExpenses(group);

    if (resGroup.isExpensesTracked)
    {
      res.entryData.push(resGroup.entryData);
    }
    else
    {
      res.isExpensesTracked = false;
      return res;
    }
  }
  
  res.isExpensesTracked = true;
  return res;
}