
const importData = async (content) => {
  content = (content.replaceAll('\r\n','\n')).replaceAll('\r','\n');
  // read header
  const header = content.slice(0,content.indexOf('\n')).split(";");
  const columns = {
    corporate_id: header.indexOf("corporate_id"),
    corporate_name: header.indexOf("corporate_name"),
    amount: header.indexOf("amount")
  }
  // read rows
  const rows = content.slice(content.indexOf('\n')+1).split('\n');
  let expensesData = [];
  await rows.forEach((rowString) => {
    let row = rowString.split(";");
    let expenseData = {
      corporateId: columns.corporate_id > -1 ? row[columns.corporate_id] : "",
      corporateName: columns.corporate_name > -1 ? row[columns.corporate_name] : "",
      amount: columns.amount > -1 ? (!isNaN(parseFloat(row[columns.amount])) ? parseFloat(row[columns.amount]) : 0.0) : 0.0,
    }
    expensesData.push(expenseData);
  })
  return expensesData;
}

// Labels OR Codes
const journalAchatsLabels = ['Achats']; const journalAchatsCodes = ['HA'];
const journalVentesLabels = ['Ventes']; const journalVentesCodes = ['VT','VE'];
const journalDotationsLabels = ['Dotation aux amortissements']; const journalDotationsCodes = ['ODA'];

// async function FECImportFECFile(file)
// ...return JSON Object of FEC File
async function FECBuildJSON(content) 
{
  let dataFEC = {};

  // read header
  const header = content.slice(0,content.indexOf('\n')).split("\t");
  const columns = {};
  header.forEach((column) => {
    columns[column] = header.indexOf(column);
  })

  // read rows
  const rows = content.slice(content.indexOf('\n')+1).split('\n');
  await rows.forEach(async (rowString) => {
    if (rowString!="")
    {
      let row = rowString.split("\t");
      let rowData = await FECReadRow(columns,row);
      let journal = rowData.JournalCode;
      if (dataFEC[journal]==undefined) {
        dataFEC[journal] = [];
      }
      dataFEC[journal].push(rowData);
    }
  })
  console.log(dataFEC);
}

async function FECReadRow(columns,row) {
  let rowData = {}
  Object.entries(columns).forEach(([column,index]) => {
    rowData[column] = row[index];
  })
  return rowData;
}

async function FECReader(content) {

  // data
  let dataFEC = {};
  dataFEC.production = null;
  dataFEC.revenue = null;
  dataFEC.storedProduction = null;
  dataFEC.immobilisedProduction = null;
  dataFEC.expenses = [];
  dataFEC.depreciations = [];

  // prepare content
  content = (content.replaceAll('\r\n','\n')).replaceAll('\r','\n');

  // read header
  const header = content.slice(0,content.indexOf('\n')).split("\t");
  const columns = {
    compteNum: header.indexOf("CompteNum"),
    ecritureLib: header.indexOf("EcritureLib"),
    debit: header.indexOf("Debit"),
    credit: header.indexOf("Credit"),
  }

  if (columns.compteNum > -1 & columns.ecritureLib > -1 & columns.debit > -1 & columns.credit > -1)
  {
    // read rows
    const rows = content.slice(content.indexOf('\n')+1).split('\n');
  
    // reader
    await rows.forEach((rowString) => {
      if (rowString!="")
      {
        let row = rowString.split("\t");
        
        // Revenus
        if (row[columns.compteNum].substring(0,2)=="70") { // 709 rabais
          dataFEC.revenue+= columns.credit > -1 ? (!isNaN(parseFloat(row[columns.credit])) ? parseFloat(row[columns.credit]) : 0.0) : 0.0;
        }
        // Stored / Unstored production
        //  ...stock at the beginning & at the end of the exercice
    
        // Immobilised production
        else if (row[columns.compteNum].substring(0,2)=="72") {
          dataFEC.immobilisedProduction+= columns.credit > -1 ? (!isNaN(parseFloat(row[columns.credit])) ? parseFloat(row[columns.credit]) : 0.0) : 0.0;
        }
    
        // Expenses
        else if ( (row[columns.compteNum].substring(0,2)=="60" && row[columns.compteNum].substring(0,3)!="603")
                || row[columns.compteNum].substring(0,2)=="61"
                || row[columns.compteNum].substring(0,2)=="62") 
        {
          // if an expense as the same libelle -> add the amount
          let index = dataFEC.expenses.findIndex((expense) => expense.corporateName==row[columns.ecritureLib]);
          if (index > -1) 
          {
            dataFEC.expenses[index].amount+= !isNaN(parseFloat(row[columns.debit])) ? parseFloat(row[columns.debit]) : 0.0; 
          }
          // ...else -> add a new expense
          else
          {
            let expenseData = {
              corporateName: row[columns.ecritureLib],
              amount: columns.debit > -1 ? (!isNaN(parseFloat(row[columns.debit])) ? parseFloat(row[columns.debit]) : 0.0) : 0.0,
            }
            dataFEC.expenses.push(expenseData);
          }
        }
    
        // Depreciations
        else if (row[columns.compteNum].substring(0,3)=="681") {
          let depreciationData = {
            corporateName: columns.ecritureLib > -1 ? row[columns.ecritureLib] : "",
            amount: columns.debit > -1 ? (!isNaN(parseFloat(row[columns.debit])) ? parseFloat(row[columns.debit]) : 0.0) : 0.0,
          }
          dataFEC.depreciations.push(depreciationData);
        }
      }
    })
  }
  return dataFEC.expenses;
}

export {importData, FECReader, FECBuildJSON};