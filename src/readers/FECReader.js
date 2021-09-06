import booksProps from './books.json'

/* ---------------------------------------------------- */
/* -------------------- FEC READER -------------------- */
/* ---------------------------------------------------- */

/* ---------- FILE READER ---------- */ 

async function FECFileReader(content)
// ...build JSON from FEC File
{
  let dataFEC = {
    meta: {books: {}},
    books: []
  };

  let columns = {};

  // read header
  // ...build mapping between labels and columns indexes
  const header = content.slice(0,content.indexOf('\n')).split("\t");
  header.forEach((column) => {
    columns[column] = header.indexOf(column);
  })

  // read rows
  const rows = content.slice(content.indexOf('\n')+1).split('\n');
  await rows.forEach(async (rowString) => {
    if (rowString!="")
    {
      // split row
      let row = rowString.split("\t");
      
      // read row
      let rowData = await readFECFileRow(columns,row);

      // update meta books
      if (dataFEC.meta.books[rowData.JournalCode]==undefined) 
      {
        dataFEC.meta.books[rowData.JournalCode] = {
          label: rowData.JournalLib,
          type: getDefaultBookType(rowData.JournalCode,rowData.JournalLib)
        }
        dataFEC.books[rowData.JournalCode] = [];
      }

      // push
      dataFEC.books[rowData.JournalCode].push(rowData);
    }
  })
  
  return dataFEC;
}

// Read line
// ...build JSON from the row with labels as keys
async function readFECFileRow(columns,row) 
{
  let rowData = {}
  Object.entries(columns).forEach(([column,index]) => {
    rowData[column] = row[index].replace(/^\"/,"")      // remove quote at the beginning
                                .replace(/\"$/,"")      // remove quote at the end
                                .replace(/ *$/,"");     // remove spaces at the end
  })
  return rowData;
}

// Book recognition
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


/* ---------- FEC DATA PROCESSER ---------- */ 

async function processFECData(FECData)
// ...extract data to use in session
{
  console.log(FECData);
  
  let data = {};

  data.revenue = 0;
  data.stockInitProduction = 0;
  data.unstoredProduction = 0;
  data.storedProduction = 0;
  data.immobilisedProduction = 0;

  data.expenses = [];
  data.initialStocks = [];
  data.stocksVariations = [];
  data.purchasesDiscounts = [];
  
  data.investments = [];
  data.depreciations = [];
  data.immobilisations = [];
  data.depreciationsInit = [];
  data.accounts = {};

  // Other useful data
  data.KNWData = {apprenticeshipTax: 0, vocationalTrainingTax: 0}

  // scan each book
  await Object.entries(FECData.meta.books).forEach(([bookCode,{type}]) => 
 {  
    // ~ A Nouveaux
    if (type=="ANOUVEAUX") { 
      readBookAsJournalANouveaux(data, FECData.books[bookCode])
    }

    else 
    {
      // ~ Ventes
      //if (journalVentesCodes.includes(bookCode) || journalVentesLabels.includes(bookLib.toUpperCase())) { 
        readBookAsJournalVentes(data, FECData.books[bookCode]);
      //}
  
      // ~ Achats
      //if (journalAchatsCodes.includes(bookCode) || journalAchatsLabels.includes(bookLib.toUpperCase())) { 
        readBookAsJournalAchats(data, FECData.books[bookCode]);
      //}
  
      // ~ Operations Diverses
      //if (journalDotationsCodes.includes(bookCode) || journalDotationsLabels.includes(bookLib.toUpperCase())) { 
        readBookAsJournalOperationsDiverses(data, FECData.books[bookCode]);
      //}
    }

  })

  return data;
}

/* ----- BOOKS READERS ----- */

// A Nouveaux
async function readBookAsJournalANouveaux(data,book) 
{  
  await book.forEach((ecriture) => {

    // Stock Production
    // ...comptes 33, 34 & 35
    if (ecriture.CompteNum.substring(0,2)=="33"
     || ecriture.CompteNum.substring(0,2)=="34"
     || ecriture.CompteNum.substring(0,2)=="35") 
    {
      // increase production stock init
      data.stockInitProduction+= parseAmount(ecriture.Debit);
    }

    // Stock Purchases (Initial)
    // ...comptes 31, 32 et 37
    if (ecriture.CompteNum.substring(0,2)=="31"
     || ecriture.CompteNum.substring(0,2)=="32"
     || ecriture.CompteNum.substring(0,2)=="37") 
    {
      // push data
      let initialStockData = {
        account: ecriture.CompteNum,
        label: ecriture.CompteLib,
        amount: parseAmount(ecriture.Debit)
      }
      data.initialStocks.push(initialStockData);
    }

    // Immobilisations
    // ....comptes 20 & 21
    if (ecriture.CompteNum.substring(0,2)=="20"
     || ecriture.CompteNum.substring(0,2)=="21") 
    {
      // push data
      let immobilisationData = {
        account: ecriture.CompteNum,
        label: ecriture.CompteLib,
        amount: parseAmount(ecriture.Debit)
      }
      data.immobilisations.push(immobilisationData);
    }

    // Amortissements
    // ...comptes 28
    if (ecriture.CompteNum.substring(0,2)=="28") 
    {
      // push data
      let depreciationData = {
        account: ecriture.CompteNum,
        amount: parseAmount(ecriture.Credit)
      }
      data.depreciationsInit.push(depreciationData);
    }
  })
}

// Ventes
async function readBookAsJournalVentes(data,book) 
{  
  await book.forEach((ecriture) => {

    // Revenus
    if (ecriture.CompteNum.substring(0,2)=="70" && ecriture.CompteNum.substring(0,3)!="709") 
    {
      // increase revenue
      data.revenue+= parseAmount(ecriture.Credit);
    } 
    // Rabais, remises, ristournes
    // ...comptes 709
    else if (ecriture.CompteNum.substring(0,3)=="709") 
    {
      // decrease revenue
      data.revenue-= parseAmount(ecriture.Debit);
    }
  })
}

// Achats
async function readBookAsJournalAchats(data,book) 
{  
  await book.forEach((ecriture) => {

    // Charges externes
    // ...comptes 60 (hors 603 & 609), 61 et 62
    if ((ecriture.CompteNum.substring(0,2)=="60" && ecriture.CompteNum.substring(0,3)!="603" && ecriture.CompteNum.substring(0,3)!="609")
      || ecriture.CompteNum.substring(0,2)=="61"
      || ecriture.CompteNum.substring(0,2)=="62")
    { 
      // enregistrement du compte
      if (data.accounts[ecriture.CompteNum]==undefined) data.accounts[ecriture.CompteNum] = ecriture.CompteLib;

      // lecture du compte auxiliaire
      let ecritureAux = book.filter(ecritureAux => ecritureAux.EcritureNum==ecriture.EcritureNum && ecritureAux.CompteNum.substring(0,2)=="40")[0] || {};
      if (data.accounts[ecritureAux.CompAuxNum]==undefined) data.accounts[ecritureAux.CompAuxNum] = (ecritureAux.CompAuxLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");
      if (data.accounts[ecritureAux.CompteNum]==undefined) data.accounts[ecritureAux.CompteNum] = (ecritureAux.CompteLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");
      
      // push data
      let expenseData = {
        label: ecriture.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ecriture.CompteNum,
        accountProvider: ecritureAux.CompAuxNum || ecritureAux.CompteNum,
        amount: parseAmount(ecriture.Debit),
      }
      data.expenses.push(expenseData);
    }

    // Rabais, remises, ristournes
    // ...comptes 609
    if (ecriture.CompteNum.substring(0,3)=="609") 
    {
      // enregistrement du compte
      if (data.accounts[ecriture.CompteNum]==undefined) data.accounts[ecriture.CompteNum] = ecriture.CompteLib;

      // lecture du compte auxiliaire
      let ecritureAux = book.filter(ecritureAux => ecritureAux.EcritureNum==ecriture.EcritureNum & ecritureAux.CompteNum.substring(0,2)=="40")[0] || {};
      if (data.accounts[ecritureAux.CompAuxNum]==undefined) data.accounts[ecritureAux.CompAuxNum] = (ecritureAux.CompAuxLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");
      if (data.accounts[ecritureAux.CompteNum]==undefined) data.accounts[ecritureAux.CompteNum] = (ecritureAux.CompteLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");

      // push data
      let discountData = {
        label: ecriture.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ecriture.CompteNum,
        accountProvider: ecritureAux.CompAuxNum,
        amount: parseAmount(ecriture.Credit),
      }
      data.purchasesDiscounts.push(discountData);
    }

    // Investissements
    // ...comtes 20 & 21
    if (ecriture.CompteNum.substring(0,2)=="20"
     || ecriture.CompteNum.substring(0,2)=="21")
    {
      // enregistrement du compte
      if (data.accounts[ecriture.CompteNum]==undefined) data.accounts[ecriture.CompteNum] = ecriture.CompteLib;

      // lecture du compte auxiliaire
      let ecritureAux = book.filter(ecritureAux => ecritureAux.EcritureNum==ecriture.EcritureNum & ecritureAux.CompteNum.substring(0,2)=="40")[0];
      if (data.accounts[ecritureAux.CompAuxNum]==undefined) data.accounts[ecritureAux.CompAuxNum] = (ecritureAux.CompAuxLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");
      if (data.accounts[ecritureAux.CompteNum]==undefined) data.accounts[ecritureAux.CompteNum] = (ecritureAux.CompteLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");
      
      // push data
      let investmentData = {
        label: ecriture.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ecriture.CompteNum,
        accountProvider: ecritureAux.CompAuxNum,
        amount: parseAmount(ecriture.Debit),
      }
      data.investments.push(investmentData);
    }

    // Data for KNW 
    // ...taxe d'apprentissage
    if (ecriture.CompteNum.substring(0,4)=="6312") {
      data.KNWData.apprenticeshipTax+= parseAmount(ecriture.Debit);
    }
    // ...participation formation professionnelle
    if (ecriture.CompteNum.substring(0,4)=="6313" || ecriture.CompteNum.substring(0,4)=="6333") {
      data.KNWData.vocationalTrainingTax+= parseAmount(ecriture.Debit);
    }

  })
}

// Operations diverses & Inventaires
async function readBookAsJournalOperationsDiverses(data,book) 
{  
  await book.forEach((ecriture) => {
    
    // Stored/Unstored Production
    // ...comptes 71
    if (ecriture.CompteNum.substring(0,2)=="71") 
    {
      // increase stored production (if credit)
      data.storedProduction+= parseAmount(ecriture.Credit);
      // increase unstored production (if debit)
      data.unstoredProduction+= parseAmount(ecriture.Debit);
    }

    // Immobilised Production
    if (ecriture.CompteNum.substring(0,2)=="72") 
    {
      // increase immobilised production
      data.immobilisedProduction+= parseAmount(ecriture.Credit);
    }
    
    // Stored/Unstored Purchases
    // ...comptes 31, 32 & 37
    if (ecriture.CompteNum.substring(0,2)=="31"
     || ecriture.CompteNum.substring(0,2)=="32"
     || ecriture.CompteNum.substring(0,2)=="37") 
    {      
      // enregistrement du compte
      if (data.accounts[ecriture.CompteNum]==undefined) data.accounts[ecriture.CompteNum] = (ecriture.CompteLib || "").replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"");

      let stockAccount = data.stocksVariations.filter(stock => stock.account == ecriture.CompteNum)[0];
      // if stock account defined
      // ...increase if debit, decrease if credit
      if (stockAccount!=undefined) {
        stockAccount.amount+= parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit);
      } 
      // if stock account undefined
      // ...push data
      else {
        let stockAccount = {
          label: ecriture.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
          account: ecriture.CompteNum,
          amount: parseAmount(ecriture.Debit) - parseAmount(ecriture.Credit),
        }
        data.stocksVariations.push(stockAccount);
      }
    }

    // Dotations amortissements
    // ...comptes 28
    if (ecriture.CompteNum.substring(0,2)=="28") 
    {
      let depreciation = data.depreciations.filter(depreciation => depreciation.account == ecriture.CompteNum)[0];
      // if depreciation defined
      // ...increase if credit, decrease if debit
      if (depreciation != undefined) {
        depreciation.amount+= parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit);
      } 
      // if depreciation undefined
      // ...push data
      else {
        let depreciationData = {
          label: ecriture.CompteLib.replace(/^\"/,"").replace(/\"$/,""),
          account: ecriture.CompteNum,
          amount: parseAmount(ecriture.Credit) - parseAmount(ecriture.Debit),
        }
        data.depreciations.push(depreciationData);
      }
    }
  })
}

function parseAmount(stringAmount) {
  return parseFloat(stringAmount.replace(',','.'))
}

export {FECFileReader, processFECData};