/* ---------------------------------------------------- */
/* -------------------- FEC READER -------------------- */
/* ---------------------------------------------------- */

// Labels OR Codes
const journalANouveauxLabels = ['A NOUVEAUX']; const journalANouveauxCodes = ['AN'];
const journalAchatsLabels = ['ACHATS','BANQUE']; const journalAchatsCodes = ['HA'];
const journalVentesLabels = ['VENTES']; const journalVentesCodes = ['VT','VE'];
const journalDotationsLabels = ['DOTATION AUX AMORTISSEMENTS']; const journalDotationsCodes = ['OD','ODA'];

/* ----- FILE READER ----- */ 

async function FECFileReader(content)
// ...build JSON from FEC File
// ...put rows in journals
{
  let dataFEC = {};
  dataFEC.meta = {};
  dataFEC.meta.books = {};
  dataFEC.journalANouveaux = [];
  dataFEC.journalVentes = [];
  dataFEC.journalAchats = [];
  dataFEC.journalOperationsDiverses = [];
  dataFEC.books = [];
  let columns = {};

  // read header
  const header = content.slice(0,content.indexOf('\n')).split("\t");
  header.forEach((column) => {
    columns[column] = header.indexOf(column);
  })

  // read rows
  const rows = content.slice(content.indexOf('\n')+1).split('\n');
  await rows.forEach(async (rowString) => {
    if (rowString!="")
    {
      let row = rowString.split("\t");
      let rowData = await readFECFileRow(columns,row);

      /*let journal = rowData.JournalCode;
      if (dataFEC[journal]==undefined) {
        dataFEC[journal] = [];
        dataFEC.meta[journal] = rowData.JournalLib;
        if (journalANouveauxCodes.includes(rowData.JournalCode) || journalANouveauxLabels.includes(rowData.JournalLib.toUpperCase())) { dataFEC.meta.codeJournalANouveaux = journal}
        if (journalVentesCodes.includes(rowData.JournalCode) || journalVentesLabels.includes(rowData.JournalLib.toUpperCase())) { dataFEC.meta.codeJournalVentes = journal}
        if (journalAchatsCodes.includes(rowData.JournalCode) || journalAchatsLabels.includes(rowData.JournalLib.toUpperCase())) { dataFEC.meta.codeJournalAchats = journal}
        if (journalDotationsCodes.includes(rowData.JournalCode) || journalDotationsLabels.includes(rowData.JournalLib.toUpperCase())) { dataFEC.meta.codeJournalDotations = journal}
      }
      dataFEC[journal].push(rowData);*/

      rowData.JournalCode = rowData.JournalCode.replace(/^\"/,"").replace(/\"$/,"").replace(/ *$/,"");
      rowData.JournalLib = rowData.JournalLib.replace(/^\"/,"").replace(/\"$/,"").replace(/ *$/,"");
      if (dataFEC.meta.books[rowData.JournalCode]==undefined) {
        dataFEC.meta.books[rowData.JournalCode] = rowData.JournalLib;
        dataFEC.books[rowData.JournalCode] = [];
      }
      dataFEC.books[rowData.JournalCode].push(rowData);
    }
  })
  
  return dataFEC;
}

// Read line
async function readFECFileRow(columns,row) {
  let rowData = {}
  Object.entries(columns).forEach(([column,index]) => {
    rowData[column] = row[index];
  })
  return rowData;
}


/* ----- FEC DATA PROCESSER ----- */ 

async function processFECData(FECData)
// ...extract data to use in session
{
  let data = {};
  data.revenue = 0;
  data.storedProduction = 0;
  data.immobilisedProduction = 0;
  data.unstoredProduction = 0;
  data.stockProduction = 0;
  data.expenses = [];
  data.depreciations = [];
  data.accounts = {};
  //data.companies = [];

  console.log(FECData.meta.books);
  await Object.entries(FECData.meta.books).forEach(([bookCode,bookLib]) => 
  {
    // A Nouveaux
    if (journalANouveauxCodes.includes(bookCode) 
        || journalANouveauxLabels.includes(bookLib.toUpperCase())) 
    { 
      
      readBookAsJournalANouveaux(data,FECData.books[bookCode])
    }
    // Ventes
    if (journalVentesCodes.includes(bookCode) 
        || journalVentesLabels.includes(bookLib.toUpperCase())) 
    { 
      readBookAsJournalVentes(data,FECData.books[bookCode])
    }
    // Achats
    if (journalAchatsCodes.includes(bookCode) 
        || journalAchatsLabels.includes(bookLib.toUpperCase())) 
    { 
      console.log("read achats")
      readBookAsJournalAchats(data,FECData.books[bookCode])
    }
    // Operations Diverses
    if (journalDotationsCodes.includes(bookCode) 
        || journalDotationsLabels.includes(bookLib.toUpperCase())) 
    { 
      readBookAsJournalOperationsDiverses(data,FECData.books[bookCode])
    }
  })

  return data;
}

/* ----- BOOKS READERS ----- */

async function readBookAsJournalANouveaux(data,book) 
{  
  await book.forEach((ecriture) => {
    // Stock Production
    if (ecriture.CompteNum.substring(0,2)=="33"
          || ecriture.CompteNum.substring(0,2)=="34"
          || ecriture.CompteNum.substring(0,2)=="35") {
      data.stockProduction+= parseFloat(ecriture.Credit);
    }
  })
}

async function readBookAsJournalVentes(data,book) 
{  
  await book.forEach((ecriture) => {
    // Revenus
    if (ecriture.CompteNum.substring(0,2)=="70") { // 709 rabais
      data.revenue+= parseFloat(ecriture.Credit);
    }
  })
}

async function readBookAsJournalAchats(data,book) 
{  
  await book.forEach((ecriture) => {
    // Achats
    if ((ecriture.CompteNum.substring(0,2)=="60" && ecriture.CompteNum.substring(0,3)!="603")
          || ecriture.CompteNum.substring(0,2)=="61"
          || ecriture.CompteNum.substring(0,2)=="62") 
    { 
      if (data.accounts[ecriture.CompteNum]==undefined) {
        data.accounts[ecriture.CompteNum] = ecriture.CompteLib;
      }
      let ecritureAux = book.filter(ecritureAux => ecritureAux.EcritureNum==ecriture.EcritureNum & ecritureAux.CompteNum.substring(0,2)=="40")[0];
      let expenseData = {
        label: ecriture.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ecriture.CompteNum,
        corporateId: ecriture.CompAuxNum,
        corporateName: ecritureAux!=undefined ? ecritureAux.CompAuxLib.replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"") : undefined,
        amount: parseFloat(ecriture.Debit),
      }
      data.expenses.push(expenseData);
    }
  })
}

async function readBookAsJournalOperationsDiverses(data,book) 
{  
  await book.forEach((ecriture) => {
    // Stored/Unstored Production
    if (ecriture.CompteNum.substring(0,2)=="71") {
      data.storedProduction+= parseFloat(ecriture.Credit);
      data.unstoredProduction+= parseFloat(ecriture.Debit);
    }
    // Immobilised Production
    else if (ecriture.CompteNum.substring(0,2)=="72") {
      data.immobilisedProduction+= parseFloat(ecriture.Credit);
    }
    // Dotations amortissements
    if (ecriture.CompteNum.substring(0,2)=="28") 
    {
      //let ecritureAux = journalAchats.filter(ecritureAux => ecritureAux.EcritureNum==ecriture.EcritureNum & ecritureAux.CompteNum.substring(0,2)=="40")[0];
      let depreciationData = {
        label: ecriture.EcritureLib.replace(/^\"/,"").replace(/\"$/,""),
        account: ecriture.CompteNum,
        corporateId: ecriture.CompAuxNum,
        //corporateName: ecritureAux!=undefined ? ecritureAux.CompAuxLib.replace(/ *$/,"").replace(/^\"/,"").replace(/\"$/,"") : undefined,
        corporateName: ecriture.CompteLib,
        amount: parseFloat(ecriture.Credit),
      }
      if (parseFloat(ecriture.Debit) > 0) {
        data.depreciations = data.depreciations.filter(depreciation => depreciation.account != ecriture.CompteNum || depreciation.amount != parseFloat(ecriture.Debit));
      } else {
        data.depreciations.push(depreciationData);
      }
    }
  })
}

export {FECFileReader, processFECData};