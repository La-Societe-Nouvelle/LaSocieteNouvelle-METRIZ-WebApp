// La Société Nouvelle - METRIZ

// Libraries
import booksProps from '../../lib/books.json'

/* ---------------------------------------------------- */
/* -------------------- FEC READER -------------------- */
/* ---------------------------------------------------- */

/*  This reader is divided into 2 methods:
 *    - FECFileReader to read the file and parse it to JSON
 *        Encoding has to be ISO-8859-1 [as normally required]
 *        Separator must be '\t' (tabulation) or '|' (pipe) [as normally required]
 *        Structure of the JSON :
 *          .books (Array) -> books with the entries ({bookCode : [...entries]})
 *          .meta -> books labels, accounts labels, accountsAux labels ({code: label})
 *    - FECDataReader to read the data and build a JSON to load into FinancialData object
 * 
 *  A documentation of the reading is available at https://github.com/SylvainH-LSN/LaSocieteNouvelle-METRIZ-WebApp/blob/main/src/readers/DOCUMENTATION%20-%20FEC%20Reader.md
 */

// EXPORT
export { FECFileReader, FECDataReader };

/* -------------------- PARSER -------------------- */

const parseAmount = (stringAmount) => parseFloat(stringAmount.replace(',','.'))

/* -------------------- FILE READER -------------------- */ 

async function FECFileReader(content) 
// ...build JSON from FEC File (FEC -> JSON)
{
  // Output data ---------------------------------------------------------------------------------------- //

  let dataFEC = {meta: {books: {},accounts: {}, accountsAux: {}}, books: []};

  // Separator ------------------------------------------------------------------------------------------ //

  let separator = content.slice(0,content.indexOf('\n')).split('\t').length == 18 ? '\t' : '|';

  // Header --------------------------------------------------------------------------------------------- //
  
  // read header & build columns index
  let indexColumns = {};
  const header = content.slice(0,content.indexOf('\n')).split(separator);
        header.forEach(column => indexColumns[column] = header.indexOf(column));

  // Rows ----------------------------------------------------------------------------------------------- //
  
  // array of rows
  const rows = content.slice(content.indexOf('\n')+1).split('\n');

  // read rows
  await rows.forEach(async (rowString) => 
  {
    // split & read row (String -> JSON)
    let rowArray = rowString.split(separator);

    if (rowArray.length == 18)
    {
      // build row data
      let rowData = await readFECFileRow(indexColumns,rowArray);

      // update meta books & books array
      if (!(rowData.JournalCode in dataFEC.meta.books)) {
        dataFEC.books[rowData.JournalCode] = [];
        dataFEC.meta.books[rowData.JournalCode] = {label: rowData.JournalLib, type: getDefaultBookType(rowData.JournalCode,rowData.JournalLib)}
      }
      // update meta accounts
      if (dataFEC.meta.accounts[rowData.CompteNum] == undefined) {
        dataFEC.meta.accounts[rowData.CompteNum] = rowData.CompteLib;
      }
      // update meta subsidiaries accounts
      if (rowData.CompAuxNum != undefined && dataFEC.meta.accountsAux[rowData.CompAuxNum] == undefined) {
        dataFEC.meta.accountsAux[rowData.CompAuxNum] = rowData.CompAuxLib;
      }

      // push data
      dataFEC.books[rowData.JournalCode].push(rowData);
    }
  })

  // Return --------------------------------------------------------------------------------------------- //
  return dataFEC;
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
  })
  return rowData;
}

// Book recognition
function getDefaultBookType(bookCode,bookLib) 
{
  // ~ A Nouveaux
  if (booksProps.ANOUVEAUX.codes.includes(bookCode) 
    || booksProps.ANOUVEAUX.labels.includes(bookLib.toUpperCase())) return "ANOUVEAUX";
  // ~ Ventes
  else if (booksProps.VENTES.codes.includes(bookCode) 
    || booksProps.VENTES.labels.includes(bookLib.toUpperCase())) return "VENTES"
  // ~ Achats
  else if (booksProps.ACHATS.codes.includes(bookCode) 
    || booksProps.ACHATS.labels.includes(bookLib.toUpperCase())) return "ACHATS"
  // ~ Operations Diverses
  else if (booksProps.OPERATIONS.codes.includes(bookCode) 
    || booksProps.OPERATIONS.labels.includes(bookLib.toUpperCase())) return "OPERATIONS"
  // ~ Others
  else return "AUTRE";
}


/* -------------------- DATA READER -------------------- */ 

async function FECDataReader(FECData)
// ...extract data to use in session (JSON -> Session)
{ 
  // Output data ---------------------------------------------------------------------------------------- //
  
  let data = {};

  // Meta ----------------------------------------------------------------------------------------------- //
  data.accounts = FECData.meta.accounts;
  data.accountsAux = FECData.meta.accountsAux;

  // Production / Incomes ------------------------------------------------------------------------------- //
  data.revenue = 0;                 // 70
  //data.storedProduction = 0;      // 71 + prevAmount 33, 34 & 35
  //data.unstoredProduction = 0;    // prevAmount 33, 34 & 35
  data.immobilisedProduction = 0;   // 72
  data.otherOperatingIncomes = 0;   // 74, 75, 781, 791

  // Stocks --------------------------------------------------------------------------------------------- //
  data.stocks = [];                 // stock 31, 32, 33, 34, 35, 37
  data.stockVariations = [];        // stock flow 603, 71 <-> 31, 32, 33, 34, 35, 37

  // Expenses ------------------------------------------------------------------------------------------- //
  data.expenses = [];               // 60, 61, 62 (hors 603) (609 read as negative expenses)
  data.depreciationExpenses = [];   // 6811 and 6871
  
  // Immobilisations ------------------------------------------------------------------------------------ //
  data.immobilisations = [];        // #20 to #27
  data.investments = [];            // flow #2 <- #404

  // Amortissements et Dépréciations -------------------------------------------------------------------- //
  data.depreciations = [];          // #28, #29 and #39

  // others key figures --------------------------------------------------------------------------------- //
  data.taxes = 0;                   // #63
  data.personnelExpenses = 0;       // #64
  data.otherExpenses = 0;           // #65
  data.financialExpenses = 0;       // #66 & #686
  data.exceptionalExpenses = 0;     // #67 & #687 (hors #6871)
  data.provisions = 0;              // #68 (hors #6811)
  data.taxOnProfits = 0;            // #69

  // Other used data ------------------------------------------------------------------------------------//
  data.KNWData = {apprenticeshipTax: 0, vocationalTrainingTax: 0}

  /* --- A NOUVEAUX --- */

  // Get book code for "A Nouveaux"
  let codeANouveaux = Object.entries(FECData.meta.books)
                            .filter(([_,{type}]) => type == "ANOUVEAUX")
                            .map(([bookCode,_]) => bookCode)[0];

  if (codeANouveaux != undefined) await readBookAsJournalANouveaux(data, FECData.books[codeANouveaux]);

  /* --- OTHER BOOKS --- */

  // Read books (except "A Nouveaux")
  await Object.entries(FECData.meta.books)
              .filter(([_,{type}]) => type != "ANOUVEAUX")
              .forEach(async ([bookCode,_]) => 
 {  
    // Get book
    let book = FECData.books[bookCode];

    // Read book
    await book.forEach((ecriture) => 
    {
      // Read entry for financial data
      if (ecriture.CompteNum.charAt(0) == "2") readImmobilisationEntry(data,book,ecriture);
      if (ecriture.CompteNum.charAt(0) == "3") readStockEntry(data,book,ecriture);      
      if (ecriture.CompteNum.charAt(0) == "6") readExpenseEntry(data,book,ecriture);
      if (ecriture.CompteNum.charAt(0) == "7") readProductionEntry(data,book,ecriture);
      
      // Read entry for additional data
      if (ecriture.CompteNum.substring(0,2) == "63") readAddtionalDataEntry(data,book,ecriture);
    })

  })

  /* --- RETURN --- */

  return data;
}

/* -------------------- BOOKS READERS ------------------------- */

/* ---------- JOURNAL A NOUVEAUX ---------- */

async function readBookAsJournalANouveaux(data,book) 
{  
  await book.sort((a,b) => a.CompteNum.localeCompare(b.CompteNum))
            .forEach((ecriture) => 
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
    if (ecriture.CompteNum.charAt(0)=="2" && !["28","29"].includes(ecriture.CompteNum.substring(0,2)))
    {
      // immobilisation data
      let immobilisationData = 
      {
        account: ecriture.CompteNum,
        accountLib: ecriture.CompteLib,
        isDepreciableImmobilisation: ["20","21"].includes(ecriture.CompteNum.substring(0,2)),
        prevAmount: parseAmount(ecriture.Debit),
        amount: parseAmount(ecriture.Debit)
      }

      // push data
      data.immobilisations.push(immobilisationData);
    }

    // Comptes d'amortissements et de dépréciations ----------------------------------------------------- //
    if (ecriture.CompteNum.charAt(0)=="2" && ["28","29"].includes(ecriture.CompteNum.substring(0,2)))
    {
      // depreciation data
      let depreciationData = 
      {
        account: ecriture.CompteNum,
        accountLib: ecriture.CompteLib,
        accountAux: "2"+ecriture.CompteNum.substring(2)+"0",
        prevAmount: parseAmount(ecriture.Credit),
        amount: parseAmount(ecriture.Credit)
      }

      // push data
      data.depreciations.push(depreciationData);
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
      Comptes 39 - Dépréciations des stocks et en-cours (non traités)
    ----------------------------------------------------------------------------------------------------
     */
    
    // Comptes de stocks (hors dépréciations et comptes 36 & 38) ---------------------------------------- //
    if (ecriture.CompteNum.charAt(0)=="3" && !["36","38","39"].includes(ecriture.CompteNum.substring(0,2)))
    {
      let isProductionStock = ["33","34","35"].includes(ecriture.CompteNum.substring(0,2));

      // stock data
      let stockData = 
      {
        account: ecriture.CompteNum,
        accountLib: ecriture.CompteLib,
        accountAux: isProductionStock ? undefined : "60"+ecriture.CompteNum.slice(1,-1).replaceAll("0$",""),
        isProductionStock: isProductionStock,
        amount: parseAmount(ecriture.Debit),
        prevAmount: parseAmount(ecriture.Debit)
      }
      // push data
      data.stocks.push(stockData);
    }

    // Comptes de dépréciations ------------------------------------------------------------------------- //
    if (ecriture.CompteNum.charAt(0)=="3" && ["39"].includes(ecriture.CompteNum.substring(0,2)))
    {
      // depreciation data
      let depreciationData = 
      {
        account: ecriture.CompteNum,
        accountLib: ecriture.CompteLib,
        accountAux: "3"+ecriture.CompteNum.substring(2)+"0",
        prevAmount: parseAmount(ecriture.Credit),
        amount: parseAmount(ecriture.Credit)
      }

      // push data
      data.depreciations.push(depreciationData);
    }

  })
}

/* -------------------- ENTRIES READERS ------------------------- */

/* ---------- COMPTES D'IMMOBILISATIONS ---------- */

const readImmobilisationEntry = async (data,book,ecriture) =>
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
  if (["20","21","23","25","26","27"].includes(ecriture.CompteNum.substring(0,2)))
  {
    // Retrieve immobilisation item
    let immobilisation = data.immobilisations.filter(immobilisation => immobilisation.account == ecriture.CompteNum)[0];
    
    // variation de la valeur de l'immobilisation
    immobilisation.amount+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);

    // lecture du compte auxiliaire (cas acquisition)
    let ecritureAux = book.filter(ecritureAux => ecritureAux.EcritureNum == ecriture.EcritureNum 
                                              && ecritureAux.CompteNum.substring(0,2) == "40")[0];
    if (ecritureAux != undefined)
    {      
      // investment data
      let investmentData = 
      {
        label: ecriture.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ecriture.CompteNum,
        accountLib: ecriture.CompteLib,
        accountAux: ecritureAux.CompAuxNum || ecritureAux.CompteNum,
        accountAuxLib : ecritureAux.CompAuxLib,
        isDefaultAccountAux: ecritureAux.CompAuxNum ? false : true,
        amount: parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit),
      }

      // push data
      data.investments.push(investmentData);
    }
  }

  // Amortissement & Dépréciation --------------------------------------------------------------------- //
  if (["28","29"].includes(ecriture.CompteNum.substring(0,2)))
  {
    // Retrieve depreciation item
    let depreciation = data.depreciations.filter(depreciation => depreciation.account == ecriture.CompteNum)[0];
    
    // variation de la valeur de l'immobilisation
    depreciation.amount+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
  }

}

/* ---------- COMPTES DE STOCKS ---------- */

const readStockEntry = async (data,book,ecriture) =>
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
  if (["31","32","33","34","35","37"].includes(ecriture.CompteNum.substring(0,2)))
  {    
    // Retrieve stock item
    let stock = data.stocks.filter(stock => stock.account == ecriture.CompteNum)[0];
    
    // if stock already define
    if (stock != undefined) stock.amount+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);

    // if stock not defined
    else
    {
      // Type of stock
      let isProductionStock = ["33","34","35"].includes(ecriture.CompteNum.substring(0,2));
            
      // stock data
      let stockData = 
      {
        account: ecriture.CompteNum,
        accountLib: ecriture.CompteLib,
        accountAux: isProductionStock ? undefined : "60"+ecriture.CompteNum.slice(1,-1).replaceAll("0$",""),
        isProductionStock: isProductionStock,
        amount: parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit),
        prevAmount: 0
      }

      // push data
      data.stocks.push(stockData);
    }
  }

  // Dépréciation ------------------------------------------------------------------------------------- //
  if (["39"].includes(ecriture.CompteNum.substring(0,2)))
  {
    // Retrieve depreciation item
    let depreciation = data.depreciations.filter(depreciation => depreciation.account == ecriture.CompteNum)[0];
    
    // variation de la valeur de l'immobilisation
    depreciation.amount+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
  }

}

/* ---------- COMPTES DE CHARGES ---------- */

const readExpenseEntry = async (data,book,ecriture) =>
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

  // Charges externes (60, 61, 62 hors 603) ----------------------------------------------------------- //
  if (["60","61","62"].includes(ecriture.CompteNum.substring(0,2)) && ecriture.CompteNum.substring(0,3)!="603")
  { 
    // lecture du compte auxiliaire
    let ecritureAux = book.filter(ecritureAux => ecritureAux.EcritureNum == ecriture.EcritureNum 
                                              && ecritureAux.CompteNum.substring(0,2)=="40")[0] || {};

    // expense data
    let expenseData = 
    {
      label: ecriture.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
      account: ecriture.CompteNum,
      accountLib: ecriture.CompteLib,
      accountAux: ecritureAux.CompAuxNum || ecritureAux.CompteNum || "_"+ecriture.CompteNum,
      accountAuxLib: ecritureAux.CompAuxLib || ecritureAux.CompAuxLib || "DEPENSES "+ecriture.CompteLib,
      isDefaultAccountAux: ecritureAux.CompAuxNum ? false : true,
      amount: parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit),
    }

    // push data
    data.expenses.push(expenseData);
  }

  // Stocks variation (603) --------------------------------------------------------------------------- //
  if (ecriture.CompteNum.substring(0,3)=="603")
  {    
    // retrieve stock entry
    let ecritureStock = book.filter(ecritureStock => ecritureStock.EcritureNum == ecriture.EcritureNum 
                                                  && ecritureStock.EcritureLib == ecriture.EcritureLib
                                                  && ecritureStock.CompteNum.charAt(0)=="3")[0] || {};
    if (data.accounts[ecritureStock.CompteNum]==undefined) data.accounts[ecritureStock.CompteNum] = (ecritureStock.CompteLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");
      
    // retrieve stock variation item
    let stockVariation = data.stockVariations.filter(stockVariation => stockVariation.account == ecriture.CompteNum
                                                                    && stockVariation.accountAux == ecritureStock.CompteNum)[0];

    // if stock variation already defined
    if (stockVariation!=undefined) stockVariation.amount+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
    
    // if stock variation undefined
    else
    {
      let prevAmount = data.stocks.filter(stock => stock.account == ecritureStock.CompteNum).map(stock => stock.prevAmount)[0] || 0;
      let stockVariationData = 
      {
        account: ecriture.CompteNum,
        accountLib: ecriture.CompteLib,
        accountAux: ecritureStock.CompteNum,
        isProductionStock: false,
        label: ecriture.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
        amount: prevAmount + parseAmount(ecriture.Debit) - parseAmount(ecritureStock.Credit),
      }
      data.stockVariations.push(stockVariationData);
    }
  }

  // Dotations aux amortissements sur immobilisations (6811 & 6871) ----------------------------------- //
  if (ecriture.CompteNum.substring(0,4)=="6811" || ecriture.CompteNum.substring(0,4)=="6871")
  {
    // retrieve depreciation accounts
    book.filter(ecritureDepreciation => ecritureDepreciation.EcritureNum == ecriture.EcritureNum 
             && ecritureDepreciation.EcritureLib == ecriture.EcritureLib
             && ecritureDepreciation.CompteNum.substring(0,2)=="28")
        .forEach((ecritureDepreciation) => 
    {
      // retrieve depreciation expense item
      let depreciationExpense = data.depreciationExpenses.filter(expense => expense.account == ecriture.CompteNum
                                                                         && expense.accountAux == ecritureDepreciation.CompteNum)[0];
      
      // if depreciation expense already defined
      if (depreciationExpense!=undefined) depreciationExpense.amount+= parseAmount(ecritureDepreciation.Credit) - parseAmount(ecritureDepreciation.Debit);
      
      // if depreciation expense undefined
      else if (ecritureDepreciation!=undefined)
      {
        let depreciationExpenseData = 
        {
          label: ecriture.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
          account: ecriture.CompteNum,
          accountLib: ecriture.CompteLib,
          accountAux: ecritureDepreciation.CompteNum,
          amount: parseAmount(ecritureDepreciation.Credit) - parseAmount(ecritureDepreciation.Debit),
        }
        data.depreciationExpenses.push(depreciationExpenseData);
      }
    })
  }

  // Other expenses ----------------------------------------------------------------------------------- //
  if (ecriture.CompteNum.substring(0,2)=="63") data.taxes+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
  if (ecriture.CompteNum.substring(0,2)=="64") data.personnelExpenses+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
  if (ecriture.CompteNum.substring(0,2)=="65") data.otherExpenses+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
  if (ecriture.CompteNum.substring(0,2)=="66" || ecriture.CompteNum.substring(0,3)=="686") data.financialExpenses+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
  if (ecriture.CompteNum.substring(0,2)=="67" || ecriture.CompteNum.substring(0,3)=="687" && ecriture.CompteNum.substring(0,4)!="6871") data.exceptionalExpenses+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
  if (ecriture.CompteNum.substring(0,3)=="681" && ecriture.CompteNum.substring(0,4)!="6811") data.provisions+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
  if (ecriture.CompteNum.substring(0,2)=="69") data.taxOnProfits+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);

}

/* ---------- COMPTES DE PRODUITS ---------- */

const readProductionEntry = async (data,book,ecriture) =>
{
  /*  LISTE DES COMPTES DE PRODUITS - NIV 1
  ----------------------------------------------------------------------------------------------------
    Comptes 70 - Ventes de produits -> revenue
    Comptes 71 - Production stockée / déstockée
    Comptes 72 - Production immobilisée
    Comptes 74 - Subventions d'exploitation
    Comptes 75 - Autres produits de gestion courante
    Comptes 76 - Produits financiers (non traités)
    Comptes 77 - Produits exceptionnels (non traités)
    Comptes 78 - Reprises sur amortissements, dépréciations et provisions (seulement sur exploitation)
    Comptes 79 - Transferts de charges (seulement sur exploitation)
  ----------------------------------------------------------------------------------------------------
  */

  // Revenue ------------------------------------------------------------------------------------------ //
  if (ecriture.CompteNum.substring(0,2)=="70") data.revenue+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
  
  // Stored/Unstored Production ----------------------------------------------------------------------- //
  if (ecriture.CompteNum.substring(0,2)=="71")
  {
    // retrieve stock entry
    let ecritureStock = book.filter(ecritureStock => ecritureStock.EcritureNum == ecriture.EcritureNum 
                                                  && ecritureStock.EcritureLib == ecriture.EcritureLib
                                                  && ecritureStock.CompteNum.charAt(0)=="3")[0] || {};

    // retrieve stock variation item
    let stockVariation = data.stockVariations.filter(stockVariation => stockVariation.account == ecritureStock.CompteNum
                                                                    && stockVariation.accountAux == ecriture.CompteNum)[0];
    
    // if stock variation already defined
    if (stockVariation!=undefined) stockVariation.amount+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);

    // if stock variation undefined
    else
    {
      let stockVariationData = 
      {
        account: ecriture.CompteNum,
        accountLib: ecritureStock.CompteLib,
        accountAux: ecritureStock.CompteNum,
        isProductionStock: true,
        label: ecriture.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
        amount: parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit),
      }
      data.stockVariations.push(stockVariationData);
    }
  }
  
  // Immobilised Production --------------------------------------------------------------------------- //
  if (ecriture.CompteNum.substring(0,2)=="72") data.immobilisedProduction+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
  
  // Other operating incomes -------------------------------------------------------------------------- //
  if (ecriture.CompteNum.substring(0,2)=="74") data.otherOperatingIncomes+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
  if (ecriture.CompteNum.substring(0,2)=="75") data.otherOperatingIncomes+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
  if (ecriture.CompteNum.substring(0,3)=="781") data.otherOperatingIncomes+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
  if (ecriture.CompteNum.substring(0,3)=="791") data.otherOperatingIncomes+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);

}

/* ---------- DONNEES SUPPLEMENTAIRES ---------- */

const readAddtionalDataEntry = async (data,book,ecriture) =>
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
  if (["6312"].includes(ecriture.CompteNum.substring(0,4))) data.KNWData.apprenticeshipTax+= parseAmount(ecriture.Debit);
  // ...participation formation professionnelle
  if (["6313","6333"].includes(ecriture.CompteNum.substring(0,4))) data.KNWData.vocationalTrainingTax+= parseAmount(ecriture.Debit);

}